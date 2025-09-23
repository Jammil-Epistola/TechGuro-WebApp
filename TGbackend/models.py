from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
import json
from TGbackend.database import Base

# ===================
# User Models
# ===================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    birthday = Column(DateTime, nullable=False)
    bio = Column(String, default="")
    profile_icon = Column(String, default="avatar_default.png")
    date_created = Column(DateTime(timezone=True), server_default=func.now())

    progress = relationship("Progress", back_populates="user")
    earned_milestones = relationship("MilestoneEarned", back_populates="user")


class Progress(Base):
    __tablename__ = "progress"

    progress_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, nullable=False)
    lesson_id = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon_url = Column(String, default="placeholderimg")

    users_earned = relationship("MilestoneEarned", back_populates="milestone")

class MilestoneEarned(Base):
    __tablename__ = "milestones_earned"

    earned_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    milestone_id = Column(Integer, ForeignKey("milestones.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="earned_milestones")
    milestone = relationship("Milestone", back_populates="users_earned")


class AssessmentResults(Base):
    __tablename__ = "assessment_results"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer)
    assessment_type = Column(String)  # 'pre' or 'post'
    score = Column(Float)
    date_taken = Column(DateTime, default=datetime.utcnow)
    completion_eligible = Column(Boolean, default=False)  
    eligibility_reason = Column(String, nullable=True)    


class AssessmentQuestionResponse(Base):
    __tablename__ = "assessment_question_responses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    assessment_id = Column(Integer, ForeignKey("assessment_results.id"))
    question_id = Column(Integer)
    selected_choice = Column(String, nullable=True)
    is_correct = Column(Boolean)
    lesson_id = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)


class UserLessonMastery(Base):
    __tablename__ = "user_lesson_mastery"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    lesson_id = Column(Integer)
    estimated_mastery = Column(Float)  # Between 0.0 and 1.0
    last_updated = Column(DateTime, default=datetime.utcnow)
    is_mastered = Column(Boolean)  # threshold flag


# UserLessonMasteryHistory for tracking changes over time
class UserLessonMasteryHistory(Base):
    __tablename__ = "user_lesson_mastery_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False) 
    lesson_id = Column(Integer, nullable=False)
    estimated_mastery = Column(Float, nullable=False)
    is_mastered = Column(Boolean, nullable=False, default=False)
    assessment_type = Column(String, nullable=True)  # e.g., "pre", "post"
    source = Column(String, nullable=False) 
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False) 


# ===================
# Course Content Models
# ===================
class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    lessons = relationship("Lesson", back_populates="course")

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=True)
    media_url = Column(String, nullable=True)

    course = relationship("Course", back_populates="lessons")
    questions = relationship("Question", back_populates="lesson")
    slides = relationship("LessonSlides", back_populates="lesson", cascade="all, delete-orphan")

class LessonSlides(Base):
    __tablename__ = "lesson_slides"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    slide_number = Column(Integer, nullable=False)
    content = Column(String, nullable=True)  # Could hold HTML/Markdown/text
    media_url = Column(String, nullable=True)  # Optional image/video/audio link
    date_created = Column(DateTime(timezone=True), server_default=func.now())

    lesson = relationship("Lesson", back_populates="slides")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)

    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)

    text = Column(String, nullable=False)
    type = Column(String, nullable=True)  # "text_mcq", "image_mcq", "true_false"
    assessment_type = Column(String, nullable=True)  # "pre" or "post"
    media_url = Column(String, nullable=True)  # Optional image, audio, or video#

    # Store options as JSON string
    options = Column(String, nullable=False)

    
    # Correct answer as a single string
    correct_answer = Column(String, nullable=False)  

    lesson = relationship("Lesson", back_populates="questions")
    course = relationship("Course")

# ===================
# Quiz Models
# ===================
class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)  # Now specific to one lesson
    title = Column(String, nullable=False)
    quiz_type = Column(String, nullable=False)  # "drag_drop", "typing", "multiple_choice"
    difficulty = Column(String, nullable=True)  # "easy", "medium", "hard" (mainly for typing)
    time_limit = Column(Integer, nullable=True)  # in seconds, mainly for typing quiz
    description = Column(String, nullable=True)
    total_questions = Column(Integer, nullable=False)
    date_created = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    course = relationship("Course")
    lesson = relationship("Lesson")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    results = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False) 
    question_number = Column(Integer, nullable=False)
    question_text = Column(String, nullable=False)  
    question_type = Column(String, nullable=False)  
    
    # For different question types
    correct_answer = Column(String, nullable=True)  
    options = Column(String, nullable=True)  # JSON string for MC and drag-drop options
    drag_items = Column(String, nullable=True)  # JSON string for drag-drop: items to drag
    drop_zones = Column(String, nullable=True)  # JSON string for drag-drop: where items go
    
    # Media support
    media_url = Column(String, nullable=True)  
    
    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
    course = relationship("Course")
    lesson = relationship("Lesson")


class QuizResult(Base):
    __tablename__ = "quiz_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)  
    quiz_type = Column(String, nullable=False) 
    score = Column(Integer, nullable=False)  # Number of correct answers
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    time_taken = Column(Integer, nullable=True)  # in seconds
    completed_at = Column(DateTime, default=datetime.utcnow)
    answers = Column(String, nullable=True)  # JSON string of user's answers for review
    
    # Relationships
    user = relationship("User")
    quiz = relationship("Quiz", back_populates="results")
    course = relationship("Course")
    lesson = relationship("Lesson")