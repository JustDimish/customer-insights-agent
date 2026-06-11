import json
import sqlite3
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture
def seeded_db(monkeypatch):
    """Patch get_db to return a seeded in-memory DB."""
    monkeypatch.setenv("GROQ_API_KEY", "test_key_dummy")

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE transactions (id INTEGER PRIMARY KEY, date TEXT, item TEXT, amount REAL, customer_id TEXT)")
    conn.executemany("INSERT INTO transactions VALUES (?,?,?,?,?)", [
        (1, "2025-01-01", "Basic Wash",   12.00, "C001"),
        (2, "2025-01-02", "Full Detail",  85.00, "C002"),
        (3, "2025-01-02", "Basic Wash",   12.00, "C001"),
    ])
    conn.commit()

    import database
    monkeypatch.setattr(database, "get_db", lambda: conn)
    import agent
    monkeypatch.setattr(agent, "get_db", lambda: conn)
    return conn


def _make_tool_call(name, args_dict, call_id="call_1"):
    tc = SimpleNamespace(
        id=call_id,
        function=SimpleNamespace(name=name, arguments=json.dumps(args_dict)),
    )
    return tc


def _make_response(tool_calls=None, content=None):
    msg = SimpleNamespace(tool_calls=tool_calls, content=content)
    choice = SimpleNamespace(message=msg)
    return SimpleNamespace(choices=[choice])


def test_agent_calls_tool_and_returns_grounded_answer(seeded_db, monkeypatch):
    """Agent must use a tool call before answering; answer must not invent numbers."""
    from agent import answer_question

    avg_result = json.dumps({"avg_ticket": 36.33, "total_transactions": 3})
    grounded_answer = "The average ticket is $36.33 across 3 transactions."

    call_sequence = [
        _make_response(tool_calls=[_make_tool_call("average_ticket", {})]),
        _make_response(content=grounded_answer),
    ]

    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = call_sequence

    with patch("agent.Groq", return_value=mock_client):
        answer = answer_question("What is my average ticket?")

    assert answer == grounded_answer
    assert mock_client.chat.completions.create.call_count == 2


def test_agent_grounds_answer_in_tool_result(seeded_db, monkeypatch):
    """The tool result content must be passed back to the model as a tool message."""
    from agent import answer_question

    calls = []

    def capture_create(**kwargs):
        calls.append(kwargs["messages"])
        if len(calls) == 1:
            return _make_response(tool_calls=[_make_tool_call("average_ticket", {})])
        return _make_response(content="Average ticket is $36.33.")

    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = capture_create

    with patch("agent.Groq", return_value=mock_client):
        answer_question("Average ticket?")

    # Second call messages must include a 'tool' role message
    second_call_messages = calls[1]
    tool_messages = [m for m in second_call_messages if m.get("role") == "tool"]
    assert len(tool_messages) == 1
    # Tool result must contain real data, not an empty string
    assert tool_messages[0]["content"]


def test_agent_no_hallucination_without_tools(seeded_db, monkeypatch):
    """If the model skips tools and answers directly, we still return that content."""
    from agent import answer_question

    direct_answer = "Here is what I know."
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _make_response(content=direct_answer)

    with patch("agent.Groq", return_value=mock_client):
        answer = answer_question("Tell me something.")

    assert answer == direct_answer
