import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    navigate('/admin/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nexa-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #dc3545, #c0392b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-shield-lock-fill" style={{ color: '#fff', fontSize: '1rem' }}></i>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em' }}>
              NEXA <span style={{ color: '#dc3545' }}>Admin</span>
            </span>
          </div>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Admin Portal</h2>
          <p style={{ color: 'var(--nexa-gray-500)', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>Restricted access — authorized personnel only.</p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="auth-label">Admin email</label>
              <input type="email" className="auth-input" placeholder="admin@nexa.com" required />
            </div>
            <div>
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input type={showPw ? 'text' : 'password'} className="auth-input auth-input--icon" placeholder="••••••••" required />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                  <i className={`bi bi-eye${showPw ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="btn w-100" style={{ background: 'linear-gradient(135deg, #dc3545, #c0392b)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
              <i className="bi bi-shield-lock me-2"></i> Sign In to Admin
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--nexa-gray-600)' }}>
          This is a restricted area. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
