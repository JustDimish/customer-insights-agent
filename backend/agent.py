import json
import os

from openai import OpenAI

from database import get_db
from stats import TOOL_SCHEMAS, dispatch_tool

SYSTEM_PROMPT = (
    "You answer questions about a car wash business using only the provided tools. "
    "Never invent numbers. Always call a tool to retrieve real data before answering."
)

MAX_TURNS = 5


def answer_question(question: str) -> str:
    client = OpenAI(api_key=os.environ["GROQ_API_KEY"], base_url="https://api.groq.com/openai/v1")
    db = get_db()

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]

    try:
        for _ in range(MAX_TURNS):
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                tools=TOOL_SCHEMAS,
                tool_choice="auto",
                max_tokens=512,
                temperature=0.1,
            )

            msg = response.choices[0].message

            if not msg.tool_calls:
                return msg.content.strip()

            messages.append({"role": "assistant", "content": msg.content, "tool_calls": [
                {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in msg.tool_calls
            ]})

            for tc in msg.tool_calls:
                args = json.loads(tc.function.arguments or "{}")
                result = dispatch_tool(tc.function.name, args, db)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                })

        return "I was unable to answer that question with the available data."
    finally:
        db.close()
