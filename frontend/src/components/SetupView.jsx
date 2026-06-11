import React, { useRef, useState } from "react";
import { api } from "../api";

const SERVICES = [
  "Basic Wash", "Standard Wash", "Premium Wash", "Full Detail",
  "Interior Clean", "Wax Treatment", "Tire & Rim Clean", "Hand Polish",
];

export default function SetupView({ onComplete }) {
  const [genLoading,    setGenLoading]    = useState(false);
  const [genError,      setGenError]      = useState("");
  const [uploadError,   setUploadError]   = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile,  setSelectedFile]  = useState(null);
  const [showForm,      setShowForm]      = useState(false);
  const [formSuccess,   setFormSuccess]   = useState(false);
  const [formError,     setFormError]     = useState("");
  const [formLoading,   setFormLoading]   = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    item: "Basic Wash",
    amount: "",
    customer_id: "",
  });
  const fileInputRef = useRef(null);

  const handleGenerate = async () => {
    setGenLoading(true);
    setGenError("");
    try {
      await api.generateData();
      await onComplete();
    } catch (e) {
      setGenError(e.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadLoading(true);
    setUploadError("");
    try {
      await api.uploadCsv(selectedFile);
      await onComplete();
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
    try {
      await api.addTransaction({
        date: form.date,
        item: form.item,
        amount: parseFloat(form.amount),
        customer_id: form.customer_id || undefined,
      });
      setFormSuccess(true);
      setForm(f => ({ ...f, amount: "", customer_id: "" }));
    } catch (e) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={wrapper}>
      <div style={inner}>
        <h1 style={heading}>Welcome to WashMetrics</h1>
        <p style={subtext}>Connect your car wash data to unlock AI-powered insights.</p>

        <div style={cardsRow}>
          {/* Generate Sample Data */}
          <div style={optionCard}>
            <div style={cardIcon}>🔬</div>
            <h2 style={cardTitle}>Generate Sample Data</h2>
            <p style={cardDesc}>
              Instantly load 200 realistic transactions across the last 6 months. Perfect for exploring the app.
            </p>
            {genError && <p style={errorText}>{genError}</p>}
            <button
              style={genLoading ? { ...primaryBtn, opacity: 0.7 } : primaryBtn}
              onClick={handleGenerate}
              disabled={genLoading}
            >
              {genLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span className="spin" style={miniSpinner} />
                  Generating…
                </span>
              ) : "Generate Sample Data"}
            </button>
          </div>

          {/* Import Data */}
          <div style={optionCard}>
            <div style={cardIcon}>📁</div>
            <h2 style={cardTitle}>Import Your Data</h2>
            <p style={cardDesc}>
              Upload a CSV file or add transactions manually.
            </p>

            <div style={{ marginBottom: 12 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              <button
                style={{ ...secondaryBtn, width: "100%", marginBottom: 8 }}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? `📄 ${selectedFile.name}` : "Upload CSV"}
              </button>
              {selectedFile && (
                <button
                  style={uploadLoading ? { ...primaryBtn, opacity: 0.7, width: "100%" } : { ...primaryBtn, width: "100%" }}
                  onClick={handleUpload}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                      <span className="spin" style={miniSpinner} />
                      Uploading…
                    </span>
                  ) : "Import CSV"}
                </button>
              )}
              {uploadError && <p style={errorText}>{uploadError}</p>}
            </div>

            <div style={csvHint}>
              <p style={hintLabel}>Expected CSV format:</p>
              <pre style={codeBlock}>{`date,service,amount,customer_id\n2025-01-15,Basic Wash,9.00,C001`}</pre>
            </div>

            <button
              style={{ ...secondaryBtn, width: "100%", marginTop: 8 }}
              onClick={() => setShowForm(f => !f)}
            >
              {showForm ? "Hide form" : "+ Add Manually"}
            </button>

            {showForm && (
              <form onSubmit={handleFormSubmit} style={{ marginTop: 12 }}>
                <div style={fieldGroup}>
                  <label style={label}>Date</label>
                  <input
                    style={input}
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div style={fieldGroup}>
                  <label style={label}>Service</label>
                  <select style={input} name="item" value={form.item} onChange={handleFormChange}>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={fieldGroup}>
                  <label style={label}>Amount ($)</label>
                  <input
                    style={input}
                    type="number"
                    step="0.01"
                    min="0"
                    name="amount"
                    value={form.amount}
                    onChange={handleFormChange}
                    placeholder="12.00"
                    required
                  />
                </div>
                <div style={fieldGroup}>
                  <label style={label}>Customer ID (optional)</label>
                  <input
                    style={input}
                    type="text"
                    name="customer_id"
                    value={form.customer_id}
                    onChange={handleFormChange}
                    placeholder="C001"
                  />
                </div>
                {formError && <p style={errorText}>{formError}</p>}
                {formSuccess && (
                  <div style={successBox}>
                    Transaction added!{" "}
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "#059669", fontWeight: 600, textDecoration: "underline", padding: 0 }}
                      onClick={onComplete}
                    >
                      Go to Dashboard →
                    </button>
                  </div>
                )}
                <button
                  style={formLoading ? { ...primaryBtn, opacity: 0.7, width: "100%", marginTop: 4 } : { ...primaryBtn, width: "100%", marginTop: 4 }}
                  type="submit"
                  disabled={formLoading}
                >
                  {formLoading ? "Adding…" : "Add Transaction"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const wrapper = {
  display: "flex",
  justifyContent: "center",
  paddingTop: 80,
  paddingBottom: 60,
  paddingLeft: 24,
  paddingRight: 24,
};

const inner = {
  maxWidth: 680,
  width: "100%",
  textAlign: "center",
};

const heading = {
  fontSize: 32,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 12,
};

const subtext = {
  fontSize: 16,
  color: "#64748b",
  marginBottom: 40,
};

const cardsRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  textAlign: "left",
};

const optionCard = {
  background: "#fff",
  borderRadius: 12,
  padding: "24px 20px",
  boxShadow: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)",
};

const cardIcon = {
  fontSize: 32,
  marginBottom: 12,
};

const cardTitle = {
  fontSize: 16,
  fontWeight: 600,
  color: "#0f172a",
  margin: "0 0 8px",
};

const cardDesc = {
  fontSize: 13,
  color: "#64748b",
  lineHeight: 1.6,
  marginBottom: 16,
};

const primaryBtn = {
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  width: "100%",
};

const secondaryBtn = {
  background: "#f1f5f9",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 14,
  fontWeight: 500,
};

const miniSpinner = {
  width: 14,
  height: 14,
  border: "2px solid rgba(255,255,255,.3)",
  borderTop: "2px solid #fff",
  borderRadius: "50%",
  display: "inline-block",
};

const errorText = {
  color: "#dc2626",
  fontSize: 13,
  margin: "8px 0",
};

const successBox = {
  background: "#d1fae5",
  color: "#065f46",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 13,
  marginBottom: 8,
};

const csvHint = {
  background: "#f8fafc",
  borderRadius: 8,
  padding: "10px 12px",
  marginTop: 4,
};

const hintLabel = {
  fontSize: 11,
  color: "#64748b",
  margin: "0 0 4px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const codeBlock = {
  margin: 0,
  fontSize: 11,
  color: "#334155",
  fontFamily: "monospace",
  lineHeight: 1.6,
};

const fieldGroup = {
  marginBottom: 10,
};

const label = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 4,
};

const input = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  fontSize: 13,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
};
