import json
import sqlite3
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture
def seeded_db(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "test_key_dummy")

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE transactions (id INTEGER PRIMARY KEY, date TEXT, item TEXT, amount REAL, customer_id TEXT)")
    conn.executemany("INSERT INTO transactions VALUES (?,?,?,?,?)", [
        (1, "2025-01-01", "Basic Wash",  12.00, "C001"),
        (2, "2025-01-02", "Full Detail", 85.00, "C002"),
        (3, "2025-01-02", "Basic Wash",  12.00, "C001"),
    ])
    conn.commit()

    import database
    monkeypatch.setattr(database, "get_db", lambda: conn)
    import agent
    monkeypatch.setattr(agent, "get_db", lambda: conn)
    return conn


def _tool_call(name, args_dict, call_id="call_1"):
    return {"id": call_id, "type": "function", "function": {"name": name, "arguments": json.dumps(args_dict)}}


def _response(tool_calls=None, content=None):
    msg = {"role": "assistant", "content": content}
    if tool_calls:
        msg["tool_calls"] = tool_calls
    return {"choices": [{"message": msg}]}


def test_agent_calls_tool_and_returns_grounded_answer(seeded_db, monkeypatch):
    from agent import answer_question
    import groq_client

    grounded_answer = "The average ticket is $36.33 across 3 transactions."
    responses = [
        _response(tool_calls=[_tool_call("average_ticket", {})]),
        _response(content=grounded_answer),
    ]
    call_count = {"n": 0}

    def mock_chat(messages, **kwargs):
        idx = call_count["n"]
        call_count["n"] += 1
        return responses[idx]

    monkeypatch.setattr(groq_client, "chat", mock_chat)
    answer = answer_question("What is my average ticket?")

    assert answer == grounded_answer
    assert call_count["n"] == 2


def test_agent_grounds_answer_in_tool_result(seeded_db, monkeypatch):
    from agent import answer_question
    import groq_client

    calls = []

    def mock_chat(messages, **kwargs):
        calls.append(messages)
        if len(calls) == 1:
            return _response(tool_calls=[_tool_call("average_ticket", {})])
        return _response(content="Average ticket is $36.33.")

    monkeypatch.setattr(groq_client, "chat", mock_chat)
    answer_question("Average ticket?")

    second_call_messages = calls[1]
    tool_messages = [m for m in second_call_messages if m.get("role") == "tool"]
    assert len(tool_messages) == 1
    assert tool_messages[0]["content"]


def test_agent_no_hallucination_without_tools(seeded_db, monkeypatch):
    from agent import answer_question
    import groq_client

    direct_answer = "Here is what I know."
    monkeypatch.setattr(groq_client, "chat", lambda messages, **kwargs: _response(content=direct_answer))
    answer = answer_question("Tell me something.")

    assert answer == direct_answer
