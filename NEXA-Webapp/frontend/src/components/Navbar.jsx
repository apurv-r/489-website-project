import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ variant = 'public' }) {
  const location = useLocation();

  useEffect(() => {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (variant === 'login-only') {
    return (
      <nav className="navbar navbar-expand-lg navbar-nexa fixed-top" id="mainNav">
        <div className="container-fluid px-4">
          <Link className="navbar-brand" to="/">
            <span className="brand-n">N</span><span className="brand-rest">EXA</span>
          </Link>
          <div className="d-flex gap-2 ms-auto">
            <Link to="/login" className="btn btn-nexa-outline btn-nexa-sm">Log In</Link>
          </div>
        </div>
      </nav>
    );
  }

  if (variant === 'signup-only') {
    return (
      <nav className="navbar navbar-expand-lg navbar-nexa fixed-top" id="mainNav">
        <div className="container-fluid px-4">
          <Link className="navbar-brand" to="/">
            <span className="brand-n">N</span><span className="brand-rest">EXA</span>
          </Link>
          <div className="d-flex gap-2 ms-auto">
            <Link to="/register" className="btn btn-nexa btn-nexa-sm">Sign Up</Link>
          </div>
        </div>
      </nav>
    );
  }

  if (variant === 'dashboard') {
    return (
      <nav className="navbar navbar-expand-lg navbar-nexa fixed-top" id="mainNav">
        <div className="container-fluid px-4">
          <Link className="navbar-brand" to="/">
            <span className="brand-n">N</span><span className="brand-rest">EXA</span>
          </Link>
          <button className="navbar-toggler border-0 text-white" type="button"
            data-bs-toggle="collapse" data-bs-target="#navMenu">
            <i className="bi bi-list fs-4"></i>
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item ms-4"><Link className="nav-link" to="/search">Search Listings</Link></li>
            </ul>
            <div className="d-flex gap-2 align-items-center">
              <Link to="/messages" className="dash-nav-icon" title="Messages">
                <i className="bi bi-chat-dots"></i>
              </Link>
              <div className="dash-avatar-btn">
                <img src="https://i.pravatar.cc/40?img=14" alt="Avatar" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // default public navbar
  return (
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
              <Link className={`nav-link${location.pathname === '/' ? ' active' : ''}`} to="/">Home</Link>
            </li>
            <li className="nav-item ms-4">
              <Link className={`nav-link${location.pathname === '/search' ? ' active' : ''}`} to="/search">Search Listings</Link>
            </li>
          </ul>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-nexa-outline btn-nexa-sm">Log In</Link>
            <Link to="/register" className="btn btn-nexa btn-nexa-sm">Sign Up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
