from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    activity_logs = relationship("ActivityLog", back_populates="user")
    study_sessions = relationship("StudySession", back_populates="user")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    app_name = Column(String(200), nullable=False)
    category = Column(String(50), default="other")  # productive / distraction / neutral
    duration_minutes = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activity_logs")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(200), default="General")
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Float, nullable=True)
    break_minutes = Column(Float, default=0)
    productivity_score = Column(Float, nullable=True)  # 1–10 user self-rating
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="study_sessions")
