import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const QUEUE = [
  { id: 1, host: 'Kevin S.',  listing: 'Pioneer Square Lot',  type: 'Outdoor Lot',     city: 'Seattle', submitted: 'Jun 5, 2025', priority: 'High' },
  { id: 2, host: 'Maria L.',  listing: 'Belltown Garage Bay', type: 'Covered Garage',  city: 'Seattle', submitted: 'Jun 4, 2025', priority: 'Medium' },
  { id: 3, host: 'Tom R.',    listing: 'SLU Driveway',        type: 'Driveway',        city: 'Seattle', submitted: 'Jun 3, 2025', priority: 'Low' },
  { id: 4, host: 'Aisha B.',  listing: 'Queen Anne Spot',     type: 'Street',          city: 'Seattle', submitted: 'Jun 1, 2025', priority: 'Medium' },
];

const PRIORITY_STYLE = {
  High:   { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b' },
  Medium: { bg: 'rgba(253,200,65,0.12)',  color: '#fdc841' },
  Low:    { bg: 'rgba(160,160,176,0.12)', color: '#a0a0b0' },
};

export default function AdminVerificationQueue() {
  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <h1 className="adm-page-title">Verification Queue</h1>
          <p className="adm-page-sub">Review and approve new listing submissions.</p>
        </div>

        <div className="adm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--nexa-gray-500)' }}>{QUEUE.length} listings awaiting review</span>
          </div>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--nexa-border)', color: 'var(--nexa-gray-500)' }}>
                {['Listing','Host','Type','City','Submitted','Priority',''].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {QUEUE.map(q => {
                const st = PRIORITY_STYLE[q.priority];
                return (
                  <tr key={q.id} style={{ borderBottom: '1px solid var(--nexa-border)' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>{q.listing}</td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)' }}>{q.host}</td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)', fontSize: '0.8rem' }}>{q.type}</td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)' }}>{q.city}</td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--nexa-gray-400)', fontSize: '0.8rem' }}>{q.submitted}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <span style={{ padding: '0.2em 0.7em', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: st.bg, color: st.color }}>{q.priority}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <Link to="/admin/listing-review" className="btn btn-nexa-outline btn-nexa-sm">Review</Link>
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
