import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function LesseeSidebar(user) {
  const active = (path) => window.location.pathname === path ? ' active' : '';
  const navigate = useNavigate();

  async function handleLogout(e) {
      e.preventDefault();
      // Call logout API
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, 
          { withCredentials: true })
          .then(response => {
              if (response.status === 204) {
                  console.log("successfully logged out");
              }
          })
          .catch(error => {
              console.log(error);
          })
          .finally(() => {
              window.dispatchEvent(new Event('auth-changed'));
              navigate("/login");
          });
  }

  // this function fires on page refresh/ initial load
  useEffect(() => {
  }, [])

  return (
    <aside className="dash-sidebar">
      <div className="dash-profile">
        <img src={user?.profilePictureUrl || 'https://i.pravatar.cc/80?img=33'} className="dash-profile-avatar" alt="User" />
        <div className="dash-profile-info">
          <div className="dash-profile-name">{user.firstName} {user.lastName}</div>
          <div className="dash-profile-role">Driver · Lessee</div>
        </div>
      </div>
      <nav className="dash-nav">
        <Link to="/dashboard" className={`dash-nav-link${active('/dashboard')}`}>
          <i className="bi bi-grid-1x2-fill"></i> Overview
        </Link>
        <Link to="/my-bookings" className={`dash-nav-link${active('/my-bookings')}`}>
          <i className="bi bi-calendar2-check"></i> My Bookings
        </Link>
        <Link to="/favorites" className={`dash-nav-link${active('/favorites')}`}>
          <i className="bi bi-heart-fill"></i> Favorites
        </Link>
        <Link to="/messages" className={`dash-nav-link${active('/messages')}`}>
          <i className="bi bi-chat-dots-fill"></i> Messages
          <span className="dash-nav-badge">{user.messageCount}</span>
        </Link>
        <Link to="/search" className={`dash-nav-link${active('/search')}`}>
          <i className="bi bi-search"></i> Find Parking
        </Link>
        <div className="dash-nav-divider"></div>
        <Link to="/settings" className={`dash-nav-link${active('/settings')}`}>
          <i className="bi bi-gear-fill"></i> Settings
        </Link>
        <Link to="/login" className="dash-nav-link dash-nav-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Log Out
        </Link>
      </nav>
    </aside>
  );
}
