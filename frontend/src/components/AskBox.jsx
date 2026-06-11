import React, { useState } from "react";
import { api } from "../api";

const CHIPS = [
  "What's my most profitable service?",
  "Which day of the week is busiest?",
  "How many customers came back more than once?",
];

export default function AskBox() {
  const [question, setQuestion] = useState("");
  const [answer,   setAnswer]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const submit = async () => {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const data = await api.ask(q);
      setAnswer(data.answer || "");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const isRateLimited = answer.toLowerCase().includes("rate-limit");

  return (
    <div style={card} className="fade-in">
      <div style={headerRow}>
        <div>
          <div style={cardTitle}>Ask AI</div>
          <div style={cardSub}>Ask anything about your car wash performance</div>
        </div>
      </div>

      <div style={chipsRow}>
        {CHIPS.map(chip => (
          <button
            key={chip}
            style={chipBtn}
            onClick={() => setQuestion(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <textarea
        style={textarea}
        rows={3}
        placeholder="Type your question…"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        onKeyDown={onKey}
        disabled={loading}
      />

      <button
        style={loading ? { ...submitBtn, opacity: 0.7 } : submitBtn}
        onClick={submit}
        disabled={loading}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="spin" style={miniSpinner} />
            Analyzing your data…
          </span>
        ) : "Ask"}
      </button>

      {error && (
        <div style={errorBox}>{error}</div>
      )}

      {answer && (
        isRateLimited ? (
          <div style={warningBox}>{answer}</div>
        ) : (
          <div style={answerBox}>
            {answer.split("\n").filter(p => p.trim()).map((para, i) => (
              <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0", lineHeight: 1.65, fontSize: 14, color: "#0f172a" }}>
                {para}
              </p>
            ))}
          </div>
        )
      )}
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)",
  marginBottom: 20,
};

const headerRow = {
  marginBottom: 14,
};

const cardTitle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#0f172a",
};

const cardSub = {
  fontSize: 12,
  color: "#64748b",
  marginTop: 2,
};

const chipsRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 12,
};

const chipBtn = {
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: "5px 12px",
  fontSize: 12,
  color: "#475569",
  fontWeight: 500,
  whiteSpace: "nowrap",
};

const textarea = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  color: "#0f172a",
  resize: "vertical",
  outline: "none",
  background: "#fff",
  marginBottom: 10,
};

const submitBtn = {
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "9px 22px",
  fontSize: 14,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const miniSpinner = {
  width: 14,
  height: 14,
  border: "2px solid rgba(255,255,255,.3)",
  borderTop: "2px solid #fff",
  borderRadius: "50%",
  display: "inline-block",
};

const answerBox = {
  marginTop: 16,
  padding: "14px 16px",
  background: "#eef2ff",
  borderRadius: 8,
  borderLeft: "4px solid #4f46e5",
};

const warningBox = {
  marginTop: 16,
  padding: "12px 16px",
  background: "#fffbeb",
  borderRadius: 8,
  borderLeft: "4px solid #d97706",
  fontSize: 14,
  color: "#92400e",
};

const errorBox = {
  marginTop: 12,
  padding: "10px 14px",
  background: "#fef2f2",
  borderRadius: 8,
  fontSize: 14,
  color: "#dc2626",
};
