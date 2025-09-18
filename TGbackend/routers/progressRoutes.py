#progressRoutes.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from TGbackend.database import get_db
from TGbackend import models
from TGbackend import schema
from TGbackend.services.bkt_service import teki_bkt
from TGbackend.models import Progress

router = APIRouter(tags=["Progress Tracking"])

@router.post("/progress/update")
def update_progress(progress_data: schema.ProgressCreate, db: Session = Depends(get_db)):
    # Check if progress already exists
    existing = db.query(models.Progress).filter_by(
        user_id=progress_data.user_id,
        course_id=progress_data.course_id,
        unit_id=progress_data.unit_id,
        lesson_id=progress_data.lesson_id
    ).first()

    user = db.query(models.User).filter_by(id=progress_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    message = ""
    lesson_newly_completed = False

    if existing:
        if progress_data.completed and not existing.completed:
            existing.completed = True
            existing.completed_at = datetime.utcnow()
            message = "Progress updated. "
            lesson_newly_completed = True
        else:
            return {"message": "Progress already recorded."}
    else:
        new_progress = models.Progress(
            user_id=progress_data.user_id,
            course_id=progress_data.course_id,
            unit_id=progress_data.unit_id,
            lesson_id=progress_data.lesson_id,
            completed=progress_data.completed,
            completed_at=datetime.utcnow() if progress_data.completed else None
        )
        db.add(new_progress)
        if progress_data.completed:
            lesson_newly_completed = True
        message = "Progress created. "

    # EVENT-DRIVEN BKT INTEGRATION: Update mastery when lesson is completed
    bkt_update_result = None
    if lesson_newly_completed:
        try:
            bkt_update_result = teki_bkt.update_from_assessments(
                user_id=progress_data.user_id, 
                course_id=progress_data.course_id, 
                db=db, 
                source="lesson_completion"
            )
        except Exception as e:
            print(f"BKT update failed for user {progress_data.user_id}, lesson {progress_data.lesson_id}: {e}")

    db.commit()

    response_data = {
        "message": message.strip(),
        "lesson_completed": lesson_newly_completed
    }

    if bkt_update_result and bkt_update_result.get("updated_masteries"):
        response_data["mastery_updates"] = bkt_update_result["updated_masteries"]

    return response_data

@router.post("/progress/bkt-update")
def update_progress_bkt(data: schema.ProgressUpdate, db: Session = Depends(get_db)):
    progress = Progress(
        user_id=data.user_id,
        course_id=data.course_id,
        unit_id=data.unit_id,
        lesson_id=data.lesson_id,
        completed=data.completed,
        completed_at=datetime.utcnow()
    )
    db.add(progress)
    db.commit()
    return {"status": "Lesson marked as completed."}

@router.get("/progress/{user_id}")
def get_progress(user_id: int, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter(Progress.user_id == user_id).all()
    return progress

# -------------------------
# Lesson Recommendations
# -------------------------
@router.get("/progress-recommendations/{user_id}/{course_id}")
def get_progress_with_recommendations(user_id: int, course_id: int, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter_by(user_id=user_id, course_id=course_id).all()
    completed_lessons = [p.lesson_id for p in progress if p.completed]

    # === Post-assessment status ===
    post_assessment = (
        db.query(models.AssessmentResults)
        .filter_by(user_id=user_id, course_id=course_id, assessment_type="post")
        .first()
    )
    post_completed = bool(post_assessment and post_assessment.score is not None)
    post_passed = bool(post_assessment and getattr(post_assessment, "completion_eligible", False))

    # === AI Recommendations ===
    try:
        ai_recommendations = teki_bkt.get_recommendations(user_id, course_id, db)
        recommended_lessons = ai_recommendations.get("recommended_lessons", [])
    except Exception as e:
        print(f"BKT recommendations failed for user {user_id}: {e}")
        recommended_lessons = []

    # === Compute recommended lessons completed ===
    completed_recommended = [l for l in recommended_lessons if l in completed_lessons]

    all_recommended_done = (
        len(recommended_lessons) > 0 and 
        len(completed_recommended) == len(recommended_lessons)
    )

    # ✅ FIXED: Post-assessment unlock logic
    # Allow retry if they completed recommended lessons, regardless of previous attempts
    # Only lock if they already passed (post_passed = True)
    post_assessment_unlocked = all_recommended_done and not post_passed

    course_completed = all_recommended_done and post_passed

    return {
        "completed_lessons": completed_lessons,
        "recommended_lessons": recommended_lessons,
        "completed_recommended": completed_recommended,
        "recommended_total": len(recommended_lessons),
        "recommended_completed_count": len(completed_recommended),
        "post_assessment_completed": post_completed,
        "post_assessment_passed": post_passed,
        "course_completed": course_completed,
        "post_assessment_unlocked": post_assessment_unlocked, 
        "unlock_reason": None if all_recommended_done else "Complete all recommended lessons first!"
    }


# -------------------------
# AI Analysis
# -------------------------
@router.get("/progress/ai-analysis/{user_id}/{course_id}")
def get_ai_learning_analysis(user_id: int, course_id: int, db: Session = Depends(get_db)):
    """
    Detailed AI analysis for progress tracking - separate from assessments.
    Shows how lesson completion affects mastery predictions.
    """
    try:
        # Get detailed BKT analysis
        recommendations = teki_bkt.get_recommendations(user_id, course_id, db)
        
        # Get current progress for context
        progress = db.query(Progress).filter_by(user_id=user_id, course_id=course_id).all()
        completed_lessons = [p.lesson_id for p in progress if p.completed]
        
        return {
            "user_id": user_id,
            "course_id": course_id,
            "completed_lessons_count": len(completed_lessons),
            "ai_recommendations": recommendations,
            "learning_insights": {
                "mastered_skills": len([m for m in recommendations.get("mastery_analysis", {}).values() 
                                     if m.get("priority") == "DONE"]),
                "high_priority_skills": len([m for m in recommendations.get("mastery_analysis", {}).values() 
                                           if m.get("priority") == "HIGH"]),
                "suggested_next_steps": recommendations.get("recommended_lessons", [])[:3]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")