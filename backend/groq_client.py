import os

import httpx

_URL = "https://api.groq.com/openai/v1/chat/completions"
_MODEL = "llama-3.3-70b-versatile"


def chat(messages, *, model=_MODEL, max_tokens=512, temperature=0.1, tools=None, tool_choice=None):
    payload = {"model": model, "messages": messages, "max_tokens": max_tokens, "temperature": temperature}
    if tools is not None:
        payload["tools"] = tools
    if tool_choice is not None:
        payload["tool_choice"] = tool_choice

    with httpx.Client(timeout=60) as client:
        resp = client.post(
            _URL,
            headers={"Authorization": f"Bearer {os.environ['GROQ_API_KEY']}", "Content-Type": "application/json"},
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()
