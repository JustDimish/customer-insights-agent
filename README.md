# Car Wash Insights Agent

A car wash analytics agent that surfaces revenue insights and answers plain-English questions grounded in real transaction data.

## Architecture

```
backend/          FastAPI — stats pipeline, Groq insights, agentic Q&A
  main.py         API routes + serves React build in production
  database.py     SQLite init + CSV seed (idempotent)
  stats.py        4 stats functions + Groq tool schemas (shared)
  insights.py     Groq AI summary of business stats
  agent.py        Tool-calling loop for free-text Q&A
  data/           200-row car wash transactions CSV
  tests/          pytest unit tests

frontend/         React + Vite + Recharts dashboard
  src/App.jsx     KPI cards, charts, AI insights panel
  src/components/ RevenueChart, TopItemsChart, AskBox
```

## Local Setup

```bash
# 1. Copy and fill in your Groq key
cp .env.example .env
# edit .env: GROQ_API_KEY=gsk_...

# 2. Backend
cd backend
pip install -r requirements.txt
cd ..
uvicorn backend.main:app --reload --app-dir .

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

## Run Tests

```bash
cd backend
pytest tests/ -v
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stats/revenue-by-day` | Daily revenue totals |
| GET | `/api/stats/top-items` | Top 5 services by revenue |
| GET | `/api/stats/repeat-customer-rate` | Customer loyalty rate |
| GET | `/api/stats/average-ticket` | Average transaction value |
| GET | `/api/insights` | AI-generated business insights (Groq) |
| POST | `/api/ask` | Agentic Q&A — body: `{"question": "..."}` |

## Deploy to Azure App Service

1. Create App Service: Python 3.11 · Linux · Free F1 plan
2. Deployment Center → GitHub → connect repo → branch: `main`
3. Configuration → Application Settings → add `GROQ_API_KEY`
4. Set Startup Command: `bash startup.sh`
5. Save — Azure deploys automatically on every push

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Your Groq API key (`gsk_...`) — never commit this |
