import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMyOrders } from "../api.js";
import "./OrdersPage.css";

const STATUS_LABELS = {
  pending: "Pending",
  completed: "Completed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const TRACK_STEPS = [
  { status: "pending", label: "Order placed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

function stepIndex(status) {
  if (status === "delivered") return 2;
  if (status === "shipped" || status === "completed") return 1;
  return 0;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function OrderTrack({ status }) {
  if (status === "cancelled") {
    return <div className="orders__track orders__track--cancelled">Order cancelled</div>;
  }

  const current = stepIndex(status);

  return (
    <ol className="orders__track">
      {TRACK_STEPS.map((step, i) => (
        <li
          key={step.status}
          className={`orders__step ${i <= current ? "orders__step--done" : ""} ${i === current ? "orders__step--current" : ""}`}
        >
          <span className="orders__step-dot" />
          <span className="orders__step-label">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function OrdersPage() {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    const data = await fetchMyOrders();
    setOrders(Array.isArray(data?.orders) ? data.orders : []);
    setError("");
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    setLoading(true);
    loadOrders()
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const id = setInterval(() => {
      if (!cancelled) loadOrders().catch(() => {});
    }, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isLoggedIn, loadOrders]);

  if (!isLoggedIn) {
    return (
      <div className="orders">
        <div className="orders__card">
          <h2 className="orders__title">My orders</h2>
          <p className="orders__empty">Please log in to see your order history.</p>
          <Link to="/login" className="orders__btn">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="orders__card">
        <div className="orders__head">
          <h2 className="orders__title">My orders</h2>
          <Link to="/" className="orders__back">← Back to shop</Link>
        </div>

        {loading ? (
          <p className="orders__empty">Loading your orders...</p>
        ) : error ? (
          <p className="orders__error">{error}</p>
        ) : orders.length === 0 ? (
          <p className="orders__empty">
            You haven't placed any orders yet. Go pick out a block set or blind box!
          </p>
        ) : (
          <ul className="orders__list">
            {orders.map((order) => (
              <li className="orders__order" key={order.id}>
                <div className="orders__order-head">
                  <div>
                    <div className="orders__reference">{order.reference}</div>
                    <div className="orders__date">{formatDate(order.created_at)}</div>
                    <div className="orders__pay">
                      {order.payment_method === "qr"
                        ? `Paid via Bakong QR${order.payment_status === "paid" ? "" : " (unpaid)"}`
                        : "Cash on delivery"}
                    </div>
                  </div>
                  <span className={`orders__badge orders__badge--${order.status}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                <OrderTrack status={order.status} />

                <ul className="orders__items">
                  {(order.order_items || []).map((item) => (
                    <li className="orders__item" key={item.id}>
                      {item.image_url ? (
                        <img
                          className="orders__item-img"
                          src={item.image_url}
                          alt=""
                          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                        />
                      ) : (
                        <div className="orders__item-img orders__item-img--placeholder">🧱</div>
                      )}
                      <span className="orders__item-name">
                        {item.product_name}
                        {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                      </span>
                      <span className="orders__item-price">
                        ${Number(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="orders__order-foot">
                  <span className="orders__ship">
                    Deliver to: {order.address}
                  </span>
                  <span className="orders__total">
                    Total <strong>${Number(order.total_amount).toFixed(2)}</strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
