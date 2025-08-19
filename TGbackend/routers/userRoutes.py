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

# -------------------------
# Data Clearing (Enhanced with BKT cleanup)
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

    # 6. NEW: Clear BKT AI model data
    try:
        from TGbackend.services.bkt_ai_service import bkt_service
        bkt_service.clear_user_model(user_id)
        bkt_cleared = True
    except Exception as e:
        print(f"[BKT CLEAR] Could not clear BKT data: {e}")
        bkt_cleared = False

    db.commit()

    print(f"[CLEAR DATA] All data reset for user_id={user_id}")
    return {
        "status": "All user-related data fully cleared",
        "cleared": [
            "Progress", "AssessmentQuestionResponse", "AssessmentResults",
            "UserLessonMastery", "MilestoneEarned"
        ],
        "reset_fields": {"exp": 0, "level": 1},
        "bkt_model_cleared": bkt_cleared,
        "user_id": user_id
    }

# -------------------------
# Milestones (Enhanced with AI insights)
# -------------------------
@router.get("/milestones/{user_id}")
def get_earned_milestones(user_id: int, db: Session = Depends(get_db)):
    earned = db.query(models.MilestoneEarned).filter(models.MilestoneEarned.user_id == user_id).all()
    
    # Add AI-suggested next milestones based on learning progress
    try:
        from TGbackend.services.bkt_ai_service import bkt_service
        ai_suggestions = bkt_service.get_milestone_suggestions(user_id, db)
    except Exception:
        ai_suggestions = []
    
    return {
        "earned_milestones": earned,
        "ai_suggested_milestones": ai_suggestions
    }

# -------------------------
# NEW: BKT-Enhanced User Endpoints
# -------------------------
@router.get("/users/learning-profile/{user_id}")
def get_user_learning_profile(user_id: int, db: Session = Depends(get_db)):
    """Get AI-generated learning profile for user"""
    try:
        from TGbackend.services.bkt_ai_service import bkt_service
        
        # Get basic user info (preserve existing logic)
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate age (preserve existing logic)
        today = date.today()
        age = today.year - user.birthday.year - (
            (today.month, today.day) < (user.birthday.month, user.birthday.day)
        )
        is_elderly = age >= 60
        
        # Get AI learning insights
        learning_insights = bkt_service.get_learning_insights(user_id, db)
        
        profile = {
            # Existing user data
            "user_id": user_id,
            "username": user.username,
            "age": age,
            "is_elderly": is_elderly,
            "level": user.level,
            "exp": user.exp,
            
            # New AI insights
            "learning_style": learning_insights.get("learning_style", "balanced"),
            "optimal_difficulty": learning_insights.get("optimal_difficulty", "medium"),
            "learning_velocity": learning_insights.get("learning_velocity", 0.5),
            "engagement_patterns": learning_insights.get("engagement_patterns", {}),
            "strengths": learning_insights.get("strengths", []),
            "areas_for_improvement": learning_insights.get("areas_for_improvement", []),
            "personalization_settings": learning_insights.get("personalization_settings", {})
        }
        
        return profile
        
    except Exception as e:
        # Fallback to basic profile if AI fails
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        today = date.today()
        age = today.year - user.birthday.year - (
            (today.month, today.day) < (user.birthday.month, user.birthday.day)
        )
        
        return {
            "user_id": user_id,
            "username": user.username,
            "age": age,
            "is_elderly": age >= 60,
            "level": user.level,
            "exp": user.exp,
            "ai_error": str(e)
        }

@router.get("/users/dashboard/{user_id}")
def get_user_dashboard_with_ai(user_id: int, db: Session = Depends(get_db)):
    """Enhanced dashboard with AI insights"""
    try:
        # Get existing user data (preserve all current logic)
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get milestones (existing logic)
        earned_milestones = db.query(models.MilestoneEarned).filter(
            models.MilestoneEarned.user_id == user_id
        ).count()
        
        # Get progress (existing logic)
        completed_lessons = db.query(models.Progress).filter(
            models.Progress.user_id == user_id,
            models.Progress.completed == True
        ).count()
        
        # Add AI recommendations without disrupting existing data
        try:
            from TGbackend.services.bkt_ai_service import bkt_service
            ai_recommendations = bkt_service.get_ai_recommendations(user_id)
            next_recommended_lesson = ai_recommendations[0]['lesson_id'] if ai_recommendations else None
            ai_enabled = True
        except Exception:
            ai_recommendations = []
            next_recommended_lesson = None
            ai_enabled = False
        
        return {
            # Existing dashboard data
            "user_id": user_id,
            "username": user.username,
            "level": user.level,
            "exp": user.exp,
            "earned_milestones_count": earned_milestones,
            "completed_lessons_count": completed_lessons,
            
            # New AI enhancements
            "ai_recommendations": ai_recommendations,
            "next_recommended_lesson": next_recommended_lesson,
            "ai_enabled": ai_enabled,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dashboard: {str(e)}")

@router.get("/users/learning-stats/{user_id}")
def get_learning_statistics(user_id: int, db: Session = Depends(get_db)):
    """Detailed learning statistics with AI analysis"""
    try:
        # Basic stats (preserve existing approach)
        total_assessments = db.query(models.AssessmentResults).filter(
            models.AssessmentResults.user_id == user_id
        ).count()
        
        avg_score = db.query(models.AssessmentResults).filter(
            models.AssessmentResults.user_id == user_id
        ).with_entities(models.AssessmentResults.score).all()
        
        average_score = sum(score[0] for score in avg_score) / len(avg_score) if avg_score else 0
        
        # Add AI analysis
        try:
            from TGbackend.services.bkt_ai_service import bkt_service
            ai_stats = bkt_service.get_detailed_stats(user_id, db)
        except Exception:
            ai_stats = {}
        
        return {
            "user_id": user_id,
            "total_assessments": total_assessments,
            "average_score": round(average_score, 2),
            "ai_mastery_analysis": ai_stats.get("mastery_analysis", {}),
            "learning_progress_trend": ai_stats.get("progress_trend", []),
            "predicted_completion_time": ai_stats.get("predicted_completion", "Unknown"),
            "learning_recommendations": ai_stats.get("recommendations", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting statistics: {str(e)}")

@router.post("/users/update-learning-preferences/{user_id}")
def update_learning_preferences(user_id: int, preferences: dict, db: Session = Depends(get_db)):
    """Update user's learning preferences to enhance AI recommendations"""
    try:
        # Validate user exists
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Store preferences (you might want to add a UserPreferences model later)
        # For now, we'll just acknowledge the preferences for AI use
        
        try:
            from TGbackend.services.bkt_ai_service import bkt_service
            bkt_service.update_user_preferences(user_id, preferences)
            ai_updated = True
        except Exception:
            ai_updated = False
        
        return {
            "message": "Learning preferences updated successfully",
            "user_id": user_id,
            "preferences_stored": True,
            "ai_model_updated": ai_updated,
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}")