import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const ACTIVITY = [
  { date: 'Jun 8, 2025',  action: 'Account created',          by: 'System' },
  { date: 'Jun 10, 2025', action: 'Email verified',            by: 'User' },
  { date: 'Jun 12, 2025', action: 'First booking completed',   by: 'System' },
  { date: 'Jun 14, 2025', action: 'Report submitted against user', by: 'Admin: J. Smith' },
  { date: 'Jun 15, 2025', action: 'Warning issued',            by: 'Admin: J. Smith' },
];

export default function AdminUserDetail() {
  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <nav style={{ fontSize: '0.85rem', color: 'var(--nexa-gray-500)', marginBottom: '0.5rem' }}>
            <Link to="/admin/users" style={{ color: 'var(--nexa-gray-500)', textDecoration: 'none' }}>Users</Link>
            <span style={{ margin: '0 0.4rem' }}>/</span>
            <span style={{ color: 'var(--nexa-gray-200)' }}>David Lee</span>
          </nav>
          <h1 className="adm-page-title">User Detail</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Profile card */}
            <div className="adm-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(253,200,65,0.12)', border: '2px solid rgba(253,200,65,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fdc841', flexShrink: 0 }}>D</div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 700 }}>David Lee</h2>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--nexa-gray-400)' }}>david@email.com</p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.2em 0.7em', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(116,185,255,0.12)', color: '#74b9ff' }}>Driver</span>
                    <span style={{ padding: '0.2em 0.7em', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(255,107,107,0.12)', color: '#ff6b6b' }}>Suspended</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginTop: '1.25rem' }}>
                {[
                  { label: 'Joined', value: 'May 1, 2025' },
                  { label: 'Total Bookings', value: '2' },
                  { label: 'Reports Against', value: '1' },
                  { label: 'Driver Rating', value: '3.2 ★' },
                  { label: 'Last Active', value: 'Jun 7, 2025' },
                  { label: 'Verified Email', value: 'Yes' },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{s.label}</p>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderation log */}
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '1.25rem' }}>Activity Log</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.6rem', background: 'var(--nexa-bg)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', whiteSpace: 'nowrap', width: 100 }}>{a.date}</span>
                    <span style={{ flex: 1, fontSize: '0.875rem' }}>{a.action}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', whiteSpace: 'nowrap' }}>{a.by}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Admin Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn w-100" style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-check2-circle me-2"></i>Reinstate Account
                </button>
                <button className="btn w-100" style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-slash-circle me-2"></i>Suspend Account
                </button>
                <button className="btn w-100" style={{ background: 'rgba(253,200,65,0.12)', color: '#fdc841', border: '1px solid rgba(253,200,65,0.3)', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>Issue Warning
                </button>
                <button className="btn w-100" style={{ background: 'rgba(220,53,69,0.12)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.3)', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="bi bi-trash me-2"></i>Delete Account
                </button>
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Add Note</h3>
              <textarea rows={4} placeholder="Internal moderation note…" style={{ width: '100%', background: 'var(--nexa-bg)', border: '1px solid var(--nexa-border)', borderRadius: 8, padding: '0.6rem 0.75rem', color: 'var(--nexa-gray-200)', resize: 'vertical', fontSize: '0.875rem', boxSizing: 'border-box' }}></textarea>
              <button className="btn btn-nexa w-100" style={{ marginTop: '0.75rem' }}>Save Note</button>
            </div>

            <Link to="/admin/users" className="btn btn-nexa-outline w-100"><i className="bi bi-arrow-left me-1"></i>Back to Users</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
