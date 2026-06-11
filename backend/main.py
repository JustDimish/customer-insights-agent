from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

from agent import answer_question
from database import get_db, init_db
from insights import get_insights
from stats import average_ticket, repeat_customer_rate, revenue_by_day, top_items


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Car Wash Insights API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Stats endpoints ──────────────────────────────────────────────────────────

@app.get("/api/stats/revenue-by-day")
def api_revenue_by_day():
    db = get_db()
    try:
        return revenue_by_day(db)
    finally:
        db.close()


@app.get("/api/stats/top-items")
def api_top_items(n: int = 5):
    db = get_db()
    try:
        return top_items(db, n=n)
    finally:
        db.close()


@app.get("/api/stats/repeat-customer-rate")
def api_repeat_customer_rate():
    db = get_db()
    try:
        return repeat_customer_rate(db)
    finally:
        db.close()


@app.get("/api/stats/average-ticket")
def api_average_ticket():
    db = get_db()
    try:
        return average_ticket(db)
    finally:
        db.close()


# ── Insights endpoint ────────────────────────────────────────────────────────

@app.get("/api/insights")
def api_insights():
    try:
        return {"summary": get_insights()}
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            return {"summary": "The AI service is temporarily rate-limited. Please refresh in a moment."}
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Agentic Q&A endpoint ─────────────────────────────────────────────────────

class QuestionRequest(BaseModel):
    question: str


@app.post("/api/ask")
def api_ask(req: QuestionRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        return {"answer": answer_question(req.question)}
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            return {"answer": "The AI service is temporarily rate-limited. Please wait a moment and try again."}
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Serve React SPA (production) ─────────────────────────────────────────────

_static = Path(__file__).parent.parent / "frontend" / "dist"
if _static.exists():
    app.mount("/", StaticFiles(directory=_static, html=True), name="static")
