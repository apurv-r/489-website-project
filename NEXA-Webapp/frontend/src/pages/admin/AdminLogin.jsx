import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("adm-page");

    let isMounted = true;

    async function checkSession() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        if (!isMounted) {
          return;
        }

        if (response.data?.user?.roleType === "Admin") {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch {
        if (!isMounted) {
          return;
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
      document.body.classList.remove("adm-page");
    };
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email: email.trim(), password },
        { withCredentials: true },
      );

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data?.user?.roleType !== "Admin") {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
        localStorage.removeItem("token");
        throw new Error("Admin access only.");
      }

      window.dispatchEvent(new Event("auth-changed"));
      navigate("/admin/dashboard", { replace: true });
    } catch (requestError) {
      setErrorMessage(
        requestError.response?.data?.message ||
          requestError.message ||
          "Invalid admin credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="text-center mb-4">
          <div className="adm-login-brand-row">
            <span className="adm-login-logo">NEXA</span>
            <span className="adm-login-badge">Admin</span>
          </div>
          <p className="adm-login-subtitle">Restricted access. Authorised personnel only.</p>
        </div>

        <form className="adm-login-form" onSubmit={handleSubmit}>
          <div className="adm-login-field">
            <label className="adm-login-label" htmlFor="adminEmail">
              Admin Email
            </label>
            <input
              id="adminEmail"
              type="email"
              className="adm-login-input"
              placeholder="admin@nexa.io"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="adm-login-field">
            <label className="adm-login-label" htmlFor="adminPassword">
              Password
            </label>
            <div className="adm-login-input-wrap">
              <input
                id="adminPassword"
                type={showPw ? "text" : "password"}
                className="adm-login-input adm-login-input--icon"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="adm-login-toggle"
                onClick={() => setShowPw((value) => !value)}
                aria-label="Toggle password visibility"
              >
                <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 mb-0" role="alert">
              {errorMessage}
            </div>
          )}

          <button type="submit" className="adm-login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-shield-lock me-2"></i>Sign In to Admin Portal
              </>
            )}
          </button>
        </form>

        <div className="adm-login-divider"></div>

        <div className="adm-login-footer">
          <i className="bi bi-shield-lock me-1"></i>Secured Login Portal &nbsp;·&nbsp;
          <Link to="/" className="adm-login-back">
            Back to NEXA
          </Link>
        </div>
      </div>
    </main>
  );
}
