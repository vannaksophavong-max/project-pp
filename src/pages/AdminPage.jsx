import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { adminUploadImage } from "../api.js";
import UsersPanel from "../components/UsersPanel.jsx";
import OrdersPanel from "../components/OrdersPanel.jsx";
import DashboardPanel from "../components/DashboardPanel.jsx";
import Icon from "../components/Icon.jsx";
import "./AdminPage.css";

const TAB_META = {
  dashboard: {
    title: "Sales & Analytics Overview",
    subtitle: "Monitor store revenue, order velocity, and top-performing products.",
  },
  products: {
    title: "Product Catalog & Inventory",
    subtitle: "Manage building block sets, mystery blind boxes, pricing, and stock levels.",
  },
  orders: {
    title: "Order Fulfillment",
    subtitle: "Track customer purchases, verify Bakong QR payments, and update delivery statuses.",
  },
  users: {
    title: "Customers & Access Control",
    subtitle: "View registered members, assign administrator roles, and manage account access.",
  },
};

export default function AdminPage() {
  const { isLoggedIn, isAdmin, username, login, logout } = useAuth();

  if (!isLoggedIn) {
    return <AdminLogin login={login} />;
  }

  if (!isAdmin) {
    return (
      <div className="admin-login">
        <div className="admin-login__box">
          <div className="admin-login__icon admin-login__icon--ban">
            <Icon name="ban" size={32} />
          </div>
          <h1 className="admin-login__title">Access Restricted</h1>
          <p className="admin-login__sub">
            Your account does not have administrator permissions to view this console.
          </p>
          <button className="admin-login__btn" onClick={logout}>
            Sign out & switch account
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard username={username} logout={logout} />;
}

function AdminLogin({ login }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.message);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__box" onSubmit={handleSubmit}>
        <div className="admin-login__brand-row">
          <div className="admin-login__icon admin-login__icon--brick">
            <Icon name="shield" size={26} />
          </div>
          <span className="admin-login__pill">Admin Portal</span>
        </div>
        <h1 className="admin-login__title">Sign in to Console</h1>
        <p className="admin-login__sub">Block Paradise — Store Management System</p>

        <label className="admin-login__field">
          <span>Administrator Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@blockparadise.com"
            required
          />
        </label>
        <label className="admin-login__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        {error && <p className="admin-login__error">{error}</p>}

        <button className="admin-login__btn" type="submit">
          Sign in to Dashboard <Icon name="arrowRight" size={16} />
        </button>

        <button type="button" className="admin-login__hint" onClick={() => navigate("/")}>
          <Icon name="arrowLeft" size={14} /> Return to storefront
        </button>
      </form>
    </div>
  );
}

const emptyForm = { name: "", description: "", price: "", img: "", type: "block", stock: "" };

function AdminDashboard({ username, logout }) {
  const { products, addOrUpdateProduct, removeProduct, refresh } = useProducts();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "in" | "low" | "out"
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [modalError, setModalError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => filter === "all" || p.type === filter)
      .filter((p) => {
        const s = Number(p.stock ?? 0);
        if (stockFilter === "in") return s > 0;
        if (stockFilter === "low") return s > 0 && s <= 5;
        if (stockFilter === "out") return s <= 0;
        return true;
      })
      .filter(
        (p) =>
          !q ||
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
  }, [products, search, filter, stockFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const block = products.filter((p) => p.type === "block").length;
    const blind = products.filter((p) => p.type === "blind").length;
    const outOfStock = products.filter((p) => Number(p.stock ?? 0) <= 0).length;
    const lowStock = products.filter((p) => {
      const s = Number(p.stock ?? 0);
      return s > 0 && s <= 5;
    }).length;
    const totalUnits = products.reduce((sum, p) => sum + Math.max(0, Number(p.stock ?? 0)), 0);
    return { total, block, blind, outOfStock, lowStock, totalUnits };
  }, [products]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setModalError("");
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      img: p.img,
      type: p.type,
      stock: p.stock,
    });
    setModalError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.img) {
      setModalError("Please fill in product name, price, and image.");
      return;
    }
    const stockNum = parseInt(form.stock, 10);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setModalError("Stock must be a valid number (0 or more).");
      return;
    }
    const result = await addOrUpdateProduct(editId, { ...form, stock: stockNum });
    if (!result.ok) {
      setModalError(result.message);
      return;
    }
    showToast(editId ? "Product updated successfully" : "New product added to catalog");
    setModalOpen(false);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setModalError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const data = await adminUploadImage(dataUrl);
      setForm((f) => ({ ...f, img: data.url }));
    } catch (err) {
      setModalError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name || "this product"}" from your catalog?`)) return;
    const result = await removeProduct(id);
    showToast(result.ok ? "Product removed" : result.message);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const currentMeta = TAB_META[activeTab] || TAB_META.products;

  return (
    <div className="admin">
      {/* ---- Sidebar Navigation ---- */}
      <aside className="admin__sidebar">
        <div className="admin__sidebar-brand">
          <Link to="/" className="admin__brand-logo-wrap">
            <img src="/images/logo.png" alt="" className="admin__brand-logo" />
            <div>
              <span className="admin__brand">
                Block<b>Paradise</b>
              </span>
              <span className="admin__brand-sub">Admin Console</span>
            </div>
          </Link>
        </div>

        <div className="admin__nav-section">
          <span className="admin__nav-heading">Overview</span>
          <nav className="admin__nav">
            <button
              type="button"
              className={`admin__nav-item ${activeTab === "dashboard" ? "admin__nav-item--active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Icon name="chart" size={18} />
              <span>Dashboard</span>
            </button>
          </nav>
        </div>

        <div className="admin__nav-section">
          <span className="admin__nav-heading">Store Operations</span>
          <nav className="admin__nav">
            <button
              type="button"
              className={`admin__nav-item ${activeTab === "products" ? "admin__nav-item--active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <Icon name="package" size={18} />
              <span>Products</span>
              <span className="admin__nav-pill">{stats.total}</span>
            </button>
            <button
              type="button"
              className={`admin__nav-item ${activeTab === "orders" ? "admin__nav-item--active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <Icon name="clipboard" size={18} />
              <span>Orders</span>
            </button>
            <button
              type="button"
              className={`admin__nav-item ${activeTab === "users" ? "admin__nav-item--active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <Icon name="users" size={18} />
              <span>Customers & Users</span>
            </button>
          </nav>
        </div>

        <div className="admin__sidebar-footer">
          <div className="admin__profile-card">
            <span className="admin__profile-avatar">
              {(username || "A").charAt(0).toUpperCase()}
            </span>
            <div className="admin__profile-info">
              <strong>{username || "Admin"}</strong>
              <span>Store Administrator</span>
            </div>
          </div>

          <div className="admin__sidebar-actions">
            <Link to="/" className="admin__sidebar-btn">
              <Icon name="globe" size={15} /> Storefront
            </Link>
            <button
              type="button"
              className="admin__sidebar-btn admin__sidebar-btn--danger"
              onClick={handleLogout}
            >
              <Icon name="logOut" size={15} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ---- Main Workspace ---- */}
      <div className="admin__workspace">
        <header className="admin__header">
          <div>
            <div className="admin__breadcrumbs">
              <span>Admin Console</span>
              <span>/</span>
              <strong className="admin__breadcrumb-active">{currentMeta.title}</strong>
            </div>
            <h1 className="admin__page-title">{currentMeta.title}</h1>
            <p className="admin__page-sub">{currentMeta.subtitle}</p>
          </div>

          <div className="admin__header-actions">
            {activeTab === "products" && (
              <button type="button" className="admin__Refresh-btn" onClick={refresh} title="Refresh products">
                <Icon name="refresh" size={15} /> Refresh
              </button>
            )}
            <button
              type="button"
              className="admin__primary-btn"
              onClick={() => {
                setActiveTab("products");
                openAdd();
              }}
            >
              <Icon name="plus" size={16} /> New Product
            </button>
          </div>
        </header>

        <main className="admin__content">
          {activeTab === "dashboard" && <DashboardPanel onNavigateTab={setActiveTab} />}

          {activeTab === "products" && (
            <>
              <div className="admin__stats">
                <StatCard
                  icon="package"
                  tone="blue"
                  label="Total Catalog"
                  value={stats.total}
                  sub={`${stats.totalUnits} total units in stock`}
                />
                <StatCard
                  icon="brick"
                  tone="green"
                  label="Block Paradise Sets"
                  value={stats.block}
                  sub={`${stats.total ? Math.round((stats.block / stats.total) * 100) : 0}% of catalog`}
                />
                <StatCard
                  icon="gift"
                  tone="yellow"
                  label="Mystery Blind Boxes"
                  value={stats.blind}
                  sub={`${stats.total ? Math.round((stats.blind / stats.total) * 100) : 0}% of catalog`}
                />
                <StatCard
                  icon="alert"
                  tone="red"
                  label="Stock Alerts"
                  value={stats.outOfStock + stats.lowStock}
                  sub={`${stats.outOfStock} sold out · ${stats.lowStock} low stock`}
                />
              </div>

              <div className="admin__panel-card">
                <div className="admin__toolbar">
                  <div className="admin__toolbar-left">
                    <div className="admin__search-wrap">
                      <Icon name="search" size={16} className="admin__search-icon" />
                      <input
                        className="admin__search"
                        placeholder="Search by product name or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button
                          type="button"
                          className="admin__search-clear"
                          onClick={() => setSearch("")}
                          aria-label="Clear search"
                        >
                          <Icon name="x" size={13} />
                        </button>
                      )}
                    </div>

                    <div className="admin__segmented">
                      {[
                        { id: "all", label: "All Types" },
                        { id: "block", label: "Block Sets" },
                        { id: "blind", label: "Blind Boxes" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={`admin__seg-btn ${filter === t.id ? "admin__seg-btn--active" : ""}`}
                          onClick={() => setFilter(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <select
                      className="admin__select"
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      aria-label="Filter by stock level"
                    >
                      <option value="all">Stock: All Levels</option>
                      <option value="in">In Stock (&gt; 0)</option>
                      <option value="low">Low Stock (1–5)</option>
                      <option value="out">Out of Stock (0)</option>
                    </select>
                  </div>

                  <span className="admin__result-count">
                    Showing <strong>{filtered.length}</strong> of {products.length} products
                  </span>
                </div>

                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th style={{ width: "52px" }}>#</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Inventory</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="admin__empty-row">
                            <div className="admin__empty-state">
                              <Icon name="package" size={28} />
                              <strong>No matching products found</strong>
                              <span>Try adjusting your search query or category filter.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((p, i) => {
                          const stockNum = Number(p.stock ?? 0);
                          const isOut = stockNum <= 0;
                          const isLow = stockNum > 0 && stockNum <= 5;
                          return (
                            <tr key={p.id}>
                              <td className="admin__idx">{String(i + 1).padStart(2, "0")}</td>
                              <td>
                                <div className="admin__product-cell">
                                  <img
                                    className="admin__thumb"
                                    src={p.img}
                                    alt=""
                                    onError={(e) => {
                                      e.currentTarget.style.opacity = 0.25;
                                    }}
                                  />
                                  <div className="admin__product-meta">
                                    <span className="admin__name">{p.name}</span>
                                    <span className="admin__desc-sub">
                                      {p.description || "No description provided"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`admin__type admin__type--${p.type}`}>
                                  <Icon name={p.type === "block" ? "brick" : "gift"} size={12} />
                                  {p.type === "block" ? "Block Set" : "Blind Box"}
                                </span>
                              </td>
                              <td>
                                <span className="admin__price-tag">
                                  ${Number(p.price).toFixed(2)}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`admin__stock admin__stock--${
                                    isOut ? "out" : isLow ? "low" : "in"
                                  }`}
                                >
                                  <span className="admin__stock-dot" />
                                  {isOut
                                    ? "Out of stock"
                                    : isLow
                                    ? `Low · ${stockNum} left`
                                    : `${stockNum} in stock`}
                                </span>
                              </td>
                              <td className="admin__actions-cell">
                                <button
                                  type="button"
                                  className="admin__edit-btn"
                                  onClick={() => openEdit(p)}
                                >
                                  <Icon name="pencil" size={13} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className="admin__del-btn"
                                  onClick={() => handleDelete(p.id, p.name)}
                                >
                                  <Icon name="trash" size={13} /> Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "users" && <UsersPanel />}
          {activeTab === "orders" && <OrdersPanel />}
        </main>
      </div>

      {/* ---- Add / Edit Product Modal ---- */}
      {modalOpen && (
        <div
          className="admin__modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <form className="admin__modal" onSubmit={handleSave}>
            <div className="admin__modal-header">
              <h3 className="admin__modal-title">
                {editId ? (
                  <>
                    <Icon name="pencil" size={18} /> Edit Product
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={18} /> Add New Product
                  </>
                )}
              </h3>
              <button
                type="button"
                className="admin__modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="admin__form-group">
              <label>Product Name</label>
              <input
                placeholder="e.g. Astronaut Galaxy Block Set"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="admin__form-group">
              <label>Description</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe piece count, series details, or dimensions..."
              />
            </div>

            <div className="admin__modal-row">
              <div className="admin__form-group">
                <label>Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="admin__form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="admin__form-group">
                <label>Category</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="block">Block Set</option>
                  <option value="blind">Blind Box</option>
                </select>
              </div>
            </div>

            <div className="admin__form-group">
              <label>Product Image</label>
              <div className="admin__upload-box">
                {form.img ? (
                  <img
                    className="admin__upload-preview"
                    src={form.img}
                    alt="Preview"
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                ) : (
                  <div className="admin__upload-placeholder">
                    <Icon name="package" size={26} />
                    <span>No image</span>
                  </div>
                )}

                <div className="admin__upload-controls">
                  <label className="admin__upload-btn">
                    {uploading ? (
                      "Uploading image..."
                    ) : (
                      <>
                        <Icon name="upload" size={15} /> Upload from device
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  <input
                    className="admin__upload-url"
                    value={form.img}
                    onChange={(e) => setForm({ ...form, img: e.target.value })}
                    placeholder="Or paste image URL (https://...)"
                  />
                </div>
              </div>
            </div>

            {modalError && <p className="admin__modal-error">{modalError}</p>}

            <div className="admin__modal-btns">
              <button type="button" className="admin__modal-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="admin__modal-save" disabled={uploading}>
                <Icon name="save" size={16} /> {editId ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="admin__toast">
          <Icon name="checkCircle" size={16} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, tone, label, value, sub }) {
  return (
    <div className="admin__stat-card">
      <div className="admin__stat-top">
        <span className="admin__stat-label">{label}</span>
        <div className={`admin__stat-icon admin__stat-icon--${tone}`}>
          <Icon name={icon} size={20} />
        </div>
      </div>
      <div className="admin__stat-value">{value}</div>
      {sub && <div className="admin__stat-sub">{sub}</div>}
    </div>
  );
}
