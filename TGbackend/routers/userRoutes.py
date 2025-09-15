from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, date
from TGbackend import models
from TGbackend.database import get_db

router = APIRouter(tags=["User Management"])

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    birthday: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Helper: EXP and Leveling
def check_level_up(user):
    exp_needed = int(100 * (1.3 ** (user.level - 1)))
    leveled_up = False
    level_up_attempts = 0  

    while user.exp >= exp_needed:
        user.exp -= exp_needed
        user.level += 1
        leveled_up = True
        exp_needed = int(100 * (1.3 ** (user.level - 1)))

        level_up_attempts += 1 
        if level_up_attempts > 100:  
            break 

    return leveled_up

# Register endpoint
@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        email=user.email,
        username=user.username,
        password_hash=hashed_password,
        birthday=user.birthday
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id}

# Login endpoint
@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # -------------------------
    # Award Milestone #1: "Welcome to TechGuro!"
    # -------------------------
    earned = db.query(models.MilestoneEarned).filter(
        models.MilestoneEarned.user_id == db_user.id,
        models.MilestoneEarned.milestone_id == 1
    ).first()

    if not earned:
        milestone_earned = models.MilestoneEarned(user_id=db_user.id, milestone_id=1)
        db.add(milestone_earned)

        # Check milestone rewards
        milestone = db.query(models.Milestone).filter(models.Milestone.id == 1).first()
        if milestone and milestone.exp_reward:
            db_user.exp += milestone.exp_reward
            check_level_up(db_user)

        db.commit()

    # Calculate age
    today = date.today()
    age = today.year - db_user.birthday.year - (
        (today.month, today.day) < (db_user.birthday.month, db_user.birthday.day)
    )
    is_elderly = age >= 60

    return {
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "age": age,
        "is_elderly": is_elderly,
        "exp": db_user.exp,
        "level": db_user.level,
    }

# -------------------------
# Data Clearing
# -------------------------
@router.delete("/user/clear-data/{user_id}")
def clear_all_user_data(user_id: int, db: Session = Depends(get_db)):
    # 1. Delete lesson progress
    db.query(models.Progress).filter(models.Progress.user_id == user_id).delete()

    # 2. Delete assessment data
    db.query(models.AssessmentQuestionResponse).filter(models.AssessmentQuestionResponse.user_id == user_id).delete()
    db.query(models.AssessmentResults).filter(models.AssessmentResults.user_id == user_id).delete()

    # 3. Delete BKT / Mastery data
    db.query(models.UserLessonMastery).filter(models.UserLessonMastery.user_id == user_id).delete()

    # 4. Delete earned milestones
    db.query(models.MilestoneEarned).filter(models.MilestoneEarned.user_id == user_id).delete()

    # 5. Reset user EXP and level
    user = db.query(models.User).filter(models.User.id == user_id).first()
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
