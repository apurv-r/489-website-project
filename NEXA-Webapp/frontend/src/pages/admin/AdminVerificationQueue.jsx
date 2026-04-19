import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PAGE_SIZE = 4;

function formatDate(value) {
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

function formatCity(location) {
  if (!location) {
    return "—";
  }

  const parts = [location.city, location.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : location.address || "—";
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

function getQueueStatus(listing) {
  const createdDate = new Date(listing?.createdAt);
  const ageDays = Number.isNaN(createdDate.getTime())
    ? 99
    : Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  if (!listing?.isPublished) {
    return "New";
  }

  if (ageDays <= 1) {
    return "New";
  }

  if (ageDays <= 3) {
    return "Pending";
  }

  return "In Review";
}

function getBadgeClass(status) {
  switch (status) {
    case "New":
      return "adm-badge-new";
    case "In Review":
      return "adm-badge-review";
    case "Pending":
    default:
      return "adm-badge-pending";
  }
}

export default function AdminVerificationQueue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [usersResponse, listingsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/parking-spaces/`, { withCredentials: true }),
        ]);

        if (!isMounted) {
          return;
        }

        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setListings(Array.isArray(listingsResponse.data) ? listingsResponse.data : []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          requestError.response?.data?.message || "Unable to load verification queue.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const hostById = useMemo(() => {
    const map = new Map();

    users.forEach((user) => {
      if (user?._id) {
        map.set(String(user._id), user);
      }
    });

    return map;
  }, [users]);

  const queue = useMemo(() => {
    return listings
      .filter((listing) => !listing?.isVerified)
      .map((listing) => {
        const host = hostById.get(String(listing?.host._id));
        const status = getQueueStatus(listing);

        return {
          id: listing?._id,
          listing: listing?.title || "Untitled listing",
          type: formatParkingType(listing?.parkingType),
          hostName: `${host?.firstName || "Unknown"} ${host?.lastName || ""}`.trim(),
          hostEmail: host?.email || "—",
          city: formatCity(listing?.location),
          price: Number.isFinite(Number(listing?.dailyRate))
            ? `$${Number(listing.dailyRate).toFixed(2)}/day`
            : "—",
          maxVehicle: formatVehicleSize(listing?.maxVehicleSize),
          submitted: formatDate(listing?.createdAt),
          status,
          imageUrl:
            listing?.imageUrls?.[0] ||
            "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=80&q=60",
        };
      })
      .filter((entry) => {
        const searchValue = search.trim().toLowerCase();
        const matchesSearch =
          !searchValue ||
          [entry.listing, entry.hostName, entry.hostEmail, entry.city, entry.type]
            .join(" ")
            .toLowerCase()
            .includes(searchValue);

        const matchesType = typeFilter === "All Types" || entry.type === typeFilter;
        const matchesStatus = statusFilter === "All Status" || entry.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((left, right) => {
        const leftTime = new Date(left.submitted).getTime() || 0;
        const rightTime = new Date(right.submitted).getTime() || 0;

        return sortOrder === "Oldest First" ? leftTime - rightTime : rightTime - leftTime;
      });
  }, [listings, hostById, search, typeFilter, statusFilter, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(queue.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleQueue = queue.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const countsByStatus = useMemo(() => {
    return queue.reduce(
      (accumulator, item) => {
        accumulator[item.status] = (accumulator[item.status] || 0) + 1;
        return accumulator;
      },
      { Pending: 0, "In Review": 0, New: 0 },
    );
  }, [queue]);

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Verification Queue</h1>
            <p className="adm-page-sub">Review and approve new listing submissions.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: "1rem" }}>
            {errorMessage}
          </div>
        )}

        <div className="adm-card" style={{ marginBottom: "1.25rem", padding: "1rem 1.25rem" }}>
          <div className="adm-filter-bar">
            <div className="adm-search-wrap">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="adm-input"
                placeholder="Search listings…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              className="adm-select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option>All Types</option>
              <option>Garage</option>
              <option>Driveway</option>
              <option>Lot</option>
              <option>Covered</option>
              <option>Parking</option>
            </select>
            <select
              className="adm-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>In Review</option>
              <option>New</option>
            </select>
            <select
              className="adm-select"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-header">
            <h2 className="adm-card-title">
              Pending Listings
              <span className="adm-badge adm-badge-pending ms-2">{queue.length}</span>
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--nexa-gray-500)" }}>
              Showing {queue.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, queue.length)} of {queue.length} results
            </span>
          </div>

          <table className="adm-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Type</th>
                <th>Host</th>
                <th>Location</th>
                <th>Price</th>
                <th>Max Vehicle</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>Loading verification queue…</td>
                </tr>
              ) : visibleQueue.length === 0 ? (
                <tr>
                  <td colSpan={9}>No listings match the current filters.</td>
                </tr>
              ) : (
                visibleQueue.map((item) => (
                  <tr
                    key={item.id}
                    className="adm-row-link"
                    onClick={() =>
                      navigate(`/admin/listing-review?id=${encodeURIComponent(item.id)}`)
                    }
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                        <img
                          src={item.imageUrl}
                          alt={item.listing}
                          style={{
                            width: 54,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                          }}
                        />
                        <strong style={{ color: "var(--nexa-white)", fontSize: "0.84rem" }}>
                          {item.listing}
                        </strong>
                      </div>
                    </td>
                    <td>{item.type}</td>
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-avatar">{item.hostName.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="adm-user-name">{item.hostName}</div>
                          <div className="adm-user-email">{item.hostEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.city}</td>
                    <td>{item.price}</td>
                    <td>{item.maxVehicle}</td>
                    <td>{item.submitted}</td>
                    <td>
                      <span className={`adm-badge ${getBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/listing-review?id=${encodeURIComponent(item.id)}`}
                        className="btn-adm btn-adm-primary btn-adm-sm"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="adm-pagination" style={{ marginTop: "1rem" }}>
            <div className="adm-page-info">
              {countsByStatus.Pending} pending · {countsByStatus["In Review"] || 0} in review ·{" "}
              {countsByStatus.New} new
            </div>
            <div className="adm-page-btns">
              <button
                className="adm-page-btn"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`adm-page-btn${pageNumber === safePage ? " active" : ""}`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                className="adm-page-btn"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={safePage >= totalPages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
