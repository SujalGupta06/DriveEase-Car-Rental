
import { useEffect, useState } from "react";
import "./ManageUsers.css";

const API_URL = "https://driveease-api-4zbo.onrender.com/api/users/admin/users";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          throw new Error(
            "Admin token not found. Please log in again."
          );
        }

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (role !== "all") {
          params.set("role", role);
        }

        const query = params.toString();
        const url = query
          ? `${API_URL}?${query}`
          : API_URL;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch users"
          );
        }

        setUsers(Array.isArray(data.users) ? data.users : []);
        setTotalUsers(data.totalUsers ?? 0);
        setTotalCustomers(data.totalCustomers ?? 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Something went wrong"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => controller.abort();
  }, [search, role, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((current) => current + 1);
  };

  const adminCount = Math.max(
    0,
    totalUsers - totalCustomers
  );

  return (
    <div className="manage-users-page">
      <div className="users-header">
        <div>
          <p className="users-eyebrow">
            DRIVEEASE ADMIN PANEL
          </p>

          <h1>Manage Users</h1>

          <p className="users-subtitle">
            View and manage registered DriveEase users.
          </p>
        </div>

        <button
          className="users-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          ↻ {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="users-stats">
        <div className="user-stat-card">
          <div className="user-stat-icon total-icon">
            👥
          </div>

          <div>
            <p>Total Users</p>
            <h2>{totalUsers}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon customer-icon">
            🧑
          </div>

          <div>
            <p>Total Customers</p>
            <h2>{totalCustomers}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon admin-icon">
            🛡️
          </div>

          <div>
            <p>Admins</p>
            <h2>{adminCount}</h2>
          </div>
        </div>
      </div>

      <div className="users-content">
        <div className="users-toolbar">
          <div className="users-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search users"
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <select
            className="users-role-filter"
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
            aria-label="Filter users by role"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="users-table-heading">
          <div>
            <h2>Registered Users</h2>
            <p>
              {loading
                ? "Loading users..."
                : `${users.length} user${
                    users.length === 1 ? "" : "s"
                  } shown`}
            </p>
          </div>
        </div>

        {error && (
          <div className="users-error" role="alert">
            <strong>Unable to load users</strong>
            <p>{error}</p>

            <button onClick={handleRefresh}>
              Try again
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="users-state">
            <div className="users-spinner" />
            <p>Loading registered users...</p>
          </div>
        )}

        {!error && !loading && users.length === 0 && (
          <div className="users-state">
            <div className="users-empty-icon">👤</div>
            <h3>No users found</h3>
            <p>
              Try another search term or change the role filter.
            </p>
          </div>
        )}

        {!error && !loading && users.length > 0 && (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Total Bookings</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar">
                          {(user.fullName || "U")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>
                          {user.fullName || "Unknown User"}
                        </span>
                      </div>
                    </td>

                    <td>{user.email || "—"}</td>

                    <td>{user.phone || "—"}</td>

                    <td>
                      <span
                        className={`user-role-badge ${
                          user.role === "admin"
                            ? "role-admin"
                            : "role-customer"
                        }`}
                      >
                        {user.role || "customer"}
                      </span>
                    </td>

                    <td>
                      <span className="user-booking-count">
                        {user.totalBookings ?? 0}
                      </span>
                    </td>

                    <td>
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;
