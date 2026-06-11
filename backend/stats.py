import json
import sqlite3


def revenue_by_day(db: sqlite3.Connection) -> list[dict]:
    rows = db.execute(
        "SELECT date, ROUND(SUM(amount), 2) AS revenue FROM transactions GROUP BY date ORDER BY date"
    ).fetchall()
    return [{"date": r["date"], "revenue": r["revenue"]} for r in rows]


def top_items(db: sqlite3.Connection, n: int = 5) -> list[dict]:
    rows = db.execute(
        """SELECT item,
                  ROUND(SUM(amount), 2) AS total_revenue,
                  COUNT(*) AS count
           FROM transactions
           GROUP BY item
           ORDER BY total_revenue DESC
           LIMIT ?""",
        (n,),
    ).fetchall()
    return [{"item": r["item"], "total_revenue": r["total_revenue"], "count": r["count"]} for r in rows]


def repeat_customer_rate(db: sqlite3.Connection) -> dict:
    total = db.execute("SELECT COUNT(DISTINCT customer_id) FROM transactions").fetchone()[0]
    repeat = db.execute(
        "SELECT COUNT(*) FROM (SELECT customer_id FROM transactions GROUP BY customer_id HAVING COUNT(*) > 1)"
    ).fetchone()[0]
    rate = round((repeat / total * 100), 1) if total else 0.0
    return {"rate_pct": rate, "repeat_count": repeat, "total_count": total}


def average_ticket(db: sqlite3.Connection) -> dict:
    row = db.execute("SELECT ROUND(AVG(amount), 2) AS avg, COUNT(*) AS cnt FROM transactions").fetchone()
    return {"avg_ticket": row["avg"], "total_transactions": row["cnt"]}


# Groq tool schemas — mirror the functions above
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "revenue_by_day",
            "description": "Returns daily revenue totals for the car wash, sorted by date ascending.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "top_items",
            "description": "Returns the top N services by total revenue. Default N=5.",
            "parameters": {
                "type": "object",
                "properties": {
                    "n": {"type": "integer", "description": "Number of top items to return (default 5)"}
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "repeat_customer_rate",
            "description": "Returns the percentage of customers who visited more than once, plus raw counts.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "average_ticket",
            "description": "Returns the average transaction value and total transaction count.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]

# Dispatcher: maps tool name → function call result
def dispatch_tool(name: str, args: dict, db: sqlite3.Connection) -> str:
    if name == "revenue_by_day":
        return json.dumps(revenue_by_day(db))
    if name == "top_items":
        return json.dumps(top_items(db, n=args.get("n", 5)))
    if name == "repeat_customer_rate":
        return json.dumps(repeat_customer_rate(db))
    if name == "average_ticket":
        return json.dumps(average_ticket(db))
    raise ValueError(f"Unknown tool: {name}")
