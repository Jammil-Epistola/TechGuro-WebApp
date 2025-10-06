#userRoutes.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, date, timedelta
from TGbackend import models
from TGbackend.database import get_db
from TGbackend.schema import UserCreate, UserLogin, UserProfileUpdate, ForgotPasswordRequest, VerifyCodeRequest, ResetPasswordRequest
from TGbackend.email_config import send_reset_email
import secrets
import os

router = APIRouter(tags=["User Management"])

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Secret key for JWT (use environment variable in production)
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
# Store reset codes temporarily (use Redis in production)
reset_codes = {}

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
        "bio": db_user.bio or "",  
        "profile_icon": db_user.profile_icon or "avatar_default.png",
        "age": age,
        "is_elderly": is_elderly,
    }

@router.post("/forgot-password")
async def request_password_reset(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset code to user's email"""
    email = request.email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If the email exists, a reset code has been sent"}
    
    # Generate 6-digit code
    reset_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store code with expiration (15 minutes)
    reset_codes[email] = {
        "code": reset_code,
        "expires": datetime.utcnow() + timedelta(minutes=15)
    }
    
    # Send email
    try:
        await send_reset_email(email, reset_code)
        return {"message": "Reset code sent to your email"}
    except Exception as e:
        print(f"Email sending failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

@router.post("/verify-reset-code")
def verify_reset_code(request: VerifyCodeRequest, db: Session = Depends(get_db)):
    """Verify the reset code"""
    email = request.email
    code = request.code
    if email not in reset_codes:
        raise HTTPException(status_code=400, detail="No reset request found")
    
    stored_data = reset_codes[email]
    
    # Check expiration
    if datetime.utcnow() > stored_data["expires"]:
        del reset_codes[email]
        raise HTTPException(status_code=400, detail="Reset code expired")
    
    # Verify code
    if stored_data["code"] != code:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    
    # Generate temporary token for password reset
    reset_token = jwt.encode(
        {"email": email, "exp": datetime.utcnow() + timedelta(minutes=15)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {"message": "Code verified", "reset_token": reset_token}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using verified token"""
    reset_token = request.reset_token
    new_password = request.new_password
    try:
        # Decode token
        payload = jwt.decode(reset_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        # Get user
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update password
        user.password_hash = pwd_context.hash(new_password)
        db.commit()
        
        # Clean up reset code
        if email in reset_codes:
            del reset_codes[email]
        
        return {"message": "Password reset successfully"}
        
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

@router.put("/user/update/{user_id}")
def update_user_profile(user_id: int, update: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    
    if update.username is not None:
        user.username = update.username
    if update.bio is not None:  
        user.bio = update.bio
    if update.profile_icon is not None:
        user.profile_icon = update.profile_icon

    db.commit()
    db.refresh(user)

    return {
        "message": "User profile updated successfully",
        "user": {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,  
            "bio": user.bio,
            "profile_icon": user.profile_icon
        }
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

    # 5. Reset user profile extras (no more exp/level)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.bio = ""

    db.commit()

    print(f"[CLEAR DATA] All data reset for user_id={user_id}")
    return {
        "status": "All user-related data fully cleared",
        "cleared": [
            "Progress", "AssessmentQuestionResponse", "AssessmentResults",
            "UserLessonMastery", "MilestoneEarned"
        ],
        "user_id": user_id
    }
