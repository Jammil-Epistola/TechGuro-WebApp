from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from TGbackend.database import get_db
from TGbackend.models import (
    Question, AssessmentResults, AssessmentQuestionResponse
)

router = APIRouter(tags=["Assessment Management"])

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