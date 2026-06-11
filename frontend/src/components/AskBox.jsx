import React, { useState } from "react";

export default function AskBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };

  return (
    <div style={card}>
      <h2 style={title}>Ask a Question</h2>
      <p style={hint}>e.g. "What was my best day?" or "Who are my repeat customers?"</p>
      <textarea
        style={textarea}
        rows={3}
        placeholder="Type your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={onKey}
        disabled={loading}
      />
      <button style={loading ? { ...btn, opacity: 0.6 } : btn} onClick={submit} disabled={loading}>
        {loading ? "Thinking…" : "Ask"}
      </button>
      {answer && (
        <div style={answerBox}>
          <strong>Answer:</strong>
          <p style={{ marginTop: 8, lineHeight: 1.6 }}>{answer}</p>
        </div>
      )}
      {error && <div style={{ color: "#dc2626", marginTop: 12, fontSize: 14 }}>{error}</div>}
    </div>
  );
}

const card = { background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,.07)" };
const title = { fontSize: 16, fontWeight: 600, marginBottom: 4, color: "#1a1a2e" };
const hint = { fontSize: 13, color: "#6b7280", marginBottom: 12 };
const textarea = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, resize: "vertical", outline: "none" };
const btn = { marginTop: 10, padding: "9px 22px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const answerBox = { marginTop: 16, padding: "14px 16px", background: "#f5f3ff", borderRadius: 8, fontSize: 14, color: "#1a1a2e", borderLeft: "4px solid #4f46e5" };
