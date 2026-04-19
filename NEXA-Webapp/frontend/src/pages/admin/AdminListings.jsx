import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import Toast from "../../components/Toast";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PAGE_SIZE = 8;
const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=500&q=75";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

function formatAddress(location) {
  if (!location) {
    return "Address unavailable";
  }

  const parts = [location.address, location.city, location.state, location.zipCode]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Address unavailable";
}

function formatHostName(host) {
  if (!host) {
    return "Host unavailable";
  }

  return `${host.firstName || "Host"} ${host.lastName || ""}`.trim();
}

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/parking-spaces`, {
          withCredentials: true,
        });
        setListings(response.data || []);
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
        setToast({
          type: "error",
          message: error.response?.data?.message || "Failed to load listings.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        const hostName = formatHostName(listing.host).toLowerCase();
        const location = formatAddress(listing.location).toLowerCase();
        const title = String(listing.title || "").toLowerCase();
        const city = String(listing.location?.city || "").toLowerCase();
        const matchesSearch =
          title.includes(search.toLowerCase()) ||
          hostName.includes(search.toLowerCase()) ||
          location.includes(search.toLowerCase()) ||
          city.includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Published" && listing.isPublished) ||
          (statusFilter === "Unpublished" && !listing.isPublished);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [listings, search, statusFilter]);

  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredListings.slice(start, start + PAGE_SIZE);
  }, [filteredListings, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));

  async function refreshListings() {
    const response = await axios.get(`${API_BASE_URL}/api/parking-spaces`, {
      withCredentials: true,
    });
    setListings(response.data || []);
  }

  async function handleTogglePublish(listing) {
    if (!listing?._id) {
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(
        `${API_BASE_URL}/api/parking-spaces/${listing._id}`,
        { isPublished: !listing.isPublished },
        { withCredentials: true },
      );

      setListings((current) =>
        current.map((item) =>
          item._id === listing._id ? { ...item, isPublished: !listing.isPublished } : item,
        ),
      );
      setActionModal(null);
      setToast({
        type: "success",
        message: listing.isPublished
          ? "Listing unpublished successfully."
          : "Listing published successfully.",
      });
    } catch (error) {
      console.error("Failed to update listing:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to update listing.",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteListing() {
    if (!actionModal?.listing?._id) {
      return;
    }

    try {
      setActionLoading(true);
      await axios.delete(`${API_BASE_URL}/api/parking-spaces/${actionModal.listing._id}`, {
        withCredentials: true,
      });

      setListings((current) => current.filter((item) => item._id !== actionModal.listing._id));
      setActionModal(null);
      setToast({ type: "success", message: "Listing deleted successfully." });
      await refreshListings();
    } catch (error) {
      console.error("Failed to delete listing:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to delete listing.",
      });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="adm-layout">
        <AdminSidebar />
        <main className="adm-main">
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-400)" }}>
            Loading listings…
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Listings</h1>
            <p className="adm-page-sub">
              Manage all parking listings. Total: {filteredListings.length}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search by listing, host, or location…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            style={{
              flex: "1 1 240px",
              padding: "0.55rem 1rem",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.24)",
              background: "var(--nexa-surface)",
              color: "var(--nexa-gray-200)",
              outline: "none",
              fontSize: "0.875rem",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
            }}
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "0.55rem 0.75rem",
              borderRadius: 8,
              border: "1px solid var(--nexa-border)",
              background: "var(--nexa-surface)",
              color: "var(--nexa-gray-200)",
              fontSize: "0.875rem",
            }}
          >
            {["All", "Published", "Unpublished"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="adm-card">
          <table
            className="adm-table"
            style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--nexa-border)",
                  color: "var(--nexa-gray-500)",
                }}
              >
                {["Listing", "Host", "Location", "Type", "Rate", "Status", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600 }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedListings.map((listing) => (
                <tr key={listing._id} style={{ borderBottom: "1px solid var(--nexa-border)" }}>
                  <td style={{ padding: "0.7rem 0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          backgroundImage: `url(${listing.imageUrls?.[0] || FALLBACK_PHOTO})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>{listing.title || "Untitled listing"}</div>
                        <div style={{ color: "var(--nexa-gray-400)", fontSize: "0.8rem" }}>
                          Created {formatDate(listing.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.7rem 0.5rem", color: "var(--nexa-gray-300)" }}>
                    {formatHostName(listing.host)}
                  </td>
                  <td
                    style={{
                      padding: "0.7rem 0.5rem",
                      color: "var(--nexa-gray-400)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {formatAddress(listing.location)}
                  </td>
                  <td style={{ padding: "0.7rem 0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2em 0.7em",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        background: "rgba(116,185,255,0.12)",
                        color: "#74b9ff",
                      }}
                    >
                      {formatParkingType(listing.parkingType)}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "0.7rem 0.5rem",
                      color: "var(--nexa-gray-300)",
                      fontWeight: 600,
                    }}
                  >
                    ${Number(listing.dailyRate || 0).toFixed(2)} / day
                  </td>
                  <td style={{ padding: "0.7rem 0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2em 0.7em",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        background: listing.isPublished
                          ? "rgba(0,230,118,0.12)"
                          : "rgba(255,107,107,0.12)",
                        color: listing.isPublished ? "#00e676" : "#ff6b6b",
                      }}
                    >
                      {listing.isPublished ? "Published" : "Unpublished"}
                    </span>
                  </td>
                  <td style={{ padding: "0.7rem 0.5rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-nexa-outline btn-nexa-sm"
                        disabled={actionLoading}
                        onClick={() =>
                          setActionModal({
                            type: "toggle",
                            listing,
                          })
                        }
                      >
                        {listing.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-nexa-outline btn-nexa-sm"
                        disabled={actionLoading}
                        onClick={() =>
                          setActionModal({
                            type: "delete",
                            listing,
                          })
                        }
                        style={{ color: "#ff6b6b", borderColor: "rgba(255,107,107,0.35)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedListings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-500)" }}
                  >
                    No listings match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "1rem",
                borderTop: "1px solid var(--nexa-border)",
              }}
            >
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 6,
                  border: "1px solid var(--nexa-border)",
                  background: currentPage === 1 ? "transparent" : "var(--nexa-surface)",
                  color: "var(--nexa-gray-200)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  fontSize: "0.8rem",
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: 6,
                    border: "1px solid var(--nexa-border)",
                    background: currentPage === page ? "var(--nexa-accent)" : "var(--nexa-surface)",
                    color: currentPage === page ? "#fff" : "var(--nexa-gray-200)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: currentPage === page ? 600 : 400,
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 6,
                  border: "1px solid var(--nexa-border)",
                  background: currentPage === totalPages ? "transparent" : "var(--nexa-surface)",
                  color: "var(--nexa-gray-200)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  fontSize: "0.8rem",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {actionModal && (
          <div
            onClick={() => !actionLoading && setActionModal(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1200,
              padding: "1rem",
            }}
          >
            <div
              className="adm-card"
              onClick={(event) => event.stopPropagation()}
              style={{ width: "100%", maxWidth: 480 }}
            >
              <h3 className="adm-card-title" style={{ marginBottom: "0.5rem" }}>
                {actionModal.type === "delete"
                  ? "Delete Listing"
                  : actionModal.listing.isPublished
                    ? "Unpublish Listing"
                    : "Publish Listing"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--nexa-gray-300)" }}>
                {actionModal.type === "delete"
                  ? "Are you sure you want to delete this listing? This action cannot be undone."
                  : actionModal.listing.isPublished
                    ? "Are you sure you want to unpublish this listing? It will no longer appear to renters."
                    : "Are you sure you want to publish this listing? It will become visible to renters."}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  className="btn btn-nexa-outline"
                  disabled={actionLoading}
                  onClick={() => setActionModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={actionLoading}
                  onClick={() => {
                    if (actionModal.type === "delete") {
                      handleDeleteListing();
                      return;
                    }

                    handleTogglePublish(actionModal.listing);
                  }}
                  style={{
                    background:
                      actionModal.type === "delete"
                        ? "#dc3545"
                        : actionModal.listing.isPublished
                          ? "#fdc841"
                          : "#00c769",
                    color: "#fff",
                    border: `1px solid ${actionModal.type === "delete" ? "#dc3545" : actionModal.listing.isPublished ? "#fdc841" : "#00c769"}`,
                  }}
                >
                  {actionLoading
                    ? "Processing..."
                    : actionModal.type === "delete"
                      ? "Delete Listing"
                      : actionModal.listing.isPublished
                        ? "Unpublish"
                        : "Publish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
