import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#4f46e5", "#7c3aed", "#a855f7", "#c084fc", "#e879f9"];

export default function TopItemsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/stats/top-items")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div style={card}>
      <h2 style={title}>Top Services by Revenue</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="item" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `$${v}`} />
          <Bar dataKey="total_revenue" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const card = { background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,.07)" };
const title = { fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1a1a2e" };
