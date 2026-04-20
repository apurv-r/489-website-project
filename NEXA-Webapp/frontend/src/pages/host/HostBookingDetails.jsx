import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calcDuration(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
}

export default function HostBookingDetails() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [booking, setBooking] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No booking ID provided.');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        const bookingRes = await axios.get(`${API_BASE_URL}/api/bookings/${id}`, { withCredentials: true, headers });
        const b = bookingRes.data;
        setBooking(b);
        if (b.parkingSpace && typeof b.parkingSpace === 'object') {
          setListing(b.parkingSpace);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  async function updateStatus(status) {
    setActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const res = await axios.put(`${API_BASE_URL}/api/bookings/${id}`, { status }, { withCredentials: true, headers });
      setBooking(res.data);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  }

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

  if (error || !booking) {
    return (
      <div className="dash-page lsr-page">
        <Navbar variant="dashboard" />
        <div className="dash-layout">
          <HostSidebar />
          <main className="dash-main">
            <p style={{ color: '#ff6b6b', padding: '2rem' }}>{error || 'Booking not found.'}</p>
          </main>
        </div>
      </div>
    );
  }

  const guestName = booking.renter ? `${booking.renter.firstName} ${booking.renter.lastName}` : 'Guest';
  const guestInitial = guestName.charAt(0).toUpperCase();
  const duration = calcDuration(booking.startDate, booking.endDate);
  const payout = (booking.totalAmount || 0) * 0.95;

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
              <span style={{ color: 'var(--nexa-gray-200)' }}>{booking._id}</span>
            </nav>
            <h1 className="dash-page-title">Booking Details</h1>
            <p className="dash-page-sub">Reference: {booking._id}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Guest profile */}
              <div className="dash-card lsr-lessee-profile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--nexa-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'var(--nexa-lsr)', border: '2px solid var(--nexa-lsr)', flexShrink: 0 }}>
                    {guestInitial}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700 }}>{guestName}</h3>
                    {booking.renter?.email && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--nexa-gray-400)' }}>
                        <i className="bi bi-envelope me-1"></i>{booking.renter.email}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/host/messages" className="btn btn-nexa btn-nexa-sm">
                    <i className="bi bi-chat-fill me-1"></i>Message Lessee
                  </Link>
                </div>
              </div>

              {/* Listing card */}
              {listing && (
                <div className="dash-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {listing.imageUrls?.[0]
                    ? <img src={listing.imageUrls[0]} alt="Listing" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8 }} />
                    : <div style={{ width: 100, height: 70, borderRadius: 8, background: 'var(--nexa-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-image" style={{ color: 'var(--nexa-gray-500)' }} /></div>
                  }
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontWeight: 700 }}>{listing.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nexa-gray-400)' }}>
                      <i className="bi bi-geo-alt me-1"></i>
                      {[listing.location?.address, listing.location?.city, listing.location?.state].filter(Boolean).join(', ')}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--nexa-gray-400)' }}>
                      <i className="bi bi-shield-lock me-1"></i>{listing.parkingType} · Up to {listing.maxVehicleSize}
                    </p>
                  </div>
                </div>
              )}

              {/* Reservation */}
              <div className="dash-card">
                <h3 className="dash-card-title">Reservation</h3>
                <div className="lsr-res-grid">
                  {[
                    { label: 'Check-in', value: formatDate(booking.startDate) },
                    { label: 'Check-out', value: formatDate(booking.endDate) },
                    { label: 'Duration', value: `${duration} day${duration !== 1 ? 's' : ''}` },
                    { label: 'Status', value: booking.status },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{item.label}</p>
                      <p style={{ fontWeight: 600, margin: 0, textTransform: 'capitalize', color: item.label === 'Status' ? STATUS_COLORS[booking.status] : undefined }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1.25rem' }}>Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Booking Requested', date: booking.requestedAt, done: true },
                    { label: 'Booking Approved', date: booking.approvedAt, done: !!booking.approvedAt },
                    { label: 'Check-in', date: booking.startDate, done: new Date() >= new Date(booking.startDate) },
                    { label: 'Check-out', date: booking.endDate, done: new Date() >= new Date(booking.endDate) },
                  ].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <i className={t.done ? 'bi-check-circle-fill' : 'bi-circle'} style={{ color: t.done ? '#00e676' : 'var(--nexa-gray-600)', fontSize: '1.1rem', marginTop: 2 }} />
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>{t.label}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{t.date ? formatDate(t.date) : '—'}</p>
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
                  { label: `$${listing?.dailyRate || 0} × ${duration} days`, value: `$${booking.totalAmount?.toFixed(2)}` },
                  { label: 'NEXA service fee (10%)', value: `−$${(booking.totalAmount * 0.1).toFixed(2)}` },
                  { label: 'Payout to you', value: `$${payout.toFixed(2)}`, bold: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--nexa-border)' }}>
                    <span style={{ color: row.bold ? 'var(--nexa-gray-200)' : 'var(--nexa-gray-400)', fontWeight: row.bold ? 700 : 400, fontSize: '0.875rem' }}>{row.label}</span>
                    <span style={{ fontWeight: row.bold ? 700 : 600, color: row.bold ? 'var(--nexa-lsr)' : undefined }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="dash-card">
                <h3 className="dash-card-title" style={{ marginBottom: '1rem' }}>Actions</h3>
                {actionError && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{actionError}</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {booking.status === 'pending' && (
                    <>
                      <button
                        className="btn w-100"
                        disabled={actionLoading}
                        onClick={() => updateStatus('approved')}
                        style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <i className="bi bi-check2-circle me-2"></i>Approve
                      </button>
                      <button
                        className="btn w-100"
                        disabled={actionLoading}
                        onClick={() => updateStatus('declined')}
                        style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <i className="bi bi-x-circle me-2"></i>Decline
                      </button>
                    </>
                  )}
                  {booking.status !== 'pending' && (
                    <div style={{ padding: '0.5rem 0', fontSize: '0.85rem', color: 'var(--nexa-gray-400)', textTransform: 'capitalize' }}>
                      Status: <span style={{ color: STATUS_COLORS[booking.status], fontWeight: 600 }}>{booking.status}</span>
                    </div>
                  )}
                  <Link to="/host/messages" className="btn btn-nexa-outline w-100">
                    <i className="bi bi-chat me-2"></i>Message Lessee
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
