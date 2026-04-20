import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import LesseeSidebar from "../components/LesseeSidebar";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "0.25rem", fontSize: "1.6rem", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${(hovered || value) >= star ? "bi-star-fill" : "bi-star"}`}
          style={{ color: (hovered || value) >= star ? "#ffc107" : "var(--nexa-gray-600)" }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
}

function getEffectiveStatus(status, startDate, endDate) {
  if (status === "cancelled") return "cancelled";
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end) return "completed";
  if (now >= start) return "active";
  return "approved";
}

export default function BookingDetails(user) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  async function fetchBooking() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        withCredentials: true,
      });
      setBooking(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching booking details:", error);
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
    const options = { month: "short", day: "numeric" };
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

  async function fetchReview(bId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reviews/booking/${bId}`, {
        withCredentials: true,
      });
      setExistingReview(response.data);
    } catch {
      // no review yet
    }
  }

  async function fetchPageData() {
    const bookingData = await fetchBooking();
    if (!bookingData) return;
    await Promise.all([
      fetchListing(bookingData.parkingSpace._id),
      fetchHost(bookingData.host),
      fetchReview(bookingData._id),
    ]);
  }

  async function submitReview() {
    if (!reviewRating) {
      setReviewError("Please select a star rating.");
      return;
    }
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/reviews`,
        { bookingId, rating: reviewRating, comment: reviewComment },
        { withCredentials: true },
      );
      setExistingReview(response.data);
      setReviewSuccess(true);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function cancelBooking() {
    if (!booking) return;
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}`,
        { status: "cancelled" },
        { withCredentials: true },
      );
      setBooking(response.data);
    } catch (error) {
      console.error("Error cancelling booking:", error);
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

  const effectiveStatus = booking
    ? getEffectiveStatus(booking.status, booking.startDate, booking.endDate)
    : "loading";

  return (
    <>
      <div className="dash-page">
        <div className="dash-layout">
          <LesseeSidebar {...user} />
          <main className="dash-main">
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb booking-breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/my-bookings">My Bookings</Link>
                </li>
                <li className="breadcrumb-item active">{booking ? booking._id : "Loading..."}</li>
              </ol>
            </nav>

            <div className="bkd-layout">
              <div>
                {/* Listing card */}
                <div className="dash-card mb-4">
                  <h2 className="dash-card-title mb-3">Listing</h2>
                  <div className="bkd-listing-row">
                    <img
                      src={listing ? listing.imageUrls[0] : ""}
                      alt="Listing"
                      className="bkd-listing-img"
                    />
                    <div>
                      <div className="bookings-card-type">
                        {listing ? listing.parkingType : "Loading..."}
                      </div>
                      <h3 className="bookings-card-name">
                        {listing ? listing.title : "Loading..."}
                      </h3>
                      <div className="bookings-card-addr">
                        <i className="bi bi-geo-alt-fill"></i>
                        {listing ? listing.location.address : "Loading..."}
                      </div>
                      {/* <Link to="/details" className="btn btn-nexa-outline btn-nexa-sm mt-2">View Listing</Link>  */}
                    </div>
                  </div>
                </div>

                {/* Booking info */}
                <div className="dash-card mb-4">
                  <h2 className="dash-card-title mb-3">Booking Details</h2>
                  <div className="bkd-info-grid">
                    <div>
                      <div className="bkd-info-label">Reference</div>
                      <div className="bkd-info-value">{booking ? booking._id : "Loading..."}</div>
                    </div>
                    <div>
                      <div className="bkd-info-label">Status</div>
                      <div>
                        <span className={`dash-booking-status status-${effectiveStatus}`}>
                          {booking ? effectiveStatus : "Loading..."}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="bkd-info-label">Check-in</div>
                      <div className="bkd-info-value">
                        {booking ? formatDate(booking.startDate) : "Loading..."}
                      </div>
                    </div>
                    <div>
                      <div className="bkd-info-label">Check-out</div>
                      <div className="bkd-info-value">
                        {booking ? formatDate(booking.endDate) : "Loading..."}
                      </div>
                    </div>
                    <div>
                      <div className="bkd-info-label">Duration</div>
                      <div className="bkd-info-value">
                        {booking ? calcDuration(booking.startDate, booking.endDate) : "Loading..."}{" "}
                        days
                      </div>
                    </div>
                    <div>
                      <div className="bkd-info-label">Total Paid</div>
                      <div className="bkd-info-value">
                        {booking ? `$${booking.totalAmount.toFixed(2)}` : "Loading..."}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="bkd-info-label mb-1">Description</div>
                    <div className="bkd-info-value">
                      {listing ? listing.description : "No Description"}
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="dash-card mb-4">
                  <h2 className="dash-card-title mb-3">Price Breakdown</h2>
                  <div className="bkd-price-rows">
                    <div className="bk-price-row">
                      <span>
                        $
                        {`${listing ? listing.dailyRate : "Loading..."} x ${booking ? calcDuration(booking.startDate, booking.endDate) : "Loading..."}`}{" "}
                        days
                      </span>
                      <span>${booking ? booking.totalAmount.toFixed(2) : "Loading..."}</span>
                    </div>
                    <div className="bk-price-row">
                      <span>Service fee (10%)</span>
                      <span>${booking ? booking.totalAmount * 0.1 : "Loading..."}</span>
                    </div>
                    <div className="bk-price-row bk-price-total" style={{ padding: "0px" }}>
                      <span>Total</span>
                      <span>${booking ? booking.totalAmount.toFixed(2) : "Loading..."}</span>
                    </div>
                  </div>
                </div>

                {/* Review section — only for completed bookings */}
                {effectiveStatus === "completed" && (
                  <div className="dash-card">
                    <h2 className="dash-card-title mb-3">
                      <i className="bi bi-star-fill me-2" style={{ color: "#ffc107" }}></i>
                      Leave a Review
                    </h2>
                    {existingReview ? (
                      <div>
                        <p
                          style={{
                            color: "var(--nexa-gray-400)",
                            marginBottom: "0.5rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          You reviewed this booking:
                        </p>
                        <div style={{ display: "flex", gap: "0.2rem", marginBottom: "0.5rem" }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <i
                              key={s}
                              className={`bi ${existingReview.rating >= s ? "bi-star-fill" : "bi-star"}`}
                              style={{ color: "#ffc107", fontSize: "1.2rem" }}
                            />
                          ))}
                        </div>
                        {existingReview.comment && (
                          <p style={{ color: "var(--nexa-gray-300)", margin: 0 }}>
                            {existingReview.comment}
                          </p>
                        )}
                      </div>
                    ) : reviewSuccess ? (
                      <p style={{ color: "#00e676" }}>
                        <i className="bi bi-check-circle me-2"></i>Review submitted! Thank you.
                      </p>
                    ) : (
                      <div>
                        <p
                          style={{
                            color: "var(--nexa-gray-400)",
                            marginBottom: "1rem",
                            fontSize: "0.88rem",
                          }}
                        >
                          How was your experience with this parking space?
                        </p>
                        <div style={{ marginBottom: "1rem" }}>
                          <StarPicker value={reviewRating} onChange={setReviewRating} />
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Share details about your experience (optional)"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          style={{
                            width: "100%",
                            background: "var(--nexa-surface-2)",
                            border: "1px solid var(--nexa-border)",
                            borderRadius: 8,
                            color: "var(--nexa-gray-100)",
                            padding: "0.65rem 0.9rem",
                            fontSize: "0.88rem",
                            resize: "vertical",
                            outline: "none",
                            marginBottom: "0.75rem",
                          }}
                        />
                        {reviewError && (
                          <p
                            style={{
                              color: "#ff6b6b",
                              fontSize: "0.85rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            {reviewError}
                          </p>
                        )}
                        <button
                          className="btn btn-nexa btn-nexa-sm"
                          onClick={submitReview}
                          disabled={reviewSubmitting}
                        >
                          {reviewSubmitting ? "Submitting…" : "Submit Review"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right column */}
              <div>
                {/* Host */}
                <div className="dash-card mb-4">
                  <h2 className="dash-card-title mb-3">Your Host</h2>
                  <div className="bkd-host-row">
                    <img
                      src={host ? host.profilePictureUrl : ""}
                      alt="Host"
                      className="bkd-host-avatar"
                    />
                    <div>
                      <div className="host-name">
                        {host ? parseDisplayName(host.firstName, host.lastName) : "Loading..."}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--nexa-gray-400)" }}>
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
                      disabled={
                        !booking ||
                        effectiveStatus === "cancelled" ||
                        effectiveStatus === "completed"
                      }
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      {effectiveStatus === "cancelled" ? "Booking Cancelled" : "Cancel Booking"}
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
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>Cancel Booking
            </h2>
            <p className="modal-body-text">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-nexa-outline btn-sm"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Booking
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={cancelBooking}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
