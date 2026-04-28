from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timezone, timedelta
from app.database import get_db
from app.models.models import StudySession, ActivityLog, User
from app.schemas.schemas import DashboardStats
from app.api.auth_utils import get_current_user

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today_start = datetime.combine(date.today(), datetime.min.time())

    # Today study minutes
    today_sessions = (
        db.query(StudySession)
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.start_time >= today_start,
            StudySession.end_time != None,
        )
        .all()
    )
    today_study_minutes = sum(s.duration_minutes or 0 for s in today_sessions)

    # Today productivity score
    scores = [s.productivity_score for s in today_sessions if s.productivity_score]
    today_productivity_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    # Today distraction minutes
    distractions = (
        db.query(func.sum(ActivityLog.duration_minutes))
        .filter(
            ActivityLog.user_id == current_user.id,
            ActivityLog.timestamp >= today_start,
            ActivityLog.category == "distraction",
        )
        .scalar()
        or 0
    )

    # Weekly study minutes
    week_start = datetime.combine(date.today() - timedelta(days=7), datetime.min.time())
    weekly_sessions = (
        db.query(StudySession)
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.start_time >= week_start,
            StudySession.end_time != None,
        )
        .all()
    )
    weekly_study_minutes = sum(s.duration_minutes or 0 for s in weekly_sessions)

    # Streak: count consecutive days with at least 1 session
    streak_days = _calculate_streak(db, current_user.id)

    total_sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, StudySession.end_time != None)
        .count()
    )

    return DashboardStats(
        today_study_minutes=round(today_study_minutes, 1),
        today_productivity_score=today_productivity_score,
        today_distraction_minutes=round(float(distractions), 1),
        weekly_study_minutes=round(weekly_study_minutes, 1),
        streak_days=streak_days,
        total_sessions=total_sessions,
    )


def _calculate_streak(db: Session, user_id: int) -> int:
    streak = 0
    check_date = date.today()
    for _ in range(365):
        day_start = datetime.combine(check_date, datetime.min.time())
        day_end = day_start + timedelta(days=1)
        count = (
            db.query(StudySession)
            .filter(
                StudySession.user_id == user_id,
                StudySession.start_time >= day_start,
                StudySession.start_time < day_end,
                StudySession.end_time != None,
            )
            .count()
        )
        if count > 0:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    return streak
