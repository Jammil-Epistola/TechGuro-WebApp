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

# Helper: EXP and Leveling
def check_level_up(user):
    exp_needed = int(100 * (1.3 ** (user.level - 1)))
    leveled_up = False
    level_up_attempts = 0  

    while user.exp >= exp_needed:
        user.exp -= exp_needed
        user.level += 1
        leveled_up = True
        exp_needed = int(100 * (1.3 ** (user.level - 1)))

        level_up_attempts += 1 
        if level_up_attempts > 100:  
            break 

    return leveled_up

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

    exp_gained = 0
    message = ""
    lesson_newly_completed = False

    if existing:
        if progress_data.completed and not existing.completed:
            existing.completed = True
            existing.completed_at = datetime.utcnow()
            exp_gained += 10  # Lesson completion
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
            exp_gained += 10
            lesson_newly_completed = True
        message = "Progress created. "

    # Unit completion check
    if progress_data.completed:
        unit_lessons = db.query(models.Progress).filter_by(
            user_id=progress_data.user_id,
            course_id=progress_data.course_id,
            unit_id=progress_data.unit_id
        ).all()

        if unit_lessons and all(p.completed for p in unit_lessons):
            exp_gained += 50
            message += "Unit completed! "

        # Course completion check
        course_progress = db.query(models.Progress).filter_by(
            user_id=progress_data.user_id,
            course_id=progress_data.course_id
        ).all()

        units_by_id = {}
        for p in course_progress:
            if p.unit_id not in units_by_id:
                units_by_id[p.unit_id] = []
            units_by_id[p.unit_id].append(p)

        all_units_completed = all(all(l.completed for l in lessons) for lessons in units_by_id.values())

        if course_progress and all_units_completed:
            exp_gained += 100
            message += "Course completed! "

    # EVENT-DRIVEN BKT INTEGRATION: Update mastery when lesson is completed
    bkt_update_result = None
    if lesson_newly_completed:
        try:
            # Trigger BKT update to refresh mastery calculations
            bkt_update_result = teki_bkt.update_from_assessments(
                user_id=progress_data.user_id, 
                course_id=progress_data.course_id, 
                db=db, 
                source="lesson_completion"
            )
        except Exception as e:
            # Don't fail progress update if BKT fails - log it instead
            print(f"BKT update failed for user {progress_data.user_id}, lesson {progress_data.lesson_id}: {e}")

    user.exp += exp_gained
    leveled_up = check_level_up(user)
    db.commit()

    if leveled_up:
        message += "Level Up!"

    # Enhanced response with BKT insights (optional)
    response_data = {
        "message": message.strip(),
        "exp_gained": exp_gained,
        "new_level": user.level,
        "current_exp": user.exp,
        "lesson_completed": lesson_newly_completed
    }

    # Add BKT insights if available (for frontend to show mastery updates)
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

    # === Unlock logic ===
    post_assessment_unlocked = all_recommended_done  # ✅ NEW FIELD
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
        "post_assessment_unlocked": all_recommended_done and not post_completed,
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