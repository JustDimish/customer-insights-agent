#!/usr/bin/env bash
set -e

WWWROOT=/home/site/wwwroot

echo "==> Installing Python dependencies..."
python3 -m pip install -r "$WWWROOT/backend/requirements.txt" --upgrade --quiet

echo "==> Installed groq version:"
python3 -c "import groq; print(groq.__version__)"

echo "==> Starting server..."
cd "$WWWROOT/backend"
exec python3 -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
