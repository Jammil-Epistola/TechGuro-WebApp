# services/milestone_service.py

from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException

from TGbackend.models import Milestone, MilestoneEarned, User
from TGbackend.routers.userRoutes import check_level_up  

def award_milestone_if_not_earned(user_id: int, milestone_id: int, db: Session):
    """
    Safely awards a milestone to a user if they haven't earned it yet.
    Handles EXP, level-up checks, and persistence.
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
        date_earned=datetime.utcnow(),
    )
    db.add(earned)

    # 4. Add EXP to user
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.exp += milestone.exp_reward or 0

        # 5. Handle possible level up (using your function)
        leveled_up = check_level_up(user)

    db.commit()
    db.refresh(user)

    return {
        "status": "milestone_awarded",
        "milestone_id": milestone_id,
        "title": milestone.title,
        "exp_reward": milestone.exp_reward,
        "new_exp": user.exp if user else None,
        "new_level": user.level if user else None,
        "leveled_up": leveled_up if user else False,
    }
