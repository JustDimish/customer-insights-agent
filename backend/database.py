import csv
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

    if conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0] == 0:
        with open(CSV_PATH, newline="") as f:
            rows = list(csv.DictReader(f))
        conn.executemany(
            "INSERT INTO transactions (id, date, item, amount, customer_id) VALUES (?,?,?,?,?)",
            [(r["id"], r["date"], r["item"], float(r["amount"]), r["customer_id"]) for r in rows],
        )
        conn.commit()

    conn.close()
