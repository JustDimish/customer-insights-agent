#!/usr/bin/env bash
# Virtual environment lives in persistent /home/site/venv/ (Azure Files).
# Created + populated once; all subsequent starts skip straight to uvicorn.

WWWROOT=/home/site/wwwroot
VENV=/home/site/venv

if [ ! -f "$VENV/bin/uvicorn" ]; then
    echo "==> Creating virtual environment..."
    python3 -m venv "$VENV"
    echo "==> Installing packages..."
    "$VENV/bin/pip" install \
        fastapi==0.115.5 \
        "uvicorn[standard]==0.32.1" \
        httpx \
        python-dotenv==1.0.1 \
        pydantic==2.10.3 \
        python-multipart==0.0.20 \
        --quiet --root-user-action=ignore
    echo "==> Packages ready."
fi

echo "==> Starting WashMetrics..."
cd "$WWWROOT/backend"
exec "$VENV/bin/uvicorn" main:app \
    --host 0.0.0.0 --port "${PORT:-8000}"
