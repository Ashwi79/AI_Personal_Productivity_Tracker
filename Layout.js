import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Timer, BarChart3, Sparkles, Activity, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/timer', icon: Timer, label: 'Study Timer' },
  { to: '/activity', icon: Activity, label: 'Activity Log' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/recommendations', icon: Sparkles, label: 'AI Schedule' },
];

export default function Layout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1.5rem 2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontSize: '1rem', fontWeight: 700 }}>
            FOCUS<span style={{ color: 'var(--text-muted)' }}>_AI</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>Productivity Tracker</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1.5rem',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ margin: '0 1rem', justifyContent: 'center' }}
        >
          <LogOut size={14} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 220, flex: 1, padding: '2rem', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
