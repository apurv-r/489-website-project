import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function parseDateKey(dateKey) {
  if (!dateKey) {
    return null;
  }

  const [year, month, day] = String(dateKey)
    .split("-")
    .map((part) => Number(part));

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateLabel(date) {
  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDurationDays(startDate, endDate) {
  if (!startDate || !endDate || endDate <= startDate) {
    return 0;
  }

  const millisecondsInDay = 1000 * 60 * 60 * 24;
  return Math.round((endDate.getTime() - startDate.getTime()) / millisecondsInDay) + 1;
}

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateConfirmation = location.state?.confirmation || null;
  const listingId = searchParams.get("listingId") || stateConfirmation?.listingId;
  const checkInParam = searchParams.get("checkIn") || stateConfirmation?.checkIn;
  const checkOutParam = searchParams.get("checkOut") || stateConfirmation?.checkOut;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadListingFallback() {
      if (stateConfirmation || !listingId) {
        return;
      }

      setLoading(true);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/parking-spaces/${listingId}`);

        if (!isMounted) {
          return;
        }

        setListing(response.data);
      } catch {
        if (!isMounted) {
          return;
        }

        setListing(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadListingFallback();

    return () => {
      isMounted = false;
    };
  }, [stateConfirmation, listingId]);

  const checkInDate = useMemo(() => parseDateKey(checkInParam), [checkInParam]);
  const checkOutDate = useMemo(() => parseDateKey(checkOutParam), [checkOutParam]);
  const days = useMemo(
    () => stateConfirmation?.days || getDurationDays(checkInDate, checkOutDate),
    [stateConfirmation, checkInDate, checkOutDate],
  );

  const dailyRate = useMemo(() => {
    const fallbackRate = Number(listing?.dailyRate);
    const stateRate = Number(stateConfirmation?.dailyRate);

    if (Number.isFinite(stateRate)) {
      return stateRate;
    }

    return Number.isFinite(fallbackRate) ? fallbackRate : 0;
  }, [listing, stateConfirmation]);

  const subtotal = useMemo(() => {
    const stateValue = Number(stateConfirmation?.subtotal);
    if (Number.isFinite(stateValue)) {
      return stateValue;
    }

    return days * dailyRate;
  }, [stateConfirmation, days, dailyRate]);

  const serviceFee = useMemo(() => {
    const stateValue = Number(stateConfirmation?.serviceFee);
    if (Number.isFinite(stateValue)) {
      return stateValue;
    }

    return subtotal * 0.05;
  }, [stateConfirmation, subtotal]);

  const total = useMemo(() => {
    const stateValue = Number(stateConfirmation?.total);
    if (Number.isFinite(stateValue)) {
      return stateValue;
    }

    return subtotal + serviceFee;
  }, [stateConfirmation, subtotal, serviceFee]);

  const title = stateConfirmation?.title || listing?.title || "Parking listing";
  const type = stateConfirmation?.type || listing?.parkingType || "Parking";
  const imageUrl =
    stateConfirmation?.imageUrl ||
    listing?.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&q=80";
  const address =
    stateConfirmation?.address ||
    [
      listing?.location?.address,
      listing?.location?.city,
      listing?.location?.state,
      listing?.location?.zipCode,
    ]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(", ") ||
    "Address unavailable";

  const rating =
    stateConfirmation?.rating ||
    (Number.isFinite(Number(listing?.ratingAverage)) && Number(listing?.reviewCount) > 0
      ? Number(listing.ratingAverage).toFixed(1)
      : "-");
  const reviewCount = Number(stateConfirmation?.reviewCount ?? listing?.reviewCount ?? 0);
  const hostName =
    stateConfirmation?.hostName ||
    `${listing?.host?.firstName || ""} ${listing?.host?.lastName || ""}`.trim() ||
    "Host";
  const hostProfilePictureUrl =
    listing?.host?.profilePictureUrl || "https://i.pravatar.cc/100?img=33";
  const referenceId =
    stateConfirmation?.referenceId ||
    `NXA-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

  return (
    <main style={{ paddingTop: "90px", paddingBottom: "3rem", minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: 680 }}>
        {!stateConfirmation && !listingId && (
          <div className="alert alert-warning" role="alert">
            Missing booking details. Please complete a booking first.
            <div className="mt-3">
              <Link to="/search" className="btn btn-nexa-outline btn-sm">
                <i className="bi bi-search me-1"></i>Go to search
              </Link>
            </div>
          </div>
        )}

        {loading && (
          <div className="alert alert-secondary" role="alert">
            Loading confirmation details...
          </div>
        )}

        <div className="conf-hero">
          <div className="conf-icon-wrap">
            <i className="bi bi-check-lg conf-icon"></i>
          </div>
          <h1 className="conf-title">Booking Confirmed!</h1>
          <p className="conf-subtitle">
            Your parking spot is reserved. Check your email for full details and access
            instructions.
          </p>
        </div>

        <div className="conf-card">
          <div className="conf-card-title">Booking Reference</div>
          <div className="conf-ref-row">
            <span className="conf-ref-label">Reference ID</span>
            <span className="conf-ref-value">{referenceId}</span>
          </div>
          <div className="conf-divider"></div>
          <div className="conf-listing-row">
            <img src={imageUrl} alt="Listing" className="conf-listing-img" />
            <div>
              <div className="conf-listing-type">{type}</div>
              <div className="conf-listing-name">{title}</div>
              <div className="conf-listing-addr">
                <i className="bi bi-geo-alt-fill me-1"></i>
                {address}
              </div>
            </div>
          </div>
        </div>

        <div className="conf-card">
          <div className="conf-card-title">Booking Details</div>
          <div className="conf-detail-rows">
            <div className="conf-detail-row">
              <span className="conf-detail-label">Check-in</span>
              <span className="conf-detail-value">{formatDateLabel(checkInDate)}</span>
            </div>
            <div className="conf-divider"></div>
            <div className="conf-detail-row">
              <span className="conf-detail-label">Check-out</span>
              <span className="conf-detail-value">{formatDateLabel(checkOutDate)}</span>
            </div>
            <div className="conf-divider"></div>
            <div className="conf-detail-row">
              <span className="conf-detail-label">Duration</span>
              <span className="conf-detail-value">
                {days} day{days === 1 ? "" : "s"}
              </span>
            </div>
            <div className="conf-divider"></div>
            <div className="conf-detail-row">
              <span className="conf-detail-label">
                ${dailyRate.toFixed(2)} × {days} day{days === 1 ? "" : "s"}
              </span>
              <span className="conf-detail-value">${subtotal.toFixed(2)}</span>
            </div>
            <div className="conf-detail-row">
              <span className="conf-detail-label">Service fee</span>
              <span className="conf-detail-value">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="conf-divider"></div>
            <div className="conf-detail-row conf-total-row">
              <span>Total paid</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="conf-card">
          <div className="conf-card-title">Your Host</div>
          <div className="conf-host-row">
            <img src={hostProfilePictureUrl} alt={hostName} className="conf-host-avatar" />
            <div>
              <div className="conf-host-name">{hostName}</div>
              <div className="conf-host-stat">
                <i className="bi bi-star-fill me-1"></i>
                {rating} · {reviewCount} reviews · Verified Host
              </div>
            </div>
            <button
              className="btn btn-nexa-outline btn-sm ms-auto"
              onClick={() => navigate("/messages")}
            >
              <i className="bi bi-chat-dots me-1"></i>Message
            </button>
          </div>
        </div>

        <div className="conf-card">
          <div className="conf-card-title">Getting There</div>
          <p className="conf-getting-addr">
            <i className="bi bi-geo-alt-fill me-2"></i>
            {address}
          </p>
          <p className="conf-getting-note">
            Exact access instructions and gate code will be sent to your email 24 hours before
            check-in.
          </p>
        </div>

        <div className="conf-actions">
          <button className="btn btn-nexa-outline" onClick={() => navigate("/my-bookings")}>
            <i className="bi bi-calendar2-check me-2"></i>View My Bookings
          </button>
          <button className="btn btn-nexa" onClick={() => navigate("/search")}>
            <i className="bi bi-search me-2"></i>Find More Parking
          </button>
        </div>
      </div>
    </main>
  );
}
