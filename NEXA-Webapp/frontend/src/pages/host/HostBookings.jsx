import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FILTERS = ['All', 'pending', 'approved', 'active', 'completed', 'declined', 'cancelled'];

const STATUS_STYLES = {
  active:    { bg: 'rgba(0,230,118,0.12)',   color: '#00e676' },
  approved:  { bg: 'rgba(0,184,255,0.12)',   color: '#00b8ff' },
  pending:   { bg: 'rgba(108,92,231,0.12)',  color: '#6c5ce7' },
  completed: { bg: 'rgba(160,160,176,0.12)', color: '#a0a0b0' },
  declined:  { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b' },
  cancelled: { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b' },
};

function getEffectiveStatus(status, startDate, endDate) {
  if (status === 'cancelled' || status === 'declined' || status === 'pending') return status;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end) return 'completed';
  if (now >= start) return 'active';
  return 'approved';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/bookings/me`, {
          withCredentials: true,
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        setBookings(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const filtered = filter === 'All' ? bookings : bookings.filter(b => getEffectiveStatus(b.status, b.startDate, b.endDate) === filter);
  const countFor = (status) => bookings.filter(b => getEffectiveStatus(b.status, b.startDate, b.endDate) === status).length;

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
          <div className="lsr-date-filter" style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`lsr-df-btn${filter === f ? ' active' : ''}`}
                style={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}
              >
                {f} {f !== 'All' && <span style={{ marginLeft: 4, opacity: 0.75 }}>({countFor(f)})</span>}
              </button>
            ))}
          </div>

          <div className="dash-card">
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--nexa-gray-400)', padding: '2rem' }}>Loading…</p>
            ) : error ? (
              <p style={{ textAlign: 'center', color: '#ff6b6b', padding: '2rem' }}>{error}</p>
            ) : filtered.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--nexa-gray-500)', padding: '2rem' }}>
                No {filter === 'All' ? '' : filter} bookings yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filtered.map(b => {
                  const effectiveStatus = getEffectiveStatus(b.status, b.startDate, b.endDate);
                  const st = STATUS_STYLES[effectiveStatus] || STATUS_STYLES.pending;
                  const guestName = b.renter ? `${b.renter.firstName} ${b.renter.lastName}` : 'Unknown Guest';
                  const listingTitle = b.parkingSpace?.title || 'Unknown Listing';
                  return (
                    <div key={b._id} style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto',
                      alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem',
                      background: 'var(--nexa-surface-2)', borderRadius: 10,
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, margin: 0 }}>{guestName}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--nexa-gray-500)', margin: 0 }}>{listingTitle}</p>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--nexa-gray-400)', margin: 0 }}>
                        {formatDate(b.startDate)} – {formatDate(b.endDate)}
                      </p>
                      <p style={{ fontWeight: 700, color: 'var(--nexa-lsr)', margin: 0 }}>
                        ${b.totalAmount?.toFixed(2)}
                      </p>
                      <span style={{
                        padding: '0.25em 0.8em', borderRadius: 20, fontSize: '0.75rem',
                        fontWeight: 600, whiteSpace: 'nowrap', textTransform: 'capitalize',
                        background: st.bg, color: st.color,
                      }}>{effectiveStatus}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/host/booking-details?id=${b._id}`} className="btn btn-nexa-outline btn-nexa-sm">View</Link>
                        <Link to="/host/messages" className="btn btn-nexa-outline btn-nexa-sm">
                          <i className="bi bi-chat-fill"></i>
                        </Link>
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
