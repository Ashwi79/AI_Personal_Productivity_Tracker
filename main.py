from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import auth, activity, sessions, dashboard, recommendations, insights

# Create tables (Alembic handles migrations in prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Productivity Tracker API",
    description="Backend for AI-powered personal productivity tracking",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(activity.router, prefix="/api/activity", tags=["Activity"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])


@app.get("/")
def root():
    return {"message": "AI Productivity Tracker API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
