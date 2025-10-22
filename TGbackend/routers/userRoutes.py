#userRoutes.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, date, timedelta
from TGbackend import models
from TGbackend.database import get_db
from TGbackend.schema import UserCreate, UserLogin, UserProfileUpdate, ForgotPasswordRequest, VerifyCodeRequest, ResetPasswordRequest, RequestAccountUnlockRequest, VerifyUnlockCodeRequest, UnlockAccountRequest
from TGbackend.email_config import send_reset_email, send_account_unlock_email
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
unlock_codes = {}

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


#  Login endpoint
@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Find user by email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    # 2. Check if account is locked
    if db_user and db_user.is_locked:
        raise HTTPException(status_code=423, detail="Account is locked. Check your email for unlock instructions.")
    
    # 3. Check if user exists and password is correct
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        if db_user:
            # Increment failed login attempts
            db_user.failed_login_attempts += 1
            db_user.last_failed_login = datetime.utcnow()
            
            # First cycle: 3 failed attempts triggers 1 min cooldown
            if db_user.failed_login_attempts == 3:
                db.commit()
                raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again in 1 minute.")
            
            # Second cycle: Another 3 failed attempts (total 6) locks account
            elif db_user.failed_login_attempts == 6:
                db_user.is_locked = True
                db_user.locked_at = datetime.utcnow()
                db.commit()
                raise HTTPException(status_code=423, detail="Account locked due to multiple failed attempts. Check your email for unlock instructions.")
            
            db.commit()
        
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # 4. Check cooldown period (1 minute after first 3 failures)
    if db_user.failed_login_attempts >= 3 and db_user.last_failed_login:
        cooldown_time = db_user.last_failed_login + timedelta(minutes=1)
        if datetime.utcnow() < cooldown_time:
            raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again later.")
    
    # 5. Reset failed attempts on successful login
    db_user.failed_login_attempts = 0
    db_user.last_failed_login = None
    db.commit()
    
    # 6. Award Milestone #1: "Welcome to TechGuro!"
    earned = db.query(models.MilestoneEarned).filter(
        models.MilestoneEarned.user_id == db_user.id,
        models.MilestoneEarned.milestone_id == 1
    ).first()

    if not earned:
        milestone_earned = models.MilestoneEarned(user_id=db_user.id, milestone_id=1)
        db.add(milestone_earned)
        db.commit()

    # 7. Calculate user age
    today = date.today()
    age = today.year - db_user.birthday.year - (
        (today.month, today.day) < (db_user.birthday.month, db_user.birthday.day)
    )
    is_elderly = age >= 60

    # 8. Prepare milestone data for frontend notification
    milestone_data = None
    if not earned:
        milestone = db.query(models.Milestone).filter(
            models.Milestone.id == 1
        ).first()
        
        if milestone:
            milestone_data = {
                "id": milestone.id,
                "title": milestone.title,
                "description": milestone.description,
                "icon_url": milestone.icon_url
            }

    # 9. Return user data 
    return {
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "bio": db_user.bio or "",  
        "profile_icon": db_user.profile_icon or "avatar_default.png",
        "age": age,
        "is_elderly": is_elderly,
        "role": db_user.role,  
        "milestone_awarded": milestone_data
    }


@router.post("/forgot-password")
async def request_password_reset(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset code to user's email"""
    email = request.email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # Don't reveal if email exists for security, but don't process further
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

# ---- ACCOUNT UNLOCK ENDPOINTS ----

@router.post("/request-account-unlock")
async def request_account_unlock(request: RequestAccountUnlockRequest, db: Session = Depends(get_db)):
    """Send account unlock code to user's email"""
    email = request.email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # Don't reveal if email exists for security, but don't process further
        return {"message": "If the account exists, an unlock code has been sent"}
    
    if not user.is_locked:
        # Account not locked, don't send code
        return {"message": "If the account is locked, an unlock code has been sent"}
    
    # Generate 6-digit unlock code
    unlock_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store code with expiration (30 minutes)
    unlock_codes[email] = {
        "code": unlock_code,
        "expires": datetime.utcnow() + timedelta(minutes=30)
    }
    
    # Send email
    try:
        await send_account_unlock_email(email, unlock_code)
        return {"message": "Unlock code sent to your email"}
    except Exception as e:
        print(f"Email sending failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")


@router.post("/verify-unlock-code")
def verify_unlock_code(request: VerifyUnlockCodeRequest, db: Session = Depends(get_db)):
    """Verify the unlock code"""
    email = request.email
    code = request.code
    
    if email not in unlock_codes:
        raise HTTPException(status_code=400, detail="No unlock request found")
    
    stored_data = unlock_codes[email]
    
    # Check expiration
    if datetime.utcnow() > stored_data["expires"]:
        del unlock_codes[email]
        raise HTTPException(status_code=400, detail="Unlock code expired")
    
    # Verify code
    if stored_data["code"] != code:
        raise HTTPException(status_code=400, detail="Invalid unlock code")
    
    # Generate temporary unlock token
    unlock_token = jwt.encode(
        {"email": email, "exp": datetime.utcnow() + timedelta(minutes=30)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {
        "message": "Code verified",
        "unlock_token": unlock_token,
        "password_reset_note": "If you don't remember your password, you can reset it using the Forgot Password option after unlocking your account."
    }


@router.post("/unlock-account")
def unlock_account(request: UnlockAccountRequest, db: Session = Depends(get_db)):
    """Unlock the account using verified token"""
    unlock_token = request.unlock_token
    email = request.email
    
    try:
        # Decode token
        payload = jwt.decode(unlock_token, SECRET_KEY, algorithms=[ALGORITHM])
        token_email = payload.get("email")
        
        if not token_email or token_email != email:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        # Get user
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Unlock account and reset attempts
        user.is_locked = False
        user.locked_at = None
        user.failed_login_attempts = 0
        user.last_failed_login = None
        db.commit()
        
        # Clean up unlock code
        if email in unlock_codes:
            del unlock_codes[email]
        
        return {"message": "Account unlocked successfully"}
        
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
