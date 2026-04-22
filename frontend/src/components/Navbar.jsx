import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>🌱 SmartSeason</span>
      <div style={styles.right}>
        <span style={styles.name}>{user?.name}</span>
        <span style={styles.role}>{user?.role}</span>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#1a6b3c',
    color: '#fff',
    padding: '0.85rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 18, fontWeight: 700 },
  right: { display: 'flex', alignItems: 'center', gap: '1rem' },
  name: { fontSize: 14 },
  role: {
    fontSize: 11,
    background: 'rgba(255,255,255,0.2)',
    padding: '2px 8px',
    borderRadius: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logout: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.4)',
    color: '#fff',
    borderRadius: 6,
    padding: '4px 12px',
    fontSize: 13,
  },
};