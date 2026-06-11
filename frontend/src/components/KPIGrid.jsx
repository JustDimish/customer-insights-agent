import React from "react";

function fmt(n) {
  if (n == null) return "—";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDec(n) {
  if (n == null) return "—";
  return "$" + Number(n).toFixed(2);
}

function DollarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function KPICard({ icon, title, value, subtitle, accent }) {
  return (
    <div style={card}>
      <div style={cardTop}>
        <div style={{ ...iconCircle, background: accent + "18", color: accent }}>
          {icon}
        </div>
        <span style={metricName}>{title}</span>
      </div>
      <div style={valueStyle}>{value}</div>
      <div style={subStyle}>{subtitle}</div>
    </div>
  );
}

export default function KPIGrid({ stats }) {
  if (!stats) return null;

  const totalRevenue = (stats.revenue_by_day || []).reduce((sum, d) => sum + (d.revenue || 0), 0);
  const avgTicket    = stats.average_ticket?.avg_ticket;
  const totalCust    = stats.repeat_customer_rate?.total_count;
  const loyaltyRate  = stats.repeat_customer_rate?.rate_pct;

  return (
    <div style={grid} className="fade-in">
      <KPICard
        icon={<DollarIcon />}
        title="Total Revenue"
        value={fmt(totalRevenue)}
        subtitle="last 6 months"
        accent="#059669"
      />
      <KPICard
        icon={<ReceiptIcon />}
        title="Avg. Transaction"
        value={fmtDec(avgTicket)}
        subtitle="per service"
        accent="#4f46e5"
      />
      <KPICard
        icon={<UsersIcon />}
        title="Total Customers"
        value={totalCust != null ? totalCust.toLocaleString() : "—"}
        subtitle="unique visitors"
        accent="#7c3aed"
      />
      <KPICard
        icon={<HeartIcon />}
        title="Loyalty Rate"
        value={loyaltyRate != null ? `${loyaltyRate}%` : "—"}
        subtitle="return rate"
        accent="#d97706"
      />
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 16,
  marginBottom: 20,
};

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)",
};

const cardTop = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 16,
};

const iconCircle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const metricName = {
  fontSize: 13,
  fontWeight: 600,
  color: "#64748b",
};

const valueStyle = {
  fontSize: 28,
  fontWeight: 700,
  color: "#0f172a",
  lineHeight: 1,
  marginBottom: 6,
};

const subStyle = {
  fontSize: 12,
  color: "#94a3b8",
};
