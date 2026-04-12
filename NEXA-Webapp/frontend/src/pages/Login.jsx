import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        if (isMounted && response.status === 200) {
          if (response.data?.user.roleType === "Renter") {
            navigate("/dashboard", { replace: true });
          } else if (response.data?.user.roleType === "Host") {
            navigate("/host/dashboard", { replace: true });
          }
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    const form = e.currentTarget;
    const email = form.loginEmail.value.trim();
    const password = form.loginPassword.value;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      // Transitional support: backend still returns a JWT for non-cookie clients.
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }
      console.log("hello from login");
      navigate("/dashboard");
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        "Login failed. Check your email and password.";
      setErrorMessage(backendMessage);
    }
  }

  return (
    <>
      <Navbar variant="signup-only" />
      <main className="auth-main auth-center" style={{ paddingTop: "80px" }}>
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-logo-mark">
              <span className="brand-n">N</span>
              <span className="brand-rest">EXA</span>
            </div>
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">Log in to your NEXA account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="loginEmail">Email address</label>
              <div className="auth-input-wrap">
                <i className="bi bi-envelope-fill auth-input-icon"></i>
                <input
                  type="email"
                  id="loginEmail"
                  className="form-control auth-input"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="auth-field" style={{ marginBottom: "1.5rem" }}>
              <div className="auth-label-row">
                <label htmlFor="loginPassword">Password</label>
              </div>
              <div className="auth-input-wrap">
                <i className="bi bi-lock-fill auth-input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="loginPassword"
                  className="form-control auth-input"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password"
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}
                  ></i>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-nexa w-100 auth-submit-btn"
            >
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
