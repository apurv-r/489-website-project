import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Home() {
  const navigate = useNavigate();
  const [locationQuery, setLocationQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchValidationMessage, setSearchValidationMessage] = useState("");

  const [featuredListings, setFeaturedListings] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/parking-spaces`)
      .then(res => setFeaturedListings((res.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  const normalizedQuery = locationQuery.trim();
  const hasInvalidDateRange = Boolean(startDate && endDate && endDate < startDate);
  const hasAllRequiredFields = Boolean(normalizedQuery && startDate && endDate);

  function handleSearch(e) {
    e.preventDefault();

    if (!hasAllRequiredFields) {
      setSearchValidationMessage("Please complete location, start date, and end date.");
      return;
    }

    if (hasInvalidDateRange) {
      setSearchValidationMessage("End date cannot be earlier than start date.");
      return;
    }

    setSearchValidationMessage("");
    const nextParams = new URLSearchParams();

    if (normalizedQuery) {
      nextParams.set("q", normalizedQuery);
    }

    if (startDate) {
      nextParams.set("start", startDate);
    }

    if (endDate) {
      nextParams.set("end", endDate);
    }

    const queryString = nextParams.toString();

    if (queryString) {
      navigate(`/search?${queryString}`);
      return;
    }

    navigate("/search");
  }

  return (
    <>
      {/* HERO */}
      <section className="hero-section" id="hero">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1400&q=80"
            alt="Aerial city parking"
          />
        </div>
        <div className="container hero-content text-center">
          <div className="hero-badge animate-fade-up">
            <i className="bi bi-lightning-charge-fill"></i> The smarter way to park
          </div>
          <h1 className="hero-title animate-fade-up delay-1">
            Find <span className="text-gradient">Parking</span> Near You
          </h1>
          <p className="hero-subtitle mx-auto animate-fade-up delay-2">
            Search hundreds of affordable driveways, garages, and lots listed by local homeowners
            &amp; businesses.
          </p>

          <div className="search-bar-wrapper animate-fade-up delay-3">
            <form className="search-bar-form" onSubmit={handleSearch}>
              <div className="search-bar-field search-bar-field--location">
                <label className="search-label">
                  <i className="bi bi-geo-alt-fill me-1"></i>Location
                </label>
                <div className="position-relative">
                  <i className="bi bi-geo-alt search-input-icon"></i>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    style={{ paddingLeft: 44 }}
                    placeholder="City, address, or ZIP…"
                    value={locationQuery}
                    onChange={(event) => {
                      setLocationQuery(event.target.value);
                      setSearchValidationMessage("");
                    }}
                  />
                </div>
              </div>
              <div className="search-bar-field search-bar-field--dates">
                <label className="search-label">
                  <i className="bi bi-calendar-event me-1"></i>Dates
                </label>
                <div className="search-date-range search-date-range--hero">
                  <input
                    type="date"
                    className="form-control form-control-lg"
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      setSearchValidationMessage("");
                    }}
                  />
                  <span className="date-separator">→</span>
                  <input
                    type="date"
                    className="form-control form-control-lg"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                      setSearchValidationMessage("");
                    }}
                  />
                </div>
              </div>
              <div className="search-bar-field search-bar-field--btn">
                <button
                  type="submit"
                  className="btn btn-nexa btn-nexa-lg w-100"
                  disabled={!hasAllRequiredFields || hasInvalidDateRange}
                >
                  <i className="bi bi-search me-1"></i> Search
                </button>
              </div>
            </form>
            {searchValidationMessage && (
              <div className="mt-2" style={{ color: "#ff8080", fontSize: "0.9rem" }}>
                {searchValidationMessage}
              </div>
            )}
          </div>

          <div className="search-hints mt-4 animate-fade-up delay-4">
            <span className="search-hint">
              <i className="bi bi-fire me-1"></i>Popular:
            </span>
            <button
              type="button"
              className="search-hint-link btn btn-link p-0"
              onClick={() => navigate("/search")}
            >
              Seattle, WA
            </button>
            <button
              type="button"
              className="search-hint-link btn btn-link p-0"
              onClick={() => navigate("/search")}
            >
              Portland, OR
            </button>
            <button
              type="button"
              className="search-hint-link btn btn-link p-0"
              onClick={() => navigate("/search")}
            >
              San Francisco, CA
            </button>
            <button
              type="button"
              className="search-hint-link btn btn-link p-0"
              onClick={() => navigate("/search")}
            >
              Bellevue, WA
            </button>
          </div>

          <div className="hero-stats justify-content-center animate-fade-up delay-4">
            <div className="hero-stat">
              <h3 className="text-gradient">500+</h3>
              <p>Parking Spots</p>
            </div>
            <div className="hero-stat">
              <h3 className="text-gradient">1,200+</h3>
              <p>Happy Drivers</p>
            </div>
            <div className="hero-stat">
              <h3 className="text-gradient">50+</h3>
              <p>Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-padding" id="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">
              <i className="bi bi-gear"></i> How It Works
            </span>
            <h2>
              Park in <span className="text-gradient">Three Easy Steps</span>
            </h2>
            <p>
              Whether you're looking for a spot or listing one, NEXA makes the process seamless.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="text-center step-connector">
                <div className="step-number">1</div>
                <h5>Search &amp; Discover</h5>
                <p className="text-secondary px-2">
                  Enter your destination and browse available parking spaces near you on our
                  interactive map. Filter by distance, price, and type.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="text-center step-connector">
                <div className="step-number">2</div>
                <h5>Book &amp; Pay</h5>
                <p className="text-secondary px-2">
                  Found the perfect spot? Reserve it instantly. Secure payments and confirmation —
                  all handled through the platform.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="text-center">
                <div className="step-number">3</div>
                <h5>Park &amp; Go</h5>
                <p className="text-secondary px-2">
                  Follow the directions to your reserved space, park your vehicle, and enjoy your
                  day — hassle-free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      {featuredListings.length > 0 && (
        <section className="section-padding bg-dark-light" id="listings">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-tag">
                <i className="bi bi-star"></i> Featured Listings
              </span>
              <h2>
                Popular <span className="text-gradient">Parking Spots</span>
              </h2>
              <p>Hand-picked spaces loved by our community of drivers.</p>
            </div>
            <div className="row g-4">
              {featuredListings.map((listing) => {
                const location = [listing.location?.city, listing.location?.state].filter(Boolean).join(", ");
                const amenities = (listing.amenities || []).slice(0, 3);
                return (
                  <div className="col-lg-4 col-md-6" key={listing._id}>
                    <div
                      className="listing-card"
                      onClick={() => navigate(`/details?id=${listing._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="listing-img">
                        {listing.imageUrls?.[0]
                          ? <img src={listing.imageUrls?.[0]} alt={listing.title} />
                          : <div style={{ width: '100%', height: '100%', background: 'var(--nexa-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nexa-gray-500)' }}><i className="bi bi-image fs-2" /></div>
                        }
                        <span className="listing-badge">Featured</span>
                        <button
                          className="listing-save"
                          aria-label="Save listing"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="bi bi-heart"></i>
                        </button>
                      </div>
                      <div className="listing-body">
                        <h6 className="listing-title">{listing.title}</h6>
                        <p className="listing-location">
                          <i className="bi bi-geo-alt-fill"></i> {location || "Location unavailable"}
                        </p>
                        <div className="listing-tags">
                          {listing.parkingType && <span className="listing-tag">{listing.parkingType}</span>}
                          {amenities.map((a) => (
                            <span className="listing-tag" key={a}>{a}</span>
                          ))}
                        </div>
                        <div className="listing-footer">
                          <div className="listing-price">
                            ${Number(listing.dailyRate || 0).toFixed(0)} <span>/ day</span>
                          </div>
                          <div className="listing-rating">
                            <i className="bi bi-star-fill"></i>{" "}
                            {listing.reviewCount > 0 ? Number(listing.ratingAverage).toFixed(1) : "New"}{" "}
                            <span>({listing.reviewCount || 0})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-5">
              <button className="btn btn-nexa-outline" onClick={() => navigate("/search")}>
                View All Listings <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* WHY NEXA */}
      <section className="section-padding" id="features">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">
              <i className="bi bi-heart"></i> Why Nexa
            </span>
            <h2>
              Built for <span className="text-gradient">Drivers &amp; Hosts</span>
            </h2>
            <p>Everything you need to rent or list parking — all in one platform.</p>
          </div>
          <div className="row g-4">
            {[
              {
                icon: "bi-map",
                color: "purple",
                title: "Interactive Map",
                desc: "Browse available spaces on a real-time map. Zoom, filter, and find the perfect spot near your destination.",
              },
              {
                icon: "bi-shield-fill-check",
                color: "purple",
                title: "Verified Listings",
                desc: "Every space is reviewed and verified by our team. No fake listings, no surprises.",
              },
              {
                icon: "bi-credit-card-fill",
                color: "purple",
                title: "Secure Payments",
                desc: "Pay safely through the platform. Hosts get paid automatically — drivers are protected.",
              },
              {
                icon: "bi-chat-dots-fill",
                color: "purple",
                title: "In-App Messaging",
                desc: "Chat directly with your host or driver. Instructions, gate codes, and questions — all in one place.",
              },
            ].map((f, i) => (
              <div className="col-lg-3 col-md-6" key={i}>
                <div className="nexa-card text-center h-100">
                  <div className={`feature-icon ${f.color} mx-auto`}>
                    <i className={`bi ${f.icon}`}></i>
                  </div>
                  <h5>{f.title}</h5>
                  <p className="text-secondary">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-dark-light">
        <div className="container text-center">
          <div className="section-header">
            <span className="section-tag">
              <i className="bi bi-house-heart"></i> List Your Space
            </span>
            <h2>
              Turn Your <span className="text-gradient">Parking Space</span> into Income
            </h2>
            <p className="mx-auto" style={{ maxWidth: 540 }}>
              Have a driveway or garage sitting empty? List it on NEXA and start earning passive
              income with zero effort.
            </p>
          </div>
          <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
            <button className="btn btn-nexa btn-nexa-lg" onClick={() => navigate("/register")}>
              <i className="bi bi-plus-circle me-2"></i>List My Space
            </button>
            <button
              className="btn btn-nexa-outline btn-nexa-lg"
              onClick={() => navigate("/search")}
            >
              <i className="bi bi-search me-2"></i>Find Parking
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
