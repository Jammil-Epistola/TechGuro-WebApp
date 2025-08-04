from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, date
from TGbackend import models
from TGbackend.database import SessionLocal

router = APIRouter()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    birthday: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProgressCreate(BaseModel):
    user_id: int
    course_id: int
    unit_id: int
    lesson_id: int
    completed: bool

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

# Helper: Award Milestone
def award_milestone(user: models.User, milestone_title: str, db: Session):
    # Find the milestone by title
    milestone = db.query(models.Milestone).filter_by(title=milestone_title).first()
    if not milestone:
        return False  # Milestone not found, exit safely

    # Check if user already earned it
    existing = db.query(models.MilestoneEarned).filter_by(
        user_id=user.id,
        milestone_id=milestone.id
    ).first()

    if existing:
        return False  # Already earned

    # Award milestone
    earned = models.MilestoneEarned(
        user_id=user.id,
        milestone_id=milestone.id,
        earned_at=datetime.utcnow()
    )
    db.add(earned)

    # Give EXP reward
    user.exp += milestone.exp_reward

    leveled_up = check_level_up(user)  # Reuse level-up logic
    return True


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

    # Calculate age
    today = date.today()
    age = today.year - db_user.birthday.year - (
        (today.month, today.day) < (db_user.birthday.month, db_user.birthday.day)
    )
    is_elderly = age >= 60

    # Award milestone: Welcome to TechGuro
    milestone_awarded = False
    leveled_up = False 

    milestone = db.query(models.Milestone).filter_by(title="Welcome to TechGuro").first()

    if milestone:
        already_earned = db.query(models.MilestoneEarned).filter_by(
            user_id=db_user.id,
            milestone_id=milestone.id
        ).first()

        if not already_earned:
            new_earned = models.MilestoneEarned(
                user_id=db_user.id,
                milestone_id=milestone.id,
                earned_at=datetime.utcnow()
            )
            db.add(new_earned)
            db_user.exp += milestone.exp_reward  # ✅ Use exp_reward from model
            milestone_awarded = True

            # Level up check
            leveled_up = check_level_up(db_user)
            db.commit()
    else:
        raise HTTPException(status_code=500, detail="Milestone 'Welcome to TechGuro' not found in database")

    return {
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "age": age,
        "is_elderly": is_elderly,
        "exp": db_user.exp,
        "level": db_user.level,
        "milestone_awarded": milestone_awarded,
        "leveled_up": leveled_up
    }


# Update Progress endpoint
@router.post("/progress/update")
def update_progress(progress_data: ProgressCreate, db: Session = Depends(get_db)):
    # Check if progress already exists
    existing = db.query(models.Progress).filter_by(
        user_id=progress_data.user_id,
        course_id=progress_data.course_id,
        unit_id=progress_data.unit_id,
        lesson_id=progress_data.lesson_id
    ).first()

    user = db.query(models.User).filter_by(id=progress_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    exp_gained = 0
    message = ""

    if existing:
        if progress_data.completed and not existing.completed:
            existing.completed = True
            existing.completed_at = datetime.utcnow()
            exp_gained += 10  # Lesson completion
            message = "Progress updated. "
        else:
            return {"message": "Progress already recorded."}
    else:
        new_progress = models.Progress(
            user_id=progress_data.user_id,
            course_id=progress_data.course_id,
            unit_id=progress_data.unit_id,
            lesson_id=progress_data.lesson_id,
            completed=progress_data.completed,
            completed_at=datetime.utcnow() if progress_data.completed else None
        )
        db.add(new_progress)
        if progress_data.completed:
            exp_gained += 10
        message = "Progress created. "

    # Unit completion check
    if progress_data.completed:
        unit_lessons = db.query(models.Progress).filter_by(
            user_id=progress_data.user_id,
            course_id=progress_data.course_id,
            unit_id=progress_data.unit_id
        ).all()

        if unit_lessons and all(p.completed for p in unit_lessons):
            exp_gained += 50
            message += "Unit completed! "

        # Course completion check
        course_progress = db.query(models.Progress).filter_by(
            user_id=progress_data.user_id,
            course_id=progress_data.course_id
        ).all()

        units_by_id = {}
        for p in course_progress:
            if p.unit_id not in units_by_id:
                units_by_id[p.unit_id] = []
            units_by_id[p.unit_id].append(p)

        all_units_completed = all(all(l.completed for l in lessons) for lessons in units_by_id.values())

        if course_progress and all_units_completed:
            exp_gained += 100
            message += "Course completed! "

    user.exp += exp_gained
    leveled_up = check_level_up(user)
    db.commit()

    if leveled_up:
        message += "Level Up!"

    return {
        "message": message.strip(),
        "exp_gained": exp_gained,
        "new_level": user.level,
        "current_exp": user.exp
    }
