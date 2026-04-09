import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('renter');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  function handleErrors(form) {
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.regEmail.value.trim();
    const phoneNumber = form.regPhone.value.trim();
    const password = form.regPassword.value;
    const confirmPassword = form.regConfirm.value;

    const errors = [];

    if (!firstName) {
      errors.push("First name is required.");
    }
    if (!lastName) {
      errors.push("Last name is required.");
    }
    if (!email) {
      errors.push("Email is required.");
    }
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters.");
    }
    if (password !== confirmPassword) {
      errors.push("Passwords do not match.");
    }

    setErrorMessages(errors);

    if (errors.length > 0) {
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessages([]);

    const form = e.currentTarget;
    const isValid = await handleErrors(form);

    if (!isValid) {
      console.log("Validation errors:", errorMessages);
      return;
    }

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.regEmail.value.trim();
    const phoneNumber = form.regPhone.value.trim();
    const password = form.regPassword.value;

    axios.post(
      `${API_BASE_URL}/api/auth/register`,
      { "email": email, "password": password, "firstName": firstName, "lastName": lastName, "roleType": role },
      { withCredentials: true }, 
    )
    .then(response => {
      console.log("Registration successful:", response.data);
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }

      navigate(role === 'host' ? '/host/dashboard' : '/dashboard');
    })
    .catch(error => {
      console.error("Registration error:", error);
      const backendMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessages([backendMessage]);
    });

  }

  return (
    <>
      <Navbar variant="login-only" />
      <main className="auth-main auth-center" style={{ paddingTop: '80px' }}>
        <div className="auth-form-card auth-form-card--wide">
          <div className="auth-form-header">
            <div className="auth-logo-mark">
              <span className="brand-n">N</span><span className="brand-rest">EXA</span>
            </div>
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-subtitle">It's free and takes less than a minute</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label>I want to…</label>
              <div className="role-toggle">
                <button type="button" className={`role-toggle-btn${role === 'renter' ? ' active' : ''}`} onClick={() => setRole('renter')}>
                  <i className="bi bi-car-front-fill"></i> Find Parking
                </button>
                <button type="button" className={`role-toggle-btn${role === 'host' ? ' active' : ''}`} onClick={() => setRole('host')}>
                  <i className="bi bi-house-fill"></i> List My Space
                </button>
              </div>
            </div>

            <div className="auth-field-row">
              <div className="auth-field">
                <label htmlFor="firstName">First name</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-person-fill auth-input-icon"></i>
                  <input type="text" id="firstName" className="form-control auth-input" placeholder="John" required />
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="lastName">Last name</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-person-fill auth-input-icon"></i>
                  <input type="text" id="lastName" className="form-control auth-input" placeholder="Doe" required />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="regEmail">Email address</label>
              <div className="auth-input-wrap">
                <i className="bi bi-envelope-fill auth-input-icon"></i>
                <input type="email" id="regEmail" className="form-control auth-input" placeholder="you@example.com" required />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="regPhone">Phone number <span className="auth-optional">(optional)</span></label>
              <div className="auth-input-wrap">
                <i className="bi bi-telephone-fill auth-input-icon"></i>
                <input type="tel" id="regPhone" className="form-control auth-input" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="regPassword">Password</label>
              <div className="auth-input-wrap">
                <i className="bi bi-lock-fill auth-input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="regPassword"
                  className="form-control auth-input"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="regConfirm">Confirm password</label>
              <div className="auth-input-wrap">
                <i className="bi bi-lock-fill auth-input-icon"></i>
                <input type="password" id="regConfirm" className="form-control auth-input" placeholder="Re-enter password" required />
              </div>
            </div>

            <div className="auth-terms">
              <input type="checkbox" id="agreeTerms" className="auth-checkbox" required />
              <label htmlFor="agreeTerms">
                I agree to the <Link to="/register">Terms of Service</Link> and <Link to="/register">Privacy Policy</Link>
              </label>
            </div>

            {errorMessages.length > 0 && (
              <div className="alert alert-danger" role="alert">
                <ul className="mb-0">
                  {errorMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
              </div>
            )}

            <button type="submit" className="btn btn-nexa w-100 auth-submit-btn">
              <i className="bi bi-person-plus-fill me-2"></i>Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </main>
    </>
  );
}
