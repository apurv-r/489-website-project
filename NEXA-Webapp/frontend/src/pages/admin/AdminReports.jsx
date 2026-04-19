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

function formatName(user) {
  if (!user) {
    return "Unknown";
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || user.email || "Unknown";
}

function toTitleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

const STATUS_STYLE = {
  Open: { bg: "rgba(255,107,107,0.12)", color: "#ff6b6b" },
  "Under Review": { bg: "rgba(253,200,65,0.12)", color: "#fdc841" },
  Resolved: { bg: "rgba(0,230,118,0.12)", color: "#00e676" },
  Closed: { bg: "rgba(160,160,176,0.12)", color: "#a0a0b0" },
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/reports`, { withCredentials: true });
        if (isMounted) {
          setReports(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    return reports
      .map((report) => {
        const status = toTitleCase(report?.status || "open");
        const isListing = Boolean(report?.reportedSpace);
        const targetLabel = isListing
          ? report.reportedSpace?.title || "Listing"
          : report.reportedUser
            ? formatName(report.reportedUser)
            : report.booking
              ? `Booking ${formatShortDate(report.booking.startDate)}`
              : "Platform item";

        const kind = isListing ? "Listing" : report?.reportedUser ? "User" : "Booking";

        return {
          id: report?._id,
          type: report?.title || toTitleCase(report?.category) || "Report",
          reporter: formatName(report?.reporter),
          target: targetLabel,
          targetType: kind,
          date: formatShortDate(report?.createdAt),
          status,
          searchText:
            `${report?.title || ""} ${report?.category || ""} ${formatName(report?.reporter)} ${targetLabel} ${kind}`.toLowerCase(),
        };
      })
      .filter((row) => {
        const matchesSearch = row.searchText.includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || row.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [reports, search, statusFilter]);

  const openReports = useMemo(() => rows.filter((row) => row.status === "Open").length, [rows]);

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Reports</h1>
            <p className="adm-page-sub">
              Review user and listing reports submitted on the platform.
            </p>
          </div>
        </div>

        <div className="adm-card" style={{ marginBottom: "1.25rem", padding: "1rem 1.25rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search reports, reporters, or targets…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{
                flex: "1 1 240px",
                padding: "0.55rem 1rem",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.24)",
                background: "var(--nexa-surface)",
                color: "var(--nexa-gray-200)",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
              }}
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{ minWidth: 180 }}
            >
              <option>All</option>
              <option>Open</option>
              <option>Under Review</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-header">
            <h2 className="adm-card-title">
              Reports
              <span className="adm-badge adm-badge-pending ms-2">{openReports}</span>
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--nexa-gray-500)" }}>
              Showing {rows.length} of {reports.length} reports
            </span>
          </div>

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
                {["Type", "Reporter", "Target", "Kind", "Date", "Status", ""].map((h) => (
                  <th
                    key={h}
                    style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-500)" }}
                  >
                    Loading reports…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-500)" }}
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const st = STATUS_STYLE[r.status] || STATUS_STYLE.Closed;
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--nexa-border)" }}>
                      <td style={{ padding: "0.6rem 0.5rem", fontWeight: 600 }}>{r.type}</td>
                      <td style={{ padding: "0.6rem 0.5rem", color: "var(--nexa-gray-400)" }}>
                        {r.reporter}
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem" }}>{r.target}</td>
                      <td style={{ padding: "0.6rem 0.5rem" }}>
                        <span
                          style={{
                            padding: "0.2em 0.6em",
                            borderRadius: 20,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            background:
                              r.targetType === "Listing"
                                ? "rgba(108,92,231,0.12)"
                                : "rgba(116,185,255,0.12)",
                            color: r.targetType === "Listing" ? "#6c5ce7" : "#74b9ff",
                          }}
                        >
                          {r.targetType}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.5rem",
                          color: "var(--nexa-gray-400)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {r.date}
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem" }}>
                        <span
                          style={{
                            padding: "0.2em 0.7em",
                            borderRadius: 20,
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            background: st.bg,
                            color: st.color,
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem" }}>
                        <Link
                          to={`/admin/report-review?id=${encodeURIComponent(r.id)}`}
                          className="btn btn-nexa-outline btn-nexa-sm"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
