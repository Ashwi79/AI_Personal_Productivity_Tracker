FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create models directory
RUN mkdir -p app/ml/saved_models

# Train models on startup if not present, then run migrations and server
CMD ["sh", "-c", "alembic upgrade head && python -m app.ml.train && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
