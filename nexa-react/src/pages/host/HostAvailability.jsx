import { useState } from 'react';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAME = 'June 2025';

// Correct: June 2025 starts on Sunday; 30 days
const JUNE_CELLS = (() => {
  const cells = [];
  const startDow = 0; // Sunday
  for (let i = 0; i < startDow; i++) cells.push({ date: null, status: 'empty' });
  for (let d = 1; d <= 30; d++) {
    const booked = [3,4,5,9,10,11,12,20,21].includes(d);
    const blocked = [15,16,22].includes(d);
    cells.push({ date: d, status: booked ? 'booked' : blocked ? 'blocked' : 'available' });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, status: 'empty' });
  return cells;
})();

const STATUS_STYLE = {
  available: { bg: 'rgba(0,230,118,0.15)', color: '#00e676', border: 'rgba(0,230,118,0.3)' },
  booked:    { bg: 'rgba(108,92,231,0.15)', color: '#6c5ce7', border: 'rgba(108,92,231,0.3)' },
  blocked:   { bg: 'rgba(255,107,107,0.15)', color: '#ff6b6b', border: 'rgba(255,107,107,0.3)' },
  empty:     { bg: 'transparent', color: 'transparent', border: 'transparent' },
};

export default function HostAvailability() {
  const [selectedListing, setSelectedListing] = useState('Capitol Hill Garage');

  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <h1 className="dash-page-title">Availability</h1>
            <p className="dash-page-sub">Manage open, blocked, and booked dates for your listings.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
            {/* Calendar */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <button className="btn btn-nexa-outline btn-nexa-sm"><i className="bi bi-chevron-left"></i></button>
                <h3 style={{ margin: 0, fontWeight: 700 }}>{MONTH_NAME}</h3>
                <button className="btn btn-nexa-outline btn-nexa-sm"><i className="bi bi-chevron-right"></i></button>
              </div>

              <div className="dash-card">
                {/* Day headers */}
                <div className="lsr-cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '0.5rem' }}>
                  {DAYS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--nexa-gray-500)', padding: '0.3rem 0' }}>{d}</div>
                  ))}
                </div>
                {/* Cells */}
                <div className="lsr-cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                  {JUNE_CELLS.map((cell, i) => {
                    const st = STATUS_STYLE[cell.status];
                    return (
                      <div
                        key={i}
                        style={{
                          aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: cell.date ? 'pointer' : 'default',
                          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                        }}
                      >
                        {cell.date || ''}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--nexa-border)', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Available', ...STATUS_STYLE.available },
                    { label: 'Booked', ...STATUS_STYLE.booked },
                    { label: 'Blocked', ...STATUS_STYLE.blocked },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div style={{ width: 14, height: 14, borderRadius: 4, background: l.bg, border: `1px solid ${l.border}` }}></div>
                      <span style={{ color: 'var(--nexa-gray-400)' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Listing</h3>
                <select className="lsr-input" value={selectedListing} onChange={e => setSelectedListing(e.target.value)}>
                  <option>Capitol Hill Garage</option>
                  <option>Eastlake Driveway</option>
                  <option>Fremont Covered Lot</option>
                </select>
              </div>

              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Block Dates</h3>
                <div className="lsr-form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="lsr-label">Start date</label>
                  <input type="date" className="lsr-input" />
                </div>
                <div className="lsr-form-group" style={{ marginBottom: '1rem' }}>
                  <label className="lsr-label">End date</label>
                  <input type="date" className="lsr-input" />
                </div>
                <button className="btn btn-nexa w-100" style={{ marginBottom: '0.75rem' }}>Block Dates</button>
                <p style={{ fontSize: '0.78rem', color: 'var(--nexa-gray-600)', margin: 0, textAlign: 'center' }}>Blocked dates won't accept new bookings.</p>
              </div>

              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Available Days</h3>
                {DAYS.map(d => (
                  <label key={d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--nexa-border)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.875rem' }}>{d}</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--nexa-lsr)' }} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
