import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipBox}>
      <div style={tooltipTitle}>{d.day}</div>
      <div style={tooltipRow}>Revenue: <strong>${Number(d.revenue).toFixed(2)}</strong></div>
      <div style={tooltipRow}>Transactions: <strong>{d.count}</strong></div>
    </div>
  );
}

export default function WeekdayChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={card}>
        <div style={chartTitle}>Busiest Days</div>
        <div style={chartSub}>Revenue by day of week</div>
        <div style={emptyState}>No data available</div>
      </div>
    );
  }

  const maxRev = Math.max(...data.map(d => d.revenue));

  const getColor = (revenue) => {
    const ratio = maxRev > 0 ? revenue / maxRev : 0;
    if (ratio > 0.85) return "#7c3aed";
    if (ratio > 0.65) return "#8b5cf6";
    if (ratio > 0.45) return "#a78bfa";
    return "#c4b5fd";
  };

  return (
    <div style={card}>
      <div style={chartTitle}>Busiest Days</div>
      <div style={chartSub}>Revenue by day of week</div>
      <div style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={getColor(entry.revenue)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: "20px 20px 10px",
  boxShadow: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)",
};

const chartTitle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#0f172a",
};

const chartSub = {
  fontSize: 12,
  color: "#64748b",
  marginTop: 2,
};

const emptyState = {
  height: 220,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  fontSize: 14,
};

const tooltipBox = {
  background: "#0f172a",
  borderRadius: 8,
  padding: "8px 12px",
};

const tooltipTitle = {
  fontSize: 12,
  color: "#94a3b8",
  marginBottom: 4,
};

const tooltipRow = {
  fontSize: 13,
  color: "#e2e8f0",
  marginBottom: 2,
};
