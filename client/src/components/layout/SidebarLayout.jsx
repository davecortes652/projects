import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_NAV = {
  admin: [
    { to: '/dashboard/admin',         icon: '📊', label: 'Dashboard' },
    { to: '/dashboard/admin/users',   icon: '👥', label: 'Manage Users' },
    { to: '/dashboard/admin/doctors', icon: '🩺', label: 'Doctor Management' },
  ],
  doctor:  [{ to: '/dashboard/doctor',  icon: '📊', label: 'Dashboard' }],
  staff:   [{ to: '/dashboard/staff',   icon: '📊', label: 'Dashboard' }],
  patient: [{ to: '/dashboard/patient', icon: '📊', label: 'Dashboard' }],
};

const ROLE_COLORS = {
  admin:   '#1e40af',
  doctor:  '#065f46',
  staff:   '#854d0e',
  patient: '#6d28d9',
};

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const color  = ROLE_COLORS[user?.role] || '#1e40af';
  const navItems = ROLE_NAV[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div style={s.shell}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={s.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        ...s.sidebar,
        width: collapsed ? '64px' : '220px',
        left: mobileOpen ? 0 : undefined,
      }}>
        {/* Brand */}
        <div style={{ ...s.brand, background: color }}>
          <span style={s.brandIcon}>🏥</span>
          {!collapsed && <span style={s.brandText}>MediCare</span>}
          <button style={s.collapseBtn} onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={s.roleBadge}>
            <span style={{ ...s.roleTag, background: color + '22', color }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={s.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              style={({ isActive }) => ({
                ...s.navItem,
                background: isActive ? color + '18' : 'transparent',
                color:      isActive ? color : '#374151',
                borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
              })}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {!collapsed && <span style={s.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={s.userSection}>
          <div style={{ ...s.avatar, background: color + '22', color }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={s.userInfo}>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userEmail}>{user?.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div style={{ ...s.main, marginLeft: collapsed ? '64px' : '220px' }}>
        {/* Top bar */}
        <header style={s.topbar}>
          <button style={s.menuBtn} onClick={() => setMobileOpen(o => !o)} aria-label="Menu">☰</button>
          <div style={s.topRight}>
            <span style={s.topName}>👤 {user?.name}</span>
            <button style={{ ...s.logoutBtn, borderColor: color, color }} onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={s.content}>{children}</main>
      </div>
    </div>
  );
};

const s = {
  shell:       { display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, sans-serif' },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 40 },
  sidebar:     { position: 'fixed', top: 0, left: 0, height: '100vh', background: '#fff', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', transition: 'width .2s', zIndex: 50, overflow: 'hidden' },
  brand:       { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 12px', color: '#fff' },
  brandIcon:   { fontSize: '20px', flexShrink: 0 },
  brandText:   { fontWeight: '700', fontSize: '15px', flex: 1 },
  collapseBtn: { background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px', fontSize: '12px', flexShrink: 0 },
  roleBadge:   { padding: '8px 12px' },
  roleTag:     { fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '99px', letterSpacing: '.06em' },
  nav:         { flex: 1, padding: '8px 0', overflowY: 'auto' },
  navItem:     { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all .12s' },
  navIcon:     { fontSize: '16px', flexShrink: 0 },
  navLabel:    { whiteSpace: 'nowrap' },
  userSection: { padding: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px' },
  avatar:      { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 },
  userInfo:    { flex: 1, minWidth: 0 },
  userName:    { fontSize: '13px', fontWeight: '500', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail:   { fontSize: '11px', color: '#9CA3AF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left .2s' },
  topbar:      { background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 },
  menuBtn:     { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280', display: 'none' },
  topRight:    { display: 'flex', alignItems: 'center', gap: '12px' },
  topName:     { fontSize: '14px', color: '#6B7280' },
  logoutBtn:   { background: 'none', border: '1px solid', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  content:     { padding: '1.5rem', flex: 1 },
};

export default SidebarLayout;