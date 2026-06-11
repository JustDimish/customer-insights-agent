import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api";

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
    </svg>
  );
}

function SkeletonLine({ width = "100%" }) {
  return (
    <div
      className="pulse"
      style={{
        height: 14,
        background: "#e2e8f0",
        borderRadius: 4,
        width,
        marginBottom: 10,
      }}
    />
  );
}

function renderInsights(text) {
  if (!text) return null;

  // Check if it looks like a numbered list
  const numberedPattern = /^\s*\d+[\.\)]/m;
  if (numberedPattern.test(text)) {
    const items = text.split(/\n/).filter(l => l.trim());
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((line, i) => (
          <div key={i} style={insightItem}>{line.trim()}</div>
        ))}
      </div>
    );
  }

  // Plain paragraphs
  return text.split("\n").filter(p => p.trim()).map((para, i) => (
    <p key={i} style={insightPara}>{para}</p>
  ));
}

export default function InsightsPanel() {
  const [insights, setInsights] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getInsights();
      setInsights(data.summary || "");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={card} className="fade-in">
      <div style={headerRow}>
        <div style={titleArea}>
          <span style={iconWrap}><SparkleIcon /></span>
          <div>
            <div style={cardTitle}>AI Insights</div>
            <div style={cardSub}>Powered by Groq llama-3.3-70b</div>
          </div>
        </div>
        <button style={refreshBtn} onClick={load} disabled={loading} title="Refresh insights">
          <span className={loading ? "spin" : ""} style={refreshIcon}>↺</span>
        </button>
      </div>

      {loading ? (
        <div style={{ marginTop: 16 }}>
          <SkeletonLine width="95%" />
          <SkeletonLine width="80%" />
          <SkeletonLine width="88%" />
        </div>
      ) : error ? (
        <div style={errorBox}>
          <span>{error}</span>
          <button style={retryBtn} onClick={load}>Retry</button>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {renderInsights(insights)}
        </div>
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
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
};

const titleArea = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const iconWrap = {
  color: "#4f46e5",
  display: "flex",
  alignItems: "center",
};

const cardTitle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#0f172a",
};

const cardSub = {
  fontSize: 12,
  color: "#64748b",
  marginTop: 1,
};

const refreshBtn = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 16,
  color: "#64748b",
  display: "flex",
  alignItems: "center",
};

const refreshIcon = {
  display: "inline-block",
  fontSize: 18,
  lineHeight: 1,
};

const insightItem = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
  color: "#0f172a",
  lineHeight: 1.6,
};

const insightPara = {
  fontSize: 14,
  color: "#0f172a",
  lineHeight: 1.7,
  margin: "0 0 8px",
};

const errorBox = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  padding: "12px 16px",
  fontSize: 14,
  color: "#dc2626",
  marginTop: 12,
};

const retryBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "5px 12px",
  fontSize: 13,
  fontWeight: 600,
  marginLeft: "auto",
};
