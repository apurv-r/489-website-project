import { Link, useLocation } from 'react-router-dom';

export default function LesseeSidebar() {
  const { pathname } = useLocation();
  const active = (path) => pathname === path ? ' active' : '';

  return (
    <aside className="dash-sidebar">
      <div className="dash-profile">
        <img src="https://i.pravatar.cc/80?img=14" className="dash-profile-avatar" alt="User" />
        <div className="dash-profile-info">
          <div className="dash-profile-name">Alex Johnson</div>
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
          <span className="dash-nav-badge">2</span>
        </Link>
        <Link to="/search" className={`dash-nav-link${active('/search')}`}>
          <i className="bi bi-search"></i> Find Parking
        </Link>
        <div className="dash-nav-divider"></div>
        <Link to="/login" className="dash-nav-link dash-nav-logout">
          <i className="bi bi-box-arrow-right"></i> Log Out
        </Link>
      </nav>
    </aside>
  );
}
