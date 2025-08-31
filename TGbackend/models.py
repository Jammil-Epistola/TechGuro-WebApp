from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
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
    exp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    bio = Column(String, default="")
    date_created = Column(DateTime(timezone=True), server_default=func.now())

    progress = relationship("Progress", back_populates="user")
    earned_milestones = relationship("MilestoneEarned", back_populates="user")


class Progress(Base):
    __tablename__ = "progress"

    progress_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, nullable=False)
    unit_id = Column(Integer, nullable=False)
    lesson_id = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    exp_reward = Column(Integer, default=0)
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

    units = relationship("Unit", back_populates="course")


class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    course = relationship("Course", back_populates="units")
    lessons = relationship("Lesson", back_populates="unit")


class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=True)
    media_url = Column(String, nullable=True)

    unit = relationship("Unit", back_populates="lessons")
    questions = relationship("Question", back_populates="lesson")
    activities = relationship("Activity", back_populates="lesson")
    
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
    id = Column(Integer, primary_key=True, index=True)

    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)

    text = Column(String, nullable=False)
    type = Column(String, nullable=True)
    assessment_type = Column(String, nullable=True)
    choices = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)
    image_url = Column(String, nullable=True)

    lesson = relationship("Lesson", back_populates="questions")
    course = relationship("Course") 

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    type = Column(String, nullable=False)
    instructions = Column(String, nullable=False)
    content = Column(String, nullable=False)

    lesson = relationship("Lesson", back_populates="activities")
