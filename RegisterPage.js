import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      await login(form.email, form.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.brand}>FOCUS_AI</div>
        <p style={styles.sub}>Create your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label>Full Name</label>
            <input value={form.name} onChange={update('name')} required placeholder="Ada Lovelace" />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} required placeholder="you@example.com" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')} required placeholder="Min 6 characters" minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' },
  box: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' },
  brand: { fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '0.5rem' },
  sub: { color: 'var(--text-muted)', fontSize: 14, marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
};
