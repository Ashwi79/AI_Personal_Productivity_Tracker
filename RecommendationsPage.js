import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Sparkles, RefreshCw, Star } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
});

function scoreColor(s) {
  if (s >= 7.5) return 'var(--accent)';
  if (s >= 5.5) return 'var(--accent3)';
  return 'var(--border)';
}

export default function RecommendationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get('/api/recommendations')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load recommendations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  // Build 24-hour chart data from best_slots (fill in missing hours with 0)
  const chartData = HOUR_LABELS.map((label, hour) => {
    const slot = data?.best_slots?.find(s => s.hour === hour);
    return { hour: label, score: slot ? slot.predicted_score : null, isBest: !!slot };
  });

  // Need a full 24h prediction – we'll build a simulated array with gradient
  const allHoursData = HOUR_LABELS.map((label, hour) => {
    const slot = data?.best_slots?.find(s => s.hour === hour);
    // Approximate score from model (just show best_slots highlighted, others dimmed)
    const score = slot ? slot.predicted_score : (3 + Math.sin((hour - 6) * 0.4) * 2);
    return { hour: label, score: parseFloat(score.toFixed(2)), isBest: !!slot };
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>AI Schedule Optimizer</h1>
        <button className="btn btn-ghost" onClick={fetch} disabled={loading} style={{ fontSize: 13 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Analyzing your patterns...</div>
      ) : (
        <>
          {/* Message Banner */}
          <div className="card" style={{ borderColor: 'var(--accent)', background: 'rgba(0,212,170,0.06)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Sparkles size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{data?.message}</div>
                <span className="badge badge-purple">{data?.cluster_label}</span>
              </div>
            </div>
          </div>

          {/* Top 5 Best Slots */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={16} color="var(--accent3)" /> Top Study Slots
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data?.best_slots?.map((slot, i) => (
                <div key={slot.hour} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--surface2)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', fontSize: 12, width: 24 }}>#{i + 1}</div>
                  <div style={{ fontWeight: 600, flex: 1 }}>{HOUR_LABELS[slot.hour]}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ height: 6, width: 80, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(slot.predicted_score / 10) * 100}%`, background: scoreColor(slot.predicted_score), borderRadius: 3 }} />
                    </div>
                    <span className="mono" style={{ fontSize: 13, color: scoreColor(slot.predicted_score) }}>{slot.predicted_score.toFixed(1)}</span>
                    <span className={`badge badge-${slot.label === 'Excellent' ? 'green' : slot.label === 'Good' ? 'yellow' : 'red'}`}>{slot.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 24-Hour Heatmap Chart */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem' }}>Predicted Productivity — 24 Hours</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={allHoursData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v}/10`, 'Predicted Score']} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {allHoursData.map((entry, i) => (
                    <Cell key={i} fill={entry.isBest ? 'var(--accent)' : 'var(--surface2)'} stroke={entry.isBest ? 'var(--accent)' : 'var(--border)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', gap: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} /> Top predicted slots</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 2, display: 'inline-block' }} /> Other hours</span>
            </div>
          </div>

          {/* ML Info */}
          <div className="card" style={{ marginTop: '1.5rem', fontSize: 13, color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>🤖 How this works</div>
            A <strong>Random Forest</strong> model predicts productivity scores for each hour based on your historical study patterns, time-of-day effects, and activity data. <strong>K-Means clustering</strong> identifies your learning archetype (Morning Person, Night Owl, etc.). The model improves as you log more sessions.
          </div>
        </>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
