from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# --- Auth ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# --- Activity ---
class ActivityLogCreate(BaseModel):
    app_name: str
    category: str = "other"  # productive / distraction / neutral
    duration_minutes: float


class ActivityLogOut(ActivityLogCreate):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Study Sessions ---
class SessionStart(BaseModel):
    subject: Optional[str] = "General"


class SessionEnd(BaseModel):
    productivity_score: float  # 1–10
    break_minutes: Optional[float] = 0
    notes: Optional[str] = None


class StudySessionOut(BaseModel):
    id: int
    user_id: int
    subject: str
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[float]
    break_minutes: float
    productivity_score: Optional[float]
    notes: Optional[str]

    class Config:
        from_attributes = True


# --- Dashboard ---
class DashboardStats(BaseModel):
    today_study_minutes: float
    today_productivity_score: float
    today_distraction_minutes: float
    weekly_study_minutes: float
    streak_days: int
    total_sessions: int


# --- Recommendations ---
class TimeSlotRecommendation(BaseModel):
    hour: int
    predicted_score: float
    label: str  # "Excellent" / "Good" / "Fair"


class RecommendationResponse(BaseModel):
    best_slots: list[TimeSlotRecommendation]
    message: str
    cluster_label: str


# --- Insights ---
class DailyInsight(BaseModel):
    date: str
    study_minutes: float
    distraction_minutes: float
    productivity_score: float
    sessions: int
