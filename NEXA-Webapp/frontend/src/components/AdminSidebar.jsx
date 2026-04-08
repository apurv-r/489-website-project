import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const active = (path) => pathname === path ? ' active' : '';

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-brand">
        <span className="brand-n">N</span><span className="brand-rest">EXA</span>
        <span className="ms-2 badge bg-danger" style={{ fontSize: '0.65rem' }}>Admin</span>
      </div>
      <nav className="adm-nav">
        <div className="adm-nav-label">Platform</div>
        <Link to="/admin/dashboard" className={`adm-nav-link${active('/admin/dashboard')}`}>
          <i className="bi bi-grid-1x2-fill"></i> Dashboard
        </Link>
        <Link to="/admin/analytics" className={`adm-nav-link${active('/admin/analytics')}`}>
          <i className="bi bi-bar-chart-fill"></i> Analytics
        </Link>
        <div className="adm-nav-label mt-3">Moderation</div>
        <Link to="/admin/verification-queue" className={`adm-nav-link${active('/admin/verification-queue')}`}>
          <i className="bi bi-shield-check"></i> Verification Queue
          <span className="adm-nav-badge">4</span>
        </Link>
        <Link to="/admin/reports" className={`adm-nav-link${active('/admin/reports')}`}>
          <i className="bi bi-flag-fill"></i> Reports
          <span className="adm-nav-badge">7</span>
        </Link>
        <div className="adm-nav-label mt-3">Management</div>
        <Link to="/admin/users" className={`adm-nav-link${active('/admin/users')}`}>
          <i className="bi bi-people-fill"></i> Users
        </Link>
        <Link to="/admin/settings" className={`adm-nav-link${active('/admin/settings')}`}>
          <i className="bi bi-gear-fill"></i> Settings
        </Link>
        <div className="adm-nav-label mt-3">Account</div>
        <Link to="/admin/login" className="adm-nav-link">
          <i className="bi bi-box-arrow-right"></i> Log Out
        </Link>
      </nav>
    </aside>
  );
}
