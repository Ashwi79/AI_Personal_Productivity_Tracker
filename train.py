"""
ML Training Script
-----------------
Trains three models:
  1. productivity_predictor  – Random Forest Regressor
  2. study_time_recommender  – K-Means Clustering
  3. distraction_detector    – Gradient Boosting Classifier

Run:
    python -m app.ml.train
    python -m app.ml.train --data ../../data/sample/sessions.csv
"""

import argparse
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, classification_report

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")


def generate_synthetic_data(n: int = 500) -> pd.DataFrame:
    """Generate synthetic training data when no CSV is provided."""
    np.random.seed(42)
    hours = np.random.randint(0, 24, n)
    # Productivity pattern: morning (7-10) and evening (18-21) peaks
    base_score = (
        5.0
        + 3.5 * np.exp(-((hours - 8.5) ** 2) / 4)
        + 2.5 * np.exp(-((hours - 19) ** 2) / 4)
    )
    score = np.clip(base_score + np.random.normal(0, 0.8, n), 1, 10)

    df = pd.DataFrame(
        {
            "hour_of_day": hours,
            "day_of_week": np.random.randint(0, 7, n),
            "duration_minutes": np.random.uniform(20, 120, n),
            "break_minutes": np.random.uniform(0, 20, n),
            "prev_session_score": np.random.uniform(3, 10, n),
            "distraction_minutes_today": np.random.uniform(0, 60, n),
            "productivity_score": score,
        }
    )
    df["is_distracted"] = (df["distraction_minutes_today"] > 30).astype(int)
    return df


def train(data_path: str = None):
    os.makedirs(MODELS_DIR, exist_ok=True)

    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
        print(f"Loaded {len(df)} rows from {data_path}")
    else:
        df = generate_synthetic_data(600)
        print("Using synthetic training data (600 samples)")

    feature_cols = [
        "hour_of_day",
        "day_of_week",
        "duration_minutes",
        "break_minutes",
        "prev_session_score",
        "distraction_minutes_today",
    ]

    X = df[feature_cols]
    y_score = df["productivity_score"]
    y_class = df["is_distracted"]

    # --- 1. Productivity Predictor (Random Forest Regressor) ---
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_score, test_size=0.2, random_state=42)
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_tr, y_tr)
    mae = mean_absolute_error(y_te, rf.predict(X_te))
    print(f"[ProductivityPredictor] MAE: {mae:.3f}")
    joblib.dump(rf, os.path.join(MODELS_DIR, "productivity_predictor.pkl"))

    # --- 2. Study Time Recommender (K-Means on hour + score) ---
    scaler = StandardScaler()
    X_cluster = scaler.fit_transform(df[["hour_of_day", "productivity_score"]])
    kmeans = KMeans(n_clusters=4, random_state=42, n_init="auto")
    kmeans.fit(X_cluster)
    joblib.dump(kmeans, os.path.join(MODELS_DIR, "time_recommender.pkl"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "cluster_scaler.pkl"))
    print("[StudyTimeRecommender] K-Means trained with 4 clusters")

    # --- 3. Distraction Detector (Gradient Boosting Classifier) ---
    Xc_tr, Xc_te, yc_tr, yc_te = train_test_split(X, y_class, test_size=0.2, random_state=42)
    gbc = GradientBoostingClassifier(n_estimators=100, random_state=42)
    gbc.fit(Xc_tr, yc_tr)
    print("[DistractionDetector]")
    print(classification_report(yc_te, gbc.predict(Xc_te)))
    joblib.dump(gbc, os.path.join(MODELS_DIR, "distraction_detector.pkl"))

    print("All models saved to", MODELS_DIR)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default=None, help="Path to training CSV")
    args = parser.parse_args()
    train(args.data)
