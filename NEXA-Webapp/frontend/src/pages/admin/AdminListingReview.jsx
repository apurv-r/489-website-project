import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import Toast from "../../components/Toast";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=500&q=75";

function formatParkingType(type) {
  switch (String(type || "").toLowerCase()) {
    case "garage":
      return "Garage";
    case "driveway":
      return "Driveway";
    case "open lot":
      return "Lot";
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

function formatShortDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

export default function AdminListingReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [note, setNote] = useState("");
  const [showNoteSavedToast, setShowNoteSavedToast] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [listing, setListing] = useState(null);
  const [hostDetails, setHostDetails] = useState(null);
  const [checklist, setChecklist] = useState({
    photosAccurate: true,
    addressVerified: true,
    pricingReasonable: false,
    noProhibitedContent: false,
    descriptionAccurate: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadListingReview() {
      if (!listingId) {
        setErrorMessage("Missing listing id. Please open a listing from the verification queue.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const matchedListing = await axios
          .get(`${API_BASE_URL}/api/parking-spaces/${listingId}`, {
            withCredentials: true,
          })
          .then((response) => response.data);

        if (!matchedListing) {
          throw new Error("Listing was not found in your accessible queue.");
        }

        let resolvedHost = null;
        const hostId = matchedListing?.host?._id || matchedListing?.host;

        if (hostId) {
          try {
            const hostResponse = await axios.get(`${API_BASE_URL}/api/users/${hostId}`, {
              withCredentials: true,
            });
            resolvedHost = hostResponse.data;
            console.log("Resolved host details:", resolvedHost);
          } catch {
            resolvedHost = matchedListing?.host || null;
          }
        }

        if (!isMounted) {
          return;
        }

        setListing(matchedListing);
        setHostDetails(resolvedHost);
        setNote(matchedListing?.adminNotes || "");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load listing review details.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadListingReview();

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  const photos = useMemo(() => {
    const listingPhotos = Array.isArray(listing?.imageUrls) ? listing.imageUrls : [];
    return listingPhotos.length > 0 ? listingPhotos : [FALLBACK_PHOTO];
  }, [listing]);

  const hostName = useMemo(() => {
    const source = hostDetails || listing?.host;
    return `${source?.firstName || "Host"} ${source?.lastName || ""}`.trim();
  }, [hostDetails, listing]);

  async function applyDecision(decision) {
    if (!listing?._id) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const updatePayload =
        decision === "approve"
          ? { isVerified: true, isPublished: true }
          : { isVerified: true, isPublished: false };

      await axios.put(`${API_BASE_URL}/api/parking-spaces/${listing._id}`, updatePayload, {
        withCredentials: true,
      });

      navigate("/admin/verification-queue", { replace: true });
    } catch (requestError) {
      setErrorMessage(
        requestError.response?.data?.message || "Unable to update listing status right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="adm-layout">
        <AdminSidebar />
        <main className="adm-main">
          <div className="alert alert-secondary" role="alert">
            Loading listing review...
          </div>
        </main>
      </div>
    );
  }

  async function saveAdminNotes() {
    if (!listing?._id) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    try {
      await axios.put(
        `${API_BASE_URL}/api/parking-spaces/${listing._id}`,
        { adminNotes: note },
        {
          withCredentials: true,
        },
      );

      setListing((current) =>
        current
          ? {
              ...current,
              adminNotes: note,
            }
          : current,
      );
      setShowNoteSavedToast(true);
    } catch (requestError) {
      setErrorMessage(
        requestError.response?.data?.message || "Unable to save admin notes right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Listing Review</h1>
            <p className="adm-page-sub">
              {listing?.title || "Listing"} — submitted {formatShortDate(listing?.createdAt)}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/verification-queue" className="btn-adm btn-adm-outline">
              <i className="bi bi-arrow-left"></i>Back to Queue
            </Link>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: "1rem" }}>
            {errorMessage}
          </div>
        )}

        <div className="adm-detail-layout">
          <div>
            <div className="adm-card" style={{ marginBottom: "1.25rem" }}>
              <h2 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Photos
              </h2>
              <div className="adm-photo-strip" style={{ marginBottom: "0.75rem" }}>
                <img
                  src={photos[activePhoto] || FALLBACK_PHOTO}
                  className="adm-photo-thumb"
                  style={{ width: 220, height: 150 }}
                  alt={listing?.title || "Listing photo"}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_PHOTO;
                  }}
                />
                {photos.map((photo, index) => (
                  <img
                    key={`${photo}-${index}`}
                    src={photo}
                    className="adm-photo-thumb"
                    style={{
                      borderColor:
                        index === activePhoto ? "var(--adm-accent)" : "rgba(255, 255, 255, 0.07)",
                      opacity: index === activePhoto ? 1 : 0.72,
                      cursor: "pointer",
                    }}
                    alt={`Listing view ${index + 1}`}
                    onClick={() => setActivePhoto(index)}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_PHOTO;
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="adm-card" style={{ marginBottom: "1.25rem" }}>
              <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                <div style={{ display: "inline-flex" }}>
                  <h2
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "var(--nexa-white)",
                      margin: 0,
                    }}
                  >
                    {listing?.title || "Untitled listing"}
                  </h2>
                  <span
                    className="adm-badge adm-badge-pending"
                    style={{ marginLeft: "0.4rem", display: "inline-flex" }}
                  >
                    Pending Verification
                  </span>
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--nexa-white)" }}>
                  ${Number(listing?.dailyRate || 0).toFixed(2)}
                  <span
                    style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--nexa-gray-400)" }}
                  >
                    /day
                  </span>
                </div>
              </div>

              <div className="adm-info-list">
                <div className="adm-info-row">
                  <span className="adm-info-label">
                    <i className="bi bi-geo-alt me-1"></i>Address
                  </span>
                  <span className="adm-info-val">{formatAddress(listing?.location)}</span>
                </div>
                <div className="adm-info-row">
                  <span className="adm-info-label">
                    <i className="bi bi-car-front me-1"></i>Parking Type
                  </span>
                  <span className="adm-info-val">{formatParkingType(listing?.parkingType)}</span>
                </div>
                <div className="adm-info-row">
                  <span className="adm-info-label">
                    <i className="bi bi-truck me-1"></i>Max Vehicle
                  </span>
                  <span className="adm-info-val">{formatVehicleSize(listing?.maxVehicleSize)}</span>
                </div>
                <div className="adm-info-row">
                  <span className="adm-info-label">
                    <i className="bi bi-calendar3 me-1"></i>Min Booking
                  </span>
                  <span className="adm-info-val">{listing?.minimumBookingDays || 1} day</span>
                </div>
                <div className="adm-info-row">
                  <span className="adm-info-label">
                    <i className="bi bi-globe-americas me-1"></i>Published Status
                  </span>
                  <span className="adm-info-val">
                    {listing?.isPublished ? "Published" : "Not Published"}
                  </span>
                </div>
              </div>

              <hr style={{ borderColor: "rgba(255, 255, 255, 0.07)", margin: "1.1rem 0" }} />

              <h3
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--nexa-white)",
                  marginBottom: "0.6rem",
                }}
              >
                Description
              </h3>
              <p
                style={{
                  fontSize: "0.84rem",
                  color: "var(--nexa-gray-300)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {listing?.description || "No description provided."}
              </p>

              <hr style={{ borderColor: "rgba(255, 255, 255, 0.07)", margin: "1.1rem 0" }} />

              <h3
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--nexa-white)",
                  marginBottom: "0.65rem",
                }}
              >
                Amenities
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                {(listing?.amenities || []).length === 0 ? (
                  <span style={{ color: "var(--nexa-gray-500)", fontSize: "0.8rem" }}>
                    No amenities listed.
                  </span>
                ) : (
                  (listing?.amenities || []).map((amenity) => (
                    <span
                      key={amenity}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 99,
                        padding: "0.2rem 0.7rem",
                        fontSize: "0.75rem",
                        color: "var(--nexa-gray-300)",
                      }}
                    >
                      {amenity}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="adm-card">
              <h2 className="adm-card-title" style={{ marginBottom: "0.85rem" }}>
                Admin Notes
              </h2>
              <textarea
                className="adm-field-input"
                rows={4}
                placeholder="Add internal notes about this listing (e.g. reason for rejection, what to request from host)…"
                style={{ width: "100%", resize: "vertical" }}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              ></textarea>
              {/* button to save */}
              <button
                className="btn-adm btn-adm-outline btn-adm-sm mt-2"
                onClick={saveAdminNotes}
                disabled={saving}
              >
                <i className="bi bi-save"></i> Save Notes
              </button>
            </div>
          </div>

          <div className="adm-detail-sidebar">
            <div className="adm-card">
              <h2 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Host
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  className="adm-avatar-lg"
                  style={{
                    background: "rgba(253,200,65,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#fdc841",
                  }}
                >
                  {hostName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--nexa-white)" }}>{hostName}</div>
                  <div style={{ fontSize: "0.76rem", color: "var(--nexa-gray-500)" }}>
                    {hostDetails?.email || "Email unavailable"}
                  </div>
                  <div style={{ marginTop: "0.35rem" }}>
                    <span className="adm-badge adm-badge-active">
                      {hostDetails ? "Verified" : "Host profile unavailable"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="adm-info-list">
                <div className="adm-info-row">
                  <span className="adm-info-label">Member since</span>
                  <span className="adm-info-val">{formatShortDate(hostDetails?.createdAt)}</span>
                </div>
                <div className="adm-info-row">
                  <span className="adm-info-label">Total listings</span>
                  <span className="adm-info-val">{hostDetails?.listingIds?.length || 0}</span>
                </div>
                <div className="adm-info-row">
                  <span className="adm-info-label">Avg. rating</span>
                  <span className="adm-info-val">
                    {Number(listing?.ratingAverage || 0).toFixed(1)} ⭐
                  </span>
                </div>
              </div>
              <Link
                to={
                  hostDetails?._id
                    ? `/admin/user-detail?id=${encodeURIComponent(hostDetails._id)}`
                    : "/admin/users"
                }
                className="btn-adm btn-adm-outline btn-adm-sm d-block text-center mt-3"
              >
                View Profile
              </Link>
            </div>

            <div className="adm-card">
              <h2 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Actions
              </h2>
              <div className="adm-action-panel">
                <button
                  className="btn-adm btn-adm-success"
                  onClick={() => applyDecision("approve")}
                  disabled={saving}
                >
                  <i className="bi bi-check-lg"></i>Approve Listing
                </button>
                <button
                  className="btn-adm btn-adm-danger"
                  onClick={() => applyDecision("reject")}
                  disabled={saving}
                >
                  <i className="bi bi-x-lg"></i>Reject Listing
                </button>
              </div>
            </div>

            <div className="adm-card">
              <h2 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Verification Checklist
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {[
                  ["photosAccurate", "Photos look accurate"],
                  ["addressVerified", "Address verified on map"],
                  ["pricingReasonable", "Pricing is reasonable"],
                  ["noProhibitedContent", "No prohibited content"],
                  ["descriptionAccurate", "Description is accurate"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      fontSize: "0.82rem",
                      color: "var(--nexa-gray-300)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checklist[key])}
                      className="form-check-input m-0"
                      onChange={(event) =>
                        setChecklist((current) => ({
                          ...current,
                          [key]: event.target.checked,
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Toast
          open={showNoteSavedToast}
          variant="success"
          message="Admin note saved successfully."
          autoHideDuration={2400}
          onClose={() => setShowNoteSavedToast(false)}
        />
      </main>
    </div>
  );
}
