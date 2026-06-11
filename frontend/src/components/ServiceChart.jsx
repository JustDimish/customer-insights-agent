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

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipBox}>
      <div style={tooltipTitle}>{d.item}</div>
      <div style={tooltipRow}>Revenue: <strong>${Number(d.total_revenue).toFixed(2)}</strong></div>
      <div style={tooltipRow}>Count: <strong>{d.count}</strong></div>
    </div>
  );
}

export default function ServiceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={card}>
        <div style={chartTitle}>Services by Revenue</div>
        <div style={chartSub}>Top performing services</div>
        <div style={emptyState}>No data available</div>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={chartTitle}>Services by Revenue</div>
      <div style={chartSub}>Top performing services</div>
      <div style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={v => "$" + (v >= 1000 ? (v / 1000).toFixed(1) + "k" : v)}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="item"
              tick={{ fontSize: 11, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total_revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} />
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
  height: 260,
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
