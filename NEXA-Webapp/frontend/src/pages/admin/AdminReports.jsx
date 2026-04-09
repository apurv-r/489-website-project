import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const REPORTS = [
  { id: 1, type: 'Inaccurate listing',   reporter: 'Marcus T.', target: 'Capitol Hill Garage', targetType: 'Listing', date: 'Jun 7, 2025', status: 'Open' },
  { id: 2, type: 'No-show host',         reporter: 'Priya M.',  target: 'Eastlake Driveway',   targetType: 'Listing', date: 'Jun 6, 2025', status: 'Open' },
  { id: 3, type: 'Unsafe conditions',    reporter: 'James R.',  target: 'Fremont Lot',          targetType: 'Listing', date: 'Jun 5, 2025', status: 'Under Review' },
  { id: 4, type: 'Harassment',           reporter: 'Sarah K.',  target: 'David Lee',            targetType: 'User',    date: 'Jun 4, 2025', status: 'Resolved' },
  { id: 5, type: 'Payment dispute',      reporter: 'Tom R.',    target: 'Maria Lopez',          targetType: 'User',    date: 'May 28, 2025', status: 'Resolved' },
  { id: 6, type: 'Fraudulent listing',   reporter: 'Aisha B.',  target: 'SLU Driveway',        targetType: 'Listing', date: 'May 20, 2025', status: 'Closed' },
  { id: 7, type: 'Unauthorized access',  reporter: 'Nina B.',   target: 'Queen Anne Spot',     targetType: 'Listing', date: 'May 15, 2025', status: 'Closed' },
];

const STATUS_STYLE = {
  Open:          { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b' },
  'Under Review': { bg: 'rgba(253,200,65,0.12)',  color: '#fdc841' },
  Resolved:      { bg: 'rgba(0,230,118,0.12)',   color: '#00e676' },
  Closed:        { bg: 'rgba(160,160,176,0.12)', color: '#a0a0b0' },
};

export default function AdminReports() {
  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <h1 className="adm-page-title">Reports</h1>
          <p className="adm-page-sub">Review user and listing reports submitted on the platform.</p>
        </div>

        <div className="adm-card">
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--nexa-border)', color: 'var(--nexa-gray-500)' }}>
                {['Type','Reporter','Target','Kind','Date','Status',''].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REPORTS.map(r => {
                const st = STATUS_STYLE[r.status] || STATUS_STYLE.Closed;
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--nexa-border)' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>{r.type}</td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)' }}>{r.reporter}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{r.target}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <span style={{ padding: '0.2em 0.6em', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: r.targetType === 'Listing' ? 'rgba(108,92,231,0.12)' : 'rgba(116,185,255,0.12)', color: r.targetType === 'Listing' ? '#6c5ce7' : '#74b9ff' }}>{r.targetType}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)', fontSize: '0.8rem' }}>{r.date}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <span style={{ padding: '0.2em 0.7em', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: st.bg, color: st.color }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <Link to="/admin/report-review" className="btn btn-nexa-outline btn-nexa-sm">Review</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
