import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "carwash.db"
CSV_PATH = Path(__file__).parent / "data" / "transactions.csv"


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id          INTEGER PRIMARY KEY,
            date        TEXT NOT NULL,
            item        TEXT NOT NULL,
            amount      REAL NOT NULL,
            customer_id TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def clear_transactions() -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM transactions")
    conn.commit()
    conn.close()


def bulk_insert(rows) -> None:
    """Insert list of (date, item, amount, customer_id) tuples."""
    conn = sqlite3.connect(DB_PATH)
    conn.executemany(
        "INSERT INTO transactions (date, item, amount, customer_id) VALUES (?,?,?,?)",
        rows,
    )
    conn.commit()
    conn.close()


def insert_one(date_str: str, item: str, amount: float, customer_id: str) -> int:
    """Insert a single transaction and return the new row id."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute(
        "INSERT INTO transactions (date, item, amount, customer_id) VALUES (?,?,?,?)",
        (date_str, item, amount, customer_id),
    )
    row_id = cur.lastrowid
    conn.commit()
    conn.close()
    return row_id


def list_transactions(limit: int = 50, offset: int = 0) -> list[dict]:
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id, date, item, amount, customer_id FROM transactions ORDER BY date DESC, id DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def count_transactions() -> int:
    conn = get_db()
    try:
        return conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
    finally:
        conn.close()
