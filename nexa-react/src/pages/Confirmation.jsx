import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Confirmation() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar variant="public" />
      <main style={{ paddingTop: '90px', paddingBottom: '3rem', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          {/* Success banner */}
          <div className="conf-hero">
            <div className="conf-icon-wrap">
              <i className="bi bi-check-lg conf-icon"></i>
            </div>
            <h1 className="conf-title">Booking Confirmed!</h1>
            <p className="conf-subtitle">
              Your parking spot is reserved. Check your email for full details and access instructions.
            </p>
          </div>

          {/* Booking reference */}
          <div className="conf-card">
            <div className="conf-card-title">Booking Reference</div>
            <div className="conf-ref-row">
              <span className="conf-ref-label">Reference ID</span>
              <span className="conf-ref-value">NXA-2025-48291</span>
            </div>
            <div className="conf-divider"></div>
            <div className="conf-listing-row">
              <img src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&q=80" alt="Listing" className="conf-listing-img" />
              <div>
                <div className="conf-listing-type">Private Garage</div>
                <div className="conf-listing-name">Private Garage · Capitol Hill</div>
                <div className="conf-listing-addr"><i className="bi bi-geo-alt-fill me-1"></i>1421 10th Ave, Seattle, WA 98122</div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="conf-card">
            <div className="conf-card-title">Booking Details</div>
            <div className="conf-detail-rows">
              <div className="conf-detail-row"><span className="conf-detail-label">Check-in</span><span className="conf-detail-value">Mon, Jun 9, 2025</span></div>
              <div className="conf-divider"></div>
              <div className="conf-detail-row"><span className="conf-detail-label">Check-out</span><span className="conf-detail-value">Thu, Jun 12, 2025</span></div>
              <div className="conf-divider"></div>
              <div className="conf-detail-row"><span className="conf-detail-label">Duration</span><span className="conf-detail-value">3 days</span></div>
              <div className="conf-divider"></div>
              <div className="conf-detail-row"><span className="conf-detail-label">$5 × 3 days</span><span className="conf-detail-value">$15.00</span></div>
              <div className="conf-detail-row"><span className="conf-detail-label">Service fee</span><span className="conf-detail-value">$0.75</span></div>
              <div className="conf-divider"></div>
              <div className="conf-detail-row conf-total-row"><span>Total paid</span><span>$15.75</span></div>
            </div>
          </div>

          {/* Host */}
          <div className="conf-card">
            <div className="conf-card-title">Your Host</div>
            <div className="conf-host-row">
              <img src="https://i.pravatar.cc/100?img=33" alt="Host" className="conf-host-avatar" />
              <div>
                <div className="conf-host-name">Daniel R.</div>
                <div className="conf-host-stat"><i className="bi bi-star-fill me-1"></i>4.9 · 38 reviews · Verified Host</div>
              </div>
              <button className="btn btn-nexa-outline btn-sm ms-auto" onClick={() => navigate('/messages')}>
                <i className="bi bi-chat-dots me-1"></i>Message
              </button>
            </div>
          </div>

          {/* Getting there */}
          <div className="conf-card">
            <div className="conf-card-title">Getting There</div>
            <p className="conf-getting-addr"><i className="bi bi-geo-alt-fill me-2"></i>1421 10th Ave, Seattle, WA 98122</p>
            <p className="conf-getting-note">Exact access instructions and gate code will be sent to your email 24 hours before check-in.</p>
          </div>

          {/* Actions */}
          <div className="conf-actions">
            <button className="btn btn-nexa-outline" onClick={() => navigate('/my-bookings')}>
              <i className="bi bi-calendar2-check me-2"></i>View My Bookings
            </button>
            <button className="btn btn-nexa" onClick={() => navigate('/search')}>
              <i className="bi bi-search me-2"></i>Find More Parking
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
