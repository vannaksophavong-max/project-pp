import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMyOrders } from "../api.js";
import Icon from "../components/Icon.jsx";
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
    return (
      <div className="orders__track orders__track--cancelled">
        <Icon name="ban" size={15} /> Order cancelled
      </div>
    );
  }

  const current = stepIndex(status);

  return (
    <ol className="orders__track">
      {TRACK_STEPS.map((step, i) => (
        <li
          key={step.status}
          className={`orders__step ${i <= current ? "orders__step--done" : ""} ${i === current ? "orders__step--current" : ""}`}
        >
          <span className="orders__step-dot">
            {i <= current && <Icon name="check" size={11} strokeWidth={2.5} />}
          </span>
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
      <div className="orders-page">
        <Navbar />
        <main className="orders-page__main">
          <div className="orders__empty-card">
            <div className="orders__empty-icon">
              <Icon name="user" size={32} />
            </div>
            <h2>My Orders</h2>
            <p>Please log in to view your order history and live delivery status.</p>
            <Link to="/login" className="orders__btn">
              <Icon name="logIn" size={16} /> Log in
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Navbar />

      <main className="orders-page__main">
        <div className="orders__head">
          <div>
            <Link to="/" className="orders__back">
              <Icon name="arrowLeft" size={15} /> Back to shop
            </Link>
            <h1 className="orders__title">My Orders</h1>
          </div>
          {!loading && orders.length > 0 && (
            <span className="orders__count-pill">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="orders__skeleton-list">
            <div className="orders__skeleton" />
            <div className="orders__skeleton" />
          </div>
        ) : error ? (
          <div className="orders__error">
            <Icon name="ban" size={16} /> {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="orders__empty-card">
            <div className="orders__empty-icon">
              <Icon name="clipboard" size={34} />
            </div>
            <h3>No orders yet</h3>
            <p>You haven't placed any orders yet. Go pick out a block set or blind box!</p>
            <Link to="/" className="orders__btn">
              Explore Products <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        ) : (
          <ul className="orders__list">
            {orders.map((order) => (
              <li className="orders__order" key={order.id}>
                <div className="orders__order-head">
                  <div className="orders__order-meta">
                    <div className="orders__ref-row">
                      <span className="orders__reference">{order.reference}</span>
                      <span className="orders__date">Placed on {formatDate(order.created_at)}</span>
                    </div>
                    <div className="orders__pay">
                      <Icon name="creditCard" size={13} />
                      {order.payment_method === "qr"
                        ? `Paid via Bakong QR${order.payment_status === "paid" ? "" : " (awaiting verification)"}`
                        : "Cash on Delivery"}
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
                        <div className="orders__item-img orders__item-img--placeholder">
                          <Icon name="brick" size={18} />
                        </div>
                      )}
                      <div className="orders__item-info">
                        <span className="orders__item-name">{item.product_name}</span>
                        <span className="orders__item-qty">
                          Qty: {item.quantity} · ${Number(item.price).toFixed(2)} each
                        </span>
                      </div>
                      <span className="orders__item-price">
                        ${Number(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="orders__order-foot">
                  <span className="orders__ship">
                    <Icon name="mapPin" size={15} />
                    <span>Deliver to: <strong>{order.address}</strong></span>
                  </span>
                  <span className="orders__total">
                    Total <strong>${Number(order.total_amount).toFixed(2)}</strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}
