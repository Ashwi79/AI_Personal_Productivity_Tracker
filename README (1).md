# 🧠 AI Personal Productivity Tracker

An intelligent productivity tracking system that monitors screen time, study patterns, and uses ML to recommend optimal study schedules.

## 🚀 Features

### Core
- ⏱️ **Study Session Timer** — Manual start/stop with productivity self-rating
- 📊 **Activity Logging** — Track app/web usage with category tagging
- 🎯 **Daily Productivity Score** — Computed from sessions, breaks, and ratings
- 🤖 **AI Schedule Recommendations** — ML-powered optimal study time prediction

### Advanced
- 🚨 **Distraction Detection** — Identify low-focus patterns from activity logs
- 📈 **Weekly Insights Dashboard** — Rich charts and trend analysis
- 🔮 **Best Study Time Prediction** — Random Forest + K-Means clustering
- 🔔 **Notification System** — Browser push notifications for study reminders

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, Tailwind CSS |
| Backend | Python 3.11, FastAPI |
| Database | PostgreSQL + SQLAlchemy |
| ML | scikit-learn, pandas, numpy |
| Auth | JWT (python-jose) |
| Deployment | Docker + Docker Compose |
| CI/CD | GitHub Actions |

## 📁 Project Structure

```
productivity-tracker/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── ml/           # ML models & training
│   │   ├── models/       # SQLAlchemy ORM models
│   │   └── schemas/      # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page views
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Zustand state
│   │   └── utils/        # Helpers
│   ├── package.json
│   └── Dockerfile
├── data/sample/          # Sample CSV for ML training
├── docker-compose.yml
└── .github/workflows/    # CI/CD
```

## ⚡ Quick Start

### Option 1: Docker (Recommended)
```bash
git clone https://github.com/YOUR_USERNAME/productivity-tracker.git
cd productivity-tracker
cp .env.example .env
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit DB credentials
alembic upgrade head       # Run migrations
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 🤖 ML Models

| Model | Purpose | Algorithm |
|-------|---------|-----------|
| Productivity Predictor | Score a given time slot | Random Forest |
| Study Time Recommender | Find peak focus windows | K-Means Clustering |
| Distraction Detector | Flag low-focus periods | Gradient Boosting Classifier |

### Training the Models
```bash
cd backend
python -m app.ml.train --data ../data/sample/sessions.csv
```
Models are saved to `backend/app/ml/saved_models/`.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login & get JWT |
| POST | `/api/activity/log` | Log app activity |
| POST | `/api/sessions/start` | Start study session |
| PUT | `/api/sessions/{id}/end` | End study session |
| GET | `/api/dashboard/stats` | Get dashboard data |
| GET | `/api/recommendations` | Get AI schedule |
| GET | `/api/insights/weekly` | Weekly report |

## 🧪 Running Tests
```bash
cd backend
pytest tests/ -v
```

## 🚀 Deployment (Production)

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:5432/productivitydb
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://yourdomain.com
```

### Deploy to Railway / Render / Fly.io
1. Push to GitHub
2. Connect repo to your cloud provider
3. Set environment variables
4. Deploy!

## 📸 Screenshots

> Dashboard, Timer, and Recommendations panels included in `/docs/screenshots/`

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE)
