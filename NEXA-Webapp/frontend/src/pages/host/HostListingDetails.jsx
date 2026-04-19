import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_COLORS = {
  active:    '#00e676',
  approved:  '#00b8ff',
  pending:   '#6c5ce7',
  completed: '#a0a0b0',
  declined:  '#ff6b6b',
  cancelled: '#ff6b6b',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HostListingDetails() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [listing, setListing] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No listing ID provided.');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        const [listingRes, bookingsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/parking-spaces/${id}`, { withCredentials: true, headers }),
          axios.get(`${API_BASE_URL}/api/bookings/me`, { withCredentials: true, headers }),
        ]);

        setListing(listingRes.data);
        const spaceBookings = (bookingsRes.data || []).filter(
          b => b.parkingSpace?._id === id || b.parkingSpace === id
        );
        setBookings(spaceBookings);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="dash-page lsr-page">
        <Navbar variant="dashboard" />
        <div className="dash-layout">
          <HostSidebar />
          <main className="dash-main">
            <p style={{ color: 'var(--nexa-gray-400)', padding: '2rem' }}>Loading…</p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="dash-page lsr-page">
        <Navbar variant="dashboard" />
        <div className="dash-layout">
          <HostSidebar />
          <main className="dash-main">
            <p style={{ color: '#ff6b6b', padding: '2rem' }}>{error || 'Listing not found.'}</p>
          </main>
        </div>
      </div>
    );
  }

  const address = [listing.location?.address, listing.location?.city, listing.location?.state, listing.location?.zipCode]
    .filter(Boolean).join(', ');

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
              <span style={{ color: 'var(--nexa-gray-200)' }}>{listing.title}</span>
            </nav>
            <h1 className="dash-page-title">{listing.title}</h1>
            <p className="dash-page-sub">{address}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
            <div>
              {/* Gallery */}
              {listing.imageUrls?.length > 0 && (
                <div className="dash-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <img
                    src={listing.imageUrls[0]}
                    alt="Listing"
                    style={{ width: '100%', height: 280, objectFit: 'cover' }}
                  />
                  {listing.imageUrls.length > 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(listing.imageUrls.length - 1, 4)},1fr)`, gap: 4, padding: 4 }}>
                      {listing.imageUrls.slice(1, 5).map((url, i) => (
                        <img key={i} src={url} alt="" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 8 }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
                <h3 className="dash-card-title">Listing Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginTop: '1rem' }}>
                  {[
                    { label: 'Type', value: listing.parkingType },
                    { label: 'Vehicle Size', value: listing.maxVehicleSize },
                    { label: 'Daily Rate', value: `$${listing.dailyRate?.toFixed(2)}/day` },
                    { label: 'Min. Duration', value: `${listing.minimumBookingDays || 1} day(s)` },
                    { label: 'Status', value: listing.isPublished ? 'Published' : 'Unpublished' },
                    { label: 'Amenities', value: listing.amenities?.length ? listing.amenities.join(', ') : 'None' },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', margin: 0, textTransform: 'capitalize' }}>{item.label}</p>
                      <p style={{ fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {listing.description && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', margin: '0 0 0.4rem' }}>Description</p>
                    <p style={{ color: 'var(--nexa-gray-300)', lineHeight: 1.6, margin: 0 }}>{listing.description}</p>
                  </div>
                )}
              </div>

              {/* Bookings */}
              <div className="dash-card">
                <h3 className="dash-card-title">Bookings</h3>
                {bookings.length === 0 ? (
                  <p style={{ color: 'var(--nexa-gray-500)', marginTop: '1rem' }}>No bookings for this listing yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    {bookings.map(b => (
                      <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--nexa-surface-2)', borderRadius: 10 }}>
                        <div>
                          <p style={{ fontWeight: 600, margin: 0 }}>
                            {b.renter ? `${b.renter.firstName} ${b.renter.lastName}` : 'Guest'}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--nexa-gray-500)', margin: 0 }}>
                            {formatDate(b.startDate)} – {formatDate(b.endDate)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 700, color: 'var(--nexa-lsr)', margin: 0 }}>${b.totalAmount?.toFixed(2)}</p>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: STATUS_COLORS[b.status], textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.status}</span>
                        </div>
                        <Link to={`/host/booking-details?id=${b._id}`} className="btn btn-nexa-outline btn-nexa-sm ms-3">View</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <Link to={`/host/edit-listing?id=${id}`} className="btn btn-nexa w-100">
                    <i className="bi bi-pencil me-2"></i>Edit Listing
                  </Link>
                  <Link to="/host/availability" className="btn btn-nexa-outline w-100">
                    <i className="bi bi-calendar3 me-2"></i>Manage Availability
                  </Link>
                </div>
              </div>

              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Stats</h3>
                {[
                  { label: 'Total bookings', value: bookings.length },
                  { label: 'Total earned', value: `$${bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toFixed(2)}` },
                  { label: 'Rating', value: listing.ratingAverage > 0 ? `${listing.ratingAverage} ★` : 'No rating' },
                  { label: 'Reviews', value: listing.reviewCount || 0 },
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
