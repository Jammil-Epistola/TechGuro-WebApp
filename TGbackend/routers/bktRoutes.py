from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from TGbackend.database import get_db
from TGbackend.models import Progress, AssessmentResults, UserLessonMastery, MilestoneEarned
from datetime import datetime

router = APIRouter()

class ProgressUpdate(BaseModel):
    user_id: int
    course_id: int
    unit_id: int
    lesson_id: int
    completed: bool = True

@router.post("/progress/update")
def update_progress(data: ProgressUpdate, db: Session = Depends(get_db)):
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

@router.post("/assessment/submit")
def submit_assessment(user_id: int, course_id: int, assessment_type: str, score: float, db: Session = Depends(get_db)):
    result = AssessmentResults(
        user_id=user_id,
        course_id=course_id,
        assessment_type=assessment_type,
        score=score,
        date_taken=datetime.utcnow()
    )
    db.add(result)
    db.commit()
    return {"status": "Assessment recorded."}

@router.get("/assessment/{user_id}")
def get_assessments(user_id: int, db: Session = Depends(get_db)):
    results = db.query(AssessmentResults).filter(AssessmentResults.user_id == user_id).all()
    return results

@router.get("/milestones/{user_id}")
def get_earned_milestones(user_id: int, db: Session = Depends(get_db)):
    earned = db.query(MilestoneEarned).filter(MilestoneEarned.user_id == user_id).all()
    return earned

@router.get("/bkt/status/{user_id}")
def get_bkt_status(user_id: int, db: Session = Depends(get_db)):
    mastery = db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).all()
    return mastery

@router.get("/lessons/recommended/{user_id}/{course_id}")
def get_recommended_lessons(user_id: int, course_id: int, db: Session = Depends(get_db)):
    mastery = db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).all()
    weak_lessons = [m.lesson_id for m in mastery if m.estimated_mastery < 0.7]
    # Placeholder 
    lessons = [{"lesson_id": lid, "title": f"Lesson {lid}"} for lid in weak_lessons]
    return lessons
