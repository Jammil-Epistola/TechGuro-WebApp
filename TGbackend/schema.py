# TGbackend/schema.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional, Any

# -------------------------
# Schema for Users
# -------------------------
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    birthday: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    username: str | None = None
    bio: str | None = None
    profile_icon: str | None = None 

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

class RequestAccountUnlockRequest(BaseModel):
    email: EmailStr

class VerifyUnlockCodeRequest(BaseModel):
    email: EmailStr
    code: str

class UnlockAccountRequest(BaseModel):
    email: EmailStr
    unlock_token: str

#------------------------
# For Administrator
#------------------------
class AdminCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    birthday: datetime

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

# For returning user data with assessment info to admin
class UserAssessmentData(BaseModel):
    user_id: int
    username: str
    email: str
    birthday: datetime
    date_created: datetime
    pre_assessment_status: str  # "not_taken", "taken"
    pre_assessment_score: Optional[float] = None
    pre_assessment_date: Optional[datetime] = None
    post_assessment_status: str  # "disabled", "enabled"
    post_assessment_score: Optional[float] = None
    post_assessment_date: Optional[datetime] = None
    course_progress: dict  # {course_id: {"course_name": str, "status": "completed"/"not_completed"}}

    class Config:
        orm_mode = True



# -------------------------
# Progress Inputs and Update (detects user Progress)
# -------------------------
class ProgressCreate(BaseModel):
    user_id: int
    course_id: int
    lesson_id: int
    completed: bool  

class ProgressUpdate(BaseModel):
    user_id: int
    course_id: int
    lesson_id: int
    completed: bool = True

# -------------------------
# Milestone response
# -------------------------
class MilestoneEarnedOut(BaseModel):
    id: int
    title: str
    description: str
    icon_url: str
    status: str

    class Config:
        orm_mode = True

class MilestoneOut(BaseModel):
    id: int
    title: str
    description: str
    icon_url: str
    status: str
    notification_shown: bool = False 

    class Config:
        orm_mode = True

# -------------------------
# Question response (single answer in an assessment)
# -------------------------
class QuestionResponse(BaseModel):
    question_id: int
    is_correct: bool = False
    selected_choice: str | None = None

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

#--------------------------
# Quiz-related Schema
#---------------------------
class QuizSubmission(BaseModel):
    answers: List[Any]  
    time_taken: Optional[int] = None  
    question_ids: Optional[List[int]] = None  
    
class QuizCreate(BaseModel):
    course_id: int
    quiz_title: str
    quiz_type: str  # "drag_drop", "typing", "multiple_choice"
    difficulty: Optional[str] = None
    time_limit: Optional[int] = None
    description: Optional[str] = None
    related_lessons: Optional[List[int]] = None
    
class QuizQuestionCreate(BaseModel):
    quiz_id: int
    question_number: int
    question_text: str
    question_type: str
    correct_answer: Optional[str] = None
    options: Optional[List[Any]] = None
    drag_items: Optional[List[Any]] = None
    drop_zones: Optional[List[Any]] = None
    question_image: Optional[str] = None
