import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);

      // Send each role to their own dashboard
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/agent');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>SmartSeason</h1>
        <p style={styles.subtitle}>Field Monitoring System</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={styles.hint}>
          <p style={styles.hintTitle}>Demo credentials</p>
          <p>Admin: alice@smartseason.com / admin123</p>
          <p>Agent: bob@smartseason.com / agent123</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f0',
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1a6b3c',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem',
    fontSize: 14,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#333',
  },
  input: {
    padding: '0.65rem 0.85rem',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 15,
    outline: 'none',
  },
  error: {
    color: '#c0392b',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    background: '#1a6b3c',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '0.75rem',
    fontSize: 15,
    fontWeight: 600,
    marginTop: '0.5rem',
  },
  hint: {
    marginTop: '1.5rem',
    padding: '0.85rem',
    background: '#f0f4f0',
    borderRadius: 8,
    fontSize: 13,
    color: '#555',
    lineHeight: 1.7,
  },
  hintTitle: {
    fontWeight: 600,
    marginBottom: 4,
    color: '#333',
  },
};