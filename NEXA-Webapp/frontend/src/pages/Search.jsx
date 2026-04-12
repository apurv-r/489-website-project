import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const TYPES = ["all", "garage", "driveway", "open-lot", "covered"];

function toDisplayType(type) {
  switch (String(type || "").toLowerCase()) {
    case "open lot":
      return "Open Lot";
    case "garage":
      return "Garage";
    case "driveway":
      return "Driveway";
    case "covered":
      return "Covered";
    default:
      return "Parking";
  }
}

function toTypeKey(type) {
  const lowered = String(type || "").toLowerCase();

  if (lowered === "open lot") {
    return "open-lot";
  }

  return lowered;
}

function toLocationLabel(location) {
  if (!location) {
    return "Location unavailable";
  }

  const city = String(location.city || "").trim();
  const state = String(location.state || "").trim();

  if (city && state) {
    return `${city}, ${state}`;
  }

  if (city) {
    return city;
  }

  if (state) {
    return state;
  }

  return "Location unavailable";
}

export default function Search() {
  const [activeType, setActiveType] = useState("all");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await axios.get(`${API_BASE_URL}/api/parking-spaces`);

        if (isMounted) {
          console.log("Fetched listings:", response.data);
          setListings(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const backendMessage =
          error.response?.data?.message ||
          "Unable to load parking listings right now. Please try again.";

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

  const mappedListings = useMemo(
    () =>
      listings.map((listing) => {
        const typeLabel = toDisplayType(listing.parkingType);
        const typeKey = toTypeKey(listing.parkingType);

        return {
          id: listing._id,
          img: listing.imageUrls?.[0] || "",
          title: listing.title || `${typeLabel} Listing`,
          location: toLocationLabel(listing.location),
          tags: [typeLabel],
          typeKey,
          price: Number.isFinite(Number(listing.dailyRate))
            ? `$${Number(listing.dailyRate).toFixed(2)}`
            : "$0.00",
          rating:
            listing.reviewCount > 0
              ? Number(listing.ratingAverage).toFixed(1)
              : "—",
        };
      }),
    [listings],
  );

  const filtered =
    activeType === "all"
      ? mappedListings
      : mappedListings.filter((listing) => listing.typeKey === activeType);

  return (
    <div className="search-page">
      <div className="search-layout">
        {/* LEFT PANEL */}
        <div className="search-panel" id="searchPanel">
          {/* Filters */}
          <div className="search-filters">
            <div className="search-filters-top">
              <div className="position-relative search-location-input">
                <i className="bi bi-geo-alt-fill search-filter-icon"></i>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Seattle, WA"
                  placeholder="Location…"
                />
              </div>
              <div className="search-date-range">
                <div className="position-relative">
                  <i className="bi bi-calendar3 search-filter-icon"></i>
                  <input
                    type="date"
                    className="form-control search-filter-date"
                  />
                </div>
                <span className="date-separator">→</span>
                <div className="position-relative">
                  <i className="bi bi-calendar3 search-filter-icon"></i>
                  <input
                    type="date"
                    className="form-control search-filter-date"
                  />
                </div>
              </div>
            </div>
            <div className="search-filters-row">
              <div className="filter-chips">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    className={`filter-chip${activeType === t ? " active" : ""}`}
                    onClick={() => setActiveType(t)}
                  >
                    {t === "all" && "All"}
                    {t === "garage" && (
                      <>
                        <i className="bi bi-building me-1"></i>Garage
                      </>
                    )}
                    {t === "driveway" && (
                      <>
                        <i className="bi bi-house-door me-1"></i>Driveway
                      </>
                    )}
                    {t === "open-lot" && (
                      <>
                        <i className="bi bi-square me-1"></i>Open Lot
                      </>
                    )}
                    {t === "covered" && (
                      <>
                        <i className="bi bi-umbrella me-1"></i>Covered
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-result-count">
              <span className="text-gradient fw-bold">{filtered.length}</span>{" "}
              parking spots found near <strong>Seattle, WA</strong>
            </div>
          </div>

          {/* Results */}
          <div className="search-results" id="searchResults">
            {loading ? (
              <div
                className="text-center py-5"
                style={{ color: "var(--nexa-gray-400)" }}
              >
                Loading listings...
              </div>
            ) : errorMessage ? (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="text-center py-5"
                style={{ color: "var(--nexa-gray-400)" }}
              >
                No parking listings found.
              </div>
            ) : (
              filtered.map((r) => (
                <Link to="/details" className="search-result-card" key={r.id}>
                  <div className="search-result-img">
                    {r.img ? (
                      <img src={r.img} alt={r.title} />
                    ) : (
                      <div
                        className="w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--nexa-gray-400)",
                        }}
                      >
                        No image
                      </div>
                    )}
                    <button
                      className="listing-save"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="bi bi-heart"></i>
                    </button>
                  </div>
                  <div className="search-result-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="search-result-title">{r.title}</h6>
                      <div className="listing-rating">
                        <i className="bi bi-star-fill"></i> {r.rating}
                      </div>
                    </div>
                    <p className="search-result-location">
                      <i className="bi bi-geo-alt-fill"></i> {r.location}
                    </p>
                    <div className="listing-tags">
                      {r.tags.map((t) => (
                        <span className="listing-tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="search-result-footer">
                      <div className="listing-price">
                        {r.price} <span>/ day</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* MAP PLACEHOLDER */}
        <div
          className="search-map"
          id="searchMap"
          style={{
            background: "var(--nexa-dark-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="text-center"
            style={{ color: "var(--nexa-gray-400)" }}
          >
            <i className="bi bi-map fs-1 mb-2 d-block"></i>
            <p>Interactive map — integrate Leaflet here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
