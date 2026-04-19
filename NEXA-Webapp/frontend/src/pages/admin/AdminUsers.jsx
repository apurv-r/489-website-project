import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import Toast from "../../components/Toast";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PAGE_SIZE = 10;

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

function formatRoleType(roleType) {
  if (roleType === "Host") return "Host";
  if (roleType === "Renter") return "Driver";
  if (roleType === "Admin") return "Admin";
  return "User";
}

const ROLES = ["All", "Host", "Renter", "Admin"];
const ROLE_LABELS = { All: "All", Host: "Host", Renter: "Driver", Admin: "Admin" };

const STATUS_STYLE = {
  Active: { bg: "rgba(0,230,118,0.12)", color: "#00e676" },
  Suspended: { bg: "rgba(255,107,107,0.12)", color: "#ff6b6b" },
  Inactive: { bg: "rgba(156,156,156,0.12)", color: "#9c9c9c" },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  async function loadUsers() {
    try {
      setLoading(true);
      const [usersRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/bookings`, { withCredentials: true }),
      ]);

      const allUsers = usersRes.data || [];
      const allBookings = bookingsRes.data || [];

      setUsers(allUsers);
      setBookings(allBookings);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateAdmin(event) {
    event.preventDefault();

    if (
      !createAdminForm.firstName ||
      !createAdminForm.lastName ||
      !createAdminForm.email ||
      !createAdminForm.password
    ) {
      setToast({ type: "error", message: "Please fill in all fields." });
      return;
    }

    if (createAdminForm.password.length < 6) {
      setToast({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    try {
      setActionLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/users/admins`,
        {
          firstName: createAdminForm.firstName.trim(),
          lastName: createAdminForm.lastName.trim(),
          email: createAdminForm.email.trim(),
          password: createAdminForm.password,
        },
        { withCredentials: true },
      );

      setCreateAdminForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setShowCreateAdmin(false);
      setToast({ type: "success", message: "Admin user created successfully." });
      await loadUsers();
    } catch (error) {
      console.error("Failed to create admin user:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to create admin user.",
      });
    } finally {
      setActionLoading(false);
    }
  }

  const bookingCountByUserId = useMemo(() => {
    const counts = {};
    bookings.forEach((booking) => {
      const userId = booking.renter?._id || booking.renter;
      if (userId) {
        counts[userId] = (counts[userId] || 0) + 1;
      }
    });
    return counts;
  }, [bookings]);

  const displayUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesRole = roleFilter === "All" || u.roleType === roleFilter;
        const matchesSearch =
          (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(search.toLowerCase());
        return matchesRole && matchesSearch;
      })
      .map((u) => ({
        ...u,
        displayName: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown",
        displayRole: formatRoleType(u.roleType),
        bookingCount: bookingCountByUserId[u._id] || 0,
        status: u.accountStatus === "suspended" ? "Suspended" : "Active",
      }));
  }, [users, roleFilter, search, bookingCountByUserId]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return displayUsers.slice(start, start + PAGE_SIZE);
  }, [displayUsers, currentPage]);

  const totalPages = Math.ceil(displayUsers.length / PAGE_SIZE);

  if (loading) {
    return (
      <div className="adm-layout">
        <AdminSidebar />
        <main className="adm-main">
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-400)" }}>
            Loading users…
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
            <h1 className="adm-page-title">Users</h1>
            <p className="adm-page-sub">
              Manage all drivers and hosts on the platform. Total: {displayUsers.length}
            </p>
          </div>
        </div>

        {/* Filter bar */}
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
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              flex: "1 1 200px",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "var(--nexa-surface)",
              color: "var(--nexa-gray-200)",
              outline: "none",
              fontSize: "0.875rem",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
            }}
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              border: "1px solid var(--nexa-border)",
              background: "var(--nexa-surface)",
              color: "var(--nexa-gray-200)",
              fontSize: "0.875rem",
            }}
          >
            {ROLES.map((r) => (
              <option key={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-nexa"
            onClick={() => setShowCreateAdmin(true)}
            style={{ whiteSpace: "nowrap" }}
          >
            <i className="bi bi-person-plus me-1"></i>Create Admin
          </button>
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
                {["Name", "Email", "Role", "Joined", "Bookings", "Status", ""].map((h) => (
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
              {paginatedUsers.map((u) => {
                const st = STATUS_STYLE[u.status] || STATUS_STYLE.Active;
                return (
                  <tr key={u._id} style={{ borderBottom: "1px solid var(--nexa-border)" }}>
                    <td style={{ padding: "0.6rem 0.5rem", fontWeight: 600 }}>{u.displayName}</td>
                    <td
                      style={{
                        padding: "0.6rem 0.5rem",
                        color: "var(--nexa-gray-400)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {u.email || "—"}
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem" }}>
                      <span
                        style={{
                          padding: "0.2em 0.7em",
                          borderRadius: 20,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background:
                            u.displayRole === "Host"
                              ? "rgba(253,200,65,0.12)"
                              : u.displayRole === "Admin"
                                ? "rgba(180,120,255,0.15)"
                                : "rgba(116,185,255,0.12)",
                          color:
                            u.displayRole === "Host"
                              ? "#fdc841"
                              : u.displayRole === "Admin"
                                ? "#c792ff"
                                : "#74b9ff",
                        }}
                      >
                        {u.displayRole}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "0.6rem 0.5rem",
                        color: "var(--nexa-gray-400)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem" }}>{u.bookingCount}</td>
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
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem" }}>
                      <Link
                        to={`/admin/user-detail?id=${u._id}`}
                        className="btn btn-nexa-outline btn-nexa-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: "2rem", textAlign: "center", color: "var(--nexa-gray-500)" }}
                  >
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

        {showCreateAdmin && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1200,
              padding: "1rem",
            }}
            onClick={() => setShowCreateAdmin(false)}
          >
            <div
              className="adm-card"
              style={{ width: "100%", maxWidth: 480 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="adm-card-title" style={{ marginBottom: "1rem" }}>
                Create Admin User
              </h3>
              <form onSubmit={handleCreateAdmin} style={{ display: "grid", gap: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="First name"
                  value={createAdminForm.firstName}
                  onChange={(event) =>
                    setCreateAdminForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "var(--nexa-surface)",
                    color: "var(--nexa-gray-200)",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={createAdminForm.lastName}
                  onChange={(event) =>
                    setCreateAdminForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "var(--nexa-surface)",
                    color: "var(--nexa-gray-200)",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
                  }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={createAdminForm.email}
                  onChange={(event) =>
                    setCreateAdminForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "var(--nexa-surface)",
                    color: "var(--nexa-gray-200)",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
                  }}
                />
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={createAdminForm.password}
                  onChange={(event) =>
                    setCreateAdminForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "var(--nexa-surface)",
                    color: "var(--nexa-gray-200)",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-nexa-outline"
                    disabled={actionLoading}
                    onClick={() => setShowCreateAdmin(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-nexa" disabled={actionLoading}>
                    {actionLoading ? "Creating..." : "Create Admin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
