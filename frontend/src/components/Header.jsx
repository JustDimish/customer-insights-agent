import React from "react";

export default function Header({ view, setView, hasData, count, onRefreshStatus }) {
  return (
    <header style={headerStyle}>
      <div style={logoArea}>
        <span style={logoIcon} aria-label="car">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
            <circle cx="7.5" cy="17.5" r="2.5" />
            <circle cx="16.5" cy="17.5" r="2.5" />
          </svg>
        </span>
        <span style={brandName}>WashMetrics</span>
      </div>

      <nav style={navArea}>
        {hasData && (
          <span style={badge}>
            <span style={{ color: "#4ade80", marginRight: 4 }}>●</span>
            {count.toLocaleString()} records
          </span>
        )}
        <button
          style={view === "dashboard" ? { ...tabBtn, ...activeTab } : tabBtn}
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>
        <button
          style={view === "data" ? { ...tabBtn, ...activeTab } : tabBtn}
          onClick={() => setView("data")}
        >
          Manage Data
        </button>
      </nav>
    </header>
  );
}

const headerStyle = {
  background: "#0f172a",
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 32px",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const logoArea = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const logoIcon = {
  display: "flex",
  alignItems: "center",
};

const brandName = {
  color: "#fff",
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: "-0.02em",
};

const navArea = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const badge = {
  fontSize: 12,
  color: "#94a3b8",
  marginRight: 8,
  display: "flex",
  alignItems: "center",
};

const tabBtn = {
  background: "transparent",
  border: "none",
  color: "#cbd5e1",
  padding: "8px 16px",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 500,
  transition: "background 0.15s",
};

const activeTab = {
  background: "#4f46e5",
  color: "#fff",
};
