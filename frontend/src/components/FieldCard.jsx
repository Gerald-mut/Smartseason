import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import styles from "./FieldCard.module.css";

export default function FieldCard({ field }) {
  const navigate = useNavigate();

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/fields/${field.id}`)}
    >
      <div className={styles.top}>
        <span className={styles.name}>{field.name}</span>
        <StatusBadge status={field.status} />
      </div>
      <p className={styles.meta}>{field.crop_type}</p>
      <p className={styles.meta}>
        Stage: <strong>{field.stage}</strong>
      </p>
      {field.agent_name && (
        <p className={styles.meta}>Agent: {field.agent_name}</p>
      )}
      <p className={styles.meta}>
        Planted: {new Date(field.planting_date).toLocaleDateString()}
      </p>
    </div>
  );
}
