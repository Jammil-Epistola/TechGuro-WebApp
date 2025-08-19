from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from TGbackend.database import get_db
from TGbackend import models
from TGbackend.models import Progress

router = APIRouter(tags=["Progress Tracking"])

# Progress input schema
class ProgressCreate(BaseModel):
    user_id: int
    course_id: int
    unit_id: int
    lesson_id: int
    completed: bool  

class ProgressUpdate(BaseModel):
    user_id: int
    course_id: int
    unit_id: int
    lesson_id: int
    completed: bool = True

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
    
    # NEW: Update BKT model when lesson is completed
    ai_insights = {}
    try:
        if progress_data.completed:
            from TGbackend.services.bkt_ai_service import bkt_service
            # Update the AI model with new completion data
            ai_result = bkt_service.update_from_lesson_completion(progress_data.user_id, progress_data.lesson_id, db)
            ai_insights = {
                "model_updated": True,
                "new_mastery_level": ai_result.get("new_mastery", 0.0),
                "next_recommended": ai_result.get("next_recommendation"),
                "learning_velocity": ai_result.get("learning_velocity", 0.5)
            }
    except Exception as e:
        ai_insights = {"model_updated": False, "error": str(e)}
    
    db.commit()

    if leveled_up:
        message += "Level Up!"

    return {
        "message": message.strip(),
        "exp_gained": exp_gained,
        "new_level": user.level,
        "current_exp": user.exp,
        "ai_insights": ai_insights  # New AI data
    }

@router.post("/progress/bkt-update")
def update_progress_bkt(data: ProgressUpdate, db: Session = Depends(get_db)):
    progress = Progress(
        user_id=data.user_id,
        course_id=data.course_id,
        unit_id=data.unit_id,
        lesson_id=data.lesson_id,
        completed=data.completed,
        completed_at=datetime.utcnow()
    )
    db.add(progress)
    db.commit()
    return {"status": "Lesson marked as completed."}

