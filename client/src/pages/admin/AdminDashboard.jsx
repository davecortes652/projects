import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/layout/SidebarLayout';
import api from '../../utils/api';

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{ ...c.card, borderTop: `3px solid ${color}` }}>
    <div style={c.cardTop}>
      <div style={{ ...c.cardIcon, background: color + '18', color }}>{icon}</div>
      <div>
        <p style={c.cardLabel}>{label}</p>
        <p style={{ ...c.cardValue, color }}>{value ?? '—'}</p>
      </div>
    </div>
    {sub && <p style={c.cardSub}>{sub}</p>}
  </div>
);

// ─── Mini bar chart (pure CSS) ───────────────────────────────────────────────
const BarChart = ({ data, color }) => {
  if (!data?.length) return <p style={c.empty}>No data yet</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={c.barWrap}>
      {data.map((d, i) => (
        <div key={i} style={c.barCol}>
          <span style={c.barCount}>{d.count}</span>
          <div style={{ ...c.bar, height: `${Math.max((d.count / max) * 100, 4)}%`, background: color }} />
          <span style={c.barLabel}>
            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Donut chart (SVG) ───────────────────────────────────────────────────────
const ROLE_COLORS = { patient: '#6d28d9', doctor: '#065f46', staff: '#854d0e', admin: '#1e40af' };

const DonutChart = ({ data }) => {
  if (!data?.length) return <p style={c.empty}>No data yet</p>;
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let offset = 0;
  const R = 60, cx = 80, cy = 80, stroke = 28;
  const circ = 2 * Math.PI * R;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.filter(d => d.count > 0).map((d, i) => {
          const pct  = d.count / total;
          const dash = pct * circ;
          const el   = (
            <circle
              key={i}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={ROLE_COLORS[d.role] || '#9CA3AF'}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ}
              style={{ transition: 'stroke-dasharray .4s' }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy - 6}  textAnchor="middle" fontSize="22" fontWeight="700" fill="#111827">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#6B7280">total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map(d => (
          <div key={d.role} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '2px', background: ROLE_COLORS[d.role] || '#9CA3AF', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ color: '#374151', textTransform: 'capitalize', minWidth: '54px' }}>{d.role}</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{d.count}</span>
            <span style={{ color: '#9CA3AF' }}>({Math.round(d.count / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Admin Dashboard Page ────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SidebarLayout>
      <div style={c.page}>
        {/* Header */}
        <div style={c.pageHeader}>
          <div>
            <h1 style={c.pageTitle}>Admin Dashboard</h1>
            <p style={c.pageSubtitle}>Welcome back — here's what's happening today</p>
          </div>
          <button style={c.manageBtn} onClick={() => navigate('/dashboard/admin/users')}>
            👥 Manage Users
          </button>
        </div>

        {loading && <p style={c.empty}>Loading stats…</p>}
        {error   && <p style={{ color: '#B91C1C', fontSize: '14px' }}>{error}</p>}

        {stats && (
          <>
            {/* Stat cards */}
            <div style={c.grid4}>
              <StatCard icon="👥" label="Total Users"    value={stats.totalUsers}    color="#1e40af" sub={`+${stats.newUsersWeek} this week`} />
              <StatCard icon="👤" label="Patients"       value={stats.totalPatients} color="#6d28d9" />
              <StatCard icon="🩺" label="Doctors"        value={stats.totalDoctors}  color="#065f46" />
              <StatCard icon="📋" label="Staff"          value={stats.totalStaff}    color="#854d0e" />
            </div>

            {/* Charts row */}
            <div style={c.grid2}>
              {/* Bar chart */}
              <div style={c.chartCard}>
                <h3 style={c.chartTitle}>📈 New registrations — last 7 days</h3>
                <BarChart data={stats.dailyRegistrations} color="#1e40af" />
              </div>

              {/* Donut chart */}
              <div style={c.chartCard}>
                <h3 style={c.chartTitle}>🍩 Users by role</h3>
                <DonutChart data={stats.roleChart} />
              </div>
            </div>

            {/* Quick actions */}
            <div style={c.chartCard}>
              <h3 style={c.chartTitle}>⚡ Quick actions</h3>
              <div style={c.actionGrid}>
                {[
                  { icon: '➕', label: 'Add new user',    onClick: () => navigate('/dashboard/admin/users') },
                  { icon: '👥', label: 'View all users',  onClick: () => navigate('/dashboard/admin/users') },
                  { icon: '🩺', label: 'View doctors',    onClick: () => navigate('/dashboard/admin/doctors') },
                  { icon: '👤', label: 'View patients',   onClick: () => navigate('/dashboard/admin/users?role=patient') },
                ].map((a, i) => (
                  <button key={i} style={c.actionBtn} onClick={a.onClick}>
                    <span style={{ fontSize: '22px' }}>{a.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

const c = {
  page:        { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  pageHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
  pageTitle:   { fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 },
  pageSubtitle:{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0' },
  manageBtn:   { padding: '8px 18px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  grid4:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' },
  grid2:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' },
  card:        { background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E5E7EB' },
  cardTop:     { display: 'flex', alignItems: 'center', gap: '12px' },
  cardIcon:    { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
  cardLabel:   { fontSize: '12px', color: '#6B7280', margin: '0 0 2px', fontWeight: '500' },
  cardValue:   { fontSize: '28px', fontWeight: '700', margin: 0 },
  cardSub:     { fontSize: '12px', color: '#6B7280', margin: '8px 0 0' },
  chartCard:   { background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E5E7EB' },
  chartTitle:  { fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 1rem' },
  barWrap:     { display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', padding: '0 4px' },
  barCol:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' },
  bar:         { width: '100%', borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height .3s' },
  barCount:    { fontSize: '11px', fontWeight: '600', color: '#374151' },
  barLabel:    { fontSize: '10px', color: '#9CA3AF', textAlign: 'center', whiteSpace: 'nowrap' },
  actionGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: '10px' },
  actionBtn:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '16px 8px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', transition: 'background .12s' },
  empty:       { color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '2rem 0' },
};

export default AdminDashboard;
