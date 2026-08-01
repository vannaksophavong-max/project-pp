import { useEffect, useState } from "react";
import {
  adminGetStats,
  adminGetUsers,
  adminUpdateUser,
  adminResetPassword,
  adminBanUser,
  adminUnbanUser,
  adminDeleteUser,
} from "../api.js";
import "./UsersPanel.css";

export default function UsersPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [message, setMessage] = useState("");

  async function loadStats() {
    try {
      const data = await adminGetStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load stats.");
    }
  }

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await adminGetUsers({ page, limit: 10, search: query });
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  function goToPage(next) {
    if (next >= 1 && next <= totalPages) setPage(next);
  }

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  async function runAction(id, action, successText) {
    setBusyId(id);
    setError("");
    try {
      if (action === "promote") await adminUpdateUser(id, { isAdmin: true });
      else if (action === "demote") await adminUpdateUser(id, { isAdmin: false });
      else if (action === "ban") await adminBanUser(id);
      else if (action === "unban") await adminUnbanUser(id);
      else if (action === "delete") await adminDeleteUser(id);
      await loadUsers();
      await loadStats();
      showMessage(successText);
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusyId("");
    }
  }

  function openResetModal(user) {
    setResetTarget(user);
    setNewPassword("");
    setResetError("");
  }

  async function submitReset(e) {
    e.preventDefault();
    setResetError("");
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    setBusyId(resetTarget.id);
    try {
      await adminResetPassword(resetTarget.id, newPassword);
      setResetTarget(null);
      showMessage(`Password reset for ${resetTarget.username}.`);
    } catch (err) {
      setResetError(err.message || "Failed to reset password.");
    } finally {
      setBusyId("");
    }
  }

  const bannedCount = stats?.bannedCount ?? 0;

  return (
    <section className="users-panel">
      <div className="users-panel__stats">
        <div className="users-panel__stat">
          <span className="users-panel__stat-value">{stats?.totalUsers ?? "—"}</span>
          <span className="users-panel__stat-label">Total Users</span>
        </div>
        <div className="users-panel__stat">
          <span className="users-panel__stat-value">{stats?.adminCount ?? "—"}</span>
          <span className="users-panel__stat-label">Admins</span>
        </div>
        <div className="users-panel__stat users-panel__stat--warn">
          <span className="users-panel__stat-value">{bannedCount}</span>
          <span className="users-panel__stat-label">Banned</span>
        </div>
        <div className="users-panel__stat">
          <span className="users-panel__stat-value">{stats?.newUsersThisWeek ?? "—"}</span>
          <span className="users-panel__stat-label">New This Week</span>
        </div>
      </div>

      <div className="users-panel__toolbar">
        <form className="users-panel__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <span className="users-panel__count">{total} user{total === 1 ? "" : "s"}</span>
      </div>

      {message && <div className="users-panel__message">{message}</div>}
      {error && <div className="users-panel__error">{error}</div>}

      <div className="users-panel__table-wrap">
        {loading ? (
          <p className="users-panel__loading">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="users-panel__empty">No users found.</p>
        ) : (
          <table className="users-panel__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`users-panel__badge ${user.is_admin ? "users-panel__badge--admin" : ""}`}>
                      {user.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>
                    {user.is_banned ? (
                      <span className="users-panel__badge users-panel__badge--banned">Banned</span>
                    ) : (
                      <span className="users-panel__badge users-panel__badge--active">Active</span>
                    )}
                  </td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td>
                  <td className="users-panel__actions">
                    <button
                      type="button"
                      className="users-panel__btn users-panel__btn--role"
                      disabled={busyId === user.id}
                      onClick={() =>
                        runAction(user.id, user.is_admin ? "demote" : "promote",
                          user.is_admin ? "Admin removed." : "User promoted to admin.")
                      }
                    >
                      {user.is_admin ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button
                      type="button"
                      className={`users-panel__btn ${user.is_banned ? "users-panel__btn--unban" : "users-panel__btn--ban"}`}
                      disabled={busyId === user.id}
                      onClick={() =>
                        runAction(user.id, user.is_banned ? "unban" : "ban",
                          user.is_banned ? "User unbanned." : "User banned.")
                      }
                    >
                      {user.is_banned ? "Unban" : "Ban"}
                    </button>
                    <button
                      type="button"
                      className="users-panel__btn users-panel__btn--reset"
                      disabled={busyId === user.id}
                      onClick={() => openResetModal(user)}
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      className="users-panel__btn users-panel__btn--delete"
                      disabled={busyId === user.id}
                      onClick={() => {
                        if (window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
                          runAction(user.id, "delete", "User deleted.");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="users-panel__pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </button>
      </div>

      {resetTarget && (
        <div className="users-panel__modal-overlay">
          <div className="users-panel__modal">
            <h3>Reset Password</h3>
            <p>Set a new password for <strong>{resetTarget.username}</strong>.</p>
            <form onSubmit={submitReset}>
              <input
                type="password"
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {resetError && <div className="users-panel__error">{resetError}</div>}
              <div className="users-panel__modal-actions">
                <button type="button" onClick={() => setResetTarget(null)}>Cancel</button>
                <button type="submit" disabled={busyId === resetTarget.id}>
                  {busyId === resetTarget.id ? "Saving..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
