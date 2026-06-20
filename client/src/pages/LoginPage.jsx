import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Role → dashboard route mapping
const ROLE_ROUTES = {
  admin:   '/dashboard/admin',
  doctor:  '/dashboard/doctor',
  staff:   '/dashboard/staff',
  patient: '/dashboard/patient',
};

const LoginPage = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    clearError();
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate(from || ROLE_ROUTES[result.role] || '/dashboard', { replace: true });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo / header */}
        <div style={styles.header}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.title}>MediCare System</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={styles.errorBanner} role="alert">
            <span>⚠️ {error}</span>
            <button onClick={clearError} style={styles.errorClose}>✕</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@hospital.com"
              style={styles.input}
              autoComplete="email"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <div style={styles.passwordWrap}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{ ...styles.input, paddingRight: '44px' }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={styles.eyeBtn}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.email || !form.password}
            style={{
              ...styles.submitBtn,
              opacity: loading || !form.email || !form.password ? 0.6 : 1,
              cursor: loading || !form.email || !form.password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Register link */}
        <p style={styles.registerLink}>
          New patient?{' '}
          <Link to="/register" style={styles.link}>Create an account</Link>
        </p>

        {/* Demo role hints */}
        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Demo accounts</p>
          <div style={styles.demoGrid}>
            {[
              { role: 'Admin',   email: 'admin@clinic.com' },
              { role: 'Doctor',  email: 'doctor@clinic.com' },
              { role: 'Staff',   email: 'staff@clinic.com' },
              { role: 'Patient', email: 'patient@clinic.com' },
            ].map(d => (
              <button
                key={d.role}
                type="button"
                style={styles.demoChip}
                onClick={() => { clearError(); setForm({ email: d.email, password: 'password123' }); }}
              >
                <span style={styles.demoRole}>{d.role}</span>
                <span style={styles.demoEmail}>{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EDE9FE 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '420px',
  },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  logo: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  title: { fontSize: '22px', fontWeight: '700', color: '#1e3a5f', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: 0 },
  errorBanner: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '1rem',
    fontSize: '13px',
    color: '#B91C1C',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#B91C1C',
    fontSize: '14px',
    padding: '0 0 0 8px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    transition: 'border-color .15s',
    width: '100%',
    boxSizing: 'border-box',
  },
  passwordWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '2px',
  },
  submitBtn: {
    marginTop: '0.5rem',
    padding: '11px',
    background: '#1e40af',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background .15s, opacity .15s',
  },
  registerLink: { textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '1.25rem' },
  link: { color: '#1e40af', textDecoration: 'none', fontWeight: '500' },
  demoBox: {
    marginTop: '1.5rem',
    padding: '12px',
    background: '#F9FAFB',
    borderRadius: '8px',
    border: '1px dashed #D1D5DB',
  },
  demoTitle: { fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' },
  demoChip: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  demoRole:  { fontSize: '11px', fontWeight: '600', color: '#1e40af' },
  demoEmail: { fontSize: '10px', color: '#9CA3AF' },
};

export default LoginPage;
