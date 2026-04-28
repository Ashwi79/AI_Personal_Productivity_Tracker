import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

function pad(n) { return String(n).padStart(2, '0'); }

export default function TimerPage() {
  const [session, setSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [subject, setSubject] = useState('General');
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endForm, setEndForm] = useState({ productivity_score: 7, break_minutes: 0, notes: '' });
  const intervalRef = useRef(null);

  // Check for active session on mount
  useEffect(() => {
    api.get('/api/sessions/active').then(r => {
      if (r.data) {
        setSession(r.data);
        const diff = Math.floor((Date.now() - new Date(r.data.start_time).getTime()) / 1000);
        setElapsed(diff);
      }
    }).catch(() => {});
  }, []);

  // Tick
  useEffect(() => {
    if (session && !session.end_time) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [session]);

  const startSession = async () => {
    setLoading(true);
    try {
      const r = await api.post('/api/sessions/start', { subject });
      setSession(r.data);
      setElapsed(0);
      toast.success('Session started! Stay focused 🎯');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await api.put(`/api/sessions/${session.id}/end`, {
        productivity_score: endForm.productivity_score,
        break_minutes: endForm.break_minutes,
        notes: endForm.notes || null,
      });
      clearInterval(intervalRef.current);
      toast.success(`Session saved! Score: ${endForm.productivity_score}/10 ✅`);
      setSession(null);
      setElapsed(0);
      setEnding(false);
    } catch (err) {
      toast.error('Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  const isRunning = !!session && !session.end_time;

  return (
    <div>
      <h1 className="page-title">Study Timer</h1>

      {/* Timer Display */}
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '1.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '4rem',
          color: isRunning ? 'var(--accent)' : 'var(--text-muted)',
          letterSpacing: '0.05em',
          transition: 'color 0.3s',
        }}>
          {pad(hours)}:{pad(mins)}:{pad(secs)}
        </div>
        {isRunning && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite' }} />
            Recording: <strong style={{ color: 'var(--text)' }}>{session?.subject}</strong>
          </div>
        )}
        {!isRunning && (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: '0.75rem' }}>Timer ready</div>
        )}
      </div>

      {/* Controls */}
      {!isRunning && !ending && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Start New Session</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Subject / Topic</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics, Python, DSA..." />
            </div>
            <button className="btn btn-primary" onClick={startSession} disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
              <Play size={16} /> {loading ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </div>
      )}

      {isRunning && !ending && (
        <div className="card">
          <button className="btn btn-danger" onClick={() => setEnding(true)} style={{ padding: '0.8rem 2rem' }}>
            <Square size={16} /> End Session
          </button>
        </div>
      )}

      {/* End Session Form */}
      {ending && (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Rate Your Session</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Productivity Score (1–10)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n}
                    onClick={() => setEndForm(f => ({ ...f, productivity_score: n }))}
                    style={{
                      width: 40, height: 40,
                      borderRadius: 8,
                      border: `2px solid ${endForm.productivity_score === n ? 'var(--accent)' : 'var(--border)'}`,
                      background: endForm.productivity_score === n ? 'var(--accent)' : 'var(--surface2)',
                      color: endForm.productivity_score === n ? '#0a0e1a' : 'var(--text)',
                      fontWeight: 700, cursor: 'pointer', fontSize: 14,
                      transition: 'all 0.15s',
                    }}
                  >{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label>Break Time (minutes)</label>
              <input type="number" min={0} value={endForm.break_minutes} onChange={e => setEndForm(f => ({ ...f, break_minutes: +e.target.value }))} />
            </div>
            <div>
              <label>Notes (optional)</label>
              <textarea rows={3} value={endForm.notes} onChange={e => setEndForm(f => ({ ...f, notes: e.target.value }))} placeholder="What did you accomplish?" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={endSession} disabled={loading}>
                <Clock size={14} /> Save Session
              </button>
              <button className="btn btn-ghost" onClick={() => setEnding(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
