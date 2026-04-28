from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import StudySession, User
from app.schemas.schemas import RecommendationResponse, TimeSlotRecommendation
from app.api.auth_utils import get_current_user
from app.ml.predictor import predict_best_hours

router = APIRouter()


@router.get("", response_model=RecommendationResponse)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch user's historical sessions
    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, StudySession.end_time != None)
        .order_by(StudySession.start_time.desc())
        .limit(100)
        .all()
    )

    result = predict_best_hours(sessions)
    return result
