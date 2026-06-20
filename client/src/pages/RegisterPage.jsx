import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    clearError();
    setFormError('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return setFormError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setFormError('Password must be at least 6 characters.');
    }
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard/patient', { replace: true });
  };

  const displayError = formError || error;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Register as a new patient</p>
        </div>

        {displayError && (
          <div style={styles.errorBanner} role="alert">
            ⚠️ {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {[
            { id: 'name',     label: 'Full name',       type: 'text',     placeholder: 'Juan dela Cruz' },
            { id: 'email',    label: 'Email address',   type: 'email',    placeholder: 'you@example.com' },
            { id: 'password', label: 'Password',        type: 'password', placeholder: 'At least 6 characters' },
            { id: 'confirm',  label: 'Confirm password',type: 'password', placeholder: 'Repeat password' },
          ].map(f => (
            <div key={f.id} style={styles.field}>
              <label style={styles.label} htmlFor={f.id}>{f.label}</label>
              <input
                id={f.id}
                name={f.id}
                type={f.type}
                value={form[f.id]}
                onChange={handleChange}
                placeholder={f.placeholder}
                style={styles.input}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
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
    width: '100%',
    boxSizing: 'border-box',
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
    cursor: 'pointer',
  },
  loginLink: { textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '1.25rem' },
  link: { color: '#1e40af', textDecoration: 'none', fontWeight: '500' },
};

export default RegisterPage;
