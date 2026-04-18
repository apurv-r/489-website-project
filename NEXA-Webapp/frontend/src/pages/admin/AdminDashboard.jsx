import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

function toTitleCase(value) {
  const parts = String(value || "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "—";
  }

  return parts
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function formatName(user) {
  if (!user) {
    return "Unknown";
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (fullName) {
    return fullName;
  }

  return user.email || "Unknown";
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [usersResponse, listingsResponse, reportsResponse, bookingsResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true }),
            axios.get(`${API_BASE_URL}/api/parking-spaces/me`, { withCredentials: true }),
            axios.get(`${API_BASE_URL}/api/reports`, { withCredentials: true }),
            axios.get(`${API_BASE_URL}/api/bookings`, { withCredentials: true }),
          ]);

        if (!isMounted) {
          return;
        }

        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setListings(Array.isArray(listingsResponse.data) ? listingsResponse.data : []);
        setReports(Array.isArray(reportsResponse.data) ? reportsResponse.data : []);
        setBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          requestError.response?.data?.message || "Unable to load dashboard data right now.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const userMapById = useMemo(() => {
    const map = new Map();

    users.forEach((user) => {
      if (user?._id) {
        map.set(String(user._id), user);
      }
    });

    return map;
  }, [users]);

  const pendingListings = useMemo(() => {
    return listings
      .filter((listing) => !listing?.isVerified)
      .sort((left, right) => new Date(right?.createdAt || 0) - new Date(left?.createdAt || 0))
      .slice(0, 4)
      .map((listing) => {
        const hostUser = userMapById.get(String(listing?.host));

        return {
          id: listing?._id,
          host: formatName(hostUser),
          listing: listing?.title || "Untitled listing",
          submitted: formatShortDate(listing?.createdAt),
          type: toTitleCase(listing?.parkingType || "Parking"),
        };
      });
  }, [listings, userMapById]);

  const recentReports = useMemo(() => {
    return reports
      .slice()
      .sort((left, right) => new Date(right?.createdAt || 0) - new Date(left?.createdAt || 0))
      .slice(0, 3)
      .map((report) => {
        const reporter = userMapById.get(String(report?.reporter));
        const targetListing =
          listings.find((listing) => String(listing?._id) === String(report?.reportedSpace)) ||
          null;

        return {
          id: report?._id,
          type: report?.title || toTitleCase(report?.category) || "Report",
          reporter: formatName(reporter),
          target: targetListing?.title || "Platform item",
          date: formatShortDate(report?.createdAt),
          status: String(report?.status || "open").toLowerCase(),
        };
      });
  }, [reports, listings, userMapById]);

  const openReports = useMemo(
    () => reports.filter((report) => String(report?.status || "").toLowerCase() === "open").length,
    [reports],
  );
  const todaySignups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return users.filter((user) => {
      const createdDate = new Date(user?.createdAt);
      if (Number.isNaN(createdDate.getTime())) {
        return false;
      }

      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    }).length;
  }, [users]);

  const approvedBookings = useMemo(
    () =>
      bookings.filter((booking) => ["approved", "active", "completed"].includes(booking?.status))
        .length,
    [bookings],
  );

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const statTiles = [
    {
      label: "Total Listings",
      value: listings.length.toLocaleString(),
      icon: "bi-geo-alt-fill",
      iconClass: "adm-stat-icon-blue",
      delta: `+${pendingListings.length} pending verification`,
      deltaClass: "adm-delta-up",
    },
    {
      label: "Total Bookings",
      value: bookings.length.toLocaleString(),
      icon: "bi-calendar2-check",
      iconClass: "adm-stat-icon-green",
      delta: `${approvedBookings.toLocaleString()} approved`,
      deltaClass: "adm-delta-up",
    },
    {
      label: "Active Users",
      value: users.length.toLocaleString(),
      icon: "bi-people-fill",
      iconClass: "adm-stat-icon-amber",
      delta: `+${todaySignups} today`,
      deltaClass: "adm-delta-up",
    },
    {
      label: "Flagged Items",
      value: openReports.toLocaleString(),
      icon: "bi-flag-fill",
      iconClass: "adm-stat-icon-red",
      delta: `${reports.length.toLocaleString()} total reports`,
      deltaClass: openReports > 0 ? "adm-delta-down" : "adm-delta-up",
    },
  ];

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Dashboard</h1>
            <p className="adm-page-sub">Welcome back, Admin · {todayLabel}</p>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: "1rem" }}>
            {errorMessage}
          </div>
        )}

        {/* Stat tiles */}
        <div className="adm-stat-grid">
          {statTiles.map((s) => (
            <div key={s.label} className="adm-stat-tile">
              <div className={`adm-stat-icon ${s.iconClass}`}>
                <i className={`bi ${s.icon}`}></i>
              </div>
              <div>
                <div className="adm-stat-val">{s.value}</div>
                <div className="adm-stat-label">{s.label}</div>
                <div className={`adm-stat-delta ${s.deltaClass}`}>{s.delta}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          {/* Pending verifications */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title" style={{ margin: 0 }}>
                Pending Verifications
              </h3>
              <Link to="/admin/verification-queue" className="btn-adm btn-adm-outline btn-adm-sm">
                View all
              </Link>
            </div>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Host</th>
                  <th>Type</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>Loading pending listings...</td>
                  </tr>
                ) : pendingListings.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No pending verifications.</td>
                  </tr>
                ) : (
                  pendingListings.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: "var(--nexa-white)" }}>{p.listing}</strong>
                      </td>
                      <td>{p.host}</td>
                      <td>{p.type}</td>
                      <td>{p.submitted}</td>
                      <td>
                        <Link
                          to={`/admin/listing-review?id=${encodeURIComponent(p.id)}`}
                          className="btn-adm btn-adm-outline btn-adm-sm"
                          style={{ float: "right" }}
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Recent reports */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title" style={{ margin: 0 }}>
                Recent Reports
              </h3>
              <Link to="/admin/reports" className="btn-adm btn-adm-outline btn-adm-sm">
                View all
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {loading ? (
                <div style={{ color: "var(--nexa-gray-500)", fontSize: "0.85rem" }}>
                  Loading reports...
                </div>
              ) : recentReports.length === 0 ? (
                <div style={{ color: "var(--nexa-gray-500)", fontSize: "0.85rem" }}>
                  No recent reports.
                </div>
              ) : (
                recentReports.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "0.6rem",
                      background: "var(--nexa-bg)",
                      borderRadius: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem" }}>{r.type}</p>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--nexa-gray-500)" }}>
                        {r.reporter} → {r.target}
                      </p>
                      <p
                        style={{
                          margin: "0.2rem 0 0",
                          fontSize: "0.72rem",
                          color: "var(--nexa-gray-500)",
                        }}
                      >
                        {r.date} · {toTitleCase(r.status)}
                      </p>
                    </div>
                    <Link
                      to={`/admin/report-review?id=${encodeURIComponent(r.id)}`}
                      className="btn-adm btn-adm-outline btn-adm-sm"
                    >
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="adm-card" style={{ marginTop: "1.5rem" }}>
          <h3 className="adm-card-title" style={{ marginBottom: "1rem" }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              { label: "All Users", icon: "bi-people", to: "/admin/users" },
              { label: "Analytics", icon: "bi-bar-chart-line", to: "/admin/analytics" },
              {
                label: "Verification Queue",
                icon: "bi-shield-check",
                to: "/admin/verification-queue",
              },
              { label: "Reports", icon: "bi-flag", to: "/admin/reports" },
              { label: "Settings", icon: "bi-gear", to: "/admin/settings" },
            ].map((q) => (
              <Link key={q.label} to={q.to} className="btn-adm btn-adm-outline btn-adm-sm">
                <i className={`bi ${q.icon} me-1`}></i>
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
