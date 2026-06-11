import json

import groq_client
from database import get_db
from stats import TOOL_SCHEMAS, dispatch_tool

SYSTEM_PROMPT = (
    "You answer questions about a car wash business using only the provided tools. "
    "Never invent numbers. Always call a tool to retrieve real data before answering."
)

MAX_TURNS = 5


def answer_question(question: str) -> str:
    db = get_db()
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]

    try:
        for _ in range(MAX_TURNS):
            response = groq_client.chat(
                messages,
                tools=TOOL_SCHEMAS,
                tool_choice="auto",
                max_tokens=512,
                temperature=0.1,
            )

            msg = response["choices"][0]["message"]
            tool_calls = msg.get("tool_calls")

            if not tool_calls:
                return (msg.get("content") or "").strip()

            messages.append({
                "role": "assistant",
                "content": msg.get("content"),
                "tool_calls": [
                    {"id": tc["id"], "type": "function", "function": tc["function"]}
                    for tc in tool_calls
                ],
            })

            for tc in tool_calls:
                args = json.loads(tc["function"].get("arguments") or "{}")
                result = dispatch_tool(tc["function"]["name"], args, db)
                messages.append({"role": "tool", "tool_call_id": tc["id"], "content": result})

        return "I was unable to answer that question with the available data."
    finally:
        db.close()
