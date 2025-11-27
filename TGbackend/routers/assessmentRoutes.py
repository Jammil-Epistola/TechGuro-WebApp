#assessmentRoutes.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import json, random

from TGbackend.database import get_db
from TGbackend.services.bkt_service import teki_bkt
from TGbackend.services.milestone_service import award_milestone_if_not_earned
from TGbackend import schema
from TGbackend.models import (
    Question, AssessmentResults, AssessmentQuestionResponse, MilestoneEarned, Milestone
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
        
        milestone_awarded = None  # Initialize milestone tracking

        if data.assessment_type == "pre":
            bkt_result = teki_bkt.update_from_pre(user_id=data.user_id, course_id=data.course_id, db=db)
            
            # -------------------------
            # Award Milestone #2: "First Steps"
            # Trigger: Complete a Pre-Assessment in any course
            # -------------------------
            try:
                milestone_result = award_milestone_if_not_earned(
                    user_id=data.user_id,
                    milestone_id=2,
                    db=db
                )
                
                # If milestone was newly awarded (not already earned)
                if milestone_result["status"] == "milestone_awarded":
                    # Fetch full milestone details
                    milestone = db.query(Milestone).filter(
                        Milestone.id == 2
                    ).first()
                    
                    if milestone:
                        milestone_awarded = {
                            "id": milestone.id,
                            "title": milestone.title,
                            "description": milestone.description,
                            "icon_url": milestone.icon_url
                        }
                
                print(f"Milestone #2 check: {milestone_result}")
            except Exception as e:
                print(f"Error awarding Milestone #2: {str(e)}")

        elif data.assessment_type == "post":
            bkt_result = teki_bkt.update_from_post(user_id=data.user_id, course_id=data.course_id, db=db)
            _persist_post_eligibility(result, bkt_result, db)
            
            # -------------------------
            # Award Course Completion Milestones (4-8)
            # Collect all newly earned milestones
            # -------------------------
            milestones_to_award = []  # ✅ NEW: Collect milestones
            
            if bkt_result.get("completion_eligible", False):
                try:
                    # Milestone #4: Course Conqueror (First course)
                    total_courses_completed = db.query(AssessmentResults).filter(
                        AssessmentResults.user_id == data.user_id,
                        AssessmentResults.assessment_type == "post",
                        AssessmentResults.completion_eligible == True
                    ).count()
                    
                    if total_courses_completed == 1:
                        milestone_result = award_milestone_if_not_earned(
                            user_id=data.user_id,
                            milestone_id=4,
                            db=db
                        )
                        if milestone_result["status"] == "milestone_awarded":
                            milestone = db.query(Milestone).filter(Milestone.id == 4).first()
                            if milestone:
                                milestones_to_award.append({
                                    "id": milestone.id,
                                    "title": milestone.title,
                                    "description": milestone.description,
                                    "icon_url": milestone.icon_url
                                })
                        print(f"Milestone #4 check: {milestone_result}")
                    
                    # Milestone #5: Computer Basics (course_id=1)
                    if data.course_id == 1:
                        milestone_result = award_milestone_if_not_earned(
                            user_id=data.user_id,
                            milestone_id=5,
                            db=db
                        )
                        if milestone_result["status"] == "milestone_awarded":
                            milestone = db.query(Milestone).filter(Milestone.id == 5).first()
                            if milestone:
                                milestones_to_award.append({
                                    "id": milestone.id,
                                    "title": milestone.title,
                                    "description": milestone.description,
                                    "icon_url": milestone.icon_url
                                })
                        print(f"Milestone #5 check: {milestone_result}")
                    
                    # Milestone #6: Internet Safety (course_id=2)
                    elif data.course_id == 2:
                        milestone_result = award_milestone_if_not_earned(
                            user_id=data.user_id,
                            milestone_id=6,
                            db=db
                        )
                        if milestone_result["status"] == "milestone_awarded":
                            milestone = db.query(Milestone).filter(Milestone.id == 6).first()
                            if milestone:
                                milestones_to_award.append({
                                    "id": milestone.id,
                                    "title": milestone.title,
                                    "description": milestone.description,
                                    "icon_url": milestone.icon_url
                                })
                        print(f"Milestone #6 check: {milestone_result}")
                    
                    # Milestone #7: Digital Communication (course_id=3)
                    elif data.course_id == 3:
                        milestone_result = award_milestone_if_not_earned(
                            user_id=data.user_id,
                            milestone_id=7,
                            db=db
                        )
                        if milestone_result["status"] == "milestone_awarded":
                            milestone = db.query(Milestone).filter(Milestone.id == 7).first()
                            if milestone:
                                milestones_to_award.append({
                                    "id": milestone.id,
                                    "title": milestone.title,
                                    "description": milestone.description,
                                    "icon_url": milestone.icon_url
                                })
                        print(f"Milestone #7 check: {milestone_result}")
                    
                    # Milestone #8: TechGuru (All courses)
                    completed_courses = db.query(AssessmentResults).filter(
                        AssessmentResults.user_id == data.user_id,
                        AssessmentResults.assessment_type == "post",
                        AssessmentResults.completion_eligible == True
                    ).all()
                    
                    completed_course_ids = {result.course_id for result in completed_courses}
                    
                    if completed_course_ids >= {1, 2, 3}:
                        milestone_result = award_milestone_if_not_earned(
                            user_id=data.user_id,
                            milestone_id=8,
                            db=db
                        )
                        if milestone_result["status"] == "milestone_awarded":
                            milestone = db.query(Milestone).filter(Milestone.id == 8).first()
                            if milestone:
                                milestones_to_award.append({
                                    "id": milestone.id,
                                    "title": milestone.title,
                                    "description": milestone.description,
                                    "icon_url": milestone.icon_url
                                })
                        print(f"Milestone #8 check: {milestone_result}")
                        
                except Exception as e:
                    print(f"Error awarding course completion milestones: {str(e)}")
            
            # ✅ Store milestones for frontend (if any were awarded)
            if milestones_to_award:
                milestone_awarded = milestones_to_award  # Will be a list now
            else:
                milestone_awarded = None
        else:
            bkt_result = teki_bkt.update_from_assessments(
            user_id=data.user_id,
            course_id=data.course_id,
            db=db,
            source="general_assessment"
        )

       # 5. Enhanced return with BKT insights + milestone info
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

        # Add milestone info if it was newly awarded
        if milestone_awarded:
            response_data["milestones_awarded"] = milestone_awarded

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
    
    formatted_results = []
    for result in results:
        # Count questions for assessment
        question_count = db.query(Question).filter(
            Question.course_id == result.course_id,
            Question.assessment_type == result.assessment_type
        ).count()
        
        total_questions = question_count if question_count > 0 else 20
        
        formatted_result = {
            "id": result.id,
            "user_id": result.user_id,
            "course_id": result.course_id,
            "assessment_type": result.assessment_type,
            "score": result.score,
            "total": total_questions,  # Add the missing total field
            "date_taken": result.date_taken.isoformat() if result.date_taken else None,
            "completion_eligible": getattr(result, 'completion_eligible', None),
            "eligibility_reason": getattr(result, 'eligibility_reason', None)
        }
        formatted_results.append(formatted_result)
    
    return formatted_results


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
    
# NEW ENDPOINT: Assessment Growth Analysis
@router.get("/assessment/growth-analysis/{user_id}/{course_id}")
def get_assessment_growth_analysis(user_id: int, course_id: int, db: Session = Depends(get_db)):
    """
    Get detailed assessment growth analysis comparing pre vs post assessment.
    Includes growth metrics, lesson-level breakdown, and improvement highlights.
    """
    from TGbackend.models import User, Course, Lesson
    from datetime import timedelta
    
    # Verify user and course exist
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get pre and post assessments
    pre_assessment = db.query(AssessmentResults).filter(
        AssessmentResults.user_id == user_id,
        AssessmentResults.course_id == course_id,
        AssessmentResults.assessment_type == "pre"
    ).first()
    
    post_assessment = db.query(AssessmentResults).filter(
        AssessmentResults.user_id == user_id,
        AssessmentResults.course_id == course_id,
        AssessmentResults.assessment_type == "post"
    ).first()
    
    # If no assessments taken yet
    if not pre_assessment and not post_assessment:
        return {
            "user_id": user_id,
            "course_id": course_id,
            "status": "no_assessments",
            "message": "No assessments taken yet for this course"
        }
    
    # If only pre-assessment taken
    if pre_assessment and not post_assessment:
        return {
            "user_id": user_id,
            "course_id": course_id,
            "status": "pre_only",
            "pre_score": pre_assessment.score,
            "pre_date": pre_assessment.date_taken.isoformat() if pre_assessment.date_taken else None,
            "message": "Only pre-assessment completed. Take post-assessment to see growth."
        }
    
    # Calculate overall growth metrics
    pre_score = pre_assessment.score if pre_assessment else 0
    post_score = post_assessment.score
    
    # Get total questions (use post-assessment total, or count questions)
    total_questions = db.query(Question).filter(
        Question.course_id == course_id,
        Question.assessment_type == "post"
    ).count()
    
    if total_questions == 0:
        total_questions = 20  # Default fallback
    
    # Calculate percentages
    pre_percentage = round((pre_score / total_questions) * 100, 2) if pre_score > 0 else 0
    post_percentage = round((post_score / total_questions) * 100, 2)
    
    # Calculate improvement
    score_improvement = post_score - pre_score
    percentage_improvement = round(post_percentage - pre_percentage, 2)
    
    # Calculate study period
    study_period_days = None
    growth_rate = None
    
    if pre_assessment and post_assessment and pre_assessment.date_taken and post_assessment.date_taken:
        study_period = post_assessment.date_taken - pre_assessment.date_taken
        study_period_days = study_period.days
        
        # Calculate growth rate (improvement per day)
        if study_period_days > 0:
            growth_rate = round(percentage_improvement / study_period_days, 2)
    
    # Get lesson-level breakdown
    pre_responses = db.query(AssessmentQuestionResponse).filter(
        AssessmentQuestionResponse.assessment_id == pre_assessment.id if pre_assessment else -1
    ).all()
    
    post_responses = db.query(AssessmentQuestionResponse).filter(
        AssessmentQuestionResponse.assessment_id == post_assessment.id
    ).all()
    
    # Group responses by lesson
    lesson_performance = {}
    
    # Process pre-assessment responses
    for response in pre_responses:
        lesson_id = response.lesson_id
        if lesson_id not in lesson_performance:
            lesson_performance[lesson_id] = {
                "lesson_id": lesson_id,
                "pre_correct": 0,
                "pre_total": 0,
                "post_correct": 0,
                "post_total": 0
            }
        
        lesson_performance[lesson_id]["pre_total"] += 1
        if response.is_correct:
            lesson_performance[lesson_id]["pre_correct"] += 1
    
    # Process post-assessment responses
    for response in post_responses:
        lesson_id = response.lesson_id
        if lesson_id not in lesson_performance:
            lesson_performance[lesson_id] = {
                "lesson_id": lesson_id,
                "pre_correct": 0,
                "pre_total": 0,
                "post_correct": 0,
                "post_total": 0
            }
        
        lesson_performance[lesson_id]["post_total"] += 1
        if response.is_correct:
            lesson_performance[lesson_id]["post_correct"] += 1
    
    # Calculate lesson-level improvements
    lesson_breakdown = []
    for lesson_id, data in lesson_performance.items():
        # Get lesson title
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        lesson_title = lesson.title if lesson else f"Lesson {lesson_id}"
        
        # Calculate percentages
        pre_lesson_percentage = round((data["pre_correct"] / data["pre_total"]) * 100, 2) if data["pre_total"] > 0 else 0
        post_lesson_percentage = round((data["post_correct"] / data["post_total"]) * 100, 2) if data["post_total"] > 0 else 0
        
        improvement = round(post_lesson_percentage - pre_lesson_percentage, 2)
        
        lesson_breakdown.append({
            "lesson_id": lesson_id,
            "lesson_title": lesson_title,
            "pre_percentage": pre_lesson_percentage,
            "post_percentage": post_lesson_percentage,
            "improvement": improvement,
            "pre_correct": data["pre_correct"],
            "pre_total": data["pre_total"],
            "post_correct": data["post_correct"],
            "post_total": data["post_total"]
        })
    
    # Sort by improvement (descending) to identify strongest areas
    lesson_breakdown.sort(key=lambda x: x["improvement"], reverse=True)
    
    # Identify strongest and weakest improvements
    strongest_improvements = [l for l in lesson_breakdown if l["improvement"] > 0][:3]
    weakest_improvements = [l for l in lesson_breakdown if l["improvement"] <= 0][:3]
    
    # Generate improvement highlights
    highlights = []
    
    # Overall improvement highlight
    if percentage_improvement > 0:
        highlights.append({
            "type": "overall_improvement",
            "icon": "📈",
            "message": f"Great progress! You improved by {percentage_improvement}% overall",
            "value": percentage_improvement
        })
    elif percentage_improvement < 0:
        highlights.append({
            "type": "needs_review",
            "icon": "⚠️",
            "message": f"Score decreased by {abs(percentage_improvement)}%. Review the material and try again",
            "value": percentage_improvement
        })
    else:
        highlights.append({
            "type": "no_change",
            "icon": "➡️",
            "message": "Score remained the same. More practice recommended",
            "value": 0
        })
    
    # Study period highlight
    if study_period_days is not None:
        if study_period_days <= 7:
            highlights.append({
                "type": "quick_learner",
                "icon": "⚡",
                "message": f"Completed course in {study_period_days} days - fast learner!",
                "value": study_period_days
            })
        elif study_period_days <= 30:
            highlights.append({
                "type": "consistent_learner",
                "icon": "📚",
                "message": f"Steady progress over {study_period_days} days",
                "value": study_period_days
            })
        else:
            highlights.append({
                "type": "persistent_learner",
                "icon": "💪",
                "message": f"Dedicated learning over {study_period_days} days - persistence pays off!",
                "value": study_period_days
            })
    
    # Strongest improvement area highlight
    if strongest_improvements:
        best_lesson = strongest_improvements[0]
        highlights.append({
            "type": "strongest_area",
            "icon": "⭐",
            "message": f"Biggest improvement in: {best_lesson['lesson_title']} (+{best_lesson['improvement']}%)",
            "lesson_id": best_lesson["lesson_id"],
            "value": best_lesson["improvement"]
        })
    
    # Mastery status highlight
    if post_percentage >= 80:
        highlights.append({
            "type": "mastery_achieved",
            "icon": "🏆",
            "message": f"Excellent mastery at {post_percentage}%!",
            "value": post_percentage
        })
    elif post_percentage >= 60:
        highlights.append({
            "type": "proficient",
            "icon": "✅",
            "message": f"Good understanding at {post_percentage}%",
            "value": post_percentage
        })
    
    return {
        "user_id": user_id,
        "course_id": course_id,
        "course_title": course.title,
        "status": "complete_analysis",
        
        # Overall metrics
        "overall_metrics": {
            "pre_score": pre_score,
            "post_score": post_score,
            "total_questions": total_questions,
            "pre_percentage": pre_percentage,
            "post_percentage": post_percentage,
            "score_improvement": score_improvement,
            "percentage_improvement": percentage_improvement,
            "study_period_days": study_period_days,
            "growth_rate_per_day": growth_rate
        },
        
        # Date information
        "dates": {
            "pre_assessment_date": pre_assessment.date_taken.isoformat() if pre_assessment and pre_assessment.date_taken else None,
            "post_assessment_date": post_assessment.date_taken.isoformat() if post_assessment.date_taken else None
        },
        
        # Lesson-level breakdown
        "lesson_breakdown": lesson_breakdown,
        
        # Improvement areas
        "strongest_improvements": strongest_improvements,
        "weakest_improvements": weakest_improvements,
        
        # Visual highlights for dashboard
        "highlights": highlights
    }

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