import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LesseeSidebar from '../components/LesseeSidebar';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BOOKINGS = [];

const TABS = ['all', 'active', 'upcoming', 'completed', 'cancelled'];

function getEffectiveStatus(status, startDate, endDate) {
  if (status === 'cancelled' || status === 'declined' || status === 'pending') return status;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end) return 'completed';
  if (now >= start) return 'active';
  return 'upcoming';
}

export default function MyBookings(user) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState(BOOKINGS);
  const [bookingStats, setBookingStats] = useState({ active: 0, past: 0 });
  const shown = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);


  async function fetchListing(listingId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/parking-spaces/${listingId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log("error fetching listing data for dashboard:", error);
    }
  }

  function formatDates(start, end) {
    const options = { month: 'short', day: 'numeric' };
    const startDate = new Date(start).toLocaleDateString(undefined, options);
    const endDate = new Date(end).toLocaleDateString(undefined, options);
    return `${startDate} – ${endDate}`;
  }

  function calculateBookingStats() {
    const active = bookings.filter(b => b.status === 'active').length;
    const past = bookings.filter(b => b.status === 'completed').length;
    setBookingStats({ active, past });
  }

  function calcDuration(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const msPerDay = 1000 * 60 * 60 * 24;
      const duration = Math.round((endDate - startDate) / msPerDay);
      return Math.max(0, duration);
  }

  async function fetchBookings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/me`, {
        withCredentials: true,
      });

      const fetchedBookings = response.data.map((booking) => {
        const listing = booking.parkingSpace;
        const duration = calcDuration(booking.startDate, booking.endDate);
        const effectiveStatus = getEffectiveStatus(booking.status, booking.startDate, booking.endDate);
        return {
          img: listing?.imageUrls?.[0] || '',
          type: listing?.parkingType || '',
          name: listing?.title || '',
          addr: listing?.location?.address || '',
          dates: formatDates(booking.startDate, booking.endDate),
          duration: `${duration} day${duration !== 1 ? 's' : ''}`,
          total: `$${booking.totalAmount.toFixed(2)}`,
          price: `$${booking.totalAmount.toFixed(2)}`,
          status: effectiveStatus,
          cls: `status-${effectiveStatus}`,
          id: booking._id,
        };
      });

      setBookings(fetchedBookings);
      console.log("successfully fetched bookings data for my-bookings:", fetchedBookings);
    } catch (error) {
      console.log("error fetching bookings:", error);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="dash-page">
      <div className="dash-layout">
        <LesseeSidebar {...user}/>
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">My Bookings</h1>
              <p className="dash-page-sub">Manage your current and past reservations.</p>
            </div>
            <Link to="/search" className="btn btn-nexa btn-nexa-sm">
              <i className="bi bi-plus-lg me-1"></i> New Booking
            </Link>
          </div>

          <div className="bookings-tabs">
            {TABS.map(t => (
              <button key={t} className={`bookings-tab${filter === t ? ' active' : ''}`} onClick={() => setFilter(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="bookings-list">
            {shown.length === 0 && (
              <div className="fav-empty text-center py-5">
                <i className="bi bi-calendar-x fs-1 mb-3 d-block" style={{ color: 'var(--nexa-gray-600)' }}></i>
                <p>No {filter} bookings.</p>
                <Link to="/search" className="btn btn-nexa mt-2">Find Parking</Link>
              </div>
            )}
            {shown.map((b, i) => (
              <div className="bookings-card" key={b.id || i} onClick={() => navigate(`/booking-details/?bookingId=${b.id}`)} style={{ cursor: 'pointer' }}>
                <img src={b.img} alt="" className="bookings-card-img" />
                <div className="bookings-card-body">
                  <div className="bookings-card-top">
                    <div>
                      <div className="bookings-card-type">{b.type}</div>
                      <h3 className="bookings-card-name">{b.name}</h3>
                      <div className="bookings-card-addr"><i className="bi bi-geo-alt-fill"></i> {b.addr}</div>
                    </div>
                    <span className={`dash-booking-status ${b.cls}`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                  <div className="bookings-card-meta">
                    <div className="bookings-meta-item"><i className="bi bi-calendar3"></i> {b.dates}</div>
                    <div className="bookings-meta-item"><i className="bi bi-moon-stars"></i> {b.duration}</div>
                    <div className="bookings-meta-item"><i className="bi bi-tag-fill"></i> {b.total}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
