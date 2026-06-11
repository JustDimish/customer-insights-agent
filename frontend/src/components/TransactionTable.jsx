import React from "react";

function fmtAmount(n) {
  if (n == null) return "—";
  return "$" + Number(n).toFixed(2);
}

export default function TransactionTable({ transactions, total, page, setPage, pageSize }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div style={emptyState}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚗</div>
        <div style={{ color: "#64748b", fontSize: 14 }}>No transactions found</div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);
  const start = page * pageSize + 1;
  const end   = Math.min((page + 1) * pageSize, total);

  return (
    <div>
      <div style={countRow}>
        <span style={countText}>Showing {start}–{end} of {total.toLocaleString()}</span>
        <div style={paginationBtns}>
          <button
            style={page === 0 ? { ...pageBtn, opacity: 0.4 } : pageBtn}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>
          <span style={pageIndicator}>Page {page + 1} of {totalPages}</span>
          <button
            style={page >= totalPages - 1 ? { ...pageBtn, opacity: 0.4 } : pageBtn}
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      </div>

      <div style={tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Customer ID</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.item}</td>
                <td style={{ fontWeight: 600, color: "#059669" }}>{fmtAmount(tx.amount)}</td>
                <td style={{ color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>{tx.customer_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const emptyState = {
  padding: "48px 0",
  textAlign: "center",
};

const countRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
};

const countText = {
  fontSize: 12,
  color: "#64748b",
};

const paginationBtns = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const pageBtn = {
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "5px 10px",
  fontSize: 12,
  color: "#475569",
};

const pageIndicator = {
  fontSize: 12,
  color: "#64748b",
};

const tableWrap = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  overflow: "hidden",
};
