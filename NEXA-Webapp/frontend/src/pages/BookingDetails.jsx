import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LesseeSidebar from '../components/LesseeSidebar';
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function BookingDetails(user) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  async function fetchBooking() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        withCredentials: true,
      });
      setBooking(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return null;
    }
  }

  async function fetchListing(listingId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/parking-spaces/${listingId}`, {
        withCredentials: true,
      });
      setListing(response.data);
      return response.data;
    } catch (error) {
      console.log("error fetching listing data for dashboard:", error);
      return null;
    }
  }

  async function fetchHost(hostId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${hostId}`, {
        withCredentials: true,
      });
      setHost(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user: could not fetch booking host", error);
      return null;
    }
  }

  function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    const retDate = new Date(date).toLocaleDateString(undefined, options);
    return `${retDate}`;
  }

  function calcDuration(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const msPerDay = 1000 * 60 * 60 * 24;
      const duration = Math.round((endDate - startDate) / msPerDay);
      return Math.max(0, duration);
  }

  function parseDisplayName(first, last) {
    return `${first} ${last[0]}.`;
  }

  async function fetchPageData() {
    const bookingData = await fetchBooking();
    if (!bookingData) return;
    await fetchListing(bookingData.parkingSpace);
    await fetchHost(bookingData.host);
  }

  async function cancelBooking() {
    if (!booking) return;
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}`,
        { status: 'cancelled' },
        { withCredentials: true },
      );
      setBooking(response.data);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setShowCancelModal(false);
    }
  }

  async function createMessageThread() {
    if (!host || !user?._id) return;
    await axios
      .put(
        `${API_BASE_URL}/api/users/message/${user._id}/${host._id}`,
        {
          text: `Hi ${host.firstName}, I booked your parking space "${listing?.title}". Looking forward to it!`,
        },
        { withCredentials: true },
      )
      .then((response) => {
        console.log("successfully sent message: ", response.data);
        navigate("/messages");
      })
      .catch((error) => {
        console.log("error sending message: ", error);
      });
  }

  useEffect(() => {
    if (bookingId) {
      fetchPageData();
    }
  }, [bookingId]);

  return (
    <>
      <div className="dash-page">
        <div className="dash-layout">
        <LesseeSidebar />
        <main className="dash-main">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb booking-breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/my-bookings">My Bookings</Link></li>
              <li className="breadcrumb-item active">{booking ? booking._id : 'Loading...'}</li>
            </ol>
          </nav>

          <div className="bkd-layout">
            <div>
              {/* Listing card */}
              <div className="dash-card mb-4">
                <h2 className="dash-card-title mb-3">Listing</h2>
                <div className="bkd-listing-row">
                  <img src={listing ? listing.imageUrls[0] : ''} alt="Listing" className="bkd-listing-img" />
                  <div>
                    <div className="bookings-card-type">{listing ? listing.parkingType : 'Loading...'}</div>
                    <h3 className="bookings-card-name">{listing ? listing.title : 'Loading...'}</h3>
                    <div className="bookings-card-addr"><i className="bi bi-geo-alt-fill"></i>{listing ? listing.location.address : 'Loading...'}</div>
                    {/* <Link to="/details" className="btn btn-nexa-outline btn-nexa-sm mt-2">View Listing</Link>  */}
                  </div>
                </div>
              </div>

              {/* Booking info */}
              <div className="dash-card mb-4">
                <h2 className="dash-card-title mb-3">Booking Details</h2>
                <div className="bkd-info-grid">
                  <div><div className="bkd-info-label">Reference</div><div className="bkd-info-value">{booking ? booking._id : 'Loading...'}</div></div>
                  <div><div className="bkd-info-label">Status</div><div><span className={`dash-booking-status status-${booking ? booking.status : "Loading"}`}>{booking ? booking.status : 'Loading...'}</span></div></div> {/* <----------------- MAKE DYNAMIC */}
                  <div><div className="bkd-info-label">Check-in</div><div className="bkd-info-value">{booking ? formatDate(booking.startDate) : 'Loading...'}</div></div> 
                  <div><div className="bkd-info-label">Check-out</div><div className="bkd-info-value">{booking ? formatDate(booking.endDate) : 'Loading...'}</div></div> 
                  <div><div className="bkd-info-label">Duration</div><div className="bkd-info-value">{booking ? calcDuration(booking.startDate, booking.endDate) : 'Loading...'} days</div></div> 
                  <div><div className="bkd-info-label">Total Paid</div><div className="bkd-info-value">{booking ? `$${booking.totalAmount.toFixed(2)}` : 'Loading...'}</div></div> 
                </div>
                <div className="mt-3">
                  <div className="bkd-info-label mb-1">Description</div>
                  <div className="bkd-info-value">{listing ? listing.description : 'No Description'}</div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="dash-card">
                <h2 className="dash-card-title mb-3">Price Breakdown</h2>
                <div className="bkd-price-rows">
                  <div className="bk-price-row"><span>${`${listing ? listing.dailyRate : 'Loading...'} x ${booking ? calcDuration(booking.startDate, booking.endDate) : 'Loading...'}`} days</span><span>${booking ? booking.totalAmount.toFixed(2) : 'Loading...'}</span></div>
                  <div className="bk-price-row"><span>Service fee (5%)</span><span>${booking ? booking.totalAmount * .05 : 'Loading...'}</span></div>
                  <div className="bk-price-row bk-price-total"><span>Total</span><span>${booking ? booking.totalAmount.toFixed(2) : 'Loading...'}</span></div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Host */}
              <div className="dash-card mb-4">
                <h2 className="dash-card-title mb-3">Your Host</h2>
                <div className="bkd-host-row">
                  <img src={host ? host.profilePictureUrl : ""} alt="Host" className="bkd-host-avatar" />
                  <div>
                    <div className="host-name">{host ? parseDisplayName(host.firstName, host.lastName) : 'Loading...'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--nexa-gray-400)' }}>
                      {/* <i className="bi bi-star-fill me-1"></i>4.9 · 38 reviews · Verified */}
                    </div>
                  </div>
                </div>
                <button onClick={createMessageThread} className="btn btn-nexa-outline w-100 mt-3">
                  <i className="bi bi-chat-dots me-2"></i>Message Host
                </button>
              </div>

              {/* Actions */}
              <div className="dash-card">
                <h2 className="dash-card-title mb-3">Actions</h2>
                <div className="d-grid gap-2">
                  <Link to="/my-bookings" className="btn btn-nexa-outline btn-sm">
                    <i className="bi bi-arrow-left me-1"></i>Back to Bookings
                  </Link>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setShowCancelModal(true)}
                    disabled={!booking || booking.status === 'cancelled' || booking.status === 'completed'}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    {booking?.status === 'cancelled' ? 'Booking Cancelled' : 'Cancel Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title"><i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>Cancel Booking</h2>
            <p className="modal-body-text">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-nexa-outline btn-sm" onClick={() => setShowCancelModal(false)}>Keep Booking</button>
              <button className="btn btn-outline-danger btn-sm" onClick={cancelBooking}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}