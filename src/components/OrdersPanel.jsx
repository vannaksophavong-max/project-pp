import { useEffect, useMemo, useState } from "react";
import { adminGetOrders, adminUpdateOrderStatus } from "../api.js";
import Icon from "./Icon.jsx";
import "./OrdersPanel.css";

const STATUSES = ["pending", "completed", "shipped", "delivered", "cancelled"];

const STATUS_LABELS = {
  pending: "Pending",
  completed: "Completed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await adminGetOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  async function changeStatus(orderId, status) {
    setBusyId(orderId);
    setError("");
    try {
      await adminUpdateOrderStatus(orderId, status);
      await loadOrders();
      showMessage(`Order status updated to ${STATUS_LABELS[status]}.`);
    } catch (err) {
      setError(err.message || "Failed to update order.");
    } finally {
      setBusyId("");
    }
  }

  const counts = useMemo(() => {
    const map = { all: orders.length };
    STATUSES.forEach((s) => (map[s] = 0));
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => statusFilter === "all" || o.status === statusFilter)
      .filter((o) => {
        if (!q) return true;
        return (
          o.reference?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.phone?.toLowerCase().includes(q) ||
          o.address?.toLowerCase().includes(q)
        );
      });
  }, [orders, search, statusFilter]);

  return (
    <section className="orders-panel">
      {/* ---- Summary KPI Row ---- */}
      <div className="orders-panel__kpis">
        <div className="orders-panel__kpi">
          <div className="orders-panel__kpi-top">
            <span>Total Orders</span>
            <span className="orders-panel__kpi-icon orders-panel__kpi-icon--blue">
              <Icon name="clipboard" size={18} />
            </span>
          </div>
          <strong>{counts.all}</strong>
        </div>
        <div className="orders-panel__kpi">
          <div className="orders-panel__kpi-top">
            <span>Pending Dispatch</span>
            <span className="orders-panel__kpi-icon orders-panel__kpi-icon--yellow">
              <Icon name="clock" size={18} />
            </span>
          </div>
          <strong>{counts.pending || 0}</strong>
        </div>
        <div className="orders-panel__kpi">
          <div className="orders-panel__kpi-top">
            <span>Shipped</span>
            <span className="orders-panel__kpi-icon orders-panel__kpi-icon--blue">
              <Icon name="truck" size={18} />
            </span>
          </div>
          <strong>{counts.shipped || 0}</strong>
        </div>
        <div className="orders-panel__kpi">
          <div className="orders-panel__kpi-top">
            <span>Fulfilled</span>
            <span className="orders-panel__kpi-icon orders-panel__kpi-icon--green">
              <Icon name="checkCircle" size={18} />
            </span>
          </div>
          <strong>{(counts.delivered || 0) + (counts.completed || 0)}</strong>
        </div>
      </div>

      {message && (
        <div className="orders-panel__message">
          <Icon name="checkCircle" size={16} /> {message}
        </div>
      )}
      {error && (
        <div className="orders-panel__error">
          <Icon name="ban" size={16} /> {error}
        </div>
      )}

      <div className="orders-panel__card">
        <div className="orders-panel__toolbar">
          <div className="orders-panel__toolbar-left">
            <div className="orders-panel__search-wrap">
              <Icon name="search" size={16} className="orders-panel__search-icon" />
              <input
                type="text"
                className="orders-panel__search"
                placeholder="Search reference, customer, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="orders-panel__search-clear"
                  onClick={() => setSearch("")}
                >
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>

            <div className="orders-panel__tabs">
              {["all", ...STATUSES].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`orders-panel__tab ${
                    statusFilter === s ? "orders-panel__tab--active" : ""
                  }`}
                  onClick={() => setStatusFilter(s)}
                >
                  <span>{s === "all" ? "All" : STATUS_LABELS[s]}</span>
                  <span className="orders-panel__tab-badge">{counts[s] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="orders-panel__refresh" onClick={loadOrders}>
            <Icon name="refresh" size={14} /> Refresh
          </button>
        </div>

        <div className="orders-panel__table-wrap">
          {loading ? (
            <p className="orders-panel__loading">Loading order records...</p>
          ) : filtered.length === 0 ? (
            <div className="orders-panel__empty">
              <Icon name="clipboard" size={28} />
              <strong>No orders match your filter</strong>
              <span>Try selecting a different status tab or clearing your search.</span>
            </div>
          ) : (
            <table className="orders-panel__table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer & Delivery</th>
                  <th>Purchased Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Placed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="orders-panel__ref">{order.reference}</span>
                    </td>
                    <td>
                      <div className="orders-panel__name">{order.customer_name}</div>
                      <div className="orders-panel__sub">{order.phone}</div>
                      <div className="orders-panel__sub orders-panel__address">
                        {order.address}
                      </div>
                    </td>
                    <td>
                      <div className="orders-panel__items-list">
                        {(order.order_items || []).map((item) => (
                          <span key={item.id} className="orders-panel__item-pill">
                            {item.product_name} <b>×{item.quantity}</b>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="orders-panel__total">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`orders-panel__pay orders-panel__pay--${
                          order.payment_method || "cod"
                        }`}
                      >
                        <span className="orders-panel__pay-dot" />
                        {order.payment_method === "qr" ? "Bakong QR" : "Cash"}
                        {order.payment_status === "paid" ? " · Paid" : " · Unpaid"}
                      </span>
                    </td>
                    <td className="orders-panel__date">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>
                      <select
                        className={`orders-panel__status orders-panel__status--${order.status}`}
                        value={order.status}
                        disabled={busyId === order.id}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
