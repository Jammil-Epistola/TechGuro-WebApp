# routers/bkt_routes_clean.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from TGbackend.database import get_db
from TGbackend.models import UserLessonMastery, UserLessonMasteryHistory
from TGbackend.services.bkt_service import teki_bkt

# Clean BKT router - pure wrapper around BKTService
router = APIRouter(prefix="/bkt", tags=["Bayesian Knowledge Tracing"])

# -------------------------
# BKT Status & History (read-only endpoints)
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
# BKT Processing Endpoints (pure wrappers)
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