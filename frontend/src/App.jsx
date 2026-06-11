import React, { useEffect, useState } from "react";
import "./index.css";
import { api } from "./api";
import Header from "./components/Header";
import SetupView from "./components/SetupView";
import DashboardView from "./components/DashboardView";
import DataView from "./components/DataView";

export default function App() {
  const [view, setView]             = useState("dashboard");
  const [dataStatus, setDataStatus] = useState(null);
  const [loading, setLoading]       = useState(true);

  const refreshStatus = async () => {
    try {
      const status = await api.dataStatus();
      setDataStatus(status);
    } catch (e) {
      console.error("Failed to fetch data status:", e);
    }
  };

  useEffect(() => {
    setLoading(true);
    api.dataStatus()
      .then(setDataStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Header
        view={view}
        setView={setView}
        hasData={dataStatus?.has_data || false}
        count={dataStatus?.transaction_count || 0}
        onRefreshStatus={refreshStatus}
      />

      {loading ? (
        <div style={centeredSpinner}>
          <div className="spin" style={spinnerDot} />
        </div>
      ) : view === "data" ? (
        <DataView dataStatus={dataStatus} onDataChanged={refreshStatus} />
      ) : dataStatus?.has_data ? (
        <DashboardView />
      ) : (
        <SetupView onComplete={refreshStatus} />
      )}
    </div>
  );
}

const centeredSpinner = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "60vh",
};

const spinnerDot = {
  width: 32,
  height: 32,
  border: "3px solid #e2e8f0",
  borderTop: "3px solid #4f46e5",
  borderRadius: "50%",
};
