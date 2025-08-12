from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from TGbackend.database import get_db
from TGbackend.models import (
    User, Progress,Question, AssessmentResults, UserLessonMastery, UserLessonMasteryHistory,
    MilestoneEarned, AssessmentQuestionResponse
)
from typing import List

# Main router for general routes
router = APIRouter()

# BKT router for Bayesian Knowledge Tracing specific endpoints
bkt_router = APIRouter(prefix="/bkt", tags=["Bayesian Knowledge Tracing"])


# -------------------------
# Progress Tracking
# -------------------------
class ProgressUpdate(BaseModel):
    user_id: int
    course_id: int
    unit_id: int
    lesson_id: int
    completed: bool = True

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
# Assessment Submission and Queries
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
            "choices": q.choices.split("|"),  # assuming choices stored like "A|B|C|D"
            "correct_answer": q.correct_answer,  # include only if needed
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
            # "selected_choice": r.selected_choice  # include if you add this field
        })

    return result

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


# -------------------------
# Milestones
# -------------------------
@router.get("/milestones/{user_id}")
def get_earned_milestones(user_id: int, db: Session = Depends(get_db)):
    earned = db.query(MilestoneEarned).filter(MilestoneEarned.user_id == user_id).all()
    return earned


# -------------------------
# Lesson Recommendations
# -------------------------
@router.get("/progress-recommendations/{user_id}/{course_id}")
def get_progress_with_recommendations(user_id: int, course_id: int, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter_by(user_id=user_id, course_id=course_id).all()
    completed_lessons = [p.lesson_id for p in progress if p.completed]

    # Example hardcoded lessons for course 1 - adjust or replace with dynamic later
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


# -------------------------
# Data Clearing
# -------------------------
@router.delete("/user/clear-data/{user_id}")
def clear_all_user_data(user_id: int, db: Session = Depends(get_db)):
    # 1. Delete lesson progress
    db.query(Progress).filter(Progress.user_id == user_id).delete()

    # 2. Delete assessment data
    db.query(AssessmentQuestionResponse).filter(AssessmentQuestionResponse.user_id == user_id).delete()
    db.query(AssessmentResults).filter(AssessmentResults.user_id == user_id).delete()

    # 3. Delete BKT / Mastery data
    db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).delete()

    # 4. Delete earned milestones
    db.query(MilestoneEarned).filter(MilestoneEarned.user_id == user_id).delete()

    # 5. Reset user EXP and level
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.exp = 0
        user.level = 1

    db.commit()

    print(f"[CLEAR DATA] All data reset for user_id={user_id}")
    return {
        "status": "All user-related data fully cleared",
        "cleared": [
            "Progress", "AssessmentQuestionResponse", "AssessmentResults",
            "UserLessonMastery", "MilestoneEarned"
        ],
        "reset_fields": {"exp": 0, "level": 1},
        "user_id": user_id
    }


# -------------------------
# BKT Mastery Status (general)
# -------------------------
@router.get("/bkt/status/{user_id}")
def get_bkt_status(user_id: int, db: Session = Depends(get_db)):
    mastery = db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).all()
    return mastery


# =========================
# BKT-specific endpoints (with prefix /bkt)
# =========================

def save_mastery_history(db: Session, user_id: int, course_id: int, assessment_type: str, threshold: float, source: str):
    """
    Save a snapshot of mastery per lesson for a specific assessment type.
    Pulls question responses for the given assessment, calculates mastery per lesson,
    and stores them in UserLessonMasteryHistory.
    """
    responses = (
        db.query(AssessmentQuestionResponse)
        .join(AssessmentResults)
        .filter(
            AssessmentResults.user_id == user_id,
            AssessmentResults.course_id == course_id,
            AssessmentResults.assessment_type == assessment_type,
            AssessmentQuestionResponse.lesson_id.isnot(None)
        )
        .all()
    )

    lesson_correct = {}
    lesson_total = {}
    for r in responses:
        lid = r.lesson_id
        lesson_total[lid] = lesson_total.get(lid, 0) + 1
        if r.is_correct:
            lesson_correct[lid] = lesson_correct.get(lid, 0) + 1

    for lesson_id, total in lesson_total.items():
        correct = lesson_correct.get(lesson_id, 0)
        est_mastery = round(correct / total, 2)
        is_mastered = est_mastery >= threshold

        hist = UserLessonMasteryHistory(
            user_id=user_id,
            course_id=course_id,
            lesson_id=lesson_id,
            estimated_mastery=est_mastery,
            is_mastered=is_mastered,
            assessment_type=assessment_type,
            source=source,
            created_at=datetime.utcnow()
        )
        db.add(hist)

    db.commit()


@bkt_router.post("/update-from-pre")
def update_from_pre(user_id: int, course_id: int, db: Session = Depends(get_db)):
    try:
        responses = db.query(AssessmentQuestionResponse).join(AssessmentResults).filter(
            AssessmentResults.user_id == user_id,
            AssessmentResults.course_id == course_id,
            AssessmentResults.assessment_type == "pre",
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

            mastery = db.query(UserLessonMastery).filter_by(user_id=user_id, lesson_id=lesson_id).first()
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

        save_mastery_history(db, user_id, course_id, "pre", 0.7, source="pre-assessment")

        weak_lessons = [m["lesson_id"] for m in mastery_updates if m["mastery"] < 0.7]
        return {"updated_mastery": mastery_updates, "recommend": weak_lessons}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@bkt_router.post("/update-from-post")
def update_from_post(user_id: int, course_id: int, db: Session = Depends(get_db)):
    responses = db.query(AssessmentQuestionResponse).join(AssessmentResults).filter(
        AssessmentResults.user_id == user_id,
        AssessmentResults.course_id == course_id,
        AssessmentResults.assessment_type == "post",
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
        is_mastered = est_mastery >= 0.85  # stricter threshold for post

        mastery = db.query(UserLessonMastery).filter_by(user_id=user_id, lesson_id=lesson_id).first()
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

    # Save history snapshot
    save_mastery_history(db, user_id, course_id, "post", 0.85, source="post-assessment")

    weak_lessons = [m["lesson_id"] for m in mastery_updates if m["mastery"] < 0.85]
    return {"updated_mastery": mastery_updates, "recommend": weak_lessons}
