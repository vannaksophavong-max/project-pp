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

export default function DashboardPanel({ onNavigateTab }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("all"); // "7" | "30" | "all"

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
      if (o.status === "cancelled") return;
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
      .sort((a, b) => b.revenue - a.revenue || b.qty - a.qty)
      .slice(0, 5);
    const maxProductRev = Math.max(1, ...topProducts.map((p) => p.revenue));

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * DAY_MS);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = dayStart.getTime() + DAY_MS;
      const dayOrders = orders.filter((o) => {
        if (!o.created_at) return false;
        const t = new Date(o.created_at).getTime();
        return t >= dayStart.getTime() && t < dayEnd;
      });
      const dayRevenue = dayOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      days.push({
        label: dayStart.toLocaleDateString(undefined, { weekday: "short" }),
        dateStr: dayStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count: dayOrders.length,
        revenue: dayRevenue,
      });
    }
    const peak = Math.max(1, ...days.map((d) => d.count));

    return {
      revenue,
      total: filtered.length,
      activeCount: active.length,
      byStatus,
      topProducts,
      maxProductRev,
      days,
      peak,
    };
  }, [orders, range]);

  const avgOrder = stats.activeCount ? stats.revenue / stats.activeCount : 0;

  return (
    <section className="dash">
      <div className="dash__toolbar">
        <div className="dash__toolbar-left">
          <span className="dash__toolbar-note">
            Showing metrics for{" "}
            <strong>
              {range === "7" ? "Last 7 Days" : range === "30" ? "Last 30 Days" : "All Time"}
            </strong>
          </span>
        </div>

        <div className="dash__toolbar-right">
          <div className="dash__range" role="tablist">
            {[
              { value: "7", label: "7 Days" },
              { value: "30", label: "30 Days" },
              { value: "all", label: "All Time" },
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

          <button type="button" className="dash__refresh-btn" onClick={loadOrders} title="Refresh analytics">
            <Icon name="refresh" size={15} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="dash__alert-error">
          <Icon name="ban" size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="dash__skeleton-grid">
          <div className="dash__skeleton-kpi" />
          <div className="dash__skeleton-kpi" />
          <div className="dash__skeleton-kpi" />
          <div className="dash__skeleton-kpi" />
        </div>
      ) : (
        <>
          {/* ---- 4 KPI Cards ---- */}
          <div className="dash__stats">
            <div className="dash__stat">
              <div className="dash__stat-top">
                <span className="dash__stat-label">Gross Revenue</span>
                <div className="dash__stat-icon dash__stat-icon--green">
                  <Icon name="coin" size={20} />
                </div>
              </div>
              <div className="dash__stat-value dash__stat-value--green">
                ${stats.revenue.toFixed(2)}
              </div>
              <div className="dash__stat-sub">
                From {stats.activeCount} active {stats.activeCount === 1 ? "order" : "orders"}
              </div>
            </div>

            <div className="dash__stat">
              <div className="dash__stat-top">
                <span className="dash__stat-label">Total Orders</span>
                <div className="dash__stat-icon dash__stat-icon--blue">
                  <Icon name="clipboard" size={20} />
                </div>
              </div>
              <div className="dash__stat-value">{stats.total}</div>
              <div className="dash__stat-sub">
                {stats.byStatus.delivered + stats.byStatus.completed} fulfilled ·{" "}
                {stats.byStatus.cancelled} cancelled
              </div>
            </div>

            <div className="dash__stat">
              <div className="dash__stat-top">
                <span className="dash__stat-label">Avg. Order Value</span>
                <div className="dash__stat-icon dash__stat-icon--yellow">
                  <Icon name="trend" size={20} />
                </div>
              </div>
              <div className="dash__stat-value">${avgOrder.toFixed(2)}</div>
              <div className="dash__stat-sub">Per non-cancelled checkout</div>
            </div>

            <div className="dash__stat">
              <div className="dash__stat-top">
                <span className="dash__stat-label">Pending Action</span>
                <div className="dash__stat-icon dash__stat-icon--red">
                  <Icon name="clock" size={20} />
                </div>
              </div>
              <div className="dash__stat-value dash__stat-value--red">
                {stats.byStatus.pending}
              </div>
              <div className="dash__stat-sub">
                {onNavigateTab ? (
                  <button
                    type="button"
                    className="dash__stat-link"
                    onClick={() => onNavigateTab("orders")}
                  >
                    Review in Orders →
                  </button>
                ) : (
                  "Orders awaiting dispatch"
                )}
              </div>
            </div>
          </div>

          {/* ---- Charts Grid ---- */}
          <div className="dash__grid">
            <div className="dash__card">
              <div className="dash__card-head">
                <div>
                  <h3 className="dash__card-title">Order Volume — Last 7 Days</h3>
                  <p className="dash__card-sub">Daily order count and revenue generated</p>
                </div>
                <span className="dash__card-pill">7-Day Window</span>
              </div>

              <div className="dash__chart">
                {stats.days.map((d, i) => {
                  const pct = Math.max(6, (d.count / stats.peak) * 100);
                  return (
                    <div className="dash__chart-col" key={i}>
                      <span className="dash__chart-val">{d.count}</span>
                      <div className="dash__chart-bar-wrap">
                        <div
                          className={`dash__chart-bar ${d.count > 0 ? "dash__chart-bar--active" : ""}`}
                          style={{ height: `${pct}%` }}
                          title={`${d.dateStr}: ${d.count} order${d.count === 1 ? "" : "s"} · $${d.revenue.toFixed(2)}`}
                        />
                      </div>
                      <span className="dash__chart-label">{d.label}</span>
                      <span className="dash__chart-rev">${d.revenue.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dash__card">
              <div className="dash__card-head">
                <div>
                  <h3 className="dash__card-title">Fulfillment Pipeline</h3>
                  <p className="dash__card-sub">Distribution by current order status</p>
                </div>
              </div>

              <div className="dash__status">
                {STATUSES.map((s) => {
                  const count = stats.byStatus[s] || 0;
                  const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                  const tone = STATUS_TONES[s];
                  return (
                    <div className="dash__status-item" key={s}>
                      <div className="dash__status-row">
                        <span className="dash__status-label">
                          <span className={`dash__dot dash__dot--${tone}`} />
                          {STATUS_LABELS[s]}
                        </span>
                        <span className="dash__status-meta">
                          <strong>{count}</strong>
                          <small>({pct}%)</small>
                        </span>
                      </div>
                      <div className="dash__status-track">
                        <div
                          className={`dash__status-fill dash__status-fill--${tone}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---- Top-Selling Products ---- */}
          <div className="dash__card">
            <div className="dash__card-head">
              <div>
                <h3 className="dash__card-title">Top-Performing Products</h3>
                <p className="dash__card-sub">Ranked by revenue contribution and units sold</p>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  className="dash__card-action"
                  onClick={() => onNavigateTab("products")}
                >
                  Manage Catalog →
                </button>
              )}
            </div>

            {stats.topProducts.length === 0 ? (
              <div className="dash__empty-box">
                <Icon name="package" size={26} />
                <p>No product sales recorded in this period yet.</p>
              </div>
            ) : (
              <div className="dash__top">
                {stats.topProducts.map((p, i) => {
                  const barPct = Math.max(8, Math.round((p.revenue / stats.maxProductRev) * 100));
                  return (
                    <div className="dash__top-row" key={p.name}>
                      <span
                        className={`dash__top-rank dash__top-rank--${
                          ["gold", "silver", "bronze"][i] || "rest"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="dash__top-info">
                        <div className="dash__top-line">
                          <span className="dash__top-name">{p.name}</span>
                          <span className="dash__top-qty">{p.qty} units sold</span>
                        </div>
                        <div className="dash__top-bar-track">
                          <div className="dash__top-bar-fill" style={{ width: `${barPct}%` }} />
                        </div>
                      </div>
                      <span className="dash__top-rev">${p.revenue.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
