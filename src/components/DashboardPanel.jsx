import { useEffect, useMemo, useState } from "react";
import { adminGetOrders } from "../api.js";
import Icon from "./Icon.jsx";
import "./DashboardPanel.css";

const STATUSES = ["pending", "completed", "shipped", "delivered", "cancelled"];

const STATUS_LABELS = {
  pending: "Pending",
  completed: "Completed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TONES = {
  pending: "yellow",
  completed: "green",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default function DashboardPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("30"); // "7" | "30" | "all"

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await adminGetOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const cutoff = range === "all" ? 0 : now - Number(range) * DAY_MS;
    const filtered = orders.filter((o) => {
      if (!o.created_at) return true;
      return new Date(o.created_at).getTime() >= cutoff;
    });

    const active = filtered.filter((o) => o.status !== "cancelled");
    const revenue = active.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const byStatus = {};
    STATUSES.forEach((s) => (byStatus[s] = 0));
    filtered.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    });

    const productMap = {};
    filtered.forEach((o) => {
      (o.order_items || []).forEach((item) => {
        const name = item.product_name || "Unknown product";
        const qty = Number(item.quantity) || 0;
        const unit = Number(item.price) || 0;
        if (!productMap[name]) {
          productMap[name] = { name, qty: 0, revenue: 0 };
        }
        productMap[name].qty += qty;
        productMap[name].revenue += qty * unit;
      });
    });
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
      .slice(0, 5);

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * DAY_MS);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = dayStart.getTime() + DAY_MS;
      const dayOrders = filtered.filter((o) => {
        if (!o.created_at) return false;
        const t = new Date(o.created_at).getTime();
        return t >= dayStart.getTime() && t < dayEnd;
      });
      const dayRevenue = dayOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      days.push({
        label: dayStart.toLocaleDateString(undefined, { weekday: "short" }),
        count: dayOrders.length,
        revenue: dayRevenue,
      });
    }
    const peak = Math.max(1, ...days.map((d) => d.count));

    return { revenue, total: filtered.length, byStatus, topProducts, days, peak };
  }, [orders, range]);

  const avgOrder = stats.total ? stats.revenue / stats.total : 0;

  return (
    <section className="dash">
      <div className="dash__toolbar">
        <h2 className="admin__section-label">Sales dashboard</h2>
        <div className="dash__range">
          {[
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
            { value: "all", label: "All time" },
          ].map((r) => (
            <button
              key={r.value}
              type="button"
              className={`dash__range-btn ${range === r.value ? "dash__range-btn--active" : ""}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="orders-panel__error">{error}</div>}

      {loading ? (
        <p className="users-panel__loading">Loading sales data...</p>
      ) : (
        <>
          <div className="dash__stats">
            <div className="dash__stat">
              <div className="dash__stat-icon dash__stat-icon--green">
                <Icon name="coin" size={22} />
              </div>
              <div>
                <div className="dash__stat-label">Revenue</div>
                <div className="dash__stat-value">${stats.revenue.toFixed(2)}</div>
              </div>
            </div>
            <div className="dash__stat">
              <div className="dash__stat-icon dash__stat-icon--blue">
                <Icon name="clipboard" size={22} />
              </div>
              <div>
                <div className="dash__stat-label">Orders</div>
                <div className="dash__stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="dash__stat">
              <div className="dash__stat-icon dash__stat-icon--yellow">
                <Icon name="trend" size={22} />
              </div>
              <div>
                <div className="dash__stat-label">Avg. order value</div>
                <div className="dash__stat-value">${avgOrder.toFixed(2)}</div>
              </div>
            </div>
            <div className="dash__stat">
              <div className="dash__stat-icon dash__stat-icon--red">
                <Icon name="clock" size={22} />
              </div>
              <div>
                <div className="dash__stat-label">Pending</div>
                <div className="dash__stat-value">{stats.byStatus.pending}</div>
              </div>
            </div>
          </div>

          <div className="dash__grid">
            <div className="dash__card">
              <h4 className="dash__card-title">Orders — last 7 days</h4>
              <div className="dash__chart">
                {stats.days.map((d, i) => (
                  <div className="dash__chart-col" key={i}>
                    <div className="dash__chart-bar-wrap">
                      <div
                        className="dash__chart-bar"
                        style={{ height: `${Math.max(4, (d.count / stats.peak) * 100)}%` }}
                        title={`${d.count} order${d.count === 1 ? "" : "s"} · $${d.revenue.toFixed(2)}`}
                      />
                    </div>
                    <span className="dash__chart-label">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash__card">
              <h4 className="dash__card-title">Order status</h4>
              <div className="dash__status">
                {STATUSES.map((s) => (
                  <div className="dash__status-row" key={s}>
                    <span className="dash__status-label">
                      <span className={`dash__dot dash__dot--${STATUS_TONES[s]}`} />
                      {STATUS_LABELS[s]}
                    </span>
                    <span className="dash__status-count">{stats.byStatus[s]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dash__card">
            <h4 className="dash__card-title">Top-selling products</h4>
            {stats.topProducts.length === 0 ? (
              <p className="dash__empty">No product sales in this range yet.</p>
            ) : (
              <div className="dash__top">
                {stats.topProducts.map((p, i) => (
                  <div className="dash__top-row" key={p.name}>
                    <span className="dash__top-rank">{i + 1}</span>
                    <span className="dash__top-name">{p.name}</span>
                    <span className="dash__top-qty">{p.qty} sold</span>
                    <span className="dash__top-rev">${p.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
