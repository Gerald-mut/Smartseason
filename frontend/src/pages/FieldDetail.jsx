import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

const STAGES = ['Planted', 'Growing', 'Ready', 'Harvested'];

const computeStatus = (field) => {
  if (field.stage === 'Harvested') return 'Completed';
  const days = (Date.now() - new Date(field.last_updated_at)) / 86400000;
  if (days > 7) return 'At Risk';
  return 'Active';
};

export default function FieldDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [field, setField] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ stage: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const [fieldsRes, updatesRes] = await Promise.all([
        api.get('/fields/dashboard'),
        api.get(`/updates/${id}`),
      ]);

      // Find this specific field from the dashboard data
      const found = fieldsRes.data.fields.find(f => f.id === parseInt(id));
      if (!found) {
        navigate(-1);
        return;
      }

      setField(found);
      setForm({ stage: found.stage, notes: '' });
      setUpdates(updatesRes.data);
    } catch (err) {
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/updates', {
        field_id: parseInt(id),
        stage: form.stage,
        notes: form.notes,
      });
      await fetchAll(); // Refresh everything after update
    } catch (err) {
      setError('Failed to submit update. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  const status = computeStatus(field);
  const isAgent = user.role === 'agent';
  const isHarvested = field.stage === 'Harvested';

  return (
    <div>
      <Navbar />
      <div style={styles.page}>

        {/* Back button */}
        <button style={styles.back} onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Field header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{field.name}</h1>
            <p style={styles.meta}>
              {field.crop_type} · Planted {new Date(field.planting_date).toLocaleDateString()}
            </p>
            {field.agent_name && (
              <p style={styles.meta}>Agent: {field.agent_name}</p>
            )}
          </div>
          <div style={styles.headerRight}>
            <StatusBadge status={status} />
            <span style={styles.stagePill}>{field.stage}</span>
          </div>
        </div>

        {/* Stage progress bar */}
        <div style={styles.progressBar}>
          {STAGES.map((s, i) => {
            const currentIndex = STAGES.indexOf(field.stage);
            const done = i <= currentIndex;
            return (
              <div key={s} style={styles.progressStep}>
                <div style={{
                  ...styles.progressDot,
                  background: done ? '#1a6b3c' : '#ddd',
                }} />
                <span style={{
                  ...styles.progressLabel,
                  color: done ? '#1a6b3c' : '#aaa',
                  fontWeight: done ? 600 : 400,
                }}>
                  {s}
                </span>
                {i < STAGES.length - 1 && (
                  <div style={{
                    ...styles.progressLine,
                    background: i < currentIndex ? '#1a6b3c' : '#ddd',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.columns}>

          {/* Update form — agents only, not shown if harvested */}
          {isAgent && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                {isHarvested ? 'Field Completed' : 'Post an Update'}
              </h2>

              {isHarvested ? (
                <p style={styles.harvestedNote}>
                  This field has been harvested. No further updates needed.
                </p>
              ) : (
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.field}>
                    <label style={styles.label}>Stage</label>
                    <select
                      style={styles.input}
                      value={form.stage}
                      onChange={e => setForm({ ...form, stage: e.target.value })}
                      required
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Notes</label>
                    <textarea
                      style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
                      placeholder="Observations, concerns, progress..."
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>

                  {error && <p style={styles.error}>{error}</p>}

                  <button
                    style={styles.submitBtn}
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Update'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Update history */}
          <div style={{ ...styles.card, flex: 2 }}>
            <h2 style={styles.cardTitle}>Update History</h2>

            {updates.length === 0 ? (
              <p style={styles.empty}>No updates yet.</p>
            ) : (
              <div style={styles.timeline}>
                {updates.map((u, i) => (
                  <div key={u.id} style={styles.timelineItem}>
                    <div style={styles.timelineDot} />
                    {i < updates.length - 1 && <div style={styles.timelineLine} />}
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineHeader}>
                        <span style={styles.timelineStage}>{u.stage}</span>
                        <span style={styles.timelineAgent}>{u.agent_name}</span>
                        <span style={styles.timelineDate}>
                          {new Date(u.created_at).toLocaleDateString('en-KE', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {u.notes && <p style={styles.timelineNotes}>{u.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 960, margin: '0 auto', padding: '1.5rem' },
  back: {
    background: 'none',
    border: 'none',
    color: '#1a6b3c',
    fontWeight: 500,
    fontSize: 14,
    marginBottom: '1.25rem',
    padding: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 13, color: '#666', marginTop: 2 },
  headerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 },
  stagePill: {
    fontSize: 12,
    background: '#e8f5e9',
    color: '#1a6b3c',
    padding: '3px 10px',
    borderRadius: 20,
    fontWeight: 500,
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: 10,
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    gap: 0,
  },
  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    flexShrink: 0,
  },
  progressLabel: { fontSize: 13 },
  progressLine: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    marginLeft: 6,
  },
  columns: { display: 'flex', gap: '1.25rem', alignItems: 'flex-start' },
  card: {
    flex: 1,
    background: '#fff',
    borderRadius: 10,
    padding: '1.25rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 13, fontWeight: 500, color: '#444' },
  input: {
    padding: '0.6rem 0.8rem',
    borderRadius: 7,
    border: '1px solid #ddd',
    fontSize: 14,
    width: '100%',
  },
  error: { color: '#c0392b', fontSize: 13 },
  submitBtn: {
    background: '#1a6b3c',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '0.65rem',
    fontSize: 14,
    fontWeight: 600,
  },
  harvestedNote: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  empty: { color: '#999', fontSize: 14 },
  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  timelineItem: {
    display: 'flex',
    gap: '0.85rem',
    position: 'relative',
    paddingBottom: '1.25rem',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#1a6b3c',
    flexShrink: 0,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 14,
    bottom: 0,
    width: 2,
    background: '#e0e0e0',
  },
  timelineContent: { flex: 1 },
  timelineHeader: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  timelineStage: { fontWeight: 600, fontSize: 14, color: '#1a6b3c' },
  timelineAgent: { fontSize: 13, color: '#555' },
  timelineDate: { fontSize: 12, color: '#999', marginLeft: 'auto' },
  timelineNotes: { fontSize: 13, color: '#444', lineHeight: 1.6 },
};