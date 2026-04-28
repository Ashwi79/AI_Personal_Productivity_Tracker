import React, { useEffect, useState } from 'react';
import { BookOpen, Zap, AlertTriangle, TrendingUp, Award, Target } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, unit, color, badge }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Icon size={18} color={color || 'var(--accent)'} />
        {badge && <span className={`badge badge-${badge.type}`}>{badge.text}</span>}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: color || 'var(--accent)' }}>
          {value}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading dashboard...</div>;

  const scoreColor = (s) => s >= 7 ? 'var(--accent)' : s >= 5 ? 'var(--accent3)' : 'var(--danger)';

  return (
    <div>
      <div style={{ marginBottom: '0.5rem', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <h1 className="page-title">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <StatCard
          icon={BookOpen}
          label="Study time today"
          value={Math.round(stats?.today_study_minutes || 0)}
          unit="min"
          badge={{ type: 'green', text: 'Today' }}
        />
        <StatCard
          icon={Zap}
          label="Avg productivity score"
          value={stats?.today_productivity_score || '—'}
          unit={stats?.today_productivity_score ? '/10' : ''}
          color={scoreColor(stats?.today_productivity_score || 0)}
          badge={{ type: stats?.today_productivity_score >= 7 ? 'green' : 'yellow', text: stats?.today_productivity_score >= 7 ? 'High' : 'Moderate' }}
        />
        <StatCard
          icon={AlertTriangle}
          label="Distraction time today"
          value={Math.round(stats?.today_distraction_minutes || 0)}
          unit="min"
          color={stats?.today_distraction_minutes > 30 ? 'var(--danger)' : 'var(--accent3)'}
          badge={{ type: stats?.today_distraction_minutes > 30 ? 'red' : 'yellow', text: stats?.today_distraction_minutes > 30 ? 'High' : 'Low' }}
        />
        <StatCard
          icon={TrendingUp}
          label="Study time this week"
          value={Math.round(stats?.weekly_study_minutes || 0)}
          unit="min"
          badge={{ type: 'purple', text: '7 days' }}
          color="#a78bfa"
        />
        <StatCard
          icon={Award}
          label="Current streak"
          value={stats?.streak_days || 0}
          unit="days"
          color="var(--accent3)"
          badge={{ type: 'yellow', text: '🔥 Streak' }}
        />
        <StatCard
          icon={Target}
          label="Total sessions"
          value={stats?.total_sessions || 0}
          unit=""
          badge={{ type: 'green', text: 'All time' }}
        />
      </div>

      {/* Tips */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>💡 Quick Tips</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { icon: '⏱️', text: 'Start a study session using the Timer page to track your focus.' },
            { icon: '📱', text: 'Log apps you use daily on the Activity Log page to detect distractions.' },
            { icon: '🤖', text: 'Check AI Schedule for your personalized best study times.' },
            { icon: '📊', text: 'Visit Insights every week to review your productivity trends.' },
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface2)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
