import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const PENDING = [
  { id: 1, host: 'Kevin S.', listing: 'Pioneer Square Lot', submitted: 'Jun 5, 2025', type: 'Outdoor Lot' },
  { id: 2, host: 'Maria L.', listing: 'Belltown Garage Bay', submitted: 'Jun 4, 2025', type: 'Covered Garage' },
  { id: 3, host: 'Tom R.',   listing: 'SLU Driveway',        submitted: 'Jun 3, 2025', type: 'Driveway' },
  { id: 4, host: 'Aisha B.', listing: 'Queen Anne Spot',    submitted: 'Jun 1, 2025', type: 'Street' },
];

const REPORTS = [
  { id: 1, type: 'Inaccurate listing', reporter: 'Marcus T.', target: 'Capitol Hill Garage', date: 'Jun 7, 2025' },
  { id: 2, type: 'No-show host',       reporter: 'Priya M.',  target: 'Eastlake Driveway',   date: 'Jun 6, 2025' },
  { id: 3, type: 'Unsafe conditions',  reporter: 'James R.',  target: 'Fremont Lot',          date: 'Jun 5, 2025' },
];

export default function AdminDashboard() {
  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <h1 className="adm-page-title">Dashboard</h1>
          <p className="adm-page-sub">Overview of platform activity.</p>
        </div>

        {/* Stat tiles */}
        <div className="adm-stat-grid">
          {[
            { label: 'Total Users', value: '2,841', icon: 'bi-people-fill', color: '#6c5ce7', delta: '+12 today' },
            { label: 'Active Listings', value: '384', icon: 'bi-building', color: '#00e676', delta: '+3 today' },
            { label: 'Pending Verifications', value: '4', icon: 'bi-shield-exclamation', color: '#fdc841', delta: '2 urgent' },
            { label: 'Open Reports', value: '7', icon: 'bi-flag-fill', color: '#ff6b6b', delta: '3 unreviewed' },
          ].map(s => (
            <div key={s.label} className="adm-stat-tile">
              <div className="adm-stat-icon" style={{ background: `${s.color}1a` }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color }}></i>
              </div>
              <div>
                <p className="adm-stat-value">{s.value}</p>
                <p className="adm-stat-label">{s.label}</p>
                <p className="adm-stat-delta">{s.delta}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          {/* Pending verifications */}
          <div className="adm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="adm-card-title" style={{ margin: 0 }}>Pending Verifications</h3>
              <Link to="/admin/verification-queue" style={{ fontSize: '0.8rem', color: 'var(--nexa-primary)', textDecoration: 'none' }}>View all →</Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--nexa-border)', color: 'var(--nexa-gray-500)' }}>
                  <th style={{ padding: '0.4rem 0', textAlign: 'left', fontWeight: 600 }}>Listing</th>
                  <th style={{ padding: '0.4rem 0', textAlign: 'left', fontWeight: 600 }}>Host</th>
                  <th style={{ padding: '0.4rem 0', textAlign: 'left', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '0.4rem', textAlign: 'left', fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {PENDING.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--nexa-border)' }}>
                    <td style={{ padding: '0.5rem 0' }}>{p.listing}</td>
                    <td style={{ padding: '0.5rem 0', color: 'var(--nexa-gray-400)' }}>{p.host}</td>
                    <td style={{ padding: '0.5rem 0', color: 'var(--nexa-gray-400)', fontSize: '0.78rem' }}>{p.type}</td>
                    <td style={{ padding: '0.5rem 0.4rem' }}><Link to="/admin/listing-review" className="btn btn-nexa-outline btn-nexa-sm">Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent reports */}
          <div className="adm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="adm-card-title" style={{ margin: 0 }}>Recent Reports</h3>
              <Link to="/admin/reports" style={{ fontSize: '0.8rem', color: '#dc3545', textDecoration: 'none' }}>View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {REPORTS.map(r => (
                <div key={r.id} style={{ padding: '0.6rem', background: 'var(--nexa-bg)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{r.type}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--nexa-gray-500)' }}>{r.reporter} → {r.target}</p>
                  </div>
                  <Link to="/admin/report-review" className="btn btn-nexa-outline btn-nexa-sm">Review</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="adm-card" style={{ marginTop: '1.5rem' }}>
          <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'All Users', icon: 'bi-people', to: '/admin/users' },
              { label: 'Analytics', icon: 'bi-bar-chart-line', to: '/admin/analytics' },
              { label: 'Verification Queue', icon: 'bi-shield-check', to: '/admin/verification-queue' },
              { label: 'Reports', icon: 'bi-flag', to: '/admin/reports' },
              { label: 'Settings', icon: 'bi-gear', to: '/admin/settings' },
            ].map(q => (
              <Link key={q.label} to={q.to} className="btn btn-nexa-outline btn-nexa-sm">
                <i className={`bi ${q.icon} me-1`}></i>{q.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
