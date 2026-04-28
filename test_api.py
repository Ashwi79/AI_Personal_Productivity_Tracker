"""
Backend API Tests
Run: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert "AI Productivity Tracker" in r.json()["message"]


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_register():
    r = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert r.status_code == 201
    assert r.json()["email"] == "test@example.com"


def test_register_duplicate():
    client.post("/api/auth/register", json={
        "name": "Dup", "email": "dup@example.com", "password": "pass"
    })
    r = client.post("/api/auth/register", json={
        "name": "Dup", "email": "dup@example.com", "password": "pass"
    })
    assert r.status_code == 400


def test_login():
    client.post("/api/auth/register", json={
        "name": "Login User", "email": "login@example.com", "password": "securepass"
    })
    r = client.post("/api/auth/login", json={
        "email": "login@example.com", "password": "securepass"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password():
    r = client.post("/api/auth/login", json={
        "email": "login@example.com", "password": "wrongpass"
    })
    assert r.status_code == 401


def _get_token(email="tok@example.com", password="pass123"):
    client.post("/api/auth/register", json={
        "name": "Token User", "email": email, "password": password
    })
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    return r.json()["access_token"]


def test_log_activity():
    token = _get_token("activity@example.com")
    r = client.post("/api/activity/log", json={
        "app_name": "YouTube", "category": "distraction", "duration_minutes": 15
    }, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 201
    assert r.json()["app_name"] == "YouTube"


def test_session_flow():
    token = _get_token("session@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Start
    r = client.post("/api/sessions/start", json={"subject": "Math"}, headers=headers)
    assert r.status_code == 201
    session_id = r.json()["id"]

    # Can't start another
    r2 = client.post("/api/sessions/start", json={"subject": "Physics"}, headers=headers)
    assert r2.status_code == 400

    # End
    r3 = client.put(f"/api/sessions/{session_id}/end", json={
        "productivity_score": 8.0, "break_minutes": 5
    }, headers=headers)
    assert r3.status_code == 200
    assert r3.json()["productivity_score"] == 8.0
