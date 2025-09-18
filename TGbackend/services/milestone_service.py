# services/milestone_service.py
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
from TGbackend.models import Milestone, MilestoneEarned


def award_milestone_if_not_earned(user_id: int, milestone_id: int, db: Session):
    """
    Safely awards a milestone to a user if they haven't earned it yet.
    """
    # 1. Load milestone definition
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail=f"Milestone {milestone_id} not found.")

    # 2. Prevent duplicate awarding
    already_earned = db.query(MilestoneEarned).filter_by(
        user_id=user_id, milestone_id=milestone_id
    ).first()
    if already_earned:
        return {
            "status": "already_earned",
            "milestone_id": milestone_id,
            "title": milestone.title,
        }

    # 3. Award milestone
    earned = MilestoneEarned(
        user_id=user_id,
        milestone_id=milestone_id,
        earned_at=datetime.utcnow(), 
    )
    db.add(earned)
    db.commit()

    return {
        "status": "milestone_awarded",
        "milestone_id": milestone_id,
        "title": milestone.title,
    }
