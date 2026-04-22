import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import FieldCard from '../components/FieldCard';

export default function AgentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get('/fields/dashboard');
      setData(res.data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  const { summary, fields } = data;
  const atRisk = fields.filter(f => f.status === 'At Risk');

  return (
    <div>
      <Navbar />
      <div style={styles.page}>

        {/* Summary cards */}
        <div style={styles.summaryRow}>
          {[
            { label: 'My Fields',  value: summary.total,     color: '#1a6b3c' },
            { label: 'Active',     value: summary.active,    color: '#1a6b3c' },
            { label: 'At Risk',    value: summary.at_risk,   color: '#b45309' },
            { label: 'Completed',  value: summary.completed, color: '#3730a3' },
          ].map(s => (
            <div key={s.label} style={styles.summaryCard}>
              <span style={{ ...styles.summaryNum, color: s.color }}>{s.value}</span>
              <span style={styles.summaryLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* At risk alert */}
        {atRisk.length > 0 && (
          <div style={styles.alert}>
            {atRisk.length} field{atRisk.length > 1 ? 's' : ''} haven't been updated in over 7 days —
            {atRisk.map(f => ` ${f.name}`).join(',')}
          </div>
        )}

        {/* Fields */}
        <h2 style={styles.heading}>My Fields</h2>
        {fields.length === 0
          ? <p style={styles.empty}>No fields assigned yet.</p>
          : (
            <div style={styles.grid}>
              {fields.map(field => <FieldCard key={field.id} field={field} />)}
            </div>
          )
        }
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 960, margin: '0 auto', padding: '1.5rem' },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  summaryCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '1.1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  summaryNum: { fontSize: 32, fontWeight: 700 },
  summaryLabel: { fontSize: 13, color: '#666' },
  alert: {
    background: '#fef3e2',
    border: '1px solid #f59e0b',
    borderRadius: 8,
    padding: '0.75rem 1rem',
    fontSize: 14,
    color: '#92400e',
    marginBottom: '1.25rem',
  },
  heading: { fontSize: 18, fontWeight: 600, marginBottom: '1rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  empty: { color: '#888', textAlign: 'center', padding: '2rem' },
};