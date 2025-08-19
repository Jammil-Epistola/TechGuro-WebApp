from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any

from TGbackend.database import get_db
from TGbackend.models import (
    Question, AssessmentResults, AssessmentQuestionResponse
)
from TGbackend.services.bkt_ai_service import BKTService  

router = APIRouter(tags=["Assessment Management"])

# Initialize BKT service
bkt_service = BKTService()

# -------------------------
# Existing Assessment Models
# -------------------------
class QuestionResponse(BaseModel):
    question_id: int
    is_correct: bool

class AssessmentSubmission(BaseModel):
    user_id: int
    course_id: int
    assessment_type: str
    score: float
    responses: List[QuestionResponse]

# New BKT-related models
class MasteryPrediction(BaseModel):
    user_id: int
    skill_name: str
    mastery_probability: float
    is_mastered: bool
    confidence_level: str

class SkillRecommendation(BaseModel):
    skill_name: str
    lesson_id: int
    priority: str
    mastery_probability: float
    recommended_action: str

# -------------------------
# Existing Assessment Endpoints
# -------------------------
@router.get("/assessment/questions/{course_id}")
def get_assessment_questions(course_id: int, assessment_type: str = None, db: Session = Depends(get_db)):
    query = db.query(Question).filter(Question.course_id == course_id)

    if assessment_type:
        query = query.filter(Question.assessment_type == assessment_type)

    questions = query.all()

    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for given parameters.")

    result = []
    for q in questions:
        result.append({
            "id": q.id,
            "lesson_id": q.lesson_id,
            "course_id": q.course_id,
            "text": q.text,
            "type": q.type,
            "assessment_type": q.assessment_type,
            "choices": q.choices.split("|"),
            "correct_answer": q.correct_answer,
            "image_url": q.image_url
        })

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
            "is_correct": r.is_correct,
            "lesson_id": r.lesson_id,
            "timestamp": r.timestamp.isoformat()
        })

    return result

@router.post("/assessment/submit")
def submit_assessment(data: AssessmentSubmission, db: Session = Depends(get_db)):
    # Original assessment submission logic
    result = AssessmentResults(
        user_id=data.user_id,
        course_id=data.course_id,
        assessment_type=data.assessment_type,
        score=data.score,
        date_taken=datetime.utcnow()
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    # Hardcoded question -> lesson mapping for Computer Basics
    question_lesson_map = {
        1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 3, 7: 3, 8: 4,
        9: 4, 10: 6, 11: 5, 12: 6, 13: 5, 14: 7, 15: 8
    }

    for response in data.responses:
        lesson_id = question_lesson_map.get(response.question_id, None)
        r = AssessmentQuestionResponse(
            user_id=data.user_id,
            assessment_id=result.id,
            question_id=response.question_id,
            is_correct=response.is_correct,
            lesson_id=lesson_id
        )
        db.add(r)
    db.commit()

    # NEW: Update BKT model after assessment submission
    try:
        bkt_service.update_user_model(data.user_id, db)
    except Exception as e:
        # Log the error but don't fail the assessment submission
        print(f"BKT update failed for user {data.user_id}: {str(e)}")

    return {"status": "Assessment and responses recorded."}

@router.get("/assessment/{user_id}")
def get_assessments(user_id: int, db: Session = Depends(get_db)):
    results = db.query(AssessmentResults).filter(AssessmentResults.user_id == user_id).all()
    return results

@router.get("/assessment/check/{user_id}/{course_id}")
def check_pre_assessment(user_id: int, course_id: int, db: Session = Depends(get_db)):
    pre = db.query(AssessmentResults).filter(
        AssessmentResults.user_id == user_id,
        AssessmentResults.course_id == course_id,
        AssessmentResults.assessment_type == "pre"
    ).first()
    return {"taken": pre is not None}

# -------------------------
# NEW: BKT-Enhanced Endpoints
# -------------------------
@router.get("/assessment/mastery/{user_id}")
def get_user_mastery(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get current mastery levels for all skills for a user
    """
    try:
        mastery_data = bkt_service.get_user_mastery(user_id, db)
        return {
            "user_id": user_id,
            "mastery_levels": mastery_data,
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting mastery data: {str(e)}")

@router.get("/assessment/recommendations/{user_id}")
def get_learning_recommendations(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get personalized learning recommendations based on BKT analysis
    """
    try:
        recommendations = bkt_service.get_recommendations(user_id, db)
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")

@router.get("/assessment/next-skill/{user_id}")
def get_next_skill(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get the next skill/lesson the user should focus on
    """
    try:
        next_skill = bkt_service.get_next_skill_recommendation(user_id, db)
        return {
            "user_id": user_id,
            "next_skill": next_skill,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting next skill: {str(e)}")

@router.post("/assessment/update-model/{user_id}")
def update_bkt_model(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Manually trigger BKT model update for a user (useful for testing)
    """
    try:
        result = bkt_service.update_user_model(user_id, db)
        return {
            "user_id": user_id,
            "update_result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating BKT model: {str(e)}")

@router.get("/assessment/skill-progress/{user_id}/{skill_name}")
def get_skill_progress(user_id: int, skill_name: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get detailed progress for a specific skill
    """
    try:
        progress = bkt_service.get_skill_progress(user_id, skill_name, db)
        return {
            "user_id": user_id,
            "skill_name": skill_name,
            "progress": progress,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting skill progress: {str(e)}")

@router.get("/assessment/difficulty-adjustment/{user_id}")
def get_difficulty_adjustment(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get recommended difficulty level adjustments based on BKT analysis
    """
    try:
        adjustment = bkt_service.get_difficulty_adjustment(user_id, db)
        return {
            "user_id": user_id,
            "difficulty_adjustment": adjustment,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting difficulty adjustment: {str(e)}")

# -------------------------
# Admin/Debug Endpoints
# -------------------------
@router.get("/assessment/bkt-status")
def get_bkt_status() -> Dict[str, Any]:
    """
    Get current BKT service status and model information
    """
    return bkt_service.get_model_info()

@router.post("/assessment/retrain-model/{course_id}")
def retrain_bkt_model(course_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Retrain BKT model with all available data for a course
    """
    try:
        result = bkt_service.retrain_model_for_course(course_id, db)
        return {
            "course_id": course_id,
            "retrain_result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retraining model: {str(e)}")