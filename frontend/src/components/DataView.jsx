import React, { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import TransactionTable from "./TransactionTable";

const SERVICES = [
  "Basic Wash", "Standard Wash", "Premium Wash", "Full Detail",
  "Interior Clean", "Wax Treatment", "Tire & Rim Clean", "Hand Polish",
];

const PAGE_SIZE = 50;

const CSV_TEMPLATE = "data:text/csv;charset=utf-8,date,service,amount,customer_id\n2025-01-15,Basic Wash,9.00,C001";

export default function DataView({ dataStatus, onDataChanged }) {
  // generate
  const [genLoading,    setGenLoading]    = useState(false);
  const [genError,      setGenError]      = useState("");
  // upload
  const [selectedFile,  setSelectedFile]  = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError,   setUploadError]   = useState("");
  const [uploadResult,  setUploadResult]  = useState(null);
  const [showFormat,    setShowFormat]    = useState(false);
  const [dragOver,      setDragOver]      = useState(false);
  // manual form
  const [showForm,      setShowForm]      = useState(false);
  const [formLoading,   setFormLoading]   = useState(false);
  const [formError,     setFormError]     = useState("");
  const [formSuccess,   setFormSuccess]   = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    item: "Basic Wash",
    amount: "",
    customer_id: "",
  });
  // clear
  const [clearConfirm,  setClearConfirm]  = useState(false);
  const [clearLoading,  setClearLoading]  = useState(false);
  const [clearError,    setClearError]    = useState("");
  // table
  const [transactions,  setTransactions]  = useState([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(0);
  const [txLoading,     setTxLoading]     = useState(false);
  const [search,        setSearch]        = useState("");

  const fileInputRef = useRef(null);

  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const data = await api.getTransactions(PAGE_SIZE, page * PAGE_SIZE);
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setTxLoading(false);
    }
  }, [page]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const filteredTransactions = search.trim()
    ? transactions.filter(tx =>
        tx.item?.toLowerCase().includes(search.toLowerCase()) ||
        tx.customer_id?.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const handleGenerate = async () => {
    setGenLoading(true);
    setGenError("");
    try {
      await api.generateData();
      await onDataChanged();
      setPage(0);
      await loadTransactions();
    } catch (e) {
      setGenError(e.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadLoading(true);
    setUploadError("");
    setUploadResult(null);
    try {
      const result = await api.uploadCsv(selectedFile);
      setUploadResult(result);
      await onDataChanged();
      setPage(0);
      await loadTransactions();
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    try {
      await api.addTransaction({
        date: form.date,
        item: form.item,
        amount: parseFloat(form.amount),
        customer_id: form.customer_id || undefined,
      });
      setFormSuccess(`Transaction added: ${form.item} on ${form.date}`);
      setForm(f => ({ ...f, amount: "", customer_id: "" }));
      await onDataChanged();
      setPage(0);
      await loadTransactions();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleClear = async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    setClearLoading(true);
    setClearError("");
    try {
      await api.clearData();
      setClearConfirm(false);
      await onDataChanged();
      setPage(0);
      setTransactions([]);
      setTotal(0);
    } catch (e) {
      setClearError(e.message);
    } finally {
      setClearLoading(false);
    }
  };

  const dropZoneStyle = {
    ...dropZone,
    borderColor: dragOver ? "#4f46e5" : "#cbd5e1",
    background: dragOver ? "#eef2ff" : "#fafafa",
  };

  return (
    <div style={wrapper}>
      <div style={layout}>
        {/* Left: Actions */}
        <div style={leftPanel}>
          <h2 style={pageTitle}>Data Management</h2>

          {/* Status card */}
          <div style={card}>
            <div style={sectionTitle}>Data Status</div>
            {dataStatus?.has_data ? (
              <>
                <div style={statRow}>
                  <span style={statLabel}>Transactions</span>
                  <span style={statVal}>{dataStatus.transaction_count?.toLocaleString()}</span>
                </div>
                {dataStatus.date_range && (
                  <div style={statRow}>
                    <span style={statLabel}>Date Range</span>
                    <span style={{ ...statVal, fontSize: 12 }}>
                      {dataStatus.date_range.min} → {dataStatus.date_range.max}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div style={noDataMsg}>No data loaded yet.</div>
            )}
          </div>

          {/* Generate Sample Data */}
          <div style={card}>
            <div style={sectionTitle}>Sample Data</div>
            <p style={sectionDesc}>
              Generate 200 realistic car wash transactions across the last 6 months.
            </p>
            <div style={warningText}>⚠ This will replace all existing data.</div>
            {genError && <div style={errorText}>{genError}</div>}
            <button
              style={genLoading ? { ...primaryBtn, opacity: 0.7 } : primaryBtn}
              onClick={handleGenerate}
              disabled={genLoading}
            >
              {genLoading ? (
                <span style={flexRow}>
                  <span className="spin" style={miniSpinner} />
                  Generating…
                </span>
              ) : "Generate Sample Data"}
            </button>
          </div>

          {/* Upload CSV */}
          <div style={card}>
            <div style={sectionTitle}>Upload CSV</div>
            <div
              style={dropZoneStyle}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                handleFileChange(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>📂</span>
              <span style={{ fontSize: 13, color: "#475569" }}>
                {selectedFile ? selectedFile.name : "Drop CSV here or click to browse"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={e => handleFileChange(e.target.files[0])}
              />
            </div>

            {selectedFile && (
              <button
                style={uploadLoading ? { ...primaryBtn, opacity: 0.7, marginTop: 10 } : { ...primaryBtn, marginTop: 10 }}
                onClick={handleUpload}
                disabled={uploadLoading}
              >
                {uploadLoading ? (
                  <span style={flexRow}>
                    <span className="spin" style={miniSpinner} />
                    Uploading…
                  </span>
                ) : `Import "${selectedFile.name}"`}
              </button>
            )}
            {uploadError  && <div style={errorText}>{uploadError}</div>}
            {uploadResult && (
              <div style={successText}>
                Imported {uploadResult.count} transactions.
                {uploadResult.errors?.length > 0 && (
                  <span style={{ color: "#d97706" }}> ({uploadResult.errors.length} rows skipped)</span>
                )}
              </div>
            )}

            <button
              style={linkBtn}
              onClick={() => setShowFormat(f => !f)}
            >
              {showFormat ? "Hide format ↑" : "View CSV format →"}
            </button>
            {showFormat && (
              <div style={formatBox}>
                <div style={formatLabel}>Required columns:</div>
                <pre style={codeBlock}>{`date,service,amount,customer_id\n2025-01-15,Basic Wash,9.00,C001`}</pre>
                <a href={CSV_TEMPLATE} download="template.csv" style={downloadLink}>
                  ↓ Download template
                </a>
              </div>
            )}
          </div>

          {/* Add Transaction form */}
          <div style={card}>
            <button
              style={collapsibleBtn}
              onClick={() => setShowForm(f => !f)}
            >
              <span>{showForm ? "▾" : "▸"}</span>
              + Add transaction manually
            </button>
            {showForm && (
              <form onSubmit={handleFormSubmit} style={{ marginTop: 12 }}>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Date</label>
                  <input style={fieldInput} type="date" name="date" value={form.date} onChange={handleFormChange} required />
                </div>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Service</label>
                  <select style={fieldInput} name="item" value={form.item} onChange={handleFormChange}>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Amount ($)</label>
                  <input style={fieldInput} type="number" step="0.01" min="0" name="amount" value={form.amount} onChange={handleFormChange} placeholder="12.00" required />
                </div>
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Customer ID (optional)</label>
                  <input style={fieldInput} type="text" name="customer_id" value={form.customer_id} onChange={handleFormChange} placeholder="C001" />
                </div>
                {formError   && <div style={errorText}>{formError}</div>}
                {formSuccess && <div style={successText}>{formSuccess}</div>}
                <button
                  style={formLoading ? { ...primaryBtn, opacity: 0.7 } : primaryBtn}
                  type="submit"
                  disabled={formLoading}
                >
                  {formLoading ? "Adding…" : "Add Transaction"}
                </button>
              </form>
            )}
          </div>

          {/* Danger zone */}
          <div style={{ ...card, borderTop: "2px solid #fee2e2" }}>
            <div style={{ ...sectionTitle, color: "#dc2626" }}>Danger Zone</div>
            {clearError && <div style={errorText}>{clearError}</div>}
            <button
              style={clearConfirm ? dangerBtnActive : dangerBtn}
              onClick={handleClear}
              disabled={clearLoading}
            >
              {clearLoading ? "Clearing…" : clearConfirm ? "Are you sure? Click again to confirm" : "Clear All Data"}
            </button>
            {clearConfirm && (
              <button
                style={{ ...linkBtn, color: "#64748b", marginLeft: 8 }}
                onClick={() => setClearConfirm(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Right: Transactions table */}
        <div style={rightPanel}>
          <div style={tableHeader}>
            <h2 style={pageTitle}>Recent Transactions</h2>
            <input
              style={searchInput}
              type="text"
              placeholder="Search service or customer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={card}>
            {txLoading ? (
              <div style={loadingRow}>
                <span className="spin" style={{ ...miniSpinner, borderColor: "#e2e8f0", borderTopColor: "#4f46e5" }} />
                Loading…
              </div>
            ) : (
              <TransactionTable
                transactions={filteredTransactions}
                total={search.trim() ? filteredTransactions.length : total}
                page={page}
                setPage={setPage}
                pageSize={PAGE_SIZE}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const wrapper = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "28px 32px",
};

const layout = {
  display: "grid",
  gridTemplateColumns: "40% 1fr",
  gap: 24,
  alignItems: "flex-start",
};

const leftPanel = {};

const rightPanel = {};

const pageTitle = {
  fontSize: 18,
  fontWeight: 700,
  color: "#0f172a",
  margin: "0 0 16px",
};

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: "20px 20px",
  boxShadow: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)",
  marginBottom: 16,
};

const sectionTitle = {
  fontSize: 14,
  fontWeight: 600,
  color: "#0f172a",
  marginBottom: 10,
};

const sectionDesc = {
  fontSize: 13,
  color: "#64748b",
  lineHeight: 1.5,
  margin: "0 0 10px",
};

const warningText = {
  fontSize: 12,
  color: "#d97706",
  marginBottom: 10,
};

const statRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "6px 0",
  borderBottom: "1px solid #f1f5f9",
};

const statLabel = {
  fontSize: 13,
  color: "#64748b",
};

const statVal = {
  fontSize: 13,
  fontWeight: 600,
  color: "#0f172a",
};

const noDataMsg = {
  fontSize: 13,
  color: "#94a3b8",
};

const primaryBtn = {
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const dangerBtn = {
  background: "#fff",
  color: "#dc2626",
  border: "1px solid #fecaca",
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
};

const dangerBtnActive = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "#4f46e5",
  fontSize: 12,
  padding: "6px 0",
  cursor: "pointer",
  textDecoration: "underline",
};

const collapsibleBtn = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const fieldGroup = {
  marginBottom: 10,
};

const fieldLabel = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 4,
};

const fieldInput = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  fontSize: 13,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
};

const dropZone = {
  border: "2px dashed #cbd5e1",
  borderRadius: 8,
  padding: "24px 16px",
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.2s, background 0.2s",
};

const formatBox = {
  background: "#f8fafc",
  borderRadius: 8,
  padding: "10px 12px",
  marginTop: 8,
};

const formatLabel = {
  fontSize: 11,
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 4,
};

const codeBlock = {
  margin: 0,
  fontSize: 11,
  color: "#334155",
  fontFamily: "monospace",
  lineHeight: 1.6,
};

const downloadLink = {
  display: "inline-block",
  marginTop: 6,
  fontSize: 12,
  color: "#4f46e5",
};

const errorText = {
  color: "#dc2626",
  fontSize: 13,
  margin: "8px 0",
};

const successText = {
  color: "#059669",
  fontSize: 13,
  margin: "8px 0",
};

const miniSpinner = {
  width: 14,
  height: 14,
  border: "2px solid rgba(255,255,255,.3)",
  borderTop: "2px solid #fff",
  borderRadius: "50%",
  display: "inline-block",
};

const flexRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const tableHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
};

const searchInput = {
  padding: "7px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 13,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
  width: 220,
};

const loadingRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "32px 0",
  color: "#64748b",
  fontSize: 14,
};
