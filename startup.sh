#!/usr/bin/env bash
set -e

echo "==> Building frontend..."
cd frontend
npm ci --prefer-offline
npm run build
cd ..

echo "==> Starting backend..."
cd backend
pip install -r requirements.txt --quiet
cd ..

exec uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"
