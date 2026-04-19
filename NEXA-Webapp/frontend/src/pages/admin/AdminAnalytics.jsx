import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function getMonthStart(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildLastSixMonths() {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString(undefined, { month: "short" }),
      start: getMonthStart(date),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
    });
  }

  return months;
}

function toCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function monthKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatHostName(host, userMap) {
  if (!host) {
    return "Host unavailable";
  }

  if (typeof host === "object") {
    const full = `${host.firstName || ""} ${host.lastName || ""}`.trim();
    return full || host.email || "Host unavailable";
  }

  const user = userMap.get(String(host));
  const full = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return full || user?.email || "Host unavailable";
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [serviceFeePercent, setServiceFeePercent] = useState(5);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalyticsData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          usersResponse,
          listingsResponse,
          bookingsResponse,
          reportsResponse,
          settingsResponse,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/parking-spaces`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/bookings`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/reports`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/platform-settings`, { withCredentials: true }),
        ]);

        if (!isMounted) {
          return;
        }

        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setListings(Array.isArray(listingsResponse.data) ? listingsResponse.data : []);
        setBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
        setReports(Array.isArray(reportsResponse.data) ? reportsResponse.data : []);

        const nextServiceFee = Number(settingsResponse.data?.serviceFee);
        if (Number.isFinite(nextServiceFee) && nextServiceFee >= 0) {
          setServiceFeePercent(nextServiceFee);
        }
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          requestError.response?.data?.message || "Unable to load analytics right now.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAnalyticsData();

    return () => {
      isMounted = false;
    };
  }, []);

  const months = useMemo(() => buildLastSixMonths(), []);

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      if (user?._id) {
        map.set(String(user._id), user);
      }
    });
    return map;
  }, [users]);

  const listingMap = useMemo(() => {
    const map = new Map();
    listings.forEach((listing) => {
      if (listing?._id) {
        map.set(String(listing._id), listing);
      }
    });
    return map;
  }, [listings]);

  const eligibleBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        ["approved", "active", "completed", "pending"].includes(booking?.status),
      ),
    [bookings],
  );

  const totalRevenue = useMemo(
    () => eligibleBookings.reduce((sum, booking) => sum + Number(booking?.totalAmount || 0), 0),
    [eligibleBookings],
  );

  const averageBookingValue = useMemo(() => {
    if (eligibleBookings.length === 0) {
      return 0;
    }

    return totalRevenue / eligibleBookings.length;
  }, [eligibleBookings, totalRevenue]);

  const platformFeeRevenue = useMemo(
    () => totalRevenue * (serviceFeePercent / 100),
    [totalRevenue, serviceFeePercent],
  );

  const thisMonthKey = monthKey(new Date());
  const newUsersThisMonth = useMemo(
    () => users.filter((user) => monthKey(user?.createdAt) === thisMonthKey).length,
    [users, thisMonthKey],
  );

  const openReports = useMemo(
    () => reports.filter((report) => String(report?.status || "").toLowerCase() === "open").length,
    [reports],
  );

  const monthlySeries = useMemo(() => {
    const bookingByMonth = new Map();
    const listingsByMonth = new Map();
    const usersByMonth = new Map();

    months.forEach((month) => {
      bookingByMonth.set(month.key, 0);
      listingsByMonth.set(month.key, 0);
      usersByMonth.set(month.key, 0);
    });

    eligibleBookings.forEach((booking) => {
      const key = monthKey(booking?.createdAt);
      if (key && bookingByMonth.has(key)) {
        bookingByMonth.set(key, bookingByMonth.get(key) + 1);
      }
    });

    listings.forEach((listing) => {
      const key = monthKey(listing?.createdAt);
      if (key && listingsByMonth.has(key)) {
        listingsByMonth.set(key, listingsByMonth.get(key) + 1);
      }
    });

    users.forEach((user) => {
      const key = monthKey(user?.createdAt);
      if (key && usersByMonth.has(key)) {
        usersByMonth.set(key, usersByMonth.get(key) + 1);
      }
    });

    return {
      labels: months.map((month) => month.label),
      bookings: months.map((month) => bookingByMonth.get(month.key) || 0),
      listings: months.map((month) => listingsByMonth.get(month.key) || 0),
      users: months.map((month) => usersByMonth.get(month.key) || 0),
    };
  }, [eligibleBookings, listings, months, users]);

  const maxBookings = Math.max(1, ...monthlySeries.bookings);
  const maxListings = Math.max(1, ...monthlySeries.listings);
  const maxUsers = Math.max(1, ...monthlySeries.users);

  const topListings = useMemo(() => {
    const aggregates = new Map();

    eligibleBookings.forEach((booking) => {
      const parkingSpaceId =
        booking?.parkingSpace && typeof booking.parkingSpace === "object"
          ? booking.parkingSpace._id
          : booking?.parkingSpace;

      if (!parkingSpaceId) {
        return;
      }

      const key = String(parkingSpaceId);
      const previous = aggregates.get(key) || { bookings: 0, earned: 0 };
      aggregates.set(key, {
        bookings: previous.bookings + 1,
        earned: previous.earned + Number(booking?.totalAmount || 0),
      });
    });

    return Array.from(aggregates.entries())
      .map(([listingId, values]) => {
        const listing = listingMap.get(listingId);
        return {
          id: listingId,
          name: listing?.title || "Untitled listing",
          host: formatHostName(listing?.host, userMap),
          city: listing?.location?.city || "—",
          bookings: values.bookings,
          earned: values.earned,
          rating:
            Number.isFinite(Number(listing?.ratingAverage)) && Number(listing?.reviewCount) > 0
              ? Number(listing.ratingAverage).toFixed(1)
              : "—",
        };
      })
      .sort((left, right) => right.bookings - left.bookings)
      .slice(0, 6);
  }, [eligibleBookings, listingMap, userMap]);

  const statTiles = [
    {
      label: "Gross Booking Revenue",
      value: toCurrency(totalRevenue),
      icon: "bi-cash-stack",
      color: "#00e676",
    },
    {
      label: `Platform Fee Revenue`,
      value: toCurrency(platformFeeRevenue),
      icon: "bi-percent",
      color: "#6c5ce7",
    },
    {
      label: "Total Bookings",
      value: eligibleBookings.length.toLocaleString(),
      icon: "bi-calendar-check",
      color: "#fdc841",
    },
    {
      label: "Avg. Booking Value",
      value: toCurrency(averageBookingValue),
      icon: "bi-graph-up-arrow",
      color: "#74b9ff",
    },
    {
      label: `New Users (${months[months.length - 1]?.label || "This month"})`,
      value: newUsersThisMonth.toLocaleString(),
      icon: "bi-person-plus-fill",
      color: "#55efc4",
    },
    {
      label: "Open Reports",
      value: openReports.toLocaleString(),
      icon: "bi-flag-fill",
      color: "#ff6b6b",
    },
  ];

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Analytics</h1>
            <p className="adm-page-sub">Live platform growth and usage metrics.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: "1rem" }}>
            {errorMessage}
          </div>
        )}

        <div className="adm-stat-grid" style={{ marginBottom: "1.5rem" }}>
          {statTiles.map((tile) => (
            <div key={tile.label} className="adm-stat-tile">
              <div className="adm-stat-icon" style={{ background: `${tile.color}1a` }}>
                <i className={`bi ${tile.icon}`} style={{ color: tile.color }}></i>
              </div>
              <div>
                <p className="adm-stat-val" style={{marginBottom: "0px"}}>{loading ? "—" : tile.value}</p>
                <p className="adm-stat-label" style={{marginBottom: "0px"}} >{tile.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="adm-card" style={{ marginBottom: "1.5rem" }}>
          <h3 className="adm-card-title" style={{ marginBottom: "1.25rem" }}>
            Bookings (Last 6 Months)
          </h3>
          <div
            className="adm-chart-wrap"
            style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", height: 160 }}
          >
            {monthlySeries.labels.map((month, index) => (
              <div
                key={month}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "var(--nexa-gray-500)" }}>
                  {loading ? "—" : monthlySeries.bookings[index]}
                </span>
                <div
                  style={{
                    width: "100%",
                    height: `${loading ? 0 : (monthlySeries.bookings[index] / maxBookings) * 130}px`,
                    background: "linear-gradient(180deg, #6c5ce7, rgba(108,92,231,0.3))",
                    borderRadius: "6px 6px 0 0",
                    minHeight: loading ? 0 : 4,
                  }}
                ></div>
                <span style={{ fontSize: "0.75rem", color: "var(--nexa-gray-500)" }}>{month}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="adm-card">
            <h3 className="adm-card-title" style={{ marginBottom: "1.25rem" }}>
              New Listings per Month
            </h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 100 }}>
              {monthlySeries.labels.map((month, index) => (
                <div
                  key={month}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <span style={{ fontSize: "0.65rem", color: "var(--nexa-gray-500)" }}>
                    {loading ? "—" : monthlySeries.listings[index]}
                  </span>
                  <div
                    style={{
                      width: "80%",
                      height: `${loading ? 0 : (monthlySeries.listings[index] / maxListings) * 80}px`,
                      background: "linear-gradient(180deg, #00e676, rgba(0,230,118,0.3))",
                      borderRadius: "4px 4px 0 0",
                      minHeight: loading ? 0 : 4,
                    }}
                  ></div>
                  <span style={{ fontSize: "0.65rem", color: "var(--nexa-gray-500)" }}>
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-card">
            <h3 className="adm-card-title" style={{ marginBottom: "1.25rem" }}>
              New Users per Month
            </h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 100 }}>
              {monthlySeries.labels.map((month, index) => (
                <div
                  key={month}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <span style={{ fontSize: "0.65rem", color: "var(--nexa-gray-500)" }}>
                    {loading ? "—" : monthlySeries.users[index]}
                  </span>
                  <div
                    style={{
                      width: "80%",
                      height: `${loading ? 0 : (monthlySeries.users[index] / maxUsers) * 80}px`,
                      background: "linear-gradient(180deg, #fdc841, rgba(253,200,65,0.3))",
                      borderRadius: "4px 4px 0 0",
                      minHeight: loading ? 0 : 4,
                    }}
                  ></div>
                  <span style={{ fontSize: "0.65rem", color: "var(--nexa-gray-500)" }}>
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="adm-card" style={{ marginTop: "1.5rem" }}>
          <h3 className="adm-card-title" style={{ marginBottom: "1rem" }}>
            Top Listings by Bookings
          </h3>
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
                {["Listing", "Host", "City", "Bookings", "Total Earned", "Avg Rating"].map(
                  (header) => (
                    <th
                      key={header}
                      style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600 }}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "1rem 0.5rem", color: "var(--nexa-gray-500)" }}>
                    Loading listing analytics...
                  </td>
                </tr>
              ) : topListings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "1rem 0.5rem", color: "var(--nexa-gray-500)" }}>
                    No booking data yet.
                  </td>
                </tr>
              ) : (
                topListings.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid var(--nexa-border)" }}>
                    <td style={{ padding: "0.55rem 0.5rem", fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: "0.55rem 0.5rem", color: "var(--nexa-gray-400)" }}>
                      {row.host}
                    </td>
                    <td style={{ padding: "0.55rem 0.5rem", color: "var(--nexa-gray-400)" }}>
                      {row.city}
                    </td>
                    <td style={{ padding: "0.55rem 0.5rem" }}>{row.bookings}</td>
                    <td style={{ padding: "0.55rem 0.5rem", color: "#00e676", fontWeight: 600 }}>
                      {toCurrency(row.earned)}
                    </td>
                    <td style={{ padding: "0.55rem 0.5rem" }}>
                      <i
                        className="bi bi-star-fill me-1"
                        style={{ color: "#ffd700", fontSize: "0.75rem" }}
                      ></i>
                      {row.rating}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
