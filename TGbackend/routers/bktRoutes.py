from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from TGbackend.database import get_db
from TGbackend.models import (
    UserLessonMastery, UserLessonMasteryHistory,
    AssessmentResults, AssessmentQuestionResponse
)

# Main BKT router
router = APIRouter(prefix="/bkt", tags=["Bayesian Knowledge Tracing"])

# -------------------------
# BKT Mastery Status (general)
# -------------------------
@router.get("/status/{user_id}")
def get_bkt_status(user_id: int, db: Session = Depends(get_db)):
    mastery = db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).all()
    return mastery

# =========================
# BKT-specific endpoints
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

@router.post("/update-from-pre")
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

@router.post("/update-from-post")
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