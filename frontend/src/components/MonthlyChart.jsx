import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatMonth(monthStr) {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '");
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipBox}>
      <div style={tooltipTitle}>{formatMonth(d.month)}</div>
      <div style={tooltipRow}>Revenue: <strong>${Number(d.revenue).toFixed(2)}</strong></div>
      <div style={tooltipRow}>Transactions: <strong>{d.count}</strong></div>
    </div>
  );
}

export default function MonthlyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={card}>
        <div style={chartTitle}>Monthly Revenue</div>
        <div style={chartSub}>Revenue by month</div>
        <div style={emptyState}>No data available</div>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={chartTitle}>Monthly Revenue</div>
      <div style={chartSub}>Revenue by month</div>
      <div style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
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
            <Bar dataKey="revenue" fill="#0891b2" radius={[4, 4, 0, 0]} />
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
