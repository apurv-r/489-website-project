import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import HostSidebar from '../../components/HostSidebar';
import { useState, useEffect } from 'react';

export default function HostDashboard() {

  useEffect(() => {
    console.log("hello from hostDashboard");
  },[]);

  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">Good morning, Daniel 👋</h1>
              <p className="dash-page-sub">Here's an overview of your listings and earnings.</p>
            </div>
            <Link to="/host/create-listing" className="btn btn-nexa btn-nexa-sm">
              <i className="bi bi-plus-lg me-1"></i> New Listing
            </Link>
          </div>

          <div className="dash-stat-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--nexa-primary)' }}><i className="bi bi-building"></i></div>
              <div className="dash-stat-body"><div className="dash-stat-value">3</div><div className="dash-stat-label">Active Listings</div></div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(0,210,255,0.12)', color: 'var(--nexa-accent)' }}><i className="bi bi-calendar2-check-fill"></i></div>
              <div className="dash-stat-body"><div className="dash-stat-value">3</div><div className="dash-stat-label">Active Bookings</div></div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(0,217,126,0.12)', color: '#00d97e' }}><i className="bi bi-cash-stack"></i></div>
              <div className="dash-stat-body"><div className="dash-stat-value">$412</div><div className="dash-stat-label">This Month</div></div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: 'rgba(241,196,15,0.12)', color: '#f1c40f' }}><i className="bi bi-star-fill"></i></div>
              <div className="dash-stat-body"><div className="dash-stat-value">4.9</div><div className="dash-stat-label">Avg. Rating</div></div>
            </div>
          </div>

          <div className="dash-two-col">
            <div className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title">Recent Bookings</h2>
                <Link to="/host/bookings" className="dash-card-link">View all</Link>
              </div>
              <div className="dash-booking-list">
                {[
                  { img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=120&q=80', name: 'Sarah K. — Private Garage', dates: 'Jun 9 – Jun 12, 2026', price: '$15.75', status: 'Active', cls: 'status-active' },
                  { img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=120&q=80', name: 'James R. — Covered Driveway', dates: 'Jun 3 – Jun 7, 2026', price: '$21.00', status: 'Pending', cls: 'status-pending' },
                  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80', name: 'Priya K. — Outdoor Lot', dates: 'May 20 – May 22, 2026', price: '$10.50', status: 'Completed', cls: 'status-completed' },
                ].map((b, i) => (
                  <Link to="/host/booking-details" className="dash-booking-item" key={i}>
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

            <div className="dash-col-right">
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">My Listings</h2>
                  <Link to="/host/my-listings" className="dash-card-link">View all</Link>
                </div>
                <div className="lsr-listing-mini-list">
                  {[
                    { img: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=80&q=70', name: 'Private Garage · Capitol Hill', meta: '$5/day', badge: 'Active', badgeCls: 'lsr-badge-active' },
                    { img: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=80&q=70', name: 'Covered Driveway · Fremont', meta: '$7/day', badge: 'Active', badgeCls: 'lsr-badge-active' },
                    { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=70', name: 'Outdoor Lot · Belltown', meta: '$3.50/day', badge: 'Paused', badgeCls: 'lsr-badge-paused' },
                  ].map((l, i) => (
                    <Link to="/host/listing-details" className="lsr-listing-mini" key={i}>
                      <img src={l.img} alt="" className="lsr-listing-mini-img" />
                      <div className="lsr-listing-mini-info">
                        <div className="lsr-listing-mini-name">{l.name}</div>
                        <div className="lsr-listing-mini-meta">{l.meta} · <span className={`lsr-badge ${l.badgeCls}`}>{l.badge}</span></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="dash-card">
                <h2 className="dash-card-title" style={{ marginBottom: '1rem' }}>Quick Actions</h2>
                <div className="dash-quick-actions">
                  <Link to="/host/create-listing" className="dash-quick-btn"><i className="bi bi-plus-circle"></i> New Listing</Link>
                  <Link to="/host/bookings" className="dash-quick-btn"><i className="bi bi-calendar2-check"></i> Bookings</Link>
                  <Link to="/host/earnings" className="dash-quick-btn"><i className="bi bi-cash-stack"></i> Earnings</Link>
                  <Link to="/host/messages" className="dash-quick-btn"><i className="bi bi-chat-dots"></i> Messages</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
