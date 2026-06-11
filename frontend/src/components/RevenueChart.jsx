import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatYAxis(val) {
  if (val >= 1000) return "$" + (val / 1000).toFixed(0) + "k";
  return "$" + val;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={tooltipBox}>
      <div style={tooltipDate}>{formatDateLabel(label)}</div>
      <div style={tooltipVal}>${Number(payload[0].value).toFixed(2)}</div>
    </div>
  );
}

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={card}>
        <div style={titleRow}>
          <div>
            <div style={chartTitle}>Revenue Trend</div>
            <div style={chartSub}>Daily revenue over time</div>
          </div>
        </div>
        <div style={emptyState}>No data available</div>
      </div>
    );
  }

  const tickInterval = Math.max(1, Math.floor(data.length / 8));

  return (
    <div style={card}>
      <div style={titleRow}>
        <div>
          <div style={chartTitle}>Revenue Trend</div>
          <div style={chartSub}>Daily revenue over time</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            interval={tickInterval}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#4f46e5" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: "20px 20px 10px",
  boxShadow: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)",
  marginBottom: 0,
};

const titleRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
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
  boxShadow: "0 4px 12px rgba(0,0,0,.15)",
};

const tooltipDate = {
  fontSize: 11,
  color: "#94a3b8",
  marginBottom: 2,
};

const tooltipVal = {
  fontSize: 14,
  fontWeight: 600,
  color: "#fff",
};
