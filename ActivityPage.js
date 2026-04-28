import React, { useState, useEffect } from 'react';
import { Plus, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'productive', label: '✅ Productive', badge: 'green' },
  { value: 'neutral', label: '⚪ Neutral', badge: 'yellow' },
  { value: 'distraction', label: '🚨 Distraction', badge: 'red' },
];

const PRESET_APPS = ['YouTube', 'Instagram', 'Twitter/X', 'Netflix', 'VS Code', 'ChatGPT', 'Browser - Study', 'Slack', 'Discord', 'Notion'];

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ app_name: '', category: 'productive', duration_minutes: '' });
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => {
    api.get('/api/activity/today').then(r => setLogs(r.data)).catch(() => {});
  };

  useEffect(() => { fetchLogs(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/activity/log', {
        app_name: form.app_name,
        category: form.category,
        duration_minutes: +form.duration_minutes,
      });
      toast.success('Activity logged!');
      setForm({ app_name: '', category: 'productive', duration_minutes: '' });
      fetchLogs();
    } catch (err) {
      toast.error('Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const totalDistraction = logs.filter(l => l.category === 'distraction').reduce((a, l) => a + l.duration_minutes, 0);
  const totalProductive = logs.filter(l => l.category === 'productive').reduce((a, l) => a + l.duration_minutes, 0);

  return (
    <div>
      <h1 className="page-title">Activity Log</h1>

      {/* Summary */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Productive Today</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--accent)' }}>{Math.round(totalProductive)} <span style={{ fontSize: '1rem' }}>min</span></div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Distraction Today</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: totalDistraction > 30 ? 'var(--danger)' : 'var(--accent3)' }}>{Math.round(totalDistraction)} <span style={{ fontSize: '1rem' }}>min</span></div>
        </div>
      </div>

      {/* Log Form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Log Activity</h3>

        {/* Quick presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {PRESET_APPS.map(app => (
            <button key={app} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}
              onClick={() => setForm(f => ({ ...f, app_name: app }))}>
              {app}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label>App / Website</label>
            <input value={form.app_name} onChange={e => setForm(f => ({ ...f, app_name: e.target.value }))} required placeholder="e.g. YouTube, VS Code..." />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label>Duration (min)</label>
            <input type="number" min={1} value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} required placeholder="30" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 38 }}>
            <Plus size={14} /> Log
          </button>
        </form>
      </div>

      {/* Logs list */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Today's Activity</h3>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '2rem' }}>
            <Monitor size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>No activity logged today yet.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {logs.map(log => {
              const cat = CATEGORIES.find(c => c.value === log.category);
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface2)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge badge-${cat?.badge || 'yellow'}`}>{cat?.label || log.category}</span>
                    <span style={{ fontWeight: 500 }}>{log.app_name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: 13, color: 'var(--text-muted)' }}>
                    <span className="mono">{log.duration_minutes} min</span>
                    <span>{format(new Date(log.timestamp), 'HH:mm')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
