import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const BOOKINGS = [
  { id: 1, name: 'Marcus T.', dates: 'Jun 2 – Jun 8, 2025', amount: '$84.00', status: 'Active' },
  { id: 2, name: 'Sarah K.', dates: 'Jun 12 – Jun 15, 2025', amount: '$36.00', status: 'Upcoming' },
  { id: 3, name: 'James R.', dates: 'May 18 – May 25, 2025', amount: '$96.00', status: 'Completed' },
];

const STATUS_COLORS = { Active: '#00e676', Upcoming: '#6c5ce7', Completed: '#a0a0b0', Declined: '#ff6b6b' };

export default function HostListingDetails() {
  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <nav style={{ fontSize: '0.85rem', color: 'var(--nexa-gray-500)', marginBottom: '0.5rem' }}>
              <Link to="/host/my-listings" style={{ color: 'var(--nexa-gray-500)', textDecoration: 'none' }}>My Listings</Link>
              <span style={{ margin: '0 0.4rem' }}>/</span>
              <span style={{ color: 'var(--nexa-gray-200)' }}>Capitol Hill Garage</span>
            </nav>
            <h1 className="dash-page-title">Capitol Hill Garage</h1>
            <p className="dash-page-sub">123 Pike St, Seattle, WA 98122</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
            <div>
              {/* Gallery */}
              <div className="dash-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=60"
                  alt="Listing"
                  style={{ width: '100%', height: 280, objectFit: 'cover' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, padding: 4 }}>
                  {[1,2,3,4].map(i => (
                    <img key={i}
                      src={`https://images.unsplash.com/photo-150652178126${i}-d8422e82f27a?w=200&q=40`}
                      alt=""
                      style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 8 }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200&q=40'; }}
                    />
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
                <h3 className="dash-card-title">Listing Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginTop: '1rem' }}>
                  {[
                    { label: 'Type', value: 'Covered Garage' },
                    { label: 'Vehicle Size', value: 'Up to SUV' },
                    { label: 'Daily Rate', value: '$14.00/day' },
                    { label: 'Weekly Rate', value: '$80.00/wk' },
                    { label: 'Monthly Rate', value: '$250.00/mo' },
                    { label: 'Min. Duration', value: '1 day' },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{item.label}</p>
                      <p style={{ fontWeight: 600, margin: 0 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1.25rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', margin: '0 0 0.4rem' }}>Description</p>
                  <p style={{ color: 'var(--nexa-gray-300)', lineHeight: 1.6, margin: 0 }}>
                    Secure covered garage in the heart of Capitol Hill. 24/7 keycard access, well lit, EV charging available. Easy walking distance to restaurants, bars, and transit.
                  </p>
                </div>
              </div>

              {/* Bookings */}
              <div className="dash-card">
                <h3 className="dash-card-title">Bookings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  {BOOKINGS.map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--nexa-surface-2)', borderRadius: 10 }}>
                      <div>
                        <p style={{ fontWeight: 600, margin: 0 }}>{b.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{b.dates}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: 'var(--nexa-lsr)', margin: 0 }}>{b.amount}</p>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: STATUS_COLORS[b.status], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.status}</span>
                      </div>
                      <Link to="/host/booking-details" className="btn btn-nexa-outline btn-nexa-sm ms-3">View</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Status</h3>
                <span style={{ display: 'inline-block', padding: '0.35em 1em', borderRadius: 20, background: 'rgba(0,230,118,0.12)', color: '#00e676', fontWeight: 600, fontSize: '0.85rem' }}>Active</span>
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <Link to="/host/edit-listing" className="btn btn-nexa w-100"><i className="bi bi-pencil me-2"></i>Edit Listing</Link>
                  <Link to="/details" className="btn btn-nexa-outline w-100"><i className="bi bi-eye me-2"></i>View as Lessee</Link>
                  <Link to="/host/availability" className="btn btn-nexa-outline w-100"><i className="bi bi-calendar3 me-2"></i>Manage Availability</Link>
                </div>
              </div>

              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Stats</h3>
                {[
                  { label: 'Total bookings', value: '12' },
                  { label: 'Avg. rating', value: '4.9 ★' },
                  { label: 'Total earned', value: '$1,240' },
                  { label: 'Views this month', value: '148' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--nexa-border)' }}>
                    <span style={{ color: 'var(--nexa-gray-400)', fontSize: '0.875rem' }}>{s.label}</span>
                    <span style={{ fontWeight: 700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
