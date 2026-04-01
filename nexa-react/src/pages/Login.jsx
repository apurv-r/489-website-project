import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    navigate('/dashboard');
  }

  return (
    <>
      <Navbar variant="signup-only" />
      <main className="auth-main auth-center" style={{ paddingTop: '80px' }}>
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-logo-mark">
              <span className="brand-n">N</span><span className="brand-rest">EXA</span>
            </div>
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">Log in to your NEXA account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="loginEmail">Email address</label>
              <div className="auth-input-wrap">
                <i className="bi bi-envelope-fill auth-input-icon"></i>
                <input type="email" id="loginEmail" className="form-control auth-input" placeholder="you@example.com" required />
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: '1.5rem' }}>
              <div className="auth-label-row">
                <label htmlFor="loginPassword">Password</label>
              </div>
              <div className="auth-input-wrap">
                <i className="bi bi-lock-fill auth-input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  className="form-control auth-input"
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-nexa w-100 auth-submit-btn">
              <i className="bi bi-box-arrow-in-right me-2"></i>Log In
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up for free</Link>
          </p>
        </div>
      </main>
    </>
  );
}
