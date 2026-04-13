import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import HostSidebar from "../../components/HostSidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function toDisplayType(type) {
  switch (type) {
    case "open lot":
      return "Open Lot";
    case "suv/midsize":
      return "SUV / Midsize";
    case "truck/large":
      return "Truck / Large";
    default:
      return String(type || "").replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

function toAddress(location) {
  if (!location) {
    return "Address unavailable";
  }

  const parts = [
    location.address,
    location.city,
    location.state,
    location.zipCode,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Address unavailable";
}

export default function HostMyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      setLoading(true);
      setErrorMessage("");

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/api/parking-spaces/me`,
          {
            withCredentials: true,
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (isMounted) {
          setListings(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const backendMessage =
          error.response?.data?.message ||
          "Unable to load your listings right now. Please try again.";
        setErrorMessage(backendMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayListings = useMemo(
    () =>
      listings.map((listing) => ({
        id: listing._id,
        img: listing.imageUrls?.[0] || "",
        name: listing.title || "Untitled listing",
        addr: toAddress(listing.location),
        type: toDisplayType(listing.parkingType),
        price: Number.isFinite(Number(listing.dailyRate))
          ? `$${Number(listing.dailyRate).toFixed(2)}/day`
          : "Rate unavailable",
        rating: Number.isFinite(Number(listing.ratingAverage))
          ? Number(listing.ratingAverage).toFixed(1)
          : "—",
        reviews: Number(listing.reviewCount) || 0,
        bookings: Number(listing.bookingCount) || 0,
        status: listing.isPublished ? "active" : "pending",
      })),
    [listings],
  );

  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">My Listings</h1>
              <p className="dash-page-sub">
                Manage your active and pending parking spaces.
              </p>
            </div>
            <Link
              to="/host/create-listing"
              className="btn btn-nexa btn-nexa-sm"
            >
              <i className="bi bi-plus-lg me-1"></i> New Listing
            </Link>
          </div>

          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="dash-card">
              <p className="mb-0" style={{ color: "var(--nexa-gray-400)" }}>
                Loading your listings...
              </p>
            </div>
          ) : displayListings.length === 0 ? (
            <div className="dash-card">
              <h3 style={{ marginBottom: "0.5rem" }}>No listings yet</h3>
              <p
                style={{ color: "var(--nexa-gray-400)", marginBottom: "1rem" }}
              >
                You haven't created any parking listings yet.
              </p>
              <Link
                to="/host/create-listing"
                className="btn btn-nexa btn-nexa-sm"
              >
                <i className="bi bi-plus-lg me-1"></i> Create your first listing
              </Link>
            </div>
          ) : (
            <div className="lsr-listings-grid">
              {displayListings.map((listing) => (
                <div
                  className="lsr-listing-card"
                  key={listing.id}
                  data-status={listing.status}
                >
                  <div className="lsr-listing-img-wrap">
                    {listing.img ? (
                      <img
                        src={listing.img}
                        alt={listing.name}
                        className="lsr-listing-card-img"
                      />
                    ) : (
                      <div
                        className="lsr-listing-card-img d-flex align-items-center justify-content-center"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--nexa-gray-400)",
                          fontSize: "0.85rem",
                        }}
                      >
                        No image
                      </div>
                    )}
                    <span
                      className={`lsr-badge lsr-badge-${listing.status} lsr-card-badge`}
                    >
                      {listing.status.charAt(0).toUpperCase() +
                        listing.status.slice(1)}
                    </span>
                  </div>

                  <div className="lsr-listing-card-body">
                    <div className="lsr-listing-card-type">{listing.type}</div>
                    <div className="lsr-listing-card-name">{listing.name}</div>
                    <div className="lsr-listing-card-addr">
                      <i className="bi bi-geo-alt"></i> {listing.addr}
                    </div>
                    <div className="lsr-listing-card-stats">
                      <span>
                        <i className="bi bi-cash"></i> {listing.price}
                      </span>
                      <span>
                        <i className="bi bi-star-fill"></i> {listing.reviews > 0 ? listing.rating.toFixed(1) : "No rating"} (
                        {listing.reviews})
                      </span>
                      <span>
                        <i className="bi bi-calendar2-check"></i>{" "}
                        {listing.bookings} bookings
                      </span>
                    </div>
                  </div>

                  <div className="lsr-listing-card-actions">
                    <Link
                      to={`/host/listing-details?id=${listing.id}`}
                      className="lsr-action-btn"
                    >
                      <i className="bi bi-eye"></i> View
                    </Link>
                    <Link
                      to={`/host/edit-listing?id=${listing.id}`}
                      className="lsr-action-btn"
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </Link>
                    <button className="lsr-action-btn lsr-action-btn--danger">
                      <i className="bi bi-trash"></i> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
