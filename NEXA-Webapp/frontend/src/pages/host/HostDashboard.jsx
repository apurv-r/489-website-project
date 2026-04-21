import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import HostSidebar from "../../components/HostSidebar";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const STATUS_CLASS = {
  active: "status-active",
  approved: "status-upcoming",
  pending: "status-pending",
  completed: "status-completed",
  declined: "status-cancelled",
  cancelled: "status-cancelled",
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getEffectiveStatus(status, startDate, endDate) {
  if (status === "cancelled" || status === "declined" || status === "pending") return status;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end) return "completed";
  if (now >= start) return "active";
  return "approved";
}

export default function HostDashboard() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        const [userRes, listingsRes, bookingsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true, headers }),
          axios.get(`${API_BASE_URL}/api/parking-spaces/me`, { withCredentials: true, headers }),
          axios.get(`${API_BASE_URL}/api/bookings/me`, { withCredentials: true, headers }),
        ]);

        setUser(userRes.data.user || userRes.data);
        setListings(Array.isArray(listingsRes.data) ? listingsRes.data : []);
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeListings = listings.filter((l) => l.isPublished && l.isVerified).length;
  const activeBookings = bookings.filter((b) => {
    const s = getEffectiveStatus(b.status, b.startDate, b.endDate);
    return s === "active" || s === "approved";
  }).length;

  const now = new Date();
  const thisMonthEarnings = bookings
    .filter((b) => {
      const d = new Date(b.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const ratingsWithReviews = listings.filter((l) => l.reviewCount > 0);
  const avgRating =
    ratingsWithReviews.length > 0
      ? (
          ratingsWithReviews.reduce((sum, l) => sum + l.ratingAverage, 0) /
          ratingsWithReviews.length
        ).toFixed(1)
      : null;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">
                {loading ? "Welcome back" : `${getGreeting()}, ${user?.firstName || "Host"}`} 👋
              </h1>
              <p className="dash-page-sub">Here's an overview of your listings and earnings.</p>
            </div>
            <Link to="/host/create-listing" className="btn btn-nexa btn-nexa-sm">
              <i className="bi bi-plus-lg me-1"></i> New Listing
            </Link>
          </div>

          <div className="dash-stat-grid">
            <div className="dash-stat-card">
              <div
                className="dash-stat-icon"
                style={{ background: "rgba(108,92,231,0.15)", color: "var(--nexa-primary)" }}
              >
                <i className="bi bi-building"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">{loading ? "—" : activeListings}</div>
                <div className="dash-stat-label">Active Listings</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div
                className="dash-stat-icon"
                style={{ background: "rgba(0,210,255,0.12)", color: "var(--nexa-accent)" }}
              >
                <i className="bi bi-calendar2-check-fill"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">{loading ? "—" : activeBookings}</div>
                <div className="dash-stat-label">Active Bookings</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div
                className="dash-stat-icon"
                style={{ background: "rgba(0,217,126,0.12)", color: "#00d97e" }}
              >
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">
                  {loading ? "—" : `$${thisMonthEarnings.toFixed(0)}`}
                </div>
                <div className="dash-stat-label">This Month</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div
                className="dash-stat-icon"
                style={{ background: "rgba(241,196,15,0.12)", color: "#f1c40f" }}
              >
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="dash-stat-body">
                <div className="dash-stat-value">{loading ? "—" : avgRating || "N/A"}</div>
                <div className="dash-stat-label">Avg. Rating</div>
              </div>
            </div>
          </div>

          <div className="dash-two-col">
            <div className="dash-card">
              <div className="dash-card-header">
                <h2 className="dash-card-title">Recent Bookings</h2>
                <Link to="/host/bookings" className="dash-card-link">
                  View all
                </Link>
              </div>
              <div className="dash-booking-list">
                {loading ? (
                  <p style={{ color: "var(--nexa-gray-500)", padding: "1rem 0" }}>Loading…</p>
                ) : recentBookings.length === 0 ? (
                  <p style={{ color: "var(--nexa-gray-500)", padding: "1rem 0" }}>
                    No bookings yet.
                  </p>
                ) : (
                  recentBookings.map((b) => {
                    const guestName = b.renter
                      ? `${b.renter.firstName} ${b.renter.lastName}`
                      : "Guest";
                    const listingTitle = b.parkingSpace?.title || "Unknown Listing";
                    const img = b.parkingSpace?.imageUrls?.[0] || "";
                    const effectiveStatus = getEffectiveStatus(b.status, b.startDate, b.endDate);
                    return (
                      <Link
                        to={`/host/booking-details?id=${b._id}`}
                        className="dash-booking-item"
                        key={b._id}
                      >
                        {img ? (
                          <img src={img} alt="" className="dash-booking-thumb" />
                        ) : (
                          <div
                            className="dash-booking-thumb"
                            style={{
                              background: "var(--nexa-surface-2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i className="bi bi-image" style={{ color: "var(--nexa-gray-500)" }} />
                          </div>
                        )}
                        <div className="dash-booking-info">
                          <div className="dash-booking-name">
                            {guestName} — {listingTitle}
                          </div>
                          <div className="dash-booking-dates">
                            <i className="bi bi-calendar3"></i> {formatDate(b.startDate)} –{" "}
                            {formatDate(b.endDate)}
                          </div>
                          <div className="dash-booking-price">${b.totalAmount?.toFixed(2)}</div>
                        </div>
                        <span
                          className={`dash-booking-status ${STATUS_CLASS[effectiveStatus] || ""}`}
                          style={{ textTransform: "capitalize" }}
                        >
                          {effectiveStatus}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            <div className="dash-col-right">
              <div className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">My Listings</h2>
                  <Link to="/host/my-listings" className="dash-card-link">
                    View all
                  </Link>
                </div>
                <div className="lsr-listing-mini-list">
                  {loading ? (
                    <p style={{ color: "var(--nexa-gray-500)", padding: "0.5rem 0" }}>Loading…</p>
                  ) : listings.length === 0 ? (
                    <p style={{ color: "var(--nexa-gray-500)", padding: "0.5rem 0" }}>
                      No listings yet.
                    </p>
                  ) : (
                    listings.slice(0, 3).map((l) => {
                      const isListingActive = l.isPublished && l.isVerified;
                      const listingStatusLabel = !l.isPublished
                        ? "Unpublished"
                        : l.isVerified
                          ? "Active"
                          : "Pending Verification";

                      return (
                        <Link
                          to={`/host/listing-details?id=${l._id}`}
                          className="lsr-listing-mini"
                          key={l._id}
                        >
                          {l.imageUrls?.[0] ? (
                            <img src={l.imageUrls[0]} alt="" className="lsr-listing-mini-img" />
                          ) : (
                            <div
                              className="lsr-listing-mini-img"
                              style={{
                                background: "var(--nexa-surface-2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <i
                                className="bi bi-image"
                                style={{ color: "var(--nexa-gray-500)" }}
                              />
                            </div>
                          )}
                          <div className="lsr-listing-mini-info">
                            <div className="lsr-listing-mini-name">{l.title}</div>
                            <div className="lsr-listing-mini-meta">
                              ${l.dailyRate}/day ·{" "}
                              <span
                                className={`lsr-badge ${isListingActive ? "lsr-badge-active" : "lsr-badge-pending"}`}
                              >
                                {listingStatusLabel}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="dash-card">
                <h2 className="dash-card-title" style={{ marginBottom: "1rem" }}>
                  Quick Actions
                </h2>
                <div className="dash-quick-actions">
                  <Link to="/host/create-listing" className="dash-quick-btn">
                    <i className="bi bi-plus-circle"></i> New Listing
                  </Link>
                  <Link to="/host/bookings" className="dash-quick-btn">
                    <i className="bi bi-calendar2-check"></i> Bookings
                  </Link>
                  <Link to="/host/earnings" className="dash-quick-btn">
                    <i className="bi bi-cash-stack"></i> Earnings
                  </Link>
                  <Link to="/host/messages" className="dash-quick-btn">
                    <i className="bi bi-chat-dots"></i> Messages
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
