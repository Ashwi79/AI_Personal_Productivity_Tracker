"""
ML Inference Module
-------------------
Loads trained models and provides prediction functions called by API routes.
"""

import os
import numpy as np
import joblib
from typing import List

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

_rf = None
_kmeans = None
_scaler = None
_gbc = None


def _load_models():
    global _rf, _kmeans, _scaler, _gbc
    rf_path = os.path.join(MODELS_DIR, "productivity_predictor.pkl")
    if not os.path.exists(rf_path):
        # Auto-train if models missing
        from app.ml.train import train
        train()
    _rf = joblib.load(rf_path)
    _kmeans = joblib.load(os.path.join(MODELS_DIR, "time_recommender.pkl"))
    _scaler = joblib.load(os.path.join(MODELS_DIR, "cluster_scaler.pkl"))
    _gbc = joblib.load(os.path.join(MODELS_DIR, "distraction_detector.pkl"))


def _ensure_loaded():
    if _rf is None:
        _load_models()


def predict_best_hours(sessions) -> dict:
    """Given a list of StudySession ORM objects, return best study time slots."""
    _ensure_loaded()

    CLUSTER_LABELS = {0: "Night Owl", 1: "Morning Person", 2: "Afternoon Focused", 3: "Evening Peak"}

    # Build feature matrix: one row per hour-of-day (0-23)
    results = []
    avg_prev_score = 6.5
    avg_distraction = 20.0
    avg_duration = 60.0
    avg_break = 5.0
    dow = 1  # Assume Monday as default

    if sessions:
        scores = [s.productivity_score for s in sessions if s.productivity_score]
        avg_prev_score = float(np.mean(scores)) if scores else 6.5
        durations = [s.duration_minutes for s in sessions if s.duration_minutes]
        avg_duration = float(np.mean(durations)) if durations else 60.0

    for hour in range(24):
        features = np.array([[hour, dow, avg_duration, avg_break, avg_prev_score, avg_distraction]])
        predicted_score = float(_rf.predict(features)[0])
        predicted_score = round(max(1.0, min(10.0, predicted_score)), 2)

        if predicted_score >= 7.5:
            label = "Excellent"
        elif predicted_score >= 5.5:
            label = "Good"
        else:
            label = "Fair"

        results.append({"hour": hour, "predicted_score": predicted_score, "label": label})

    # Sort by score and pick top 5
    best = sorted(results, key=lambda x: x["predicted_score"], reverse=True)[:5]

    # Determine cluster for current user pattern
    if sessions:
        hours_data = [s.start_time.hour for s in sessions if s.start_time]
        scores_data = [s.productivity_score or 5 for s in sessions]
        if hours_data:
            avg_hour = float(np.mean(hours_data))
            avg_score = float(np.mean(scores_data))
            scaled = _scaler.transform([[avg_hour, avg_score]])
            cluster = int(_kmeans.predict(scaled)[0])
            cluster_label = CLUSTER_LABELS.get(cluster, "Flexible Learner")
        else:
            cluster_label = "Flexible Learner"
    else:
        cluster_label = "Flexible Learner"

    top_hour = best[0]["hour"]
    ampm = "AM" if top_hour < 12 else "PM"
    display_hour = top_hour if top_hour <= 12 else top_hour - 12
    if display_hour == 0:
        display_hour = 12

    return {
        "best_slots": best,
        "message": f"Your peak focus window is around {display_hour}:00 {ampm}. You're a {cluster_label}!",
        "cluster_label": cluster_label,
    }


def detect_distraction(hour: int, dow: int, duration: float, break_min: float, prev_score: float, distraction_today: float) -> bool:
    """Return True if current session pattern suggests distraction."""
    _ensure_loaded()
    features = np.array([[hour, dow, duration, break_min, prev_score, distraction_today]])
    return bool(_gbc.predict(features)[0])
