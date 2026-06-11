import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import KPIGrid from "./KPIGrid";
import RevenueChart from "./RevenueChart";
import ServiceChart from "./ServiceChart";
import WeekdayChart from "./WeekdayChart";
import MonthlyChart from "./MonthlyChart";
import InsightsPanel from "./InsightsPanel";
import AskBox from "./AskBox";

function SkeletonCard({ height = 120 }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div className="pulse" style={{ width: "80%", height: 14, background: "#e2e8f0", borderRadius: 4 }} />
    </div>
  );
}

function formatDateRange(dateRange) {
  if (!dateRange) return null;
  const fmt = (s) => {
    const d = new Date(s + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  return `${fmt(dateRange.min)} — ${fmt(dateRange.max)}`;
}

export default function DashboardView() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [range,   setRange]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summary, status] = await Promise.all([
        api.getStatsSummary(),
        api.dataStatus(),
      ]);
      setStats(summary);
      setRange(status.date_range);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={wrapper}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} height={96} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
          <SkeletonCard height={310} />
          <SkeletonCard height={310} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <SkeletonCard height={270} />
          <SkeletonCard height={270} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={wrapper}>
        <div style={errorBox}>
          <span>{error}</span>
          <button style={retryBtn} onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapper}>
      {/* Top bar */}
      <div style={topBar} className="fade-in">
        {range && (
          <span style={rangeBadge}>
            {formatDateRange(range)}
          </span>
        )}
        <button style={refreshBtn} onClick={load} title="Refresh">
          ↺ Refresh
        </button>
      </div>

      {/* KPIs */}
      <KPIGrid stats={stats} />

      {/* Revenue + Services */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }} className="fade-in">
        <RevenueChart data={stats?.revenue_by_day} />
        <ServiceChart data={stats?.top_items} />
      </div>

      {/* Weekday + Monthly */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="fade-in">
        <WeekdayChart data={stats?.by_weekday} />
        <MonthlyChart data={stats?.by_month} />
      </div>

      {/* Insights + Ask */}
      <InsightsPanel />
      <AskBox />
    </div>
  );
}

const wrapper = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "28px 32px",
};

const topBar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
};

const rangeBadge = {
  fontSize: 13,
  color: "#64748b",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "5px 12px",
};

const refreshBtn = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 13,
  color: "#475569",
  fontWeight: 500,
};

const errorBox = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  padding: "16px 20px",
  color: "#dc2626",
  fontSize: 14,
};

const retryBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  fontSize: 13,
  fontWeight: 600,
  marginLeft: "auto",
};
