from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime

from TGbackend.database import get_db
from TGbackend.models import (
    UserLessonMastery, UserLessonMasteryHistory,
    AssessmentResults, AssessmentQuestionResponse
)
from TGbackend.services.bkt_ai_service import bkt_service  # Fixed import

# Main BKT router
router = APIRouter(prefix="/bkt", tags=["🤖 AI-Powered Bayesian Knowledge Tracing"])

# -------------------------
# AI BKT Status and Recommendations
# -------------------------
@router.get("/status/{user_id}")
def get_ai_bkt_status(user_id: int, db: Session = Depends(get_db)):
    """Get AI-calculated mastery status for user"""
    mastery = db.query(UserLessonMastery).filter(UserLessonMastery.user_id == user_id).all()
    
    # Get AI recommendations
    ai_recommendations = bkt_service.get_ai_recommendations(user_id)  # Updated reference
    
    return {
        "mastery_data": mastery,
        "ai_recommendations": ai_recommendations,
        "ai_status": "active" if user_id in bkt_service.models else "needs_training"  # Updated reference
    }

@router.get("/recommendations/{user_id}")
def get_ai_recommendations(user_id: int, threshold: float = 0.7, db: Session = Depends(get_db)):
    """Get AI-powered lesson recommendations - FAST response"""
    try:
        # Check if we have a trained model
        if user_id not in bkt_service.models:  # Updated reference
            # Train model in background if needed
            bkt_service.train_user_model(user_id, db)  # Updated reference
        
        recommendations = bkt_service.get_ai_recommendations(user_id, threshold)  # Updated reference
        
        return {
            "ai_recommendations": recommendations,
            "response_time": "fast",
            "ai_powered": True,
            "threshold": threshold,
            "total_recommendations": len(recommendations)
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "fallback_recommendations": [],
            "ai_powered": False
        }

@router.post("/train-model/{user_id}")
def train_ai_model(user_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Train/retrain AI model for user"""
    def train_in_background():
        success = bkt_service.train_user_model(user_id, db)  # Updated reference
        print(f"[AI-BKT] Background training {'succeeded' if success else 'failed'} for user {user_id}")
    
    background_tasks.add_task(train_in_background)
    
    return {
        "status": "AI model training started",
        "user_id": user_id,
        "training": "in_progress",
        "ai_powered": True
    }

@router.get("/mastery-levels/{user_id}")
def get_ai_mastery_levels(user_id: int, db: Session = Depends(get_db)):
    """Get detailed AI-calculated mastery levels"""
    try:
        masteries = bkt_service.get_all_masteries(user_id)  # Updated reference
        
        detailed_masteries = []
        for lesson_id, mastery_score in masteries.items():
            skill_name = bkt_service.skill_names.get(lesson_id, f"skill_{lesson_id}")  # Updated reference
            detailed_masteries.append({
                "lesson_id": lesson_id,
                "skill_name": skill_name,
                "mastery_probability": round(mastery_score, 3),
                "mastery_percentage": f"{round(mastery_score * 100, 1)}%",
                "status": "mastered" if mastery_score >= 0.7 else "needs_practice",
                "ai_confidence": "high" if mastery_score > 0.8 or mastery_score < 0.3 else "medium"
            })
        
        return {
            "ai_mastery_levels": detailed_masteries,
            "ai_powered": True,
            "calculated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "ai_mastery_levels": [],
            "ai_powered": False
        }

# =========================
# Updated AI-Powered Assessment Processing
# =========================

@router.post("/update-from-pre")
def update_from_pre_ai(user_id: int, course_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Process pre-assessment with AI-powered BKT"""
    try:
        # Train AI model in background for instant response
        def process_ai_update():
            ai_result = bkt_service.update_from_new_assessment(user_id, db)  # Updated reference
            print(f"[AI-BKT] Pre-assessment AI update: {ai_result.get('status', 'completed')}")
        
        background_tasks.add_task(process_ai_update)
        
        # Get immediate recommendations (from existing model if available)
        quick_recommendations = bkt_service.get_ai_recommendations(user_id, threshold=0.7)  # Updated reference
        weak_lessons = [r['lesson_id'] for r in quick_recommendations]
        
        return {
            "status": "AI is analyzing your responses...",
            "ai_processing": True,
            "immediate_recommendations": weak_lessons,
            "ai_recommendations": quick_recommendations,
            "response_time": "instant",
            "background_processing": True
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "ai_powered": False}

@router.post("/update-from-post")
def update_from_post_ai(user_id: int, course_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Process post-assessment with AI-powered BKT"""
    try:
        # Train AI model in background
        def process_ai_update():
            ai_result = bkt_service.update_from_new_assessment(user_id, db)  # Updated reference
            print(f"[AI-BKT] Post-assessment AI update: {ai_result.get('status', 'completed')}")
        
        background_tasks.add_task(process_ai_update)
        
        # Get immediate recommendations with higher threshold
        quick_recommendations = bkt_service.get_ai_recommendations(user_id, threshold=0.85)  # Updated reference
        weak_lessons = [r['lesson_id'] for r in quick_recommendations]
        
        return {
            "status": "AI is analyzing your final performance...",
            "ai_processing": True,
            "immediate_recommendations": weak_lessons,
            "ai_recommendations": quick_recommendations,
            "response_time": "instant",
            "post_assessment_complete": True
        }
        
    except Exception as e:
        return {"error": str(e), "ai_powered": False}

# =========================
# Legacy support (keep existing endpoints working)
# =========================

def save_mastery_history(db: Session, user_id: int, course_id: int, assessment_type: str, threshold: float, source: str):
    """Keep existing history functionality"""
    responses = (
        db.query(AssessmentQuestionResponse)
        .join(AssessmentResults)
        .filter(
            AssessmentResults.user_id == user_id,
            AssessmentResults.course_id == course_id,
            AssessmentResults.assessment_type == assessment_type,
            AssessmentQuestionResponse.lesson_id.isnot(None)
        )
        .all()
    )

    lesson_correct = {}
    lesson_total = {}
    for r in responses:
        lid = r.lesson_id
        lesson_total[lid] = lesson_total.get(lid, 0) + 1
        if r.is_correct:
            lesson_correct[lid] = lesson_correct.get(lid, 0) + 1

    for lesson_id, total in lesson_total.items():
        correct = lesson_correct.get(lesson_id, 0)
        est_mastery = round(correct / total, 2)
        is_mastered = est_mastery >= threshold

        hist = UserLessonMasteryHistory(
            user_id=user_id,
            course_id=course_id,
            lesson_id=lesson_id,
            estimated_mastery=est_mastery,
            is_mastered=is_mastered,
            assessment_type=assessment_type,
            source=f"ai_bkt_{source}",  # Mark as AI-powered
            created_at=datetime.utcnow()
        )
        db.add(hist)

    db.commit()