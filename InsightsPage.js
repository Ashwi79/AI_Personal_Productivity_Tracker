import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

export default function InsightsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/insights/weekly')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load insights'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading insights...</div>;

  const totalStudy = data.reduce((a, d) => a + d.study_minutes, 0);
  const avgScore = data.filter(d => d.productivity_score > 0).reduce((a, d, _, arr) => a + d.productivity_score / arr.length, 0);
  const bestDay = [...data].sort((a, b) => b.study_minutes - a.study_minutes)[0];

  return (
    <div>
      <h1 className="page-title">Weekly Insights</h1>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Study This Week</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--accent)', marginTop: 6 }}>
            {Math.round(totalStudy)} <span style={{ fontSize: '1rem' }}>min</span>
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Productivity Score</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: avgScore >= 7 ? 'var(--accent)' : 'var(--accent3)', marginTop: 6 }}>
            {avgScore.toFixed(1)} <span style={{ fontSize: '1rem' }}>/10</span>
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Most Productive Day</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#a78bfa', marginTop: 6 }}>
            {bestDay?.date || '—'}
          </div>
        </div>
      </div>

      {/* Study vs Distraction Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem' }}>Study vs Distraction (minutes)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="study_minutes" name="Study" fill="var(--accent)" radius={[4,4,0,0]} />
            <Bar dataKey="distraction_minutes" name="Distraction" fill="var(--danger)" radius={[4,4,0,0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Productivity Score Trend */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Productivity Score Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="productivity_score"
              name="Score"
              stroke="var(--accent3)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--accent3)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
