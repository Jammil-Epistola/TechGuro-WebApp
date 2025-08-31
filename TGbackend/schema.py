# TGbackend/schemas.py
from pydantic import BaseModel
from typing import List

# -------------------------
# Progress Inputs and Update (detects user Progress)
# -------------------------
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

# -------------------------
# Question response (single answer in an assessment)
# -------------------------
class QuestionResponse(BaseModel):
    question_id: int
    is_correct: bool
    selected_choice: str = None 

# -------------------------
# Incoming payload when submitting an assessment
# -------------------------
class AssessmentSubmission(BaseModel):
    user_id: int
    course_id: int
    assessment_type: str  # "pre" or "post"
    responses: List[QuestionResponse]

# -------------------------
# Response model for returning assessment results
# -------------------------
class AssessmentResult(BaseModel):
    user_id: int
    course_id: int
    assessment_type: str
    score: float
    total: int
    completion_eligible: bool = False        
    eligibility_reason: str | None = None    

    class Config:
        orm_mode = True
