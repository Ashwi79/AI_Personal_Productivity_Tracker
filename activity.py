from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ActivityLog, User
from app.schemas.schemas import ActivityLogCreate, ActivityLogOut
from app.api.auth_utils import get_current_user
from typing import List

router = APIRouter()


@router.post("/log", response_model=ActivityLogOut, status_code=201)
def log_activity(
    payload: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = ActivityLog(
        user_id=current_user.id,
        app_name=payload.app_name,
        category=payload.category,
        duration_minutes=payload.duration_minutes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/today", response_model=List[ActivityLogOut])
def today_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, date
    today = datetime.combine(date.today(), datetime.min.time())
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id, ActivityLog.timestamp >= today)
        .order_by(ActivityLog.timestamp.desc())
        .all()
    )
    return logs
