import React, { useEffect, useState } from "react";
import AskBox from "./components/AskBox";
import RevenueChart from "./components/RevenueChart";
import TopItemsChart from "./components/TopItemsChart";

export default function App() {
  const [kpis, setKpis] = useState(null);
  const [insights, setInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats/average-ticket").then((r) => r.json()),
      fetch("/api/stats/repeat-customer-rate").then((r) => r.json()),
    ]).then(([ticket, repeat]) => setKpis({ ticket, repeat })).catch(console.error);

    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => setInsights(d.summary))
      .catch(() => setInsights("Could not load AI insights."))
      .finally(() => setInsightsLoading(false));
  }, []);

  return (
    <div style={layout}>
      <header style={header}>
        <h1 style={headerTitle}>🚗 Car Wash Insights</h1>
        <p style={headerSub}>AI-powered analytics for your business</p>
      </header>

      {kpis && (
        <div style={kpiRow}>
          <KpiCard label="Avg Ticket" value={`$${kpis.ticket.avg_ticket}`} sub={`${kpis.ticket.total_transactions} transactions`} />
          <KpiCard label="Repeat Rate" value={`${kpis.repeat.rate_pct}%`} sub={`${kpis.repeat.repeat_count} of ${kpis.repeat.total_count} customers`} />
        </div>
      )}

      <div style={chartRow}>
        <RevenueChart />
        <TopItemsChart />
      </div>

      <div style={insightCard}>
        <h2 style={sectionTitle}>AI Insights</h2>
        {insightsLoading
          ? <p style={muted}>Generating insights…</p>
          : <p style={{ lineHeight: 1.7, fontSize: 14 }}>{insights}</p>
        }
      </div>

      <AskBox />
    </div>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div style={kpiCard}>
      <div style={kpiLabel}>{label}</div>
      <div style={kpiValue}>{value}</div>
      <div style={kpiSub}>{sub}</div>
    </div>
  );
}

const layout = { maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 };
const header = { marginBottom: 8 };
const headerTitle = { fontSize: 28, fontWeight: 700, color: "#1a1a2e" };
const headerSub = { fontSize: 14, color: "#6b7280", marginTop: 4 };
const kpiRow = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 };
const kpiCard = { background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,.07)", textAlign: "center" };
const kpiLabel = { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 6 };
const kpiValue = { fontSize: 32, fontWeight: 700, color: "#4f46e5" };
const kpiSub = { fontSize: 12, color: "#9ca3af", marginTop: 4 };
const chartRow = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: 20 };
const insightCard = { background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,.07)" };
const sectionTitle = { fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#1a1a2e" };
const muted = { color: "#9ca3af", fontSize: 14 };
