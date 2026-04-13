import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthBox from './authBox';
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Navbar() {
 const location = useLocation();
const active = (path) => location.pathname === path ? ' active' : '';

  const [isSession, setIsSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("");
  const [dashboardLink, setDashboardLink] = useState("/dashboard");


  function handleAuthAction(action) {
    if (action === 'logout') {
      setIsSession(false);
      setRole('');
      setDashboardLink('/dashboard');
    }
  }

  async function checkSession() {
    axios.get(`${API_BASE_URL}/api/auth/me`, {
      withCredentials: true,
    })
    .then(response => {
      if (response.status === 200) {
        setIsSession(true);
        setRole(response.data.user.roleType);    
      }
    })
    .catch(error => {
      setIsSession(false);
      setRole('');
      if (error?.response?.status !== 401) {
        console.log(error);
      }
    })
    .finally(() => {
      setIsLoading(false);
    });
  }

  useEffect(() => {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    checkSession();

    const onAuthChanged = () => {
      checkSession();
    };

    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, [location.pathname]);

  useEffect(() => {
    if (role === "Renter") {
      setDashboardLink("/dashboard");
    } else if (role === "Host") {
      setDashboardLink("/host/dashboard");
    }
  }, [role]);

  // default public navbar
  return ( !isLoading &&
    <nav className="navbar navbar-expand-lg navbar-nexa fixed-top" id="mainNav">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <span className="brand-n">N</span><span className="brand-rest">EXA</span>
        </Link>
        <button className="navbar-toggler border-0 text-white" type="button"
          data-bs-toggle="collapse" data-bs-target="#navMenu">
          <i className="bi bi-list fs-4"></i>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link${active('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item ms-4">
              <Link className={`nav-link${active('/search')}`} to="/search">Search Listings</Link>
            </li>
            {( isSession &&
              <li className="nav-item ms-4">
                <Link className={`nav-link${active('/dashboard')}`} to={dashboardLink}>Dashboard</Link>
              </li>
            )}
          </ul>
          <div className="d-flex gap-2">
            {/* {(!isSession && <AuthBox/>) || <Link to={dashboardLink} className="btn btn-nexa-outline btn-nexa-sm">Dashboard</Link> } */}
            <AuthBox isSession={isSession} onAuthAction={handleAuthAction} />
          </div>
        </div>
      </div>
    </nav>
  );
}

