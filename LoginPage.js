import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.brand}>FOCUS_AI</div>
        <p style={styles.sub}>Sign in to your productivity tracker</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: '1.5rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '1rem',
  },
  box: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    color: 'var(--accent)',
    marginBottom: '0.5rem',
  },
  sub: { color: 'var(--text-muted)', fontSize: 14, marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
};
