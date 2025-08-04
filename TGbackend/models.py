from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
from TGbackend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    birthday = Column(DateTime, nullable=False)
    exp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    bio = Column(String, default="")  # Optional
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

class UserLessonMastery(Base):
    __tablename__ = "user_lesson_mastery"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer)
    estimated_mastery = Column(Float)  # Between 0.0 and 1.0
    last_updated = Column(DateTime, default=datetime.utcnow)
    is_mastered = Column(Boolean)  # Optional threshold flag
