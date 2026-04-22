const colours = {
  Active:    { background: '#e6f4ec', color: '#1a6b3c' },
  'At Risk': { background: '#fef3e2', color: '#b45309' },
  Completed: { background: '#e8eaf6', color: '#3730a3' },
};

export default function StatusBadge({ status }) {
  const style = colours[status] || { background: '#eee', color: '#555' };
  return (
    <span style={{
      ...style,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
    }}>
      {status}
    </span>
  );
}