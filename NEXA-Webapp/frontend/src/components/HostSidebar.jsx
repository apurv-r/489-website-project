import { Link, useLocation } from 'react-router-dom';

export default function HostSidebar() {
  const { pathname } = useLocation();
  const active = (path) => pathname === path ? ' active' : '';

  return (
    <aside className="dash-sidebar lsr-page">
      <div className="dash-profile">
        <img src="https://i.pravatar.cc/80?img=33" className="dash-profile-avatar" alt="Host" />
        <div className="dash-profile-info">
          <div className="dash-profile-name">Marcus T.</div>
          <div className="dash-profile-role">
            Host · Lessor
            <span className="lsr-mode-pill ms-1">Host Mode</span>
          </div>
        </div>
      </div>
      <nav className="dash-nav">
        <Link to="/" className="dash-nav-link"><i className="bi bi-house"></i> NEXA Home</Link>
        <Link to="/search" className="dash-nav-link"><i className="bi bi-search"></i> Search Listings</Link>
        <div className="dash-nav-divider"></div>
        <Link to="/host/dashboard" className={`dash-nav-link${active('/host/dashboard')}`}>
          <i className="bi bi-grid-1x2-fill"></i> Overview
        </Link>
        <Link to="/host/my-listings" className={`dash-nav-link${active('/host/my-listings')}`}>
          <i className="bi bi-card-list"></i> My Listings
        </Link>
        <Link to="/host/bookings" className={`dash-nav-link${active('/host/bookings')}`}>
          <i className="bi bi-calendar2-check"></i> Bookings
        </Link>
        <Link to="/host/earnings" className={`dash-nav-link${active('/host/earnings')}`}>
          <i className="bi bi-cash-stack"></i> Earnings
        </Link>
        <Link to="/host/messages" className={`dash-nav-link${active('/host/messages')}`}>
          <i className="bi bi-chat-dots-fill"></i> Messages
          <span className="dash-nav-badge">3</span>
        </Link>
        <div className="dash-nav-divider"></div>
        <Link to="/settings" className={`dash-nav-link${active('/settings')}`}>
          <i className="bi bi-gear-fill"></i> Settings
        </Link>
        <Link to="/login" className="dash-nav-link dash-nav-logout">
          <i className="bi bi-box-arrow-right"></i> Log Out
        </Link>
      </nav>
    </aside>
  );
}
