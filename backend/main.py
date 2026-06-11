import csv
import io
from contextlib import asynccontextmanager
from datetime import date
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

from agent import answer_question
from data_generator import generate_transactions
from database import (
    bulk_insert,
    clear_transactions,
    count_transactions,
    get_db,
    init_db,
    insert_one,
    list_transactions,
)
from insights import get_insights, invalidate_cache
from stats import (
    average_ticket,
    repeat_customer_rate,
    revenue_by_day,
    revenue_by_month,
    revenue_by_weekday,
    top_items,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="WashMetrics API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Data status / management ──────────────────────────────────────────────────

@app.get("/api/data/status")
def api_data_status():
    total = count_transactions()
    if total == 0:
        return {"has_data": False, "transaction_count": 0, "date_range": None}

    db = get_db()
    try:
        row = db.execute(
            "SELECT MIN(date) AS min_date, MAX(date) AS max_date FROM transactions"
        ).fetchone()
        date_range = {"min": row["min_date"], "max": row["max_date"]}
    finally:
        db.close()

    return {"has_data": True, "transaction_count": total, "date_range": date_range}


@app.post("/api/data/generate")
def api_data_generate():
    rows = generate_transactions(count=200, days=180)
    clear_transactions()
    bulk_insert(rows)
    invalidate_cache()
    return {"count": len(rows)}


@app.post("/api/data/clear")
def api_data_clear():
    clear_transactions()
    invalidate_cache()
    return {"message": "All transaction data has been cleared."}


@app.post("/api/data/upload")
async def api_data_upload(file: UploadFile = File(...)):
    content = await file.read()
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    fieldnames = [f.strip() for f in (reader.fieldnames or [])]

    # Flexible column mapping
    def find_col(candidates):
        for c in candidates:
            if c in fieldnames:
                return c
        return None

    date_col     = find_col(["date", "Date", "DATE"])
    item_col     = find_col(["item", "service", "Service", "Item", "ITEM", "SERVICE"])
    amount_col   = find_col(["amount", "Amount", "price", "Price", "AMOUNT", "PRICE"])
    customer_col = find_col(["customer_id", "customer", "Customer", "Customer_ID", "CUSTOMER_ID"])

    if not date_col or not item_col or not amount_col:
        raise HTTPException(
            status_code=400,
            detail=f"CSV must have columns for date, service/item, and amount. Found: {fieldnames}",
        )

    rows = []
    errors = []
    for i, row in enumerate(reader, start=2):
        try:
            d   = row[date_col].strip()
            itm = row[item_col].strip()
            amt = float(row[amount_col].strip())
            cid = row[customer_col].strip() if customer_col and row.get(customer_col) else f"U{i:04d}"
            if not d or not itm:
                raise ValueError("date or item is empty")
            rows.append((d, itm, amt, cid))
        except Exception as exc:
            errors.append(f"Row {i}: {exc}")

    if not rows:
        raise HTTPException(status_code=400, detail="No valid rows found in CSV.")

    clear_transactions()
    bulk_insert(rows)
    invalidate_cache()
    return {"count": len(rows), "errors": errors}


# ── Transactions CRUD ─────────────────────────────────────────────────────────

class TransactionIn(BaseModel):
    date: str
    item: str
    amount: float
    customer_id: Optional[str] = None


@app.post("/api/transactions")
def api_add_transaction(tx: TransactionIn):
    cid = tx.customer_id or f"U{int(date.today().strftime('%Y%m%d'))}"
    row_id = insert_one(tx.date, tx.item, tx.amount, cid)
    invalidate_cache()
    return {"id": row_id, "message": "Transaction added."}


@app.get("/api/transactions")
def api_list_transactions(limit: int = 50, offset: int = 0):
    txs   = list_transactions(limit=limit, offset=offset)
    total = count_transactions()
    return {"transactions": txs, "total": total}


# ── Stats endpoints ───────────────────────────────────────────────────────────

@app.get("/api/stats/summary")
def api_stats_summary():
    db = get_db()
    try:
        return {
            "revenue_by_day":       revenue_by_day(db),
            "top_items":            top_items(db),
            "repeat_customer_rate": repeat_customer_rate(db),
            "average_ticket":       average_ticket(db),
            "by_weekday":           revenue_by_weekday(db),
            "by_month":             revenue_by_month(db),
        }
    finally:
        db.close()


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


@app.get("/api/stats/by-weekday")
def api_by_weekday():
    db = get_db()
    try:
        return revenue_by_weekday(db)
    finally:
        db.close()


@app.get("/api/stats/by-month")
def api_by_month():
    db = get_db()
    try:
        return revenue_by_month(db)
    finally:
        db.close()


# ── Insights endpoint ─────────────────────────────────────────────────────────

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


# ── Agentic Q&A endpoint ──────────────────────────────────────────────────────

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


# ── Serve React SPA (production) ──────────────────────────────────────────────

_static = Path(__file__).parent.parent / "frontend" / "dist"
if _static.exists():
    app.mount("/", StaticFiles(directory=_static, html=True), name="static")
