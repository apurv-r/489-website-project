import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminToast from "../../components/AdminToast";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function formatDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRoleType(roleType) {
  if (roleType === "Host") return "Host";
  if (roleType === "Renter") return "Driver";
  return "User";
}

export default function AdminUserDetail() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [userRes, bookingsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users/${userId}`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/api/bookings?renter=${userId}`, { withCredentials: true }),
        ]);

        setUser(userRes.data);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.response?.data?.message || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleSuspendAccount = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await axios.patch(
        `${API_BASE_URL}/api/users/${user._id}`,
        { accountStatus: "suspended" },
        { withCredentials: true },
      );

      setUser({ ...user, accountStatus: "suspended" });
      setShowSuspendConfirm(false);
      setToast({ type: "success", message: "Account suspended successfully." });
    } catch (err) {
      console.error("Failed to suspend account:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to suspend account.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinstateAccount = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await axios.patch(
        `${API_BASE_URL}/api/users/${user._id}`,
        { accountStatus: "active" },
        { withCredentials: true },
      );

      setUser({ ...user, accountStatus: "active" });
      setShowReinstateConfirm(false);
      setToast({ type: "success", message: "Account reinstated successfully." });
    } catch (err) {
      console.error("Failed to reinstate account:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to reinstate account.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await axios.delete(`${API_BASE_URL}/api/users/${user._id}`, { withCredentials: true });

      setToast({ type: "success", message: "Account deleted successfully." });
      setShowDeleteConfirm(false);
      setTimeout(() => (window.location.href = "/admin/users"), 1500);
    } catch (err) {
      console.error("Failed to delete account:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to delete account.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNote = async (e) => {
    const textarea = e.target.previousElementSibling;
    const note = textarea.value.trim();

    if (!user || !note) {
      setToast({ type: "error", message: "Please enter a note." });
      return;
    }

    try {
      setActionLoading(true);
      await axios.patch(
        `${API_BASE_URL}/api/users/${user._id}`,
        { adminNotes: note },
        { withCredentials: true },
      );

      setUser({ ...user, adminNotes: note });
      textarea.value = "";
      setToast({ type: "success", message: "Note saved successfully." });
    } catch (err) {
      console.error("Failed to save note:", err);
      setToast({ type: "error", message: err.response?.data?.message || "Failed to save note." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-layout">
        <AdminSidebar />
        <main className="adm-main">
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-400)" }}>
            Loading user details…
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="adm-layout">
        <AdminSidebar />
        <main className="adm-main">
          <div className="adm-header">
            <nav
              style={{ fontSize: "0.85rem", color: "var(--nexa-gray-500)", marginBottom: "0.5rem" }}
            >
              <Link
                to="/admin/users"
                style={{ color: "var(--nexa-gray-500)", textDecoration: "none" }}
              >
                Users
              </Link>
            </nav>
            <h1 className="adm-page-title">User Detail</h1>
          </div>
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-400)" }}>
            {error || "User not found."}
          </div>
        </main>
      </div>
    );
  }

  const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}

        <div className="adm-header">
          <nav
            style={{ fontSize: "0.85rem", color: "var(--nexa-gray-500)", marginBottom: "0.5rem" }}
          >
            <Link
              to="/admin/users"
              style={{ color: "var(--nexa-gray-500)", textDecoration: "none" }}
            >
              Users
            </Link>
            <span style={{ margin: "0 0.4rem" }}>/</span>
            <span style={{ color: "var(--nexa-gray-200)" }}>{displayName}</span>
          </nav>
          <h1 className="adm-page-title">User Detail</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Profile card */}
            <div className="adm-card">
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background:
                      user.roleType === "Host" ? "rgba(253,200,65,0.12)" : "rgba(116,185,255,0.12)",
                    border: "2px solid rgba(253,200,65,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: user.roleType === "Host" ? "#fdc841" : "#74b9ff",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 700 }}>{displayName}</h2>
                  <p
                    style={{
                      margin: "0.2rem 0 0",
                      fontSize: "0.875rem",
                      color: "var(--nexa-gray-400)",
                    }}
                  >
                    {user.email || "—"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginTop: "0.4rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "0.2em 0.7em",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        background:
                          user.roleType === "Host"
                            ? "rgba(253,200,65,0.12)"
                            : "rgba(116,185,255,0.12)",
                        color: user.roleType === "Host" ? "#fdc841" : "#74b9ff",
                      }}
                    >
                      {formatRoleType(user.roleType)}
                    </span>
                    <span
                      style={{
                        padding: "0.2em 0.7em",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        background:
                          user.accountStatus === "suspended"
                            ? "rgba(255,107,107,0.12)"
                            : "rgba(0,230,118,0.12)",
                        color: user.accountStatus === "suspended" ? "#ff6b6b" : "#00e676",
                      }}
                    >
                      {user.accountStatus === "suspended" ? "Suspended" : "Active"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "1rem",
                  marginTop: "1.25rem",
                }}
              >
                {[
                  { label: "Joined", value: formatDate(user.createdAt) },
                  { label: "Total Bookings", value: bookings.length },
                  { label: "Last Active", value: formatDateTime(user.lastLoginAt) },
                ].map((s) => (
                  <div key={s.label}>
                    <p style={{ fontSize: "0.72rem", color: "var(--nexa-gray-500)", margin: 0 }}>
                      {s.label}
                    </p>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookings card */}
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: "1.25rem" }}>
                Bookings ({bookings.length})
              </h3>
              {bookings.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--nexa-gray-400)",
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  No bookings found.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
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
                        {["Parking Space", "Dates", "Price", "Status"].map((h) => (
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
                      {bookings.map((b) => {
                        const statusColors = {
                          pending: { bg: "rgba(253,200,65,0.12)", color: "#fdc841" },
                          confirmed: { bg: "rgba(0,230,118,0.12)", color: "#00e676" },
                          approved: { bg: "rgba(0,230,118,0.12)", color: "#00e676" },
                          completed: { bg: "rgba(116,185,255,0.12)", color: "#74b9ff" },
                          cancelled: { bg: "rgba(255,107,107,0.12)", color: "#ff6b6b" },
                          declined: { bg: "rgba(255,107,107,0.12)", color: "#ff6b6b" },
                        };
                        const st = statusColors[b.status?.toLowerCase()] || statusColors.pending;

                        return (
                          <tr key={b._id} style={{ borderBottom: "1px solid var(--nexa-border)" }}>
                            <td style={{ padding: "0.6rem 0.5rem", fontWeight: 600 }}>
                              {b.parkingSpace?.title || b.parkingSpace || "—"}
                            </td>
                            <td
                              style={{
                                padding: "0.6rem 0.5rem",
                                color: "var(--nexa-gray-400)",
                                fontSize: "0.8rem",
                              }}
                            >
                              {formatDate(b.startDate)} to {formatDate(b.endDate)}
                            </td>
                            <td style={{ padding: "0.6rem 0.5rem" }}>${b.totalAmount || "—"}</td>
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
                                {b.status || "Unknown"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Action panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Admin Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {user.accountStatus === "suspended" ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowReinstateConfirm(true)}
                    className="btn w-100"
                    style={{
                      background: "rgba(0,230,118,0.12)",
                      color: "#00e676",
                      border: "1px solid rgba(0,230,118,0.3)",
                      borderRadius: 8,
                      padding: "0.6rem 1rem",
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      opacity: actionLoading ? 0.6 : 1,
                    }}
                  >
                    <i className="bi bi-check2-circle me-2"></i>
                    {actionLoading ? "Processing..." : "Reinstate Account"}
                  </button>
                ) : (
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowSuspendConfirm(true)}
                    className="btn w-100"
                    style={{
                      background: "rgba(255,107,107,0.12)",
                      color: "#ff6b6b",
                      border: "1px solid rgba(255,107,107,0.3)",
                      borderRadius: 8,
                      padding: "0.6rem 1rem",
                      cursor: actionLoading ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      opacity: actionLoading ? 0.6 : 1,
                    }}
                  >
                    <i className="bi bi-slash-circle me-2"></i>
                    {actionLoading ? "Processing..." : "Suspend Account"}
                  </button>
                )}
                <button
                  disabled={actionLoading}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn w-100"
                  style={{
                    background: "rgba(220,53,69,0.12)",
                    color: "#dc3545",
                    border: "1px solid rgba(220,53,69,0.3)",
                    borderRadius: 8,
                    padding: "0.6rem 1rem",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    opacity: actionLoading ? 0.6 : 1,
                  }}
                >
                  <i className="bi bi-trash me-2"></i>
                  {actionLoading ? "Processing..." : "Delete Account"}
                </button>
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Admin Notes
              </h3>
              <textarea
                defaultValue={user.adminNotes || ""}
                rows={4}
                placeholder="Internal moderation note…"
                style={{
                  width: "100%",
                  background: "var(--nexa-bg)",
                  border: "1px solid var(--nexa-border)",
                  borderRadius: 8,
                  padding: "0.6rem 0.75rem",
                  color: "var(--nexa-gray-200)",
                  resize: "vertical",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
              <button
                disabled={actionLoading}
                onClick={handleSaveNote}
                className="btn btn-nexa w-100"
                style={{
                  marginTop: "0.75rem",
                  opacity: actionLoading ? 0.6 : 1,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                {actionLoading ? "Saving..." : "Save Note"}
              </button>
            </div>

            <Link to="/admin/users" className="btn btn-nexa-outline w-100">
              <i className="bi bi-arrow-left me-1"></i>Back to Users
            </Link>
          </div>
        </div>

        {showSuspendConfirm && (
          <div
            onClick={() => !actionLoading && setShowSuspendConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.55)",
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
              style={{ width: "100%", maxWidth: 460 }}
            >
              <h3 className="adm-card-title" style={{ marginBottom: "0.5rem", color: "#ff6b6b" }}>
                Confirm Suspension
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--nexa-gray-300)" }}>
                Are you sure you want to suspend this account?
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
                  onClick={() => setShowSuspendConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={actionLoading}
                  onClick={handleSuspendAccount}
                  style={{ background: "#ff6b6b", color: "#fff", border: "1px solid #ff6b6b" }}
                >
                  {actionLoading ? "Suspending..." : "Suspend Account"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showReinstateConfirm && (
          <div
            onClick={() => !actionLoading && setShowReinstateConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.55)",
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
              style={{ width: "100%", maxWidth: 460 }}
            >
              <h3 className="adm-card-title" style={{ marginBottom: "0.5rem", color: "#00e676" }}>
                Confirm Reinstatement
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--nexa-gray-300)" }}>
                Are you sure you want to reinstate this account?
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
                  onClick={() => setShowReinstateConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={actionLoading}
                  onClick={handleReinstateAccount}
                  style={{ background: "#00c769", color: "#fff", border: "1px solid #00c769" }}
                >
                  {actionLoading ? "Reinstating..." : "Reinstate Account"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div
            onClick={() => !actionLoading && setShowDeleteConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.55)",
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
              style={{ width: "100%", maxWidth: 460 }}
            >
              <h3 className="adm-card-title" style={{ marginBottom: "0.5rem", color: "#ff6b6b" }}>
                Confirm Delete
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--nexa-gray-300)" }}>
                Are you sure you want to delete this account? This action cannot be undone.
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
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={actionLoading}
                  onClick={handleDeleteAccount}
                  style={{ background: "#dc3545", color: "#fff", border: "1px solid #dc3545" }}
                >
                  {actionLoading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
