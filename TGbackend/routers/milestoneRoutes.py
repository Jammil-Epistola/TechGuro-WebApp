#milestoneRoutes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from TGbackend import models, database
from TGbackend.schema import MilestoneOut
from typing import List

router = APIRouter(prefix="/milestones", tags=["Milestones"])

# DB Dependency
get_db = database.get_db


@router.get("/{user_id}", response_model=List[MilestoneOut])
def get_all_milestones(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch all milestones with locked/unlocked status for a specific user.
    """
    milestones = (
        db.query(models.Milestone)
        .options(joinedload(models.Milestone.users_earned))
        .order_by(models.Milestone.id)
        .all()
    )

    earned_records = {
        me.milestone_id: me
        for me in db.query(models.MilestoneEarned)
        .filter(models.MilestoneEarned.user_id == user_id)
        .all()
    }

    return [
        {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "icon_url": m.icon_url,
            "status": "earned" if m.id in earned_records else "not earned",
            "notification_shown": earned_records[m.id].notification_shown if m.id in earned_records else False
        }
        for m in milestones
    ]


@router.post("/award/{user_id}/{milestone_id}")
def award_milestone(user_id: int, milestone_id: int, db: Session = Depends(get_db)):
    milestone = db.query(models.Milestone).filter(models.Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    earned = models.MilestoneEarned(user_id=user_id, milestone_id=milestone_id)
    db.add(earned)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"message": "Milestone already earned"}

    return {
        "message": f"Milestone '{milestone.title}' awarded to user {user_id}"
    }


@router.get("/earned/{user_id}")
def get_user_milestones(user_id: int, db: Session = Depends(get_db)):
    """
    Get all milestones earned by a user, with explicit 'earned' status attached.
    """
    earned_milestones = (
        db.query(models.Milestone)
        .join(models.MilestoneEarned, models.Milestone.id == models.MilestoneEarned.milestone_id)
        .filter(models.MilestoneEarned.user_id == user_id)
        .all()
    )

    return [
        {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "icon_url": m.icon_url,
            "status": "earned",
        }
        for m in earned_milestones
    ]


@router.get("/check/{user_id}/{milestone_id}")
def check_milestone(user_id: int, milestone_id: int, db: Session = Depends(get_db)):
    """
    Check if a user has earned a specific milestone.
    """
    earned = db.query(models.MilestoneEarned).filter(
        models.MilestoneEarned.user_id == user_id,
        models.MilestoneEarned.milestone_id == milestone_id
    ).first()

    return {"earned": earned is not None}


@router.post("/mark-shown/{user_id}/{milestone_id}")
def mark_notification_shown(user_id: int, milestone_id: int, db: Session = Depends(get_db)):
    """
    Mark a milestone notification as shown for a user.
    """
    earned = db.query(models.MilestoneEarned).filter(
        models.MilestoneEarned.user_id == user_id,
        models.MilestoneEarned.milestone_id == milestone_id
    ).first()
    
    if not earned:
        raise HTTPException(status_code=404, detail="Milestone not earned by user")
    
    earned.notification_shown = True
    db.commit()
    
    return {"message": "Notification marked as shown", "milestone_id": milestone_id}