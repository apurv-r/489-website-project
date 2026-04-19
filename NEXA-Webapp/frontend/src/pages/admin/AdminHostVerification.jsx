import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PAGE_SIZE = 6;

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

function formatHostStatus(host) {
  if (host?.isVerified) {
    return "Verified";
  }

  const createdAt = new Date(host?.createdAt);
  const ageDays = Number.isNaN(createdAt.getTime())
    ? 99
    : Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

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
    case "Verified":
      return "adm-badge-active";
    case "New":
      return "adm-badge-new";
    case "In Review":
      return "adm-badge-review";
    case "Pending":
    default:
      return "adm-badge-pending";
  }
}

function getHostListingSummary(hostId, allListings, bookingsByListingId) {
  const hostListings = allListings.filter(
    (listing) => String(listing?.host?._id) === String(hostId),
  );

  if (hostListings.length === 0) {
    return [];
  }

  return hostListings.slice(0, 3).map((listing) => {
    const listingId = String(listing?._id || "");
    const bookingCount = bookingsByListingId.get(listingId) || 0;

    return {
      id: listingId,
      title: listing?.title || "Untitled listing",
      bookings: bookingCount,
    };
  });
}

export default function AdminHostVerification() {
  const [loading, setLoading] = useState(true);
  const [verifyingHostId, setVerifyingHostId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hosts, setHosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [usersResponse, listingsResponse, bookingsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/parking-spaces`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/bookings`, { withCredentials: true }),
        ]);

        if (!isMounted) {
          return;
        }

        const allUsers = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const onlyHosts = allUsers.filter((user) => user?.roleType === "Host");

        setHosts(onlyHosts);
        setListings(Array.isArray(listingsResponse.data) ? listingsResponse.data : []);
        setBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          requestError.response?.data?.message || "Unable to load host verification queue.",
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

  const bookingsByListingId = useMemo(() => {
    const counts = new Map();

    bookings.forEach((booking) => {
      const listingId = String(booking?.parkingSpace?._id || booking?.parkingSpace || "");
      if (!listingId) {
        return;
      }

      counts.set(listingId, (counts.get(listingId) || 0) + 1);
    });

    return counts;
  }, [bookings]);

  const queue = useMemo(() => {
    return hosts
      .map((host) => {
        const status = formatHostStatus(host);
        const hostListings = listings.filter(
          (listing) => String(listing?.host?._id) === String(host?._id),
        );
        const listingsSummary = getHostListingSummary(host?._id, listings, bookingsByListingId);
        const totalBookings = hostListings.reduce((sum, listing) => {
          const listingId = String(listing?._id || "");
          return sum + (bookingsByListingId.get(listingId) || 0);
        }, 0);

        return {
          id: String(host?._id || ""),
          fullName: `${host?.firstName || "Unknown"} ${host?.lastName || ""}`.trim(),
          email: host?.email || "—",
          joined: formatDate(host?.createdAt),
          status,
          listingCount: hostListings.length,
          totalBookings,
          listingsSummary,
        };
      })
      .filter((entry) => {
        const searchValue = search.trim().toLowerCase();
        const matchesSearch =
          !searchValue ||
          [entry.fullName, entry.email, ...entry.listingsSummary.map((item) => item.title)]
            .join(" ")
            .toLowerCase()
            .includes(searchValue);

        const matchesStatus = statusFilter === "All Status" || entry.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        const leftTime = new Date(left.joined).getTime() || 0;
        const rightTime = new Date(right.joined).getTime() || 0;

        return sortOrder === "Oldest First" ? leftTime - rightTime : rightTime - leftTime;
      });
  }, [hosts, listings, bookingsByListingId, search, statusFilter, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortOrder]);

  async function verifyHost(hostId) {
    if (!hostId) {
      return;
    }

    setVerifyingHostId(hostId);
    setErrorMessage("");

    try {
      await axios.put(
        `${API_BASE_URL}/api/users/hosts/${hostId}/verify`,
        { isVerified: true },
        { withCredentials: true },
      );

      setHosts((currentHosts) =>
        currentHosts.map((host) =>
          String(host?._id) === String(hostId)
            ? {
                ...host,
                isVerified: true,
              }
            : host,
        ),
      );
    } catch (requestError) {
      setErrorMessage(requestError.response?.data?.message || "Unable to verify host right now.");
    } finally {
      setVerifyingHostId("");
    }
  }

  const totalPages = Math.max(1, Math.ceil(queue.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleQueue = queue.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const countsByStatus = useMemo(() => {
    return queue.reduce(
      (accumulator, item) => {
        accumulator[item.status] = (accumulator[item.status] || 0) + 1;
        return accumulator;
      },
      { Pending: 0, "In Review": 0, New: 0, Verified: 0 },
    );
  }, [queue]);

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Host Verification</h1>
            <p className="adm-page-sub">Review host profiles and verify eligible hosts.</p>
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
                placeholder="Search hosts or listing titles…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              className="adm-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>In Review</option>
              <option>New</option>
              <option>Verified</option>
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
              Host Queue
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
                <th>Host</th>
                <th>Joined</th>
                <th>Listings</th>
                <th>Total Bookings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>Loading host queue…</td>
                </tr>
              ) : visibleQueue.length === 0 ? (
                <tr>
                  <td colSpan={6}>No hosts match the current filters.</td>
                </tr>
              ) : (
                visibleQueue.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-avatar">{item.fullName.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="adm-user-name">{item.fullName}</div>
                          <div className="adm-user-email">{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.joined}</td>
                    <td>
                      {item.listingsSummary.length === 0 ? (
                        <span style={{ color: "var(--nexa-gray-500)" }}>No listings</span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                          {item.listingsSummary.map((listing) => (
                            <div
                              key={listing.id}
                              style={{ fontSize: "0.78rem", color: "var(--nexa-gray-300)" }}
                            >
                              {listing.title}
                              <span style={{ color: "var(--nexa-gray-500)", marginLeft: "0.4rem" }}>
                                ({listing.bookings} bookings)
                              </span>
                            </div>
                          ))}
                          {item.listingCount > item.listingsSummary.length && (
                            <span style={{ fontSize: "0.75rem", color: "var(--nexa-gray-500)" }}>
                              +{item.listingCount - item.listingsSummary.length} more listings
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>{item.totalBookings}</td>
                    <td>
                      <span className={`adm-badge ${getBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-adm btn-adm-primary btn-adm-sm"
                        disabled={item.status === "Verified" || verifyingHostId === item.id}
                        onClick={() => verifyHost(item.id)}
                      >
                        {item.status === "Verified"
                          ? "Verified"
                          : verifyingHostId === item.id
                            ? "Verifying..."
                            : "Verify Host"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="adm-pagination" style={{ marginTop: "1rem" }}>
            <div className="adm-page-info">
              {countsByStatus.Pending} pending · {countsByStatus["In Review"] || 0} in review ·{" "}
              {countsByStatus.New} new · {countsByStatus.Verified || 0} verified
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
