from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from TGbackend.database import get_db
from TGbackend import models
from TGbackend.models import Progress

router = APIRouter(tags=["Progress Tracking"])

# Progress input schema
class ProgressCreate(BaseModel):
    user_id: int
    course_id: int
    unit_id: int
    lesson_id: int
    completed: bool  

class ProgressUpdate(BaseModel):
    user_id: int
    course_id: int
    unit_id: int
    lesson_id: int
    completed: bool = True

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
def update_progress(progress_data: ProgressCreate, db: Session = Depends(get_db)):
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

    if existing:
        if progress_data.completed and not existing.completed:
            existing.completed = True
            existing.completed_at = datetime.utcnow()
            exp_gained += 10  # Lesson completion
            message = "Progress updated. "
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

    user.exp += exp_gained
    leveled_up = check_level_up(user)
    db.commit()

    if leveled_up:
        message += "Level Up!"

    return {
        "message": message.strip(),
        "exp_gained": exp_gained,
        "new_level": user.level,
        "current_exp": user.exp
    }

@router.post("/progress/bkt-update")
def update_progress_bkt(data: ProgressUpdate, db: Session = Depends(get_db)):
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

    # Example hardcoded lessons for course 1 - adjust or replace with dynamic later
    course1_lessons = [1, 2, 3, 4, 5, 6, 7, 8]

    mastery = db.query(models.UserLessonMastery).filter(
        models.UserLessonMastery.user_id == user_id,
        models.UserLessonMastery.lesson_id.in_(course1_lessons)
    ).all()
    recommended = [m.lesson_id for m in mastery if m.estimated_mastery < 0.7]

    post_unlocked = len(completed_lessons) >= 8

    return {
        "completed_lessons": completed_lessons,
        "recommended_lessons": recommended,
        "post_assessment_unlocked": post_unlocked
    }