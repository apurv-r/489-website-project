import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AMENITY_ICON_MAP = {
  "EV Charging": "bi-lightning-charge-fill",
  CCTV: "bi-camera-video-fill",
  "Well Lit": "bi-lightbulb-fill",
  Covered: "bi-umbrella-fill",
  "Keypad Entry": "bi-key-fill",
  "Near Transit": "bi-bus-front-fill",
  Accessible: "bi-person-wheelchair",
  "24/7 Access": "bi-clock-history",
};

const DAY_LABELS = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function getMonthLabel(date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function eachDateInRange(startDate, endDate) {
  const dates = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);

  const finalDate = new Date(endDate);
  finalDate.setHours(0, 0, 0, 0);

  while (cursor <= finalDate) {
    dates.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function buildCalendarCells(monthDate, bookedDates) {
  const firstDay = startOfMonth(monthDate);
  const firstWeekday = firstDay.getDay();
  const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ type: "empty", key: `empty-${i}` });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const dateKey = formatDateKey(date);
    cells.push({
      type: "day",
      key: dateKey,
      date,
      dateKey,
      day,
      isBooked: bookedDates.has(dateKey),
      isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
    });
  }

  return cells;
}

function formatParkingType(type) {
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

function formatVehicleSize(size) {
  switch (String(size || "").toLowerCase()) {
    case "compact":
      return "Compact";
    case "standard":
      return "Standard";
    case "suv/midsize":
      return "SUV / Midsize";
    case "truck/large":
      return "Truck / Large";
    default:
      return "Any size";
  }
}

function formatAddress(location) {
  if (!location) {
    return "Address unavailable";
  }

  const parts = [location.address, location.city, location.state, location.zipCode]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Address unavailable";
}

function getInitials(name) {
  return (
    String(name || "Host")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "H"
  );
}

function toMapUrl(location) {
  if (!location?.latitude || !location?.longitude) {
    return null;
  }

  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
}

export default function Details(user) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [listing, setListing] = useState(null);
  const [futureBookings, setFutureBookings] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    let isMounted = true;

    async function fetchListing() {
      if (!listingId) {
        setErrorMessage("Missing listing id. Please choose a listing from search.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const response = await axios.get(`${API_BASE_URL}/api/parking-spaces/${listingId}`);

        if (isMounted) {
          setListing(response.data);
          setActiveImg(0);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const backendMessage =
          error.response?.data?.message ||
          "Unable to load this listing right now. Please try again.";

        setErrorMessage(backendMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchListing();

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchFutureBookings() {
      if (!listingId) {
        setCalendarLoading(false);
        return;
      }

      setCalendarLoading(true);
      setCalendarError("");

      try {
        const response = await axios.get(`${API_BASE_URL}/api/bookings/future/${listingId}`);

        if (isMounted) {
          setFutureBookings(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCalendarError(
          error.response?.data?.message || "Availability calendar could not be loaded right now.",
        );
      } finally {
        if (isMounted) {
          setCalendarLoading(false);
        }
      }
    }

    fetchFutureBookings();

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  const images = useMemo(() => listing?.imageUrls || [], [listing]);
  const hostName = useMemo(() => {
    const firstName = listing?.host?.firstName || "Host";
    const lastName = listing?.host?.lastName || "";
    return `${firstName} ${lastName}`.trim();
  }, [listing]);

  const amenities = useMemo(() => listing?.amenities || [], [listing]);
  const availableDays = useMemo(() => listing?.availableDays || [], [listing]);
  const mapUrl = useMemo(() => toMapUrl(listing?.location), [listing]);
  const bookedDates = useMemo(() => {
    const dates = new Set();

    futureBookings.forEach((booking) => {
      if (!booking?.startDate || !booking?.endDate) {
        return;
      }

      eachDateInRange(new Date(booking.startDate), new Date(booking.endDate)).forEach((dateKey) => {
        dates.add(dateKey);
      });
    });

    return dates;
  }, [futureBookings]);

  const calendarCells = useMemo(
    () => buildCalendarCells(calendarMonth, bookedDates),
    [calendarMonth, bookedDates],
  );

  const todayKey = formatDateKey(new Date());

  function prevImage() {
    if (images.length < 2) {
      return;
    }

    setActiveImg((current) => (current - 1 + images.length) % images.length);
  }

  function nextImage() {
    if (images.length < 2) {
      return;
    }

    setActiveImg((current) => (current + 1) % images.length);
  }

  function goToPreviousMonth() {
    setCalendarMonth((current) => addMonths(current, -1));
  }

  function goToNextMonth() {
    setCalendarMonth((current) => addMonths(current, 1));
  }

  async function createMessageThread() {
    const host = listing.host;
    console.log("listing host: ", host);
    console.log("listing host id: ", host._id);
    //                                                    senderId, recipientId
    await axios.put(`${API_BASE_URL}/api/users/message/${user._id}/${host._id}`,
    { text: `Hi ${host.firstName}, I'm interested in your parking space "${listing.title}". Is it still available?` },
    { withCredentials: true })
    .then(response => {
      console.log("successfully sent message: ", response.data);
      navigate("/messages");
    })
    .catch(error => {
      console.log("error sending message: ", error);
    });
  }

  if (loading) {
    return (
      <main className="details-main">
        <div
          className="container-xl details-container text-center py-5"
          style={{ color: "var(--nexa-gray-400)" }}
        >
          Loading listing details...
        </div>
      </main>
    );
  }

  if (errorMessage || !listing) {
    return (
      <main className="details-main">
        <div className="details-breadcrumb">
          <div className="container-xl">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/search">Search</Link>
                </li>
                <li className="breadcrumb-item active">Listing details</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="container-xl details-container">
          <div className="alert alert-danger" role="alert">
            {errorMessage || "Listing not found."}
          </div>
          <Link to="/search" className="btn btn-nexa-outline">
            <i className="bi bi-arrow-left me-1"></i> Back to search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="details-main">
      <div className="details-breadcrumb">
        <div className="container-xl">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/search">Search</Link>
              </li>
              <li className="breadcrumb-item active">{listing.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container-xl details-container">
        <div className="details-gallery">
          <div className="gallery-carousel">
            {images.length > 1 && (
              <>
                <button
                  className="gallery-arrow gallery-arrow--prev"
                  onClick={prevImage}
                  type="button"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button
                  className="gallery-arrow gallery-arrow--next"
                  onClick={nextImage}
                  type="button"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </>
            )}
            <div className="gallery-16-9">
              {images.length > 0 ? (
                <img src={images[activeImg] || images[0]} alt={listing.title} />
              ) : (
                <div
                  className="w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ color: "var(--nexa-gray-400)" }}
                >
                  No images available
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="gallery-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`gallery-dot${index === activeImg ? " active" : ""}`}
                    onClick={() => setActiveImg(index)}
                  ></button>
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((src, index) => (
                <div
                  key={src}
                  className={`gallery-thumb${index === activeImg ? " active" : ""}`}
                  onClick={() => setActiveImg(index)}
                >
                  <div className="gallery-thumb-16-9">
                    <img src={src} alt={`${listing.title} view ${index + 1}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="details-body">
          <div className="details-left">
            <div className="details-title-row">
              <div>
                <h1 className="details-title">{listing.title}</h1>
                <div className="details-meta">
                  <span>
                    <i className="bi bi-geo-alt-fill"></i> {formatAddress(listing.location)}
                  </span>
                  <span className="details-meta-dot">·</span>
                  <span className="listing-tag" style={{ display: "inline-block" }}>
                    {formatParkingType(listing.parkingType)}
                  </span>
                </div>
              </div>
              <div className="details-rating-badge">
                <i className="bi bi-star-fill"></i>
                <span>
                  {Number.isFinite(Number(listing.ratingAverage))
                    ? Number(listing.ratingAverage).toFixed(1)
                    : "0.0"}
                </span>
                <small>({Number(listing.reviewCount) || 0} reviews)</small>
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">About this space</h2>
              <p className="details-description">
                {listing.description || "No description was provided for this listing."}
              </p>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">Space details</h2>
              <div className="details-amenities">
                <div className="amenity-item">
                  <i className="bi bi-car-front"></i>
                  <span>{formatVehicleSize(listing.maxVehicleSize)}</span>
                </div>
                <div className="amenity-item">
                  <i className="bi bi-calendar2-week"></i>
                  <span>Min. {listing.minimumBookingDays || 1} day booking</span>
                </div>
                <div className="amenity-item">
                  <i className="bi bi-check-circle"></i>
                  <span>{listing.isVerified ? "Verified" : "Pending verification"}</span>
                </div>
                {listing.isPublished === false && (
                  <div className="amenity-item">
                    <i className="bi bi-binoculars"></i>
                    <span>{listing.isPublished ? "Published" : "Draft"}</span>
                  </div>
                )}
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">Amenities</h2>
              {amenities.length > 0 ? (
                <div className="details-amenities">
                  {amenities.map((amenity) => (
                    <div className="amenity-item" key={amenity}>
                      <i
                        className={`bi ${AMENITY_ICON_MAP[amenity] || "bi-check-circle-fill"}`}
                      ></i>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="details-description">No amenities listed yet.</p>
              )}
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">Availability</h2>
              <div
                className="details-amenities"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))" }}
              >
                {availableDays.length > 0 ? (
                  availableDays.map((day) => (
                    <div className="amenity-item" key={day}>
                      <i className="bi bi-calendar-check-fill"></i>
                      <span>{DAY_LABELS[day] || day}</span>
                    </div>
                  ))
                ) : (
                  <p className="details-description">No weekday restrictions specified.</p>
                )}
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">Availability Calendar</h2>
              <div className="avail-calendar">
                <div className="avail-cal-header">
                  <button
                    type="button"
                    className="avail-cal-nav"
                    onClick={goToPreviousMonth}
                    aria-label="Previous month"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <div className="avail-cal-month">{getMonthLabel(calendarMonth)}</div>
                  <button
                    type="button"
                    className="avail-cal-nav"
                    onClick={goToNextMonth}
                    aria-label="Next month"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>

                {calendarLoading ? (
                  <div className="text-center py-4" style={{ color: "var(--nexa-gray-400)" }}>
                    Loading availability...
                  </div>
                ) : calendarError ? (
                  <div className="alert alert-warning mb-0" role="alert">
                    {calendarError}
                  </div>
                ) : (
                  <>
                    <div className="avail-cal-weekdays">
                      {WEEKDAY_LABELS.map((weekday) => (
                        <span key={weekday}>{weekday}</span>
                      ))}
                    </div>
                    <div className="avail-cal-grid">
                      {calendarCells.map((cell) => {
                        if (cell.type === "empty") {
                          return <div key={cell.key} className="cal-cell cal-empty"></div>;
                        }

                        const cellClasses = ["cal-cell"];

                        if (cell.isBooked) {
                          cellClasses.push("cal-booked");
                        } else if (cell.dateKey === todayKey) {
                          cellClasses.push("cal-selected");
                        } else if (cell.isPast) {
                          cellClasses.push("cal-past");
                        } else {
                          cellClasses.push("cal-free");
                        }

                        return (
                          <div key={cell.key} className={cellClasses.join(" ")}>
                            {cell.day}
                          </div>
                        );
                      })}
                    </div>
                    <div className="avail-cal-legend">
                      <div className="avail-legend-item">
                        <span className="avail-legend-dot avail-dot-free"></span>
                        <span>Available</span>
                      </div>
                      <div className="avail-legend-item">
                        <span className="avail-legend-dot avail-dot-booked"></span>
                        <span>Booked</span>
                      </div>
                      <div className="avail-legend-item">
                        <span className="avail-legend-dot avail-dot-selected"></span>
                        <span>Today</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="details-section">
              <h2 className="details-section-title">Location</h2>
              <p className="details-description">{formatAddress(listing.location)}</p>
              <p className="details-description" style={{ marginTop: "0.5rem" }}>
                Coordinates:{" "}
                {listing.location?.latitude?.toFixed?.(6) ?? listing.location?.latitude},{" "}
                {listing.location?.longitude?.toFixed?.(6) ?? listing.location?.longitude}
              </p>
              <div
                className="details-map"
                id="detailMap"
                style={{
                  background: "var(--nexa-dark-card)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <span style={{ color: "var(--nexa-gray-400)" }}>
                  <i className="bi bi-map me-2"></i>Map preview unavailable without a map provider
                </span>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-nexa-outline btn-nexa-sm"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">
                Reviews
                <span className="details-review-score">
                  <i className="bi bi-star-fill"></i>{" "}
                  {Number.isFinite(Number(listing.ratingAverage))
                    ? Number(listing.ratingAverage).toFixed(1)
                    : "0.0"}{" "}
                  &nbsp;·&nbsp; {Number(listing.reviewCount) || 0} reviews
                </span>
              </h2>
              {Number(listing.reviewCount) > 0 ? (
                <p className="details-description">
                  Detailed review comments are not loaded yet, but this listing has an average
                  rating above.
                </p>
              ) : (
                <p className="details-description">
                  No reviews yet. Be the first to book this space.
                </p>
              )}
            </div>
          </div>

          <div className="details-right">
            <div className="booking-card">
              <div className="booking-card-price">
                $
                {Number.isFinite(Number(listing.dailyRate))
                  ? Number(listing.dailyRate).toFixed(2)
                  : "0.00"}{" "}
                <span>/ day</span>
              </div>
              <div className="booking-card-rating">
                <i className="bi bi-star-fill"></i>{" "}
                {Number.isFinite(Number(listing.ratingAverage))
                  ? Number(listing.ratingAverage).toFixed(1)
                  : "0.0"}
                <span className="booking-card-reviews">
                  ({Number(listing.reviewCount) || 0} reviews)
                </span>
              </div>
              <div className="booking-dates">
                <div className="booking-date-field">
                  <label>Check-in</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="booking-date-sep">
                  <i className="bi bi-arrow-right"></i>
                </div>
                <div className="booking-date-field">
                  <label>Check-out</label>
                  <input type="date" className="form-control" />
                </div>
              </div>
              <button
                className="btn btn-nexa w-100 booking-btn"
                onClick={() => navigate("/booking")}
              >
                <i className="bi bi-calendar-check me-2"></i>Reserve Now
              </button>
              <p className="booking-note">You won't be charged yet</p>
            </div>

            <div className="host-card">
              <div className="host-card-header">
                <div
                  className="host-avatar d-flex align-items-center justify-content-center"
                  style={{
                    background: "rgba(108,92,231,0.15)",
                    color: "var(--nexa-white)",
                    fontWeight: 700,
                  }}
                >
                  {getInitials(hostName)}
                </div>
                <div className="host-info">
                  <span className="host-name">{hostName}</span>
                  <span className="host-since">Listing host</span>
                  <div className="host-badges">
                    <span className="host-badge">
                      <i className="bi bi-patch-check-fill"></i> Verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="host-stats">
                <div className="host-stat">
                  <span className="host-stat-value">{Number(listing.reviewCount) || 0}</span>
                  <span className="host-stat-label">Reviews</span>
                </div>
                <div className="host-stat">
                  <span className="host-stat-value">
                    {Number.isFinite(Number(listing.ratingAverage))
                      ? Number(listing.ratingAverage).toFixed(1)
                      : "0.0"}
                  </span>
                  <span className="host-stat-label">Rating</span>
                </div>
                <div className="host-stat">
                  <span className="host-stat-value">—</span>
                  <span className="host-stat-label">Response</span>
                </div>
              </div>
              <p className="host-bio">
                Hosted through NEXA. Contact the host after booking for any access instructions.
              </p>
              <button
                className="btn btn-nexa-outline w-100 chat-btn"
                onClick={createMessageThread}
              >
                <i className="bi bi-chat-dots-fill me-2"></i>Message Host
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
