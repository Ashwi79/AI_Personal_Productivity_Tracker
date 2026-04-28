from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.models.models import StudySession, User
from app.schemas.schemas import SessionStart, SessionEnd, StudySessionOut
from app.api.auth_utils import get_current_user
from typing import List

router = APIRouter()


@router.post("/start", response_model=StudySessionOut, status_code=201)
def start_session(
    payload: SessionStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check for already-running session
    active = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, StudySession.end_time == None)
        .first()
    )
    if active:
        raise HTTPException(status_code=400, detail="A session is already running. End it first.")

    session = StudySession(
        user_id=current_user.id,
        subject=payload.subject,
        start_time=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.put("/{session_id}/end", response_model=StudySessionOut)
def end_session(
    session_id: int,
    payload: SessionEnd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(StudySession)
        .filter(StudySession.id == session_id, StudySession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.end_time:
        raise HTTPException(status_code=400, detail="Session already ended")

    now = datetime.now(timezone.utc)
    session.end_time = now
    total_minutes = (now - session.start_time).total_seconds() / 60
    session.duration_minutes = round(total_minutes - payload.break_minutes, 2)
    session.break_minutes = payload.break_minutes
    session.productivity_score = payload.productivity_score
    session.notes = payload.notes
    db.commit()
    db.refresh(session)
    return session


@router.get("/active", response_model=StudySessionOut | None)
def get_active_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, StudySession.end_time == None)
        .first()
    )


@router.get("/history", response_model=List[StudySessionOut])
def session_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, StudySession.end_time != None)
        .order_by(StudySession.start_time.desc())
        .limit(limit)
        .all()
    )
