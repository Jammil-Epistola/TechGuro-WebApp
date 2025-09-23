from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import json, random

from TGbackend.database import get_db
from TGbackend.services.bkt_service import teki_bkt
from TGbackend import schema
from TGbackend.models import (
    Question, AssessmentResults, AssessmentQuestionResponse
)

router = APIRouter(tags=["Assessment Management"])

# -------------------------
# Helper function: Save responses & compute score
# -------------------------
def save_assessment_and_responses(data: schema.AssessmentSubmission, db: Session):
    total = len(data.responses)
    correct = 0
    responses_to_save = []

    for r in data.responses:
        question = db.query(Question).filter(Question.id == r.question_id).first()
        if not question:
            continue

        # Enhanced answer checking for different question types
        is_correct = False
        
        if question.type == "image_mcq":
            # For image MCQ, compare with the image filename in correct_answer
            # Handle both full path and just filename
            correct_answer = question.correct_answer
            selected_choice = r.selected_choice
            
            # Extract filename from paths if needed
            if "/" in correct_answer:
                correct_answer = correct_answer.split("/")[-1]
            if "/" in selected_choice:
                selected_choice = selected_choice.split("/")[-1]
                
            is_correct = (selected_choice == correct_answer)
        else:
            # For text_mcq and true_false: direct string comparison
            is_correct = (r.selected_choice == question.correct_answer)

        if is_correct:
            correct += 1

        response_obj = AssessmentQuestionResponse(
            user_id=data.user_id,
            question_id=r.question_id,
            selected_choice=r.selected_choice,
            is_correct=is_correct,
            lesson_id=question.lesson_id,
            assessment_id=None
        )
        responses_to_save.append(response_obj)

    score = correct
    return score, total, responses_to_save

def _persist_post_eligibility(result_obj, bkt_result, db):
    """Persist completion eligibility + reason into AssessmentResults row"""
    result_obj.completion_eligible = bkt_result.get("completion_eligible", False)
    result_obj.eligibility_reason = bkt_result.get("eligibility_reason", "not_computed")
    db.commit()
    db.refresh(result_obj)

# -------------------------
# Routes
# -------------------------

@router.get("/assessment/questions/{course_id}")
def get_assessment_questions(course_id: int, assessment_type: str = None, db: Session = Depends(get_db)):
    query = db.query(Question).filter(Question.course_id == course_id)

    if assessment_type:
        query = query.filter(Question.assessment_type == assessment_type)

    questions = query.all()

    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for given parameters.")

    # Randomize the question order
    random.shuffle(questions)

    result = []
    for q in questions:
        # Load options from JSON
        try:
            options = json.loads(q.options) if q.options else []
        except json.JSONDecodeError:
            options = []

        # Handle different question types
        question_data = {
            "id": q.id,
            "lesson_id": q.lesson_id,
            "course_id": q.course_id,
            "text": q.text,
            "type": q.type,
            "assessment_type": q.assessment_type,
            "correct_answer": q.correct_answer
        }
        
        # Add media_url if available (for main question image)
        if hasattr(q, 'media_url') and q.media_url:
            question_data["image"] = q.media_url
        else:
            question_data["image"] = None

        # Handle options based on question type
        if q.type == "image_mcq":
            # Don't randomize image MCQ options as they're objects with images
            question_data["options"] = options
        else:
            # Randomize text options for text_mcq and true_false
            random.shuffle(options)
            question_data["options"] = options

        result.append(question_data)

    return result

@router.get("/assessment/responses/{assessment_id}")
def get_assessment_responses(assessment_id: int, db: Session = Depends(get_db)):
    responses = db.query(AssessmentQuestionResponse).filter(
        AssessmentQuestionResponse.assessment_id == assessment_id
    ).all()

    if not responses:
        raise HTTPException(status_code=404, detail="No responses found for this assessment.")

    result = []
    for r in responses:
        result.append({
            "id": r.id,
            "user_id": r.user_id,
            "assessment_id": r.assessment_id,
            "question_id": r.question_id,
            "selected_choice": r.selected_choice,  
            "is_correct": r.is_correct,
            "lesson_id": r.lesson_id,
            "timestamp": r.timestamp.isoformat()
        })

    return result