@router.get("/progress/{user_id}")
def get_progress(user_id: int, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter(Progress.user_id == user_id).all()
    return progress

# -------------------------
# Lesson Recommendations (Enhanced with AI)
# -------------------------
@router.get("/progress-recommendations/{user_id}/{course_id}")
def get_progress_with_recommendations(user_id: int, course_id: int, db: Session = Depends(get_db)):
    # Existing logic (preserve completely)
    progress = db.query(Progress).filter_by(user_id=user_id, course_id=course_id).all()
    completed_lessons = [p.lesson_id for p in progress if p.completed]

    # Example hardcoded lessons for course 1 - adjust or replace with dynamic later
    course1_lessons = [1, 2, 3, 4, 5, 6, 7, 8]

    mastery = db.query(models.UserLessonMastery).filter(
        models.UserLessonMastery.user_id == user_id,
        models.UserLessonMastery.lesson_id.in_(course1_lessons)
    ).all()
    recommended = [m.lesson_id for m in mastery if m.estimated_mastery < 0.7]

    post_unlocked = len(completed_lessons) >= 8

    # NEW: Add AI-enhanced recommendations
    ai_recommendations = {}
    try:
        from TGbackend.services.bkt_ai_service import bkt_service
        
        # Get AI recommendations for this course
        ai_recs = bkt_service.get_course_recommendations(user_id, course_id, db)
        ai_recommendations = {
            "smart_recommended_lessons": ai_recs.get("recommended_lessons", []),
            "next_priority_lesson": ai_recs.get("next_priority"),
            "mastery_insights": ai_recs.get("mastery_analysis", {}),
            "learning_path": ai_recs.get("suggested_path", []),
            "estimated_time_to_completion": ai_recs.get("time_estimate"),
            "ai_enabled": True
        }
    except Exception as e:
        ai_recommendations = {
            "smart_recommended_lessons": [],
            "ai_enabled": False,
            "error": str(e)
        }

    return {
        # Existing data (unchanged)
        "completed_lessons": completed_lessons,
        "recommended_lessons": recommended,
        "post_assessment_unlocked": post_unlocked,
        
        # New AI enhancements
        "ai_recommendations": ai_recommendations
    }

# -------------------------
# NEW: AI-Enhanced Progress Endpoints
# -------------------------
@router.get("/progress/ai-insights/{user_id}")
def get_ai_progress_insights(user_id: int, db: Session = Depends(get_db)):
    """AI-driven progress insights using BKT analysis"""
    try:
        from TGbackend.services.bkt_ai_service import bkt_service
        
        # Get comprehensive progress data
        mastery_data = bkt_service.get_user_mastery(user_id, db)
        learning_velocity = bkt_service.calculate_overall_learning_velocity(user_id, db)
        
        # Get basic progress stats (preserve existing approach)
        total_progress = db.query(models.Progress).filter(
            models.Progress.user_id == user_id,
            models.Progress.completed == True
        ).count()
        
        total_assessments = db.query(models.AssessmentResults).filter(
            models.AssessmentResults.user_id == user_id
        ).count()
        
        # Calculate AI insights
        total_skills = len(bkt_service.skill_taxonomy) if hasattr(bkt_service, 'skill_taxonomy') else 8
        mastered_skills = sum(1 for mastery in mastery_data.values() if mastery >= 0.8)
        in_progress_skills = sum(1 for mastery in mastery_data.values() if 0.3 <= mastery < 0.8)
        
        insights = {
            # Basic stats
            "user_id": user_id,
            "total_completed_lessons": total_progress,
            "total_assessments_taken": total_assessments,
            
            # AI insights
            "overall_progress_percentage": (mastered_skills / total_skills * 100) if total_skills > 0 else 0,
            "mastered_skills_count": mastered_skills,
            "in_progress_skills_count": in_progress_skills,
            "learning_velocity": learning_velocity,
            "estimated_completion_days": bkt_service.estimate_completion_time(user_id, db),
            
            # Detailed analysis
            "strengths": [skill for skill, mastery in mastery_data.items() if mastery >= 0.8],
            "areas_for_improvement": [skill for skill, mastery in mastery_data.items() if mastery < 0.5],
            "learning_pattern": bkt_service.analyze_learning_pattern(user_id, db),
            "difficulty_preference": bkt_service.get_optimal_difficulty(user_id, db),
            
            # Mastery breakdown
            "mastery_levels": mastery_data,
            "ai_enabled": True,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return insights
        
    except Exception as e:
        # Fallback to basic stats if AI fails
        total_progress = db.query(models.Progress).filter(
            models.Progress.user_id == user_id,
            models.Progress.completed == True
        ).count()
        
        return {
            "user_id": user_id,
            "total_completed_lessons": total_progress,
            "ai_enabled": False,
            "error": str(e),
            "fallback_mode": True
        }

@router.get("/progress/learning-path/{user_id}")
def get_personalized_learning_path(user_id: int, db: Session = Depends(get_db)):
    """Generate a personalized learning path based on BKT analysis"""
    try:
        from TGbackend.services.bkt_ai_service import bkt_service
        learning_path = bkt_service.generate_learning_path(user_id, db)
        
        # Enhance with lesson details
        detailed_path = []
        for i, step in enumerate(learning_path):
            lesson = db.query(models.Lesson).filter(models.Lesson.id == step['lesson_id']).first()
            if lesson:
                detailed_path.append({
                    "sequence_number": i + 1,
                    "lesson_id": lesson.id,
                    "lesson_title": lesson.title,
                    "unit_title": lesson.unit.title if lesson.unit else "Unknown Unit",
                    "current_mastery": step.get('current_mastery', 0.0),
                    "target_mastery": step.get('target_mastery', 0.8),
                    "priority": step.get('priority', 'medium'),
                    "estimated_time": step.get('estimated_time', '15-20 mins'),
                    "prerequisites_met": step.get('prerequisites_met', True),
                    "reasoning": step.get('reasoning', 'Part of your personalized learning path')
                })
        
        return {
            "user_id": user_id,
            "learning_path": detailed_path,
            "total_steps": len(detailed_path),
            "estimated_total_duration": bkt_service.estimate_path_duration(learning_path),
            "path_difficulty": bkt_service.assess_path_difficulty(learning_path),
            "ai_enabled": True,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "user_id": user_id,
            "learning_path": [],
            "error": f"Error generating learning path: {str(e)}",
            "ai_enabled": False
        }

@router.get("/progress/weekly-summary/{user_id}")
def get_weekly_progress_summary(user_id: int, db: Session = Depends(get_db)):
    """Get AI-enhanced weekly progress summary"""
    try:
        from datetime import timedelta
        from TGbackend.services.bkt_ai_service import bkt_service
        
        # Get progress from last 7 days
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_progress = db.query(models.Progress).filter(
            models.Progress.user_id == user_id,
            models.Progress.completed_at >= week_ago,
            models.Progress.completed == True
        ).all()
        
        # Get recent assessments
        recent_assessments = db.query(models.AssessmentResults).filter(
            models.AssessmentResults.user_id == user_id,
            models.AssessmentResults.date_taken >= week_ago
        ).all()
        
        # AI analysis
        weekly_analysis = bkt_service.analyze_weekly_progress(user_id, db)
        
        summary = {
            "user_id": user_id,
            "week_period": f"{week_ago.date()} to {datetime.utcnow().date()}",
            
            # Basic stats
            "lessons_completed_this_week": len(recent_progress),
            "assessments_taken_this_week": len(recent_assessments),
            
            # AI insights
            "learning_velocity_trend": weekly_analysis.get("velocity_trend", "stable"),
            "mastery_improvements": weekly_analysis.get("mastery_gains", []),
            "focus_areas": weekly_analysis.get("focus_areas", []),
            "achievement_highlights": weekly_analysis.get("achievements", []),
            "next_week_goals": weekly_analysis.get("next_week_goals", []),
            "consistency_score": weekly_analysis.get("consistency_score", 0.5),
            
            # Recommendations
            "weekly_recommendations": weekly_analysis.get("recommendations", []),
            "optimal_study_time": weekly_analysis.get("optimal_study_time", "15-20 minutes"),
            
            "ai_enabled": True,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return summary
        
    except Exception as e:
        # Fallback summary
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_progress = db.query(models.Progress).filter(
            models.Progress.user_id == user_id,
            models.Progress.completed_at >= week_ago,
            models.Progress.completed == True
        ).count()
        
        return {
            "user_id": user_id,
            "lessons_completed_this_week": recent_progress,
            "ai_enabled": False,
            "error": str(e),
            "fallback_mode": True
        }

@router.get("/progress/motivation-insights/{user_id}")
def get_motivation_insights(user_id: int, db: Session = Depends(get_db)):
    """Get AI-powered motivation and engagement insights"""
    try:
        from TGbackend.services.bkt_ai_service import bkt_service
        
        motivation_data = bkt_service.analyze_motivation_patterns(user_id, db)
        
        # Get user level and exp for context
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        insights = {
            "user_id": user_id,
            "current_level": user.level if user else 1,
            "current_exp": user.exp if user else 0,
            
            # AI motivation insights
            "engagement_level": motivation_data.get("engagement_level", "medium"),
            "learning_streak": motivation_data.get("streak_days", 0),
            "preferred_session_length": motivation_data.get("optimal_session_length", "15-20 minutes"),
            "best_learning_times": motivation_data.get("peak_performance_times", ["morning"]),
            "motivation_triggers": motivation_data.get("motivation_factors", []),
            
            # Personalized encouragement
            "encouragement_message": motivation_data.get("encouragement", "Keep up the great work!"),
            "achievement_ready": motivation_data.get("ready_for_challenge", False),
            "suggested_rewards": motivation_data.get("reward_suggestions", []),
            
            "ai_enabled": True,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return insights
        
    except Exception as e:
        return {
            "user_id": user_id,
            "engagement_level": "unknown",
            "encouragement_message": "Keep learning at your own pace!",
            "ai_enabled": False,
            "error": str(e)
        }