import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LesseeSidebar from '../components/LesseeSidebar';

export default function BookingDetails() {
  return (
    <div className="dash-page">
      <div className="dash-layout">
        <LesseeSidebar />
        <main className="dash-main">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb booking-breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/my-bookings">My Bookings</Link></li>
              <li className="breadcrumb-item active">Booking #NXA-20925</li>
            </ol>
          </nav>

          <div className="bkd-layout">
            <div>
              {/* Listing card */}
              <div className="dash-card mb-4">
                <h2 className="dash-card-title mb-3">Listing</h2>
                <div className="bkd-listing-row">
                  <img src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&q=80" alt="Listing" className="bkd-listing-img" />
                  <div>
                    <div className="bookings-card-type">Private Garage</div>
                    <h3 className="bookings-card-name">Private Garage · Capitol Hill</h3>
                    <div className="bookings-card-addr"><i className="bi bi-geo-alt-fill"></i> 1421 10th Ave, Seattle, WA 98122</div>
                    <Link to="/details" className="btn btn-nexa-outline btn-nexa-sm mt-2">View Listing</Link>
                  </div>
                </div>
              </div>

              {/* Booking info */}
              <div className="dash-card mb-4">
                <h2 className="dash-card-title mb-3">Booking Details</h2>
                <div className="bkd-info-grid">
                  <div><div className="bkd-info-label">Reference</div><div className="bkd-info-value">#NXA-20925</div></div>
                  <div><div className="bkd-info-label">Status</div><div><span className="dash-booking-status status-active">Active</span></div></div>
                  <div><div className="bkd-info-label">Check-in</div><div className="bkd-info-value">Mon, Jun 9, 2025</div></div>
                  <div><div className="bkd-info-label">Check-out</div><div className="bkd-info-value">Thu, Jun 12, 2025</div></div>
                  <div><div className="bkd-info-label">Duration</div><div className="bkd-info-value">3 days</div></div>
                  <div><div className="bkd-info-label">Total Paid</div><div className="bkd-info-value">$15.75</div></div>
                </div>
                <div className="mt-3">
                  <div className="bkd-info-label mb-1">Access Code</div>
                  <div className="bkd-access-code">4821</div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="dash-card">
                <h2 className="dash-card-title mb-3">Price Breakdown</h2>
                <div className="bkd-price-rows">
                  <div className="bk-price-row"><span>$5 × 3 days</span><span>$15.00</span></div>
                  <div className="bk-price-row"><span>Service fee (5%)</span><span>$0.75</span></div>
                  <div className="bk-price-row bk-price-total"><span>Total</span><span>$15.75</span></div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Host */}
              <div className="dash-card mb-4">
                <h2 className="dash-card-title mb-3">Your Host</h2>
                <div className="bkd-host-row">
                  <img src="https://i.pravatar.cc/100?img=33" alt="Host" className="bkd-host-avatar" />
                  <div>
                    <div className="host-name">Daniel R.</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--nexa-gray-400)' }}>
                      <i className="bi bi-star-fill me-1"></i>4.9 · 38 reviews · Verified
                    </div>
                  </div>
                </div>
                <Link to="/messages" className="btn btn-nexa-outline w-100 mt-3">
                  <i className="bi bi-chat-dots me-2"></i>Message Host
                </Link>
              </div>

              {/* Actions */}
              <div className="dash-card">
                <h2 className="dash-card-title mb-3">Actions</h2>
                <div className="d-grid gap-2">
                  <Link to="/my-bookings" className="btn btn-nexa-outline btn-sm">
                    <i className="bi bi-arrow-left me-1"></i>Back to Bookings
                  </Link>
                  <button className="btn btn-outline-danger btn-sm">
                    <i className="bi bi-x-circle me-1"></i>Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
