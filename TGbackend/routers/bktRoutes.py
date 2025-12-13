# routers/bkt_routes_clean.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from TGbackend.database import get_db
from TGbackend.models import UserLessonMastery, UserLessonMasteryHistory
from TGbackend.services.bkt_service import teki_bkt

router = APIRouter(prefix="/bkt", tags=["Bayesian Knowledge Tracing"])

# -------------------------
# BKT Status & History 
# -------------------------

@router.get("/status/{user_id}")
def get_bkt_status(user_id: int, db: Session = Depends(get_db)):
    """Get current mastery status for a user across all lessons"""
    try:
        mastery = db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).all()
        return {
            "status": "success",
            "mastery_records": mastery,
            "total_lessons": len(mastery),
            "mastered_count": sum(1 for m in mastery if m.is_mastered)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch status: {str(e)}")

@router.get("/history/{user_id}/{course_id}")
def get_mastery_history(user_id: int, course_id: int, db: Session = Depends(get_db)):
    """Get historical mastery progression for a user in a specific course"""
    try:
        history = (
            db.query(UserLessonMasteryHistory)
            .filter(
                UserLessonMasteryHistory.user_id == user_id,
                UserLessonMasteryHistory.course_id == course_id
            )
            .order_by(UserLessonMasteryHistory.created_at.desc())
            .all()
        )
        return {
            "status": "success", 
            "history_records": history,
            "assessment_types": list(set(h.assessment_type for h in history if h.assessment_type))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

# =========================
# BKT Processing Endpoints 
# =========================

@router.post("/update-from-pre")
def update_from_pre(user_id: int, course_id: int, db: Session = Depends(get_db)):
    """
    Process PRE-assessment results using BKT algorithm.
    Pure wrapper around BKTService.update_from_pre()
    """
    try:
        result = teki_bkt.update_from_pre(user_id, course_id, db)
        
        # Transform result to match expected frontend format
        return {
            "status": "success",
            "updated_mastery": [
                {
                    "lesson_id": lesson_id,
                    "mastery": mastery,
                    "is_mastered": mastery >= 0.7  # BKT service threshold
                }
                for lesson_id, mastery in result.get("updated_masteries", {}).items()
            ],
            "recommend": [
                lesson_id for lesson_id, mastery in result.get("updated_masteries", {}).items()
                if mastery < 0.7
            ],
            "ai_enabled": result.get("ai_enabled", False),
            "assessment_type": result.get("assessment_type", "pre"),
            "bkt_result": result  # Include full BKT result for debugging
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"BKT pre-assessment failed: {str(e)}")

@router.post("/update-from-post")
def update_from_post(user_id: int, course_id: int, db: Session = Depends(get_db)):
    """
    Process POST-assessment results using BKT algorithm.
    Pure wrapper around BKTService.update_from_post() with strict completion logic.
    """
    try:
        result = teki_bkt.update_from_post(user_id, course_id, db)
        
        # Extract key values from BKT result
        updated_masteries = result.get("updated_masteries", {})
        completion_eligible = result.get("completion_eligible", False)
        overall_score = result.get("overall_score", 0)
        
        # Transform to frontend-expected format
        mastery_list = [
            {
                "lesson_id": lesson_id,
                "mastery": mastery,
                "is_mastered": mastery >= 0.8  # Post-assessment uses stricter threshold
            }
            for lesson_id, mastery in updated_masteries.items()
        ]
        
        weak_lessons = [
            lesson_id for lesson_id, mastery in updated_masteries.items()
            if mastery < 0.8
        ]
        
        return {
            "status": "success",
            "updated_mastery": mastery_list,
            "recommend": weak_lessons,
            "course_mastered": completion_eligible,  # This is the key field frontend checks
            "overall_score": overall_score,
            "total_correct": result.get("debug_info", {}).get("overall_correct", 0),
            "total_questions": result.get("debug_info", {}).get("overall_total", 0),
            "bkt_eligible": result.get("bkt_eligible", False),
            "score_eligible": result.get("score_eligible", False),
            "improvement_analysis": result.get("improvement_analysis", {}),
            "assessment_type": "post",
            "debug_info": result.get("debug_info", {}),
            "bkt_result": result  # Full result for debugging
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"BKT post-assessment failed: {str(e)}")

@router.get("/recommendations/{user_id}/{course_id}")
def get_recommendations(
    user_id: int, 
    course_id: int, 
    threshold: float = 0.7,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Get lesson recommendations based on current BKT mastery levels.
    Pure wrapper around BKTService.get_recommendations()
    """
    try:
        result = teki_bkt.get_recommendations(user_id, course_id, db, threshold, limit)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")
    
# Complete Mastery Breakdown (All Lessons)
@router.get("/mastery-complete/{user_id}/{course_id}")
def get_complete_mastery_breakdown(user_id: int, course_id: int, db: Session = Depends(get_db)):
    from TGbackend.models import Lesson, QuizResult
    
    try:
        # Get all lessons for this course
        all_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
        
        if not all_lessons:
            raise HTTPException(status_code=404, detail=f"No lessons found for course {course_id}")
        
        # Get current mastery levels
        current_masteries = db.query(UserLessonMastery).filter(
            UserLessonMastery.user_id == user_id,
            UserLessonMastery.course_id == course_id
        ).all()
        
        # Create lookup dict for current mastery
        current_mastery_dict = {
            m.lesson_id: {
                "mastery": float(m.estimated_mastery or 0.0),
                "is_mastered": m.is_mastered,
                "last_updated": m.last_updated.isoformat() if m.last_updated else None
            }
            for m in current_masteries
        }
        
        # Get pre-assessment baseline from history
        pre_masteries = db.query(UserLessonMasteryHistory).filter(
            UserLessonMasteryHistory.user_id == user_id,
            UserLessonMasteryHistory.course_id == course_id,
            UserLessonMasteryHistory.assessment_type == "pre"
        ).all()
        
        # Create lookup dict for pre-assessment baseline
        pre_mastery_dict = {}
        for m in pre_masteries:
            if m.lesson_id not in pre_mastery_dict:
                pre_mastery_dict[m.lesson_id] = float(m.estimated_mastery or 0.0)
        
        # Get quiz attempt counts per lesson
        quiz_attempts = db.query(
            QuizResult.lesson_id,
            func.count(QuizResult.id).label('attempt_count')  # ✅ Correct
        ).filter(
            QuizResult.user_id == user_id,
            QuizResult.course_id == course_id
        ).group_by(QuizResult.lesson_id).all()
        
        # Create lookup dict for quiz attempts
        quiz_attempt_dict = {
            result.lesson_id: result.attempt_count 
            for result in quiz_attempts
        }
        
        # Build complete lesson breakdown
        lesson_breakdown = []
        
        for lesson in all_lessons:
            lesson_id = lesson.id
            
            # Get current mastery (or 0 if not yet assessed)
            current_data = current_mastery_dict.get(lesson_id, {
                "mastery": 0.0,
                "is_mastered": False,
                "last_updated": None
            })
            
            current_mastery = current_data["mastery"]
            
            # Get pre-assessment baseline (or 0 if not taken)
            pre_mastery = pre_mastery_dict.get(lesson_id, 0.0)
            
            # Calculate improvement delta
            improvement = round(current_mastery - pre_mastery, 3)
            improvement_percentage = round((current_mastery - pre_mastery) * 100, 1)
            
            # Get quiz attempt count
            quiz_attempts_count = quiz_attempt_dict.get(lesson_id, 0)
            
            # Determine mastery status with color coding
            if current_mastery >= 0.8:
                status = "Mastered"
                status_color = "green"
            elif current_mastery >= 0.6:
                status = "Proficient"
                status_color = "blue"
            elif current_mastery >= 0.4:
                status = "Developing"
                status_color = "yellow"
            else:
                status = "Needs Work"
                status_color = "red"
            
            lesson_breakdown.append({
                "lesson_id": lesson_id,
                "lesson_title": lesson.title,
                
                # Current state
                "current_mastery": round(current_mastery, 3),
                "current_percentage": round(current_mastery * 100, 1),
                "is_mastered": current_data["is_mastered"],
                "last_updated": current_data["last_updated"],
                
                # Historical comparison
                "pre_mastery": round(pre_mastery, 3),
                "pre_percentage": round(pre_mastery * 100, 1),
                "improvement": improvement,
                "improvement_percentage": improvement_percentage,
                
                # Activity metrics
                "quiz_attempts": quiz_attempts_count,
                
                # Status classification
                "status": status,
                "status_color": status_color,
                
                # Recommendations
                "needs_practice": current_mastery < 0.7,
                "significant_improvement": improvement >= 0.2
            })
        
        # Sort by lesson_id to maintain course order
        lesson_breakdown.sort(key=lambda x: x["lesson_id"])
        
        # Calculate overall statistics
        total_lessons = len(lesson_breakdown)
        mastered_count = sum(1 for l in lesson_breakdown if l["is_mastered"])
        proficient_count = sum(1 for l in lesson_breakdown if l["current_mastery"] >= 0.6 and not l["is_mastered"])
        needs_work_count = sum(1 for l in lesson_breakdown if l["current_mastery"] < 0.6)
        
        avg_mastery = sum(l["current_mastery"] for l in lesson_breakdown) / total_lessons if total_lessons > 0 else 0
        avg_improvement = sum(l["improvement"] for l in lesson_breakdown) / total_lessons if total_lessons > 0 else 0
        
        total_quiz_attempts = sum(l["quiz_attempts"] for l in lesson_breakdown)
        
        # Identify top improvements and areas needing work
        top_improvements = sorted(
            [l for l in lesson_breakdown if l["improvement"] > 0],
            key=lambda x: x["improvement"],
            reverse=True
        )[:3]
        
        needs_attention = sorted(
            [l for l in lesson_breakdown if l["current_mastery"] < 0.6],
            key=lambda x: x["current_mastery"]
        )[:3]
        
        return {
            "user_id": user_id,
            "course_id": course_id,
            "status": "success",
            
            # Complete lesson breakdown
            "lessons": lesson_breakdown,
            
            # Overall statistics
            "statistics": {
                "total_lessons": total_lessons,
                "mastered_count": mastered_count,
                "proficient_count": proficient_count,
                "needs_work_count": needs_work_count,
                "average_mastery": round(avg_mastery, 3),
                "average_mastery_percentage": round(avg_mastery * 100, 1),
                "average_improvement": round(avg_improvement, 3),
                "average_improvement_percentage": round(avg_improvement * 100, 1),
                "total_quiz_attempts": total_quiz_attempts
            },
            
            # Highlights
            "top_improvements": top_improvements,
            "needs_attention": needs_attention,
            
            # Overall course progress
            "course_completion_percentage": round((mastered_count / total_lessons) * 100, 1) if total_lessons > 0 else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get complete mastery breakdown: {str(e)}")

# =========================
# General BKT Update Endpoint
# =========================

@router.post("/update-general")
def update_from_assessments(
    user_id: int, 
    course_id: int, 
    source: str = "general_assessment",
    db: Session = Depends(get_db)
):
    """
    General BKT update endpoint - processes all available assessment responses.
    Pure wrapper around BKTService.update_from_assessments()
    """
    try:
        result = teki_bkt.update_from_assessments(user_id, course_id, db, source)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"General BKT update failed: {str(e)}")

# =========================
# Debugging & Analytics Endpoints  
# =========================

@router.get("/debug/{user_id}/{course_id}")
def debug_bkt_state(user_id: int, course_id: int, db: Session = Depends(get_db)):
    """Debug endpoint to inspect BKT state and data"""
    try:
        # Get current mastery state
        current_mastery = db.query(UserLessonMastery).filter(
            UserLessonMastery.user_id == user_id,
            UserLessonMastery.course_id == course_id
        ).all()
        
        # Get recent history
        recent_history = (
            db.query(UserLessonMasteryHistory)
            .filter(
                UserLessonMasteryHistory.user_id == user_id,
                UserLessonMasteryHistory.course_id == course_id
            )
            .order_by(UserLessonMasteryHistory.created_at.desc())
            .limit(20)
            .all()
        )
        
        # Get recommendations for debugging
        recommendations = teki_bkt.get_recommendations(user_id, course_id, db)
        
        return {
            "status": "debug",
            "user_id": user_id,
            "course_id": course_id,
            "current_mastery": {
                "records": current_mastery,
                "count": len(current_mastery),
                "mastered_count": sum(1 for m in current_mastery if m.is_mastered)
            },
            "recent_history": {
                "records": recent_history,
                "count": len(recent_history)
            },
            "recommendations": recommendations,
            "bkt_config": {
                "p_init": teki_bkt.p_init,
                "p_learn": teki_bkt.p_learn,
                "p_slip": teki_bkt.p_slip,
                "p_guess": teki_bkt.p_guess,
                "min_responses_per_skill": teki_bkt.min_responses_per_skill
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug failed: {str(e)}")