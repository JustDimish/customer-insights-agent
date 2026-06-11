import json

import groq_client
from database import get_db
from stats import TOOL_SCHEMAS, dispatch_tool

SYSTEM_PROMPT = (
    "You are a sharp, practical business advisor for a car wash owner. "
    "You have deep expertise in car wash operations, pricing, marketing, customer retention, "
    "local competition, staffing, equipment, and growth strategy. "
    "When the owner asks data questions (revenue, top services, repeat customers, etc.) you MUST "
    "call the available tools to get real numbers and cite them in your answer. "
    "When the owner asks strategy, marketing, competitive, or forward-looking questions, answer "
    "directly from your expertise — you do NOT need to call tools, but if data would strengthen "
    "your advice (e.g. knowing their top service before recommending a bundle), call it. "
    "Be direct, specific, and actionable. Write like a trusted advisor, not a textbook. "
    "Keep answers focused and under 350 words."
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
                max_tokens=1024,
                temperature=0.4,
            )

            msg = response["choices"][0].get("message") or {}
            tool_calls = msg.get("tool_calls")

            if not tool_calls:
                content = (msg.get("content") or "").strip()
                return content if content else "I wasn't able to generate a response. Please rephrase your question."

            messages.append({
                "role": "assistant",
                "content": msg.get("content") or "",
                "tool_calls": [
                    {"id": tc["id"], "type": "function", "function": tc["function"]}
                    for tc in tool_calls
                ],
            })

            for tc in tool_calls:
                args = json.loads(tc["function"].get("arguments") or "{}") or {}
                result = dispatch_tool(tc["function"]["name"], args, db)
                messages.append({"role": "tool", "tool_call_id": tc["id"], "content": str(result)})

        return "I was unable to answer that question with the available data."
    finally:
        db.close()
