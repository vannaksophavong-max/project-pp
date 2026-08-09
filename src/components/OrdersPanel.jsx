import { useEffect, useState } from "react";
import { adminGetOrders, adminUpdateOrderStatus } from "../api.js";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      showMessage(`Order marked as ${STATUS_LABELS[status]}.`);
    } catch (err) {
      setError(err.message || "Failed to update order.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="orders-panel">
      <div className="orders-panel__toolbar">
        <h2 className="admin__section-label">Order list</h2>
        <span className="orders-panel__count">{orders.length} order{orders.length === 1 ? "" : "s"}</span>
      </div>

      {message && <div className="orders-panel__message">{message}</div>}
      {error && <div className="orders-panel__error">{error}</div>}

      <div className="users-panel__table-wrap">
        {loading ? (
          <p className="users-panel__loading">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="users-panel__empty">No orders yet.</p>
        ) : (
          <table className="users-panel__table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="orders-panel__ref">{order.reference}</td>
                  <td>
                    <div className="orders-panel__name">{order.customer_name}</div>
                    <div className="orders-panel__sub">{order.phone}</div>
                    <div className="orders-panel__sub">{order.address}</div>
                  </td>
                  <td>
                    {(order.order_items || []).map((item) => (
                      <div key={item.id} className="orders-panel__sub">
                        {item.product_name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="orders-panel__total">${Number(order.total_amount).toFixed(2)}</td>
                  <td>
                    <div className={`orders-panel__pay orders-panel__pay--${order.payment_method || "cod"}`}>
                      {order.payment_method === "qr" ? "Bakong QR" : "Cash"}
                      {order.payment_status === "paid" ? " · paid" : " · unpaid"}
                    </div>
                  </td>
                  <td className="orders-panel__sub">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <select
                      className={`orders-panel__status orders-panel__status--${order.status}`}
                      value={order.status}
                      disabled={busyId === order.id}
                      onChange={(e) => changeStatus(order.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
