import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import FieldCard from "../components/FieldCard";
import styles from "./AgentDashboard.module.css";

export default function AgentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get("/fields/dashboard");
      setData(res.data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );

  const { summary, fields } = data;
  const atRisk = fields.filter((f) => f.status === "At Risk");

  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        {/* Summary cards */}
        <div className={styles.summaryRow}>
          {[
            { label: "My Fields", value: summary.total, color: "#1a6b3c" },
            { label: "Active", value: summary.active, color: "#1a6b3c" },
            { label: "At Risk", value: summary.at_risk, color: "#b45309" },
            { label: "Completed", value: summary.completed, color: "#3730a3" },
          ].map((s) => (
            <div key={s.label} className={styles.summaryCard}>
              <span className={styles.summaryNum} style={{ color: s.color }}>
                {s.value}
              </span>
              <span className={styles.summaryLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* At risk alert */}
        {atRisk.length > 0 && (
          <div className={styles.alert}>
            {atRisk.length} field{atRisk.length > 1 ? "s" : ""} haven't been
            updated in over 7 days —{atRisk.map((f) => ` ${f.name}`).join(",")}
          </div>
        )}

        {/* Fields */}
        <h2 className={styles.heading}>My Fields</h2>
        {fields.length === 0 ? (
          <p className={styles.empty}>No fields assigned yet.</p>
        ) : (
          <div className={styles.grid}>
            {fields.map((field) => (
              <FieldCard key={field.id} field={field} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