@router.post("/assessment/submit", response_model=schema.AssessmentResult)
def submit_assessment(data: schema.AssessmentSubmission, db: Session = Depends(get_db)):
    try:
        # 1. Save responses & compute score (your existing logic)
        score, total, responses = save_assessment_and_responses(data, db)

        # === POST-ASSESSMENT OVERRIDE LOGIC ===
        if data.assessment_type == "post":
            existing = db.query(AssessmentResults).filter_by(
                user_id=data.user_id,
                course_id=data.course_id,
                assessment_type="post"
            ).first()

            if existing:
                # Trigger BKT update
                bkt_result = teki_bkt.update_from_post(user_id=data.user_id, course_id=data.course_id, db=db)

                # Overwrite instead of inserting a new row
                existing.score = score
                existing.date_taken = datetime.utcnow()
                _persist_post_eligibility(existing, bkt_result, db) 

                # Clear old responses & replace them
                db.query(AssessmentQuestionResponse).filter_by(assessment_id=existing.id).delete()
                db.commit()
                for r in responses:
                    r.assessment_id = existing.id
                    db.add(r)
                db.commit()

                return {
                    "user_id": data.user_id,
                    "course_id": data.course_id,
                    "assessment_type": "post",
                    "score": score,
                    "total": total,
                    "bkt_analysis": bkt_result,
                    "improvement_analysis": bkt_result.get("improvement_analysis", {}),
                    "completion_eligible": bkt_result.get("completion_eligible", False),
                }
            
        # === DEFAULT FLOW (pre-assessment + first-time post) ===
        result = AssessmentResults(
            user_id=data.user_id,
            course_id=data.course_id,
            assessment_type=data.assessment_type,
            score=score,
            date_taken=datetime.utcnow()
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        # 3. Link assessment_id to responses & save them
        for r in responses:
            r.assessment_id = result.id
            db.add(r)
        db.commit()

        # 4. EVENT-DRIVEN: Immediately trigger BKT updates with enhanced logic
        if data.assessment_type == "pre":
            bkt_result = teki_bkt.update_from_pre(user_id=data.user_id, course_id=data.course_id, db=db)

        elif data.assessment_type == "post":
            bkt_result = teki_bkt.update_from_post(user_id=data.user_id, course_id=data.course_id, db=db)
            _persist_post_eligibility(result, bkt_result, db)   
        else:
            bkt_result = teki_bkt.update_from_assessments(
            user_id=data.user_id,
            course_id=data.course_id,
            db=db,
            source="general_assessment"
        )

        # 5. Enhanced return with BKT insights
        response_data = {
            "user_id": data.user_id,
            "course_id": data.course_id,
            "assessment_type": data.assessment_type,
            "score": score,
            "total": total,
        }

        if bkt_result:
            response_data["bkt_analysis"] = bkt_result
            if data.assessment_type == "post":
                response_data["improvement_analysis"] = bkt_result.get("improvement_analysis", {})
                response_data["completion_eligible"] = bkt_result.get("completion_eligible", False)

        return response_data

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Assessment submission failed: {str(e)}")

@router.get("/assessment/check/{user_id}/{course_id}")
def check_pre_assessment(user_id: int, course_id: int, db: Session = Depends(get_db)):
    pre = db.query(AssessmentResults).filter(
        AssessmentResults.user_id == user_id,
        AssessmentResults.course_id == course_id,
        AssessmentResults.assessment_type == "pre"
    ).first()
    return {"taken": pre is not None}

@router.get("/assessment/{user_id}")
def get_assessments(user_id: int, db: Session = Depends(get_db)):
    results = db.query(AssessmentResults).filter(AssessmentResults.user_id == user_id).all()
    return results


# ----------------------------
# SIMPLIFIED: Read-Only Recommendation Routes
# ----------------------------

@router.get("/recommendations/{user_id}/{course_id}")
async def get_recommendations(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db)
):
    """
    FAST: Just read pre-computed recommendations from database.
    No BKT computation - assumes event-driven updates keep data fresh.
    """
    try:
        recommendations = teki_bkt.get_recommendations(user_id, course_id, db)
        
        return {
            "user_id": user_id,
            "course_id": course_id,
            "recommendations": recommendations,
            "cache_status": "reading_from_updated_mastery"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@router.get("/mastery/status/{user_id}/{course_id}")
async def get_mastery_status(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db)
):
    """
    Get current mastery status without triggering any updates.
    """
    try:
        from TGbackend.models import UserLessonMastery
        
        masteries = (
            db.query(UserLessonMastery)
            .filter(
                UserLessonMastery.user_id == user_id,
                UserLessonMastery.course_id == course_id,
            )
            .all()
        )
        
        mastery_data = {
            row.lesson_id: {
                "mastery": float(row.estimated_mastery or 0.0),
                "is_mastered": row.is_mastered,
                "last_updated": row.last_updated.isoformat() if row.last_updated else None
            }
            for row in masteries
        }
        
        return {
            "user_id": user_id,
            "course_id": course_id,
            "lesson_masteries": mastery_data,
            "total_lessons": len(mastery_data),
            "mastered_count": sum(1 for data in mastery_data.values() if data["is_mastered"])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mastery status: {str(e)}")

@router.get("/improvement/analysis/{user_id}/{course_id}")
async def get_improvement_analysis(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed improvement analysis comparing pre vs post assessments.
    """
    try:
        from TGbackend.models import UserLessonMastery
        
        # Get current masteries
        current_masteries = (
            db.query(UserLessonMastery)
            .filter(
                UserLessonMastery.user_id == user_id,
                UserLessonMastery.course_id == course_id,
            )
            .all()
        )
        
        if not current_masteries:
            return {
                "status": "no_data",
                "message": "No mastery data available for analysis"
            }
        
        # Convert to dict for analysis
        current_mastery_dict = {
            row.lesson_id: float(row.estimated_mastery or 0.0) 
            for row in current_masteries
        }
        
        # Use BKT service to analyze improvements
        improvement_analysis = teki_bkt._analyze_improvement_from_history(
            user_id, course_id, db, current_mastery_dict
        )
        
        return {
            "user_id": user_id,
            "course_id": course_id,
            "improvement_analysis": improvement_analysis,
            "status": "analysis_complete"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze improvements: {str(e)}")

# ----------------------------
# UTILITY: Manual BKT Trigger (for debugging/admin)
# ----------------------------

@router.post("/bkt/manual-update/{user_id}/{course_id}")
async def manual_bkt_update(
    user_id: int,
    course_id: int,
    source: str = "manual_trigger",
    db: Session = Depends(get_db)
):
    """
    Manual BKT update trigger - useful for debugging or admin actions.
    In production, this should mainly be triggered by assessment submissions.
    """
    try:
        bkt_result = teki_bkt.update_from_assessments(user_id, course_id, db, source)
        
        return {
            "status": "manual_update_complete",
            "bkt_result": bkt_result,
            "message": f"BKT manually updated for user {user_id}, course {course_id}"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Manual BKT update failed: {str(e)}")