import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LesseeSidebar from '../components/LesseeSidebar';
import { useState, useEffect } from 'react';
import axios from "axios"
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const USERID = "some temp id"

export default function Dashboard() {

  const [user, setUser] = useState({});

  const fetchUser = async () => {
    axios.get(`${API_BASE_URL}/api/user:${USERID}`, {
      headers: {
        "Authorization": localStorage.getItem("token"),
      }
    })
    .then(response => {
      setUser({
        foreName: response.data.firstName,
        lastName: response.data.lastName,
      })
    })
    .catch(error => {
      console.log(error);
    });
  }

  useEffect(() => {
    fetchUser();
  },[]);

  return (
    <div className="dash-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <LesseeSidebar {...user}/>
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">Good morning, {user.foreName} 👋</h1>
              <p className="dash-page-sub">Here's what's happening with your parking.</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="dash-stat-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--nexa-primary)' }}>
                <i className="bi bi-calendar2-check-fill"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">2</div> {/* PROP NEEDED HERE */}
                <div className="dash-stat-label">Active Bookings</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(0,210,255,0.12)', color: 'var(--nexa-accent)' }}>
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">1</div> {/* PROP NEEDED HERE */}
                <div className="dash-stat-label">Past Bookings</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(0,217,126,0.12)', color: '#00d97e' }}>
                <i className="bi bi-chat-dots-fill"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">2</div> {/* PROP NEEDED HERE */}
                <div className="dash-stat-label">Unread Messages</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(241,196,15,0.12)', color: '#f1c40f' }}>
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">4.8</div> {/* PROP NEEDED HERE */}
                <div className="dash-stat-label">Avg. Rating Given</div>
              </div>
            </div>
          </div>

          {/* Two-column */}
          <div className="dash-two-col">
            {/* Recent bookings */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title">Recent Bookings</h2>
                <Link to="/my-bookings" className="dash-card-link">View all</Link>
              </div>
              <div className="dash-booking-list">
                {[
                  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80', name: 'Private Garage · Capitol Hill', dates: 'Jun 9 – Jun 12, 2025', price: '$15.75', status: 'Active', cls: 'status-active' },
                  { img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=120&q=80', name: 'Covered Driveway · Fremont', dates: 'May 1 – May 4, 2025', price: '$21.00', status: 'Completed', cls: 'status-completed' },
                  { img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=120&q=80', name: 'Outdoor Lot · Belltown', dates: 'Apr 14 – Apr 15, 2025', price: '$10.50', status: 'Completed', cls: 'status-completed' },
                ].map((b, i) => (
                  <Link to="/booking-details" className="dash-booking-item" key={i}>
                    <img src={b.img} alt="" className="dash-booking-thumb" />
                    <div className="dash-booking-info">
                      <div className="dash-booking-name">{b.name}</div>
                      <div className="dash-booking-dates"><i className="bi bi-calendar3"></i> {b.dates}</div>
                      <div className="dash-booking-price">{b.price}</div>
                    </div>
                    <span className={`dash-booking-status ${b.cls}`}>{b.status}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="dash-col-right">
              {/* Messages */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">Messages</h2>
                  <Link to="/messages" className="dash-card-link">View all</Link>
                </div>
                <div className="dash-msg-list">
                  {[
                    { img: 'https://i.pravatar.cc/40?img=12', name: 'Marcus T.', time: '2h ago', preview: 'Hey! The gate code is 4821. Let me know…', unread: true },
                    { img: 'https://i.pravatar.cc/40?img=5', name: 'Sarah K.', time: 'Yesterday', preview: 'Your spot is ready! Pull all the way in to…', unread: true },
                    { img: 'https://i.pravatar.cc/40?img=21', name: 'James R.', time: 'Mon', preview: 'Thanks for booking! See you on the 9th.', unread: false },
                  ].map((m, i) => (
                    <Link to="/messages" className={`dash-msg-item${m.unread ? ' dash-msg-unread' : ''}`} key={i}>
                      <img src={m.img} alt="" className="dash-msg-avatar" />
                      <div className="dash-msg-body">
                        <div className="dash-msg-name">{m.name} <span className="dash-msg-time">{m.time}</span></div>
                        <div className="dash-msg-preview">{m.preview}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="dash-card">
                <h2 className="dash-card-title" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
                <div className="dash-quick-actions">
                  <Link to="/search" className="dash-quick-btn"><i className="bi bi-search"></i> Find Parking</Link>
                  <Link to="/my-bookings" className="dash-quick-btn"><i className="bi bi-calendar2-check"></i> My Bookings</Link>
                  <Link to="/messages" className="dash-quick-btn"><i className="bi bi-chat-dots"></i> Messages</Link>
                  <Link to="/favorites" className="dash-quick-btn"><i className="bi bi-heart-fill"></i> Favorites</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
