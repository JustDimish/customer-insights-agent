import sqlite3
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))
from stats import average_ticket, repeat_customer_rate, revenue_by_day, top_items


@pytest.fixture
def db():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE transactions (
            id INTEGER PRIMARY KEY, date TEXT, item TEXT, amount REAL, customer_id TEXT
        )
    """)
    conn.executemany(
        "INSERT INTO transactions VALUES (?,?,?,?,?)",
        [
            (1, "2025-01-01", "Basic Wash",    12.00, "C001"),
            (2, "2025-01-01", "Premium Wash",  22.00, "C002"),
            (3, "2025-01-02", "Full Detail",   85.00, "C001"),  # C001 repeats
            (4, "2025-01-02", "Basic Wash",    12.00, "C003"),
            (5, "2025-01-03", "Interior Clean",45.00, "C004"),
        ],
    )
    conn.commit()
    yield conn
    conn.close()


def test_revenue_by_day(db):
    result = revenue_by_day(db)
    assert len(result) == 3
    assert result[0] == {"date": "2025-01-01", "revenue": 34.00}
    assert result[1] == {"date": "2025-01-02", "revenue": 97.00}
    assert result[2] == {"date": "2025-01-03", "revenue": 45.00}


def test_top_items(db):
    result = top_items(db, n=3)
    assert result[0]["item"] == "Full Detail"
    assert result[0]["total_revenue"] == 85.00
    assert result[0]["count"] == 1


def test_top_items_default_n(db):
    result = top_items(db)
    assert len(result) <= 5


def test_repeat_customer_rate(db):
    result = repeat_customer_rate(db)
    assert result["total_count"] == 4       # C001, C002, C003, C004
    assert result["repeat_count"] == 1      # only C001 appears twice
    assert result["rate_pct"] == 25.0


def test_average_ticket(db):
    result = average_ticket(db)
    assert result["total_transactions"] == 5
    expected_avg = round((12 + 22 + 85 + 12 + 45) / 5, 2)
    assert result["avg_ticket"] == expected_avg
