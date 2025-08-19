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

    # Fixed: Add missing relationships for BKT integration
    progress = relationship("Progress", back_populates="user")
    earned_milestones = relationship("MilestoneEarned", back_populates="user")
    assessment_results = relationship("AssessmentResults", back_populates="user")
    assessment_responses = relationship("AssessmentQuestionResponse", back_populates="user")
    lesson_mastery = relationship("UserLessonMastery", back_populates="user")
    mastery_history = relationship("UserLessonMasteryHistory", back_populates="user")


class Progress(Base):
    __tablename__ = "progress"

    progress_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Fixed: Add FK constraint
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)      # Fixed: Add FK constraint  
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)  # Fixed: Add FK constraint
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    # Fixed: Add all missing relationships
    user = relationship("User", back_populates="progress")
    course = relationship("Course", back_populates="progress")
    unit = relationship("Unit", back_populates="progress") 
    lesson = relationship("Lesson", back_populates="progress")


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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Fixed: Make nullable=False
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Fixed: Add FK constraint
    assessment_type = Column(String)  # 'pre' or 'post'
    score = Column(Float)
    date_taken = Column(DateTime, default=datetime.utcnow)

    # Fixed: Add missing relationships for BKT
    user = relationship("User", back_populates="assessment_results")
    course = relationship("Course", back_populates="assessment_results")
    responses = relationship("AssessmentQuestionResponse", back_populates="assessment")


class AssessmentQuestionResponse(Base):
    __tablename__ = "assessment_question_responses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Fixed: Make nullable=False
    assessment_id = Column(Integer, ForeignKey("assessment_results.id"), nullable=False)  # Fixed: Make nullable=False
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)  # Fixed: Add FK constraint
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)  # Fixed: Add FK constraint
    selected_choice = Column(String, nullable=True)
    is_correct = Column(Boolean, nullable=False)  # Fixed: Make nullable=False for BKT
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Fixed: Add all missing relationships for BKT traversal
    user = relationship("User", back_populates="assessment_responses")
    assessment = relationship("AssessmentResults", back_populates="responses")
    question = relationship("Question", back_populates="responses")
    lesson = relationship("Lesson", back_populates="responses")


class UserLessonMastery(Base):
    __tablename__ = "user_lesson_mastery"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Fixed: Make nullable=False
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)  # Fixed: Add FK constraint
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)  # Fixed: Add missing course_id
    estimated_mastery = Column(Float, nullable=False, default=0.0)  # Between 0.0 and 1.0
    last_updated = Column(DateTime, default=datetime.utcnow)
    is_mastered = Column(Boolean, default=False)  # threshold flag

    # Fixed: Add missing relationships for BKT
    user = relationship("User", back_populates="lesson_mastery")
    lesson = relationship("Lesson", back_populates="mastery_records")
    course = relationship("Course", back_populates="mastery_records")


class UserLessonMasteryHistory(Base):
    __tablename__ = "user_lesson_mastery_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False) 
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)  # Fixed: Add FK constraint
    estimated_mastery = Column(Float, nullable=False)
    is_mastered = Column(Boolean, nullable=False, default=False)
    assessment_type = Column(String, nullable=True)  # e.g., "pre", "post"
    source = Column(String, nullable=False) 
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Fixed: Add missing relationships
    user = relationship("User", back_populates="mastery_history")
    course = relationship("Course", back_populates="mastery_history")
    lesson = relationship("Lesson", back_populates="mastery_history")


# ===================
# Course Content Models
# ===================
class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    # Fixed: Add missing back_populates for BKT integration
    units = relationship("Unit", back_populates="course")
    progress = relationship("Progress", back_populates="course")
    assessment_results = relationship("AssessmentResults", back_populates="course")
    mastery_records = relationship("UserLessonMastery", back_populates="course")
    mastery_history = relationship("UserLessonMasteryHistory", back_populates="course")
    questions = relationship("Question", back_populates="course")


class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    course = relationship("Course", back_populates="units")
    lessons = relationship("Lesson", back_populates="unit")
    progress = relationship("Progress", back_populates="unit")  # Fixed: Add missing relationship


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
    
    # Fixed: Add missing relationships for BKT integration
    progress = relationship("Progress", back_populates="lesson")
    responses = relationship("AssessmentQuestionResponse", back_populates="lesson")
    mastery_records = relationship("UserLessonMastery", back_populates="lesson")
    mastery_history = relationship("UserLessonMasteryHistory", back_populates="lesson")


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
    course = relationship("Course", back_populates="questions")  # Fixed: Add back_populates
    responses = relationship("AssessmentQuestionResponse", back_populates="question")  # Fixed: Add missing relationship


class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    type = Column(String, nullable=False)
    instructions = Column(String, nullable=False)
    content = Column(String, nullable=False)

    lesson = relationship("Lesson", back_populates="activities")