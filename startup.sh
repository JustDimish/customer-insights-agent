#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/backend"

echo "==> Installing Python dependencies..."
pip install -r requirements.txt --quiet

echo "==> Starting server..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
