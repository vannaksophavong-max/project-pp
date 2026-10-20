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
import Icon from "./Icon.jsx";
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

  function clearSearch() {
    setSearch("");
    setPage(1);
    setQuery("");
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
      {/* ---- 4 KPI Cards ---- */}
      <div className="users-panel__stats">
        <div className="users-panel__stat">
          <div className="users-panel__stat-top">
            <span className="users-panel__stat-label">Total Members</span>
            <span className="users-panel__stat-icon users-panel__stat-icon--blue">
              <Icon name="users" size={18} />
            </span>
          </div>
          <span className="users-panel__stat-value">{stats?.totalUsers ?? "—"}</span>
        </div>

        <div className="users-panel__stat">
          <div className="users-panel__stat-top">
            <span className="users-panel__stat-label">Administrators</span>
            <span className="users-panel__stat-icon users-panel__stat-icon--yellow">
              <Icon name="shield" size={18} />
            </span>
          </div>
          <span className="users-panel__stat-value">{stats?.adminCount ?? "—"}</span>
        </div>

        <div className="users-panel__stat">
          <div className="users-panel__stat-top">
            <span className="users-panel__stat-label">New This Week</span>
            <span className="users-panel__stat-icon users-panel__stat-icon--green">
              <Icon name="userPlus" size={18} />
            </span>
          </div>
          <span className="users-panel__stat-value">{stats?.newUsersThisWeek ?? "—"}</span>
        </div>

        <div className="users-panel__stat users-panel__stat--warn">
          <div className="users-panel__stat-top">
            <span className="users-panel__stat-label">Banned Accounts</span>
            <span className="users-panel__stat-icon users-panel__stat-icon--red">
              <Icon name="ban" size={18} />
            </span>
          </div>
          <span className="users-panel__stat-value">{bannedCount}</span>
        </div>
      </div>

      {message && (
        <div className="users-panel__message">
          <Icon name="checkCircle" size={16} /> {message}
        </div>
      )}
      {error && (
        <div className="users-panel__error">
          <Icon name="ban" size={16} /> {error}
        </div>
      )}

      <div className="users-panel__card">
        <div className="users-panel__toolbar">
          <form className="users-panel__search" onSubmit={handleSearch}>
            <div className="users-panel__search-wrap">
              <Icon name="search" size={16} className="users-panel__search-icon" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="users-panel__search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>
            <button type="submit" className="users-panel__search-btn">
              Search
            </button>
          </form>

          <div className="users-panel__toolbar-right">
            <span className="users-panel__count">
              <strong>{total}</strong> registered {total === 1 ? "user" : "users"}
            </span>
            <button
              type="button"
              className="users-panel__refresh-btn"
              onClick={() => {
                loadStats();
                loadUsers();
              }}
            >
              <Icon name="refresh" size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="users-panel__table-wrap">
          {loading ? (
            <p className="users-panel__loading">Loading user directory...</p>
          ) : users.length === 0 ? (
            <div className="users-panel__empty">
              <Icon name="users" size={28} />
              <strong>No users found</strong>
              <span>No user accounts match your current search query.</span>
            </div>
          ) : (
            <table className="users-panel__table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="users-panel__user-cell">
                        <span className="users-panel__avatar">
                          {(user.username || "U").charAt(0).toUpperCase()}
                        </span>
                        <span className="users-panel__username">{user.username}</span>
                      </div>
                    </td>
                    <td className="users-panel__email">{user.email}</td>
                    <td>
                      <span
                        className={`users-panel__badge ${
                          user.is_admin ? "users-panel__badge--admin" : "users-panel__badge--user"
                        }`}
                      >
                        {user.is_admin && <Icon name="shield" size={11} />}
                        {user.is_admin ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td>
                      {user.is_banned ? (
                        <span className="users-panel__badge users-panel__badge--banned">
                          <span className="users-panel__status-dot" /> Banned
                        </span>
                      ) : (
                        <span className="users-panel__badge users-panel__badge--active">
                          <span className="users-panel__status-dot" /> Active
                        </span>
                      )}
                    </td>
                    <td className="users-panel__date">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="users-panel__actions">
                      <button
                        type="button"
                        className="users-panel__btn users-panel__btn--role"
                        disabled={busyId === user.id}
                        onClick={() =>
                          runAction(
                            user.id,
                            user.is_admin ? "demote" : "promote",
                            user.is_admin ? "Admin role removed." : "User promoted to admin."
                          )
                        }
                      >
                        {user.is_admin ? "Revoke Admin" : "Make Admin"}
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
                        className={`users-panel__btn ${
                          user.is_banned ? "users-panel__btn--unban" : "users-panel__btn--ban"
                        }`}
                        disabled={busyId === user.id}
                        onClick={() =>
                          runAction(
                            user.id,
                            user.is_banned ? "unban" : "ban",
                            user.is_banned ? "User unbanned." : "User banned."
                          )
                        }
                      >
                        {user.is_banned ? "Unban" : "Ban"}
                      </button>
                      <button
                        type="button"
                        className="users-panel__btn users-panel__btn--delete"
                        disabled={busyId === user.id}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete user "${user.username}"? This action cannot be undone.`
                            )
                          ) {
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
            <Icon name="arrowLeft" size={14} /> Previous
          </button>
          <span>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next <Icon name="arrowRight" size={14} />
          </button>
        </div>
      </div>

      {resetTarget && (
        <div
          className="users-panel__modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setResetTarget(null)}
        >
          <div className="users-panel__modal">
            <div className="users-panel__modal-head">
              <h3>Reset Member Password</h3>
              <button
                type="button"
                className="users-panel__modal-close"
                onClick={() => setResetTarget(null)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <p>
              Enter a new password for <strong>{resetTarget.username}</strong> ({resetTarget.email}).
            </p>
            <form onSubmit={submitReset}>
              <input
                type="password"
                placeholder="New password (minimum 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {resetError && <div className="users-panel__error">{resetError}</div>}
              <div className="users-panel__modal-actions">
                <button type="button" onClick={() => setResetTarget(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={busyId === resetTarget.id}>
                  {busyId === resetTarget.id ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
