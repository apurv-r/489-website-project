import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LesseeSidebar from '../components/LesseeSidebar';

const BOOKINGS = [
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&q=80', type: 'Private Garage', name: 'Private Garage · Capitol Hill', addr: '1421 10th Ave, Seattle, WA', dates: 'Jun 9 – Jun 12, 2025', duration: '3 days', total: '$15.75', ref: '#NXA-20925', status: 'active' },
  { img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=240&q=80', type: 'Covered Driveway', name: 'Covered Driveway · Fremont', addr: '3812 Fremont Ave N, Seattle, WA', dates: 'Jun 14 – Jun 18, 2025', duration: '4 days', total: '$21.00', ref: '#NXA-20931', status: 'active' },
  { img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=240&q=80', type: 'Outdoor Lot', name: 'Outdoor Lot · South Lake Union', addr: '440 Terry Ave N, Seattle, WA', dates: 'Jul 1 – Jul 3, 2025', duration: '2 days', total: '$10.50', ref: '#NXA-20944', status: 'upcoming' },
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&q=80', type: 'Covered Garage', name: 'Covered Garage · Eastlake', addr: '2200 Eastlake Ave E, Seattle, WA', dates: 'Apr 20 – Apr 22, 2025', duration: '2 days', total: '$18.00', ref: '#NXA-20881', status: 'completed' },
];

const STATUS_CLASS = { active: 'status-active', upcoming: 'status-upcoming', completed: 'status-completed', cancelled: 'status-cancelled' };
const TABS = ['all', 'active', 'upcoming', 'completed', 'cancelled'];

export default function MyBookings() {
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? BOOKINGS : BOOKINGS.filter(b => b.status === filter);

  return (
    <div className="dash-page">
      <div className="dash-layout">
        <LesseeSidebar />
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
              <Link to="/booking-details" className="bookings-card" key={i}>
                <img src={b.img} alt="" className="bookings-card-img" />
                <div className="bookings-card-body">
                  <div className="bookings-card-top">
                    <div>
                      <div className="bookings-card-type">{b.type}</div>
                      <h3 className="bookings-card-name">{b.name}</h3>
                      <div className="bookings-card-addr"><i className="bi bi-geo-alt-fill"></i> {b.addr}</div>
                    </div>
                    <span className={`dash-booking-status ${STATUS_CLASS[b.status]}`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                  <div className="bookings-card-meta">
                    <div className="bookings-meta-item"><i className="bi bi-calendar3"></i> {b.dates}</div>
                    <div className="bookings-meta-item"><i className="bi bi-moon-stars"></i> {b.duration}</div>
                    <div className="bookings-meta-item"><i className="bi bi-tag-fill"></i> {b.total} total</div>
                    <div className="bookings-meta-item"><i className="bi bi-hash"></i> {b.ref}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
