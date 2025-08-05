from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from TGbackend.database import get_db
from TGbackend.models import (
    Progress, AssessmentResults, UserLessonMastery, MilestoneEarned,
    AssessmentQuestionResponse
)
from datetime import datetime
from typing import List

router = APIRouter()

# Progress Tracking 
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

# Assessment Submit with Per-Question Responses 
class QuestionResponse(BaseModel):
    question_id: int
    is_correct: bool

class AssessmentSubmission(BaseModel):
    user_id: int
    course_id: int
    assessment_type: str 
    score: float
    responses: List[QuestionResponse]

@router.post("/assessment/submit")
def submit_assessment(data: AssessmentSubmission, db: Session = Depends(get_db)):
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

# BKT Mastery Status 
@router.get("/bkt/status/{user_id}")
def get_bkt_status(user_id: int, db: Session = Depends(get_db)):
    mastery = db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).all()
    return mastery

# Lesson Recommendations
@router.get("/progress-recommendations/{user_id}/{course_id}")
def get_progress_with_recommendations(user_id: int, course_id: int, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter_by(user_id=user_id, course_id=course_id).all()
    completed_lessons = [p.lesson_id for p in progress if p.completed]

    course1_lessons = [1, 2, 3, 4, 5, 6, 7, 8]

    mastery = db.query(UserLessonMastery).filter(
        UserLessonMastery.user_id == user_id,
        UserLessonMastery.lesson_id.in_(course1_lessons)
    ).all()
    recommended = [m.lesson_id for m in mastery if m.estimated_mastery < 0.7]

    post_unlocked = len(completed_lessons) >= 8  

    return {
        "completed_lessons": completed_lessons,
        "recommended_lessons": recommended,
        "post_assessment_unlocked": post_unlocked
    }

# Milestones 
@router.get("/milestones/{user_id}")
def get_earned_milestones(user_id: int, db: Session = Depends(get_db)):
    earned = db.query(MilestoneEarned).filter(MilestoneEarned.user_id == user_id).all()
    return earned

# BKT Update Endpoint
@router.post("/bkt/update-from-pre")
def update_bkt_from_pre(user_id: int, course_id: int, db: Session = Depends(get_db)):
    responses = db.query(AssessmentQuestionResponse).filter(
        AssessmentQuestionResponse.user_id == user_id,
        AssessmentQuestionResponse.lesson_id.isnot(None)
    ).all()

    lesson_correct = {}
    lesson_total = {}
    for r in responses:
        lid = r.lesson_id
        lesson_total[lid] = lesson_total.get(lid, 0) + 1
        if r.is_correct:
            lesson_correct[lid] = lesson_correct.get(lid, 0) + 1

    mastery_updates = []
    for lesson_id, total in lesson_total.items():
        correct = lesson_correct.get(lesson_id, 0)
        est_mastery = round(correct / total, 2)
        is_mastered = est_mastery >= 0.7

        mastery = db.query(UserLessonMastery).filter_by(
            user_id=user_id, lesson_id=lesson_id
        ).first()
        if mastery:
            mastery.estimated_mastery = est_mastery
            mastery.is_mastered = is_mastered
            mastery.last_updated = datetime.utcnow()
        else:
            mastery = UserLessonMastery(
                user_id=user_id,
                lesson_id=lesson_id,
                estimated_mastery=est_mastery,
                is_mastered=is_mastered,
                last_updated=datetime.utcnow()
            )
            db.add(mastery)
        mastery_updates.append({"lesson_id": lesson_id, "mastery": est_mastery})
    db.commit()

    weak_lessons = [m["lesson_id"] for m in mastery_updates if m["mastery"] < 0.7]
    return {"updated_mastery": mastery_updates, "recommend": weak_lessons}

# Clear User Data Endpoint
@router.delete("/user/clear-data/{user_id}")
def clear_all_user_data(user_id: int, db: Session = Depends(get_db)):
    # Clear Progress
    db.query(Progress).filter(Progress.user_id == user_id).delete()

    # Clear Assessments and Question Responses
    db.query(AssessmentQuestionResponse).filter(AssessmentQuestionResponse.user_id == user_id).delete()
    db.query(AssessmentResults).filter(AssessmentResults.user_id == user_id).delete()

    # Clear BKT Mastery Data
    db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).delete()

    # Note: MilestoneEarned is NOT deleted
    db.commit()
    return {"status": "User data cleared except for milestones and account info", "user_id": user_id}

