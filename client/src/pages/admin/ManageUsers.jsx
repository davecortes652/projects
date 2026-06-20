import { useEffect, useState, useCallback } from 'react';
import SidebarLayout from '../../components/layout/SidebarLayout';
import api from '../../utils/api';

const ROLES     = ['all', 'admin', 'doctor', 'staff', 'patient'];
const ROLE_CLR  = { admin: '#1e40af', doctor: '#065f46', staff: '#854d0e', patient: '#6d28d9' };
const ROLE_BG   = { admin: '#EFF6FF', doctor: '#ECFDF5', staff: '#FEF9C3', patient: '#F5F3FF' };

// ─── Add User Modal ──────────────────────────────────────────────────────────
const AddUserModal = ({ onClose, onCreated }) => {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/admin/users', form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally { setLoading(false); }
  };

  return (
    <div style={m.backdrop}>
      <div style={m.modal}>
        <div style={m.modalHeader}>
          <h2 style={m.modalTitle}>Add new user</h2>
          <button style={m.closeBtn} onClick={onClose}>✕</button>
        </div>
        {error && <p style={m.err}>{error}</p>}
        <form onSubmit={handleSubmit} style={m.form}>
          {[
            { id: 'name',     label: 'Full name',     type: 'text',     ph: 'Juan dela Cruz' },
            { id: 'email',    label: 'Email address', type: 'email',    ph: 'user@clinic.com' },
            { id: 'password', label: 'Password',      type: 'password', ph: 'Min. 6 characters' },
          ].map(f => (
            <div key={f.id} style={m.field}>
              <label style={m.label}>{f.label}</label>
              <input type={f.type} value={form[f.id]} placeholder={f.ph}
                onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                style={m.input} required />
            </div>
          ))}
          <div style={m.field}>
            <label style={m.label}>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={m.input}>
              {['admin','doctor','staff','patient'].map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={m.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={m.submitBtn}>
              {loading ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit User Modal ─────────────────────────────────────────────────────────
const EditUserModal = ({ user, onClose, onSaved }) => {
  const [form, setForm]     = useState({ name: user.name, email: user.email, password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await api.put(`/admin/users/${user.id}`, payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally { setLoading(false); }
  };

  return (
    <div style={m.backdrop}>
      <div style={m.modal}>
        <div style={m.modalHeader}>
          <h2 style={m.modalTitle}>Edit user</h2>
          <button style={m.closeBtn} onClick={onClose}>✕</button>
        </div>
        {error && <p style={m.err}>{error}</p>}
        <form onSubmit={handleSubmit} style={m.form}>
          <div style={m.field}>
            <label style={m.label}>Full name</label>
            <input type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={m.input} required />
          </div>
          <div style={m.field}>
            <label style={m.label}>Email address</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={m.input} required />
          </div>
          <div style={m.field}>
            <label style={m.label}>Reset password <span style={{ color: '#9CA3AF', fontWeight: '400' }}>(optional)</span></label>
            <input type="password" value={form.password} placeholder="Leave blank to keep current password"
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              style={m.input} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={m.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={m.submitBtn}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Manage Users Page ───────────────────────────────────────────────────────
const ManageUsers = () => {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRole] = useState('all');
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, role: roleFilter, search };
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data.users);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
    } catch { /* handled silently */ }
    finally { setLoading(false); }
  }, [page, roleFilter, search]);

  useEffect(() => { load(); }, [load]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId + '-role');
    try { await api.put(`/admin/users/${userId}/role`, { role: newRole }); await load(); }
    catch { alert('Failed to update role.'); }
    finally { setActionLoading(null); }
  };

  const handleToggle = async (userId) => {
    setActionLoading(userId + '-toggle');
    try { await api.put(`/admin/users/${userId}/toggle`); await load(); }
    catch { alert('Failed to toggle status.'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionLoading(userId + '-delete');
    try { await api.delete(`/admin/users/${userId}`); await load(); }
    catch { alert('Failed to delete user.'); }
    finally { setActionLoading(null); }
  };

  return (
    <SidebarLayout>
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onCreated={load} />}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={load}
        />
      )}

      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Manage Users</h1>
            <p style={s.sub}>{total} total users in the system</p>
          </div>
          <button style={s.addBtn} onClick={() => setShowAdd(true)}>➕ Add user</button>
        </div>

        {/* Filters */}
        <div style={s.filters}>
          <input
            style={s.search}
            placeholder="🔍 Search name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <div style={s.roleTabs}>
            {ROLES.map(r => (
              <button key={r} style={{ ...s.roleTab, ...(roleFilter === r ? s.roleTabActive : {}) }}
                onClick={() => { setRole(r); setPage(1); }}>
                {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          {loading ? (
            <p style={s.empty}>Loading users…</p>
          ) : users.length === 0 ? (
            <p style={s.empty}>No users found.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['#', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={s.td}>{(page - 1) * 10 + i + 1}</td>
                    <td style={{ ...s.td, fontWeight: '500', color: '#111827' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ ...s.avatar, background: ROLE_BG[u.role], color: ROLE_CLR[u.role] }}>
                          {u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ ...s.td, color: '#6B7280' }}>{u.email}</td>
                    <td style={s.td}>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={actionLoading === u.id + '-role'}
                        style={{ ...s.roleSelect, color: ROLE_CLR[u.role], background: ROLE_BG[u.role] }}
                      >
                        {['admin','doctor','staff','patient'].map(r => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: u.is_active ? '#DCFCE7' : '#FEE2E2', color: u.is_active ? '#166534' : '#991B1B' }}>
                        {u.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#9CA3AF', fontSize: '12px' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={{ ...s.actionBtn, color: '#1e40af' }}
                          onClick={() => setEditingUser(u)}
                          disabled={!!actionLoading}
                        >
                          ✏ Edit
                        </button>
                        <button
                          style={{ ...s.actionBtn, color: u.is_active ? '#854d0e' : '#065f46' }}
                          onClick={() => handleToggle(u.id)}
                          disabled={!!actionLoading}
                        >
                          {u.is_active ? '⏸ Deactivate' : '▶ Activate'}
                        </button>
                        <button
                          style={{ ...s.actionBtn, color: '#991B1B' }}
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={!!actionLoading}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={s.pagination}>
            <button style={s.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} style={{ ...s.pageBtn, ...(n === page ? s.pageBtnActive : {}) }} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button style={s.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = {
  page:         { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
  title:        { fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 },
  sub:          { fontSize: '14px', color: '#6B7280', margin: '4px 0 0' },
  addBtn:       { padding: '8px 18px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  filters:      { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  search:       { flex: 1, minWidth: '200px', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  roleTabs:     { display: 'flex', gap: '4px' },
  roleTab:      { padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#374151' },
  roleTabActive:{ background: '#1e40af', color: '#fff', borderColor: '#1e40af' },
  tableWrap:    { background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' },
  td:           { padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#374151', verticalAlign: 'middle' },
  avatar:       { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 },
  roleSelect:   { border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' },
  badge:        { fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '99px' },
  actionBtn:    { background: 'none', border: '1px solid #E5E7EB', borderRadius: '5px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  pagination:   { display: 'flex', gap: '6px', justifyContent: 'center' },
  pageBtn:      { padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '13px' },
  pageBtnActive:{ background: '#1e40af', color: '#fff', borderColor: '#1e40af' },
  empty:        { padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' },
};

const m = {
  backdrop:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:     { background: '#fff', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,.15)' },
  modalHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 },
  closeBtn:  { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9CA3AF' },
  err:       { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', marginBottom: '12px' },
  form:      { display: 'flex', flexDirection: 'column', gap: '12px' },
  field:     { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:     { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:     { padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  cancelBtn: { flex: 1, padding: '9px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '7px', fontSize: '14px', cursor: 'pointer', color: '#374151' },
  submitBtn: { flex: 1, padding: '9px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

export default ManageUsers;
