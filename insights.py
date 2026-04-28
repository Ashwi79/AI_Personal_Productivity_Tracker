from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from app.database import get_db
from app.models.models import StudySession, ActivityLog, User
from app.schemas.schemas import DailyInsight
from app.api.auth_utils import get_current_user
from typing import List

router = APIRouter()


@router.get("/weekly", response_model=List[DailyInsight])
def weekly_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    insights = []
    for i in range(6, -1, -1):
        day = date.today() - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = day_start + timedelta(days=1)

        sessions = (
            db.query(StudySession)
            .filter(
                StudySession.user_id == current_user.id,
                StudySession.start_time >= day_start,
                StudySession.start_time < day_end,
                StudySession.end_time != None,
            )
            .all()
        )

        study_mins = sum(s.duration_minutes or 0 for s in sessions)
        scores = [s.productivity_score for s in sessions if s.productivity_score]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        distraction_mins = (
            db.query(func.sum(ActivityLog.duration_minutes))
            .filter(
                ActivityLog.user_id == current_user.id,
                ActivityLog.timestamp >= day_start,
                ActivityLog.timestamp < day_end,
                ActivityLog.category == "distraction",
            )
            .scalar()
            or 0
        )

        insights.append(
            DailyInsight(
                date=day.strftime("%a %b %d"),
                study_minutes=round(study_mins, 1),
                distraction_minutes=round(float(distraction_mins), 1),
                productivity_score=avg_score,
                sessions=len(sessions),
            )
        )
    return insights
