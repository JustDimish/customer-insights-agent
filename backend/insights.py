import json
import time

import groq_client
from database import get_db
from stats import average_ticket, repeat_customer_rate, revenue_by_day, top_items

_cache: dict = {"ts": 0.0, "summary": ""}
_CACHE_TTL = 60

SYSTEM_PROMPT = (
    "You are a business analyst specializing in car wash operations. "
    "Given JSON performance data, provide 4-5 specific actionable insights. "
    "Focus on top revenue drivers, customer loyalty patterns, peak periods, and growth opportunities. "
    "Cite exact numbers. Use terms like 'transaction', 'service', 'wash' — never 'ticket'. "
    "Keep response under 250 words."
)


def invalidate_cache() -> None:
    _cache["ts"] = 0.0
    _cache["summary"] = ""


def get_insights() -> str:
    if time.time() - _cache["ts"] < _CACHE_TTL and _cache["summary"]:
        return _cache["summary"]

    db = get_db()
    stats = {
        "revenue_by_day": revenue_by_day(db),
        "top_items": top_items(db),
        "repeat_customer_rate": repeat_customer_rate(db),
        "average_ticket": average_ticket(db),
    }
    db.close()

    response = groq_client.chat(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(stats)},
        ],
        max_tokens=350,
        temperature=0.3,
    )

    summary = response["choices"][0]["message"]["content"].strip()
    _cache["ts"] = time.time()
    _cache["summary"] = summary
    return summary
