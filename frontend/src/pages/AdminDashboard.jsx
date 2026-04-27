import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import FieldCard from '../components/FieldCard';
import StatusBadge from '../components/StatusBadge';
import styles from './AdminDashboard.module.css';


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

  if (loading) return <div className={styles.loading}>Loading...</div>;

  const { summary, fields } = data;
  const filtered = filter === 'All' ? fields : fields.filter(f => f.status === filter);

  return (
    <div>
      <Navbar />
      <div className={styles.page}>

        {/* Summary cards */}
        <div className={styles.summaryRow}>
          {[
            { label: 'Total Fields', value: summary.total, color: '#1a6b3c' },
            { label: 'Active',       value: summary.active, color: '#1a6b3c' },
            { label: 'At Risk',      value: summary.at_risk, color: '#b45309' },
            { label: 'Completed',    value: summary.completed, color: '#3730a3' },
          ].map(s => (
            <div key={s.label} className={styles.summaryCard}>
              <span className={styles.summaryNum} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.summaryLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className={styles.headerRow}>
          <h2 className={styles.heading}>Fields</h2>
          <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ Add Field'}
          </button>
        </div>

        {/* Create field form */}
        {showForm && (
          <form onSubmit={handleCreate} className={styles.form}>
            <input
              className={styles.input}
              placeholder="Field name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className={styles.input}
              placeholder="Crop type"
              value={form.crop_type}
              onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
              required
            />
            <input
              className={styles.input}
              type="date"
              value={form.planting_date}
              onChange={e => setForm({ ...form, planting_date: e.target.value })}
              required
            />
            <select
              className={styles.input}
              value={form.assigned_agent_id}
              onChange={e => setForm({ ...form, assigned_agent_id: e.target.value })}
            >
              <option value="">Unassigned</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button className={styles.addBtn} type="submit">Create Field</button>
          </form>
        )}

        {/* Filter tabs */}
        <div className={styles.filterRow}>
          {['All', 'Active', 'At Risk', 'Completed'].map(f => (
            <button
              key={f}
              className={filter === f ? `${styles.filterBtn} ${styles.filterActive}` : styles.filterBtn}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Field grid */}
        {filtered.length === 0
          ? <p className={styles.empty}>No fields found.</p>
          : (
            <div className={styles.grid}>
              {filtered.map(field => <FieldCard key={field.id} field={field} />)}
            </div>
          )
        }
      </div>
    </div>
  );
}

