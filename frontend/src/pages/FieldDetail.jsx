import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import styles from './FieldDetail.module.css';


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
      console.error(err);
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
      <div className={styles.page}>

        {/* Back button */}
        <button className={styles.back} onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Field header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{field.name}</h1>
            <p className={styles.meta}>
              {field.crop_type} · Planted {new Date(field.planting_date).toLocaleDateString()}
            </p>
            {field.agent_name && (
              <p className={styles.meta}>Agent: {field.agent_name}</p>
            )}
          </div>
          <div className={styles.headerRight}>
            <StatusBadge status={status} />
            <span className={styles.stagePill}>{field.stage}</span>
          </div>
        </div>

        {/* Stage progress bar */}
        <div className={styles.progressBar}>
          {STAGES.map((s, i) => {
            const currentIndex = STAGES.indexOf(field.stage);
            const done = i <= currentIndex;
            return (
              <div key={s} className={styles.progressStep}>
                <div className={styles.progressDot} style={{
                  background: done ? '#1a6b3c' : '#ddd',
                }} />
                <span className={styles.progressLabel} style={{
                  color: done ? '#1a6b3c' : '#aaa',
                  fontWeight: done ? 600 : 400,
                }}>
                  {s}
                </span>
                {i < STAGES.length - 1 && (
                  <div className={styles.progressLine} style={{
                    background: i < currentIndex ? '#1a6b3c' : '#ddd',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.columns}>

          {/* Update form — agents only, not shown if harvested */}
          {isAgent && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                {isHarvested ? 'Field Completed' : 'Post an Update'}
              </h2>

              {isHarvested ? (
                <p className={styles.harvestedNote}>
                  This field has been harvested. No further updates needed.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Stage</label>
                    <select
                      className={styles.input}
                      value={form.stage}
                      onChange={e => setForm({ ...form, stage: e.target.value })}
                      required
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Notes</label>
                    <textarea
                      className={styles.input}
                      style={{ minHeight: 100, resize: 'vertical' }}
                      placeholder="Observations, concerns, progress..."
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>

                  {error && <p className={styles.error}>{error}</p>}

                  <button
                    className={styles.submitBtn}
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
          <div className={styles.card} style={{ flex: 2 }}>
            <h2 className={styles.cardTitle}>Update History</h2>

            {updates.length === 0 ? (
              <p className={styles.empty}>No updates yet.</p>
            ) : (
              <div className={styles.timeline}>
                {updates.map((u, i) => (
                  <div key={u.id} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    {i < updates.length - 1 && <div className={styles.timelineLine} />}
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineStage}>{u.stage}</span>
                        <span className={styles.timelineAgent}>{u.agent_name}</span>
                        <span className={styles.timelineDate}>
                          {new Date(u.created_at).toLocaleDateString('en-KE', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {u.notes && <p className={styles.timelineNotes}>{u.notes}</p>}
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


