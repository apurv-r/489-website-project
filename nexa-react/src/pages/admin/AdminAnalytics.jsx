import AdminSidebar from '../../components/AdminSidebar';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const BOOKINGS_DATA = [120, 148, 165, 190, 210, 238];
const LISTINGS_DATA = [30, 38, 45, 52, 61, 74];
const USERS_DATA    = [340, 420, 510, 650, 780, 920];
const MAX_BOOKING = Math.max(...BOOKINGS_DATA);

export default function AdminAnalytics() {
  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-header">
          <h1 className="adm-page-title">Analytics</h1>
          <p className="adm-page-sub">Platform growth and usage metrics.</p>
        </div>

        {/* Stat tiles */}
        <div className="adm-stat-grid" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Revenue',   value: '$48,210',  icon: 'bi-cash-stack',       color: '#00e676' },
            { label: 'Total Bookings',  value: '1,071',    icon: 'bi-calendar-check',   color: '#6c5ce7' },
            { label: 'Avg. Booking Val', value: '$45.01',  icon: 'bi-graph-up-arrow',   color: '#fdc841' },
            { label: 'New Users (Jun)', value: '140',      icon: 'bi-person-plus-fill', color: '#74b9ff' },
          ].map(s => (
            <div key={s.label} className="adm-stat-tile">
              <div className="adm-stat-icon" style={{ background: `${s.color}1a` }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color }}></i>
              </div>
              <div>
                <p className="adm-stat-value">{s.value}</p>
                <p className="adm-stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Booking chart */}
        <div className="adm-card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="adm-card-title" style={{ marginBottom: '1.25rem' }}>Monthly Bookings</h3>
          <div className="adm-chart-wrap" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 160 }}>
            {MONTHS.map((m, i) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--nexa-gray-500)' }}>{BOOKINGS_DATA[i]}</span>
                <div style={{ width: '100%', height: `${(BOOKINGS_DATA[i] / MAX_BOOKING) * 130}px`, background: 'linear-gradient(180deg, #6c5ce7, rgba(108,92,231,0.3))', borderRadius: '6px 6px 0 0' }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)' }}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two column charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="adm-card">
            <h3 className="adm-card-title" style={{ marginBottom: '1.25rem' }}>New Listings per Month</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 100 }}>
              {MONTHS.map((m, i) => (
                <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--nexa-gray-500)' }}>{LISTINGS_DATA[i]}</span>
                  <div style={{ width: '80%', height: `${(LISTINGS_DATA[i] / Math.max(...LISTINGS_DATA)) * 80}px`, background: 'linear-gradient(180deg, #00e676, rgba(0,230,118,0.3))', borderRadius: '4px 4px 0 0' }}></div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--nexa-gray-500)' }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-card">
            <h3 className="adm-card-title" style={{ marginBottom: '1.25rem' }}>User Growth</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 100 }}>
              {MONTHS.map((m, i) => (
                <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--nexa-gray-500)' }}>{USERS_DATA[i]}</span>
                  <div style={{ width: '80%', height: `${(USERS_DATA[i] / Math.max(...USERS_DATA)) * 80}px`, background: 'linear-gradient(180deg, #fdc841, rgba(253,200,65,0.3))', borderRadius: '4px 4px 0 0' }}></div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--nexa-gray-500)' }}>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top listings table */}
        <div className="adm-card" style={{ marginTop: '1.5rem' }}>
          <h3 className="adm-card-title" style={{ marginBottom: '1rem' }}>Top Listings by Bookings</h3>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--nexa-border)', color: 'var(--nexa-gray-500)' }}>
                {['Listing','Host','City','Bookings','Total Earned','Avg Rating'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Capitol Hill Garage', host: 'Kevin S.', city: 'Seattle', bookings: 42, earned: '$1,960', rating: '4.9' },
                { name: 'Downtown Lot A', host: 'Maria L.', city: 'Seattle', bookings: 38, earned: '$1,710', rating: '4.8' },
                { name: 'Belltown Bay', host: 'Tom R.', city: 'Seattle', bookings: 31, earned: '$1,240', rating: '4.7' },
                { name: 'SLU Driveway', host: 'Aisha B.', city: 'Seattle', bookings: 27, earned: '$945', rating: '4.9' },
              ].map(r => (
                <tr key={r.name} style={{ borderBottom: '1px solid var(--nexa-border)' }}>
                  <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600 }}>{r.name}</td>
                  <td style={{ padding: '0.55rem 0.5rem', color: 'var(--nexa-gray-400)' }}>{r.host}</td>
                  <td style={{ padding: '0.55rem 0.5rem', color: 'var(--nexa-gray-400)' }}>{r.city}</td>
                  <td style={{ padding: '0.55rem 0.5rem' }}>{r.bookings}</td>
                  <td style={{ padding: '0.55rem 0.5rem', color: '#00e676', fontWeight: 600 }}>{r.earned}</td>
                  <td style={{ padding: '0.55rem 0.5rem' }}><i className="bi bi-star-fill me-1" style={{ color: '#ffd700', fontSize: '0.75rem' }}></i>{r.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
