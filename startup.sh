#!/usr/bin/env bash
set -e

echo "==> Installing Python dependencies..."
pip install -r backend/requirements.txt --quiet

echo "==> Starting server..."
exec uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"
