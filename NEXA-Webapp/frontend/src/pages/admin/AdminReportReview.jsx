import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import Toast from "../../components/Toast";

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

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

function getTargetType(report) {
  if (report?.reportedSpace) {
    return "Listing";
  }

  if (report?.reportedUser) {
    return "User";
  }

  if (report?.booking) {
    return "Booking";
  }

  return "Platform item";
}

function toApiStatus(label) {
  if (label === "resolved") {
    return "resolved";
  }

  if (label === "dismissed") {
    return "dismissed";
  }

  return "under review";
}

export default function AdminReportReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("id");

  const [report, setReport] = useState(null);
  const [listingDetails, setListingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      if (!reportId) {
        setErrorMessage("Missing report id. Please open a report from the reports page.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const reportResponse = await axios.get(`${API_BASE_URL}/api/reports/${reportId}`, {
          withCredentials: true,
        });

        const loadedReport = reportResponse.data;

        let resolvedListing = null;
        const reportedSpaceId = loadedReport?.reportedSpace?._id || loadedReport?.reportedSpace;

        if (reportedSpaceId) {
          try {
            const listingResponse = await axios.get(
              `${API_BASE_URL}/api/parking-spaces/${reportedSpaceId}`,
              { withCredentials: true },
            );
            resolvedListing = listingResponse.data;
          } catch {
            resolvedListing = loadedReport?.reportedSpace || null;
          }
        }

        if (!isMounted) {
          return;
        }

        setReport(loadedReport);
        setListingDetails(resolvedListing);
        setNote(loadedReport?.resolutionNotes || "");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load report review details.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  const displayName = useMemo(() => {
    return report?.title || toTitleCase(report?.category) || "Report";
  }, [report]);

  const reporterName = useMemo(() => formatName(report?.reporter), [report]);
  const targetType = useMemo(() => getTargetType(report), [report]);
  const targetLabel = useMemo(() => {
    if (report?.reportedSpace) {
      return listingDetails?.title || report.reportedSpace?.title || "Listing";
    }

    if (report?.reportedUser) {
      return formatName(report.reportedUser);
    }

    if (report?.booking) {
      return `Booking ${formatShortDate(report.booking.startDate)}`;
    }

    return "Platform item";
  }, [listingDetails, report]);

  const hostUser = useMemo(() => {
    return listingDetails?.host && typeof listingDetails.host === "object"
      ? listingDetails.host
      : null;
  }, [listingDetails]);

  async function saveNote() {
    if (!report?._id) {
      return;
    }

    try {
      setSaving(true);
      await axios.patch(
        `${API_BASE_URL}/api/reports/${report._id}`,
        {
          resolutionNotes: note,
          status: report.status === "open" ? "under review" : report.status,
        },
        { withCredentials: true },
      );

      setReport((current) =>
        current
          ? {
              ...current,
              resolutionNotes: note,
            }
          : current,
      );
      setToast({ type: "success", message: "Moderation note saved." });
    } catch (requestError) {
      console.log("Failed to save moderation note:", requestError);
      setToast({
        type: "error",
        message: requestError.response?.data?.message || "Unable to save note right now.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function updateReportStatus(nextStatus, toastMessage) {
    if (!report?._id) {
      return;
    }

    try {
      setSaving(true);

      const response = await axios.patch(
        `${API_BASE_URL}/api/reports/${report._id}`,
        {
          status: toApiStatus(nextStatus),
          resolutionNotes: note.trim(),
        },
        { withCredentials: true },
      );

      setReport(response.data);
      setToast({ type: "success", message: toastMessage });
      setTimeout(() => {
        navigate("/admin/reports");
      }, 2000);
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.response?.data?.message || "Unable to update this report right now.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="adm-layout">
        <AdminSidebar />
        <main className="adm-main">
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-400)" }}>
            Loading report review…
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage || !report) {
    return (
      <div className="adm-layout">
        <AdminSidebar />
        <main className="adm-main">
          <div className="adm-header">
            <nav
              style={{ fontSize: "0.85rem", color: "var(--nexa-gray-500)", marginBottom: "0.5rem" }}
            >
              <Link
                to="/admin/reports"
                style={{ color: "var(--nexa-gray-500)", textDecoration: "none" }}
              >
                Reports
              </Link>
            </nav>
            <h1 className="adm-page-title">Report Review</h1>
          </div>
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-400)" }}>
            {errorMessage || "Report not found."}
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

        <div className="adm-header">
          <nav
            style={{ fontSize: "0.85rem", color: "var(--nexa-gray-500)", marginBottom: "0.5rem" }}
          >
            <Link
              to="/admin/reports"
              style={{ color: "var(--nexa-gray-500)", textDecoration: "none" }}
            >
              Reports
            </Link>
            <span style={{ margin: "0 0.4rem" }}>/</span>
            <span style={{ color: "var(--nexa-gray-200)" }}>{report._id || reportId}</span>
          </nav>
          <h1 className="adm-page-title">Report Review</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="adm-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontWeight: 700 }}>{displayName}</h3>
                  <p
                    style={{
                      margin: "0.25rem 0 0",
                      fontSize: "0.8rem",
                      color: "var(--nexa-gray-500)",
                    }}
                  >
                    {report._id} · Submitted {formatDateTime(report.createdAt)}
                  </p>
                </div>
                <span
                  style={{
                    padding: "0.25em 0.8em",
                    borderRadius: 20,
                    background: "rgba(255,107,107,0.12)",
                    color: "#ff6b6b",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  {toTitleCase(report.status)}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                {[
                  { label: "Reporter", value: reporterName },
                  { label: "Target", value: `${targetLabel} (${targetType})` },
                  { label: "Reporter Email", value: report.reporter?.email || "—" },
                  {
                    label: "Target Host",
                    value: hostUser ? formatName(hostUser) : listingDetails?.host?.email || "—",
                  },
                ].map((d) => (
                  <div key={d.label}>
                    <p style={{ fontSize: "0.72rem", color: "var(--nexa-gray-500)", margin: 0 }}>
                      {d.label}
                    </p>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: "0.875rem" }}>{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence / description */}
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Reporter's Description
              </h3>
              <p
                style={{
                  color: "var(--nexa-gray-300)",
                  lineHeight: 1.7,
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                {report.description}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Take Action
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <button
                  onClick={() => updateReportStatus("resolved", "Report marked as resolved.")}
                  className="btn w-100"
                  style={{
                    background: "rgba(0,230,118,0.12)",
                    color: "#00e676",
                    border: "1px solid rgba(0,230,118,0.3)",
                    borderRadius: 8,
                    padding: "0.6rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  disabled={saving}
                >
                  <i className="bi bi-check2-circle me-2"></i>Approve Review
                </button>
                {report.reportedSpace ? (
                  <Link
                    to={`/admin/listing-review?id=${encodeURIComponent(report.reportedSpace?._id || report.reportedSpace)}`}
                    className="btn w-100"
                    style={{
                      background: "rgba(253,200,65,0.12)",
                      color: "#fdc841",
                      border: "1px solid rgba(253,200,65,0.3)",
                      borderRadius: 8,
                      padding: "0.6rem",
                      cursor: "pointer",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-block",
                      textAlign: "center",
                    }}
                    target="_blank"
                  >
                    <i className="bi bi-pin-map me-2"></i>Open Listing Review
                  </Link>
                ) : null}
                <Link
                  to={`/admin/user-detail?id=${encodeURIComponent(
                    (report.reportedUser && report.reportedUser._id) ||
                      (hostUser && hostUser._id) ||
                      report.reporter?._id ||
                      "",
                  )}`}
                  className="btn w-100"
                  style={{
                    background: "rgba(253,200,65,0.12)",
                    color: "#fdc841",
                    border: "1px solid rgba(253,200,65,0.3)",
                    borderRadius: 8,
                    padding: "0.6rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-block",
                    textAlign: "center",
                  }}
                >
                  <i className="bi bi-person-x me-2"></i>
                  {report.reportedSpace ? "View Host Details" : "Open User Detail"}
                </Link>
                <button
                  onClick={() => updateReportStatus("dismissed", "Review closed without action.")}
                  className="btn w-100"
                  style={{
                    background: "rgba(160,160,176,0.12)",
                    color: "#a0a0b0",
                    border: "1px solid rgba(160,160,176,0.3)",
                    borderRadius: 8,
                    padding: "0.6rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  disabled={saving}
                >
                  <i className="bi bi-x-circle me-2"></i>Close Review
                </button>
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: "0.75rem" }}>
                Internal Note
              </h3>
              <textarea
                rows={4}
                placeholder="Add a moderation note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--nexa-gray-900)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  padding: "0.6rem 0.75rem",
                  color: "var(--nexa-gray-200)",
                  resize: "vertical",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              ></textarea>
              <button
                onClick={saveNote}
                className="btn btn-nexa w-100"
                style={{ marginTop: "0.75rem" }}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Note"}
              </button>
            </div>

            <Link to="/admin/reports" className="btn btn-nexa-outline w-100">
              <i className="bi bi-arrow-left me-1"></i>Back to Reports
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
