#!/usr/bin/env bash
set -e

WWWROOT=/home/site/wwwroot

echo "==> Installing Python dependencies..."
pip install -r "$WWWROOT/backend/requirements.txt" --quiet

echo "==> Starting server..."
cd "$WWWROOT/backend"
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
