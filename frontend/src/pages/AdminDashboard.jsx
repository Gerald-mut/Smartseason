import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import FieldCard from '../components/FieldCard';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', crop_type: '', planting_date: '', assigned_agent_id: ''
  });
  const [filter, setFilter] = useState('All');

  const fetchData = async () => {
    const [dashRes, agentsRes] = await Promise.all([
      api.get('/fields/dashboard'),
      api.get('/fields/agents'),
    ]);
    setData(dashRes.data);
    setAgents(agentsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fields', form);
      setShowForm(false);
      setForm({ name: '', crop_type: '', planting_date: '', assigned_agent_id: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create field', err);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  const { summary, fields } = data;
  const filtered = filter === 'All' ? fields : fields.filter(f => f.status === filter);

  return (
    <div>
      <Navbar />
      <div style={styles.page}>

        {/* Summary cards */}
        <div style={styles.summaryRow}>
          {[
            { label: 'Total Fields', value: summary.total, color: '#1a6b3c' },
            { label: 'Active',       value: summary.active, color: '#1a6b3c' },
            { label: 'At Risk',      value: summary.at_risk, color: '#b45309' },
            { label: 'Completed',    value: summary.completed, color: '#3730a3' },
          ].map(s => (
            <div key={s.label} style={styles.summaryCard}>
              <span style={{ ...styles.summaryNum, color: s.color }}>{s.value}</span>
              <span style={styles.summaryLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>Fields</h2>
          <button style={styles.addBtn} onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ Add Field'}
          </button>
        </div>

        {/* Create field form */}
        {showForm && (
          <form onSubmit={handleCreate} style={styles.form}>
            <input
              style={styles.input}
              placeholder="Field name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              style={styles.input}
              placeholder="Crop type"
              value={form.crop_type}
              onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
              required
            />
            <input
              style={styles.input}
              type="date"
              value={form.planting_date}
              onChange={e => setForm({ ...form, planting_date: e.target.value })}
              required
            />
            <select
              style={styles.input}
              value={form.assigned_agent_id}
              onChange={e => setForm({ ...form, assigned_agent_id: e.target.value })}
            >
              <option value="">Unassigned</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button style={styles.addBtn} type="submit">Create Field</button>
          </form>
        )}

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {['All', 'Active', 'At Risk', 'Completed'].map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Field grid */}
        {filtered.length === 0
          ? <p style={styles.empty}>No fields found.</p>
          : (
            <div style={styles.grid}>
              {filtered.map(field => <FieldCard key={field.id} field={field} />)}
            </div>
          )
        }
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 960, margin: '0 auto', padding: '1.5rem' },
  loading: { padding: '2rem', textAlign: 'center' },
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
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  heading: { fontSize: 18, fontWeight: 600 },
  addBtn: {
    background: '#1a6b3c',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '0.5rem 1.1rem',
    fontSize: 14,
    fontWeight: 500,
  },
  form: {
    background: '#fff',
    borderRadius: 10,
    padding: '1.2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '1rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  input: {
    padding: '0.6rem 0.8rem',
    borderRadius: 7,
    border: '1px solid #ddd',
    fontSize: 14,
  },
  filterRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  filterBtn: {
    padding: '5px 14px',
    borderRadius: 20,
    border: '1px solid #ddd',
    background: '#fff',
    fontSize: 13,
    color: '#555',
  },
  filterActive: {
    background: '#1a6b3c',
    color: '#fff',
    border: '1px solid #1a6b3c',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  empty: { color: '#888', textAlign: 'center', padding: '2rem' },
};