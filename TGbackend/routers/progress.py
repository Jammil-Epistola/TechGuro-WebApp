from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from TGbackend.database import SessionLocal
from TGbackend import models

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Progress input schema
class ProgressCreate(BaseModel):
    user_id: int
    course_id: int
    unit_id: int
    lesson_id: int
    completed: bool  # True = lesson/unit completed

@router.post("/progress/update")
def update_progress(progress_data: ProgressCreate, db: Session = Depends(get_db)):
    # Check if progress already exists
    existing = db.query(models.Progress).filter_by(
        user_id=progress_data.user_id,
        course_id=progress_data.course_id,
        unit_id=progress_data.unit_id,
        lesson_id=progress_data.lesson_id
    ).first()

    if existing:
        if progress_data.completed and not existing.completed:
            existing.completed = True
            existing.completed_at = datetime.utcnow()

            # Add EXP (e.g., 10 EXP per lesson)
            user = db.query(models.User).filter_by(id=progress_data.user_id).first()
            user.exp += 10
            db.commit()
            return {"message": "Progress updated. EXP awarded."}
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

        # Add EXP if completed
        if progress_data.completed:
            user = db.query(models.User).filter_by(id=progress_data.user_id).first()
            user.exp += 10
        db.commit()
        return {"message": "Progress created. EXP updated."}
