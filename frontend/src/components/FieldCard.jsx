import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function FieldCard({ field }) {
  const navigate = useNavigate();

  return (
    <div style={styles.card} onClick={() => navigate(`/fields/${field.id}`)}>
      <div style={styles.top}>
        <span style={styles.name}>{field.name}</span>
        <StatusBadge status={field.status} />
      </div>
      <p style={styles.meta}>{field.crop_type}</p>
      <p style={styles.meta}>Stage: <strong>{field.stage}</strong></p>
      {field.agent_name && (
        <p style={styles.meta}>Agent: {field.agent_name}</p>
      )}
      <p style={styles.meta}>
        Planted: {new Date(field.planting_date).toLocaleDateString()}
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 10,
    padding: '1.1rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontWeight: 600, fontSize: 15 },
  meta: { fontSize: 13, color: '#555' },
};