import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const TIMELINE = [
  { icon: 'bi-check-circle-fill', color: '#00e676', label: 'Booking Requested', sub: 'Jun 1, 2025 · 9:14 AM' },
  { icon: 'bi-check-circle-fill', color: '#00e676', label: 'Booking Approved by Host', sub: 'Jun 1, 2025 · 10:02 AM' },
  { icon: 'bi-check-circle-fill', color: '#00e676', label: 'Payment Received', sub: 'Jun 1, 2025 · 10:04 AM' },
  { icon: 'bi-circle', color: 'var(--nexa-gray-600)', label: 'Check-in', sub: 'Jun 2, 2025 · Expected 12:00 PM' },
  { icon: 'bi-circle', color: 'var(--nexa-gray-600)', label: 'Check-out', sub: 'Jun 8, 2025 · Expected 12:00 PM' },
];

export default function HostBookingDetails() {
  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <nav style={{ fontSize: '0.85rem', color: 'var(--nexa-gray-500)', marginBottom: '0.5rem' }}>
              <Link to="/host/bookings" style={{ color: 'var(--nexa-gray-500)', textDecoration: 'none' }}>Bookings</Link>
              <span style={{ margin: '0 0.4rem' }}>/</span>
              <span style={{ color: 'var(--nexa-gray-200)' }}>NXA‑2025‑48291</span>
            </nav>
            <h1 className="dash-page-title">Booking Details</h1>
            <p className="dash-page-sub">Reference: NXA‑2025‑48291</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Lessee profile */}
              <div className="dash-card lsr-lessee-profile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--nexa-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'var(--nexa-lsr)', border: '2px solid var(--nexa-lsr)', flexShrink: 0 }}>M</div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700 }}>Marcus Thompson</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', fontSize: '0.85rem', color: 'var(--nexa-gray-400)' }}>
                      <span><i className="bi bi-star-fill me-1" style={{ color: '#ffd700' }}></i>4.9 driver rating</span>
                      <span><i className="bi bi-car-front me-1"></i>12 trips</span>
                      <span><i className="bi bi-award me-1"></i>Verified driver</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <Link to="/host/messages" className="btn btn-nexa btn-nexa-sm"><i className="bi bi-chat-fill me-1"></i>Message Lessee</Link>
                </div>
              </div>

              {/* Listing card */}
              <div className="dash-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=160&q=60" alt="Listing" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8 }} />
                <div>
                  <h3 style={{ margin: '0 0 0.25rem', fontWeight: 700 }}>Capitol Hill Garage</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nexa-gray-400)' }}><i className="bi bi-geo-alt me-1"></i>123 Pike St, Seattle, WA 98122</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--nexa-gray-400)' }}><i className="bi bi-shield-lock me-1"></i>Covered Garage · Up to SUV</p>
                </div>
              </div>

              {/* Reservation grid */}
              <div className="dash-card">
                <h3 className="dash-card-title">Reservation</h3>
                <div className="lsr-res-grid">
                  {[
                    { label: 'Check-in', value: 'Jun 2, 2025' },
                    { label: 'Check-out', value: 'Jun 8, 2025' },
                    { label: 'Duration', value: '6 nights' },
                    { label: 'Vehicle', value: 'Toyota Camry (2021)' },
                    { label: 'License Plate', value: 'WA · ABC‑1234' },
                    { label: 'Status', value: 'Active' },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{item.label}</p>
                      <p style={{ fontWeight: 600, margin: 0 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {TIMELINE.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <i className={`${t.icon}`} style={{ color: t.color, fontSize: '1.1rem', marginTop: 2 }}></i>
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>{t.label}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{t.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Price breakdown */}
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Price Breakdown</h3>
                {[
                  { label: '$14.00 × 6 nights', value: '$84.00' },
                  { label: 'NEXA service fee', value: '−$8.40' },
                  { label: 'Payout to you', value: '$75.60', bold: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--nexa-border)' }}>
                    <span style={{ color: row.bold ? 'var(--nexa-gray-200)' : 'var(--nexa-gray-400)', fontWeight: row.bold ? 700 : 400, fontSize: '0.875rem' }}>{row.label}</span>
                    <span style={{ fontWeight: row.bold ? 700 : 600, color: row.bold ? 'var(--nexa-lsr)' : undefined }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ display: 'inline-block', padding: '0.25em 0.8em', borderRadius: 20, background: 'rgba(0,230,118,0.12)', color: '#00e676', fontSize: '0.78rem', fontWeight: 600 }}>Payment received</span>
                </div>
              </div>

              {/* Actions */}
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn btn-nexa w-100" style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)' }}>
                    <i className="bi bi-check2-circle me-2"></i>Approve
                  </button>
                  <button className="btn w-100" style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
                    <i className="bi bi-x-circle me-2"></i>Decline
                  </button>
                  <Link to="/host/messages" className="btn btn-nexa-outline w-100"><i className="bi bi-chat me-2"></i>Message Lessee</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
