import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const ALL_BOOKINGS = [
  { id: 1, guest: 'Marcus T.', listing: 'Capitol Hill Garage', dates: 'Jun 2 – Jun 8, 2025', amount: '$84.00', status: 'Active' },
  { id: 2, guest: 'Sarah K.', listing: 'Capitol Hill Garage', dates: 'Jun 12 – Jun 15, 2025', amount: '$36.00', status: 'Upcoming' },
  { id: 3, guest: 'James R.', listing: 'Eastlake Driveway', dates: 'May 18 – May 25, 2025', amount: '$96.00', status: 'Completed' },
  { id: 4, guest: 'Priya M.', listing: 'Eastlake Driveway', dates: 'May 1 – May 5, 2025', amount: '$48.00', status: 'Completed' },
  { id: 5, guest: 'David L.', listing: 'Fremont Covered Lot', dates: 'Apr 22 – Apr 30, 2025', amount: '$88.00', status: 'Completed' },
  { id: 6, guest: 'Nina B.', listing: 'Capitol Hill Garage', dates: 'Apr 10 – Apr 12, 2025', amount: '$28.00', status: 'Declined' },
];

const FILTERS = ['All', 'Active', 'Upcoming', 'Completed', 'Declined'];
const STATUS_STYLES = {
  Active:    { bg: 'rgba(0,230,118,0.12)',   color: '#00e676' },
  Upcoming:  { bg: 'rgba(108,92,231,0.12)',  color: '#6c5ce7' },
  Completed: { bg: 'rgba(160,160,176,0.12)', color: '#a0a0b0' },
  Declined:  { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b' },
};

export default function HostBookings() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? ALL_BOOKINGS : ALL_BOOKINGS.filter(b => b.status === filter);

  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <h1 className="dash-page-title">Bookings</h1>
            <p className="dash-page-sub">View and manage reservations for your listings.</p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.4em 1.1em', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap',
                  background: filter === f ? 'var(--nexa-lsr)' : 'var(--nexa-surface-2)',
                  color: filter === f ? '#0a0a0f' : 'var(--nexa-gray-400)',
                }}
              >
                {f} {f !== 'All' && <span style={{ marginLeft: 4, opacity: 0.75 }}>({ALL_BOOKINGS.filter(b => b.status === f).length})</span>}
              </button>
            ))}
          </div>

          {/* Bookings list */}
          <div className="dash-card">
            {filtered.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--nexa-gray-500)', padding: '2rem' }}>No {filter.toLowerCase()} bookings.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filtered.map(b => {
                  const st = STATUS_STYLES[b.status];
                  return (
                    <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--nexa-surface-2)', borderRadius: 10 }}>
                      <div>
                        <p style={{ fontWeight: 600, margin: 0 }}>{b.guest}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{b.listing}</p>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--nexa-gray-400)', margin: 0 }}>{b.dates}</p>
                      <p style={{ fontWeight: 700, color: 'var(--nexa-lsr)', margin: 0 }}>{b.amount}</p>
                      <span style={{ padding: '0.25em 0.8em', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{b.status}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to="/host/booking-details" className="btn btn-nexa-outline btn-nexa-sm">View</Link>
                        <Link to="/host/messages" className="btn btn-nexa-outline btn-nexa-sm"><i className="bi bi-chat-fill"></i></Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
