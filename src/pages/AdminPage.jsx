import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { adminUploadImage } from "../api.js";
import UsersPanel from "../components/UsersPanel.jsx";
import OrdersPanel from "../components/OrdersPanel.jsx";
import Icon from "../components/Icon.jsx";
import "./AdminPage.css";

export default function AdminPage() {
  const { isLoggedIn, isAdmin, username, login, logout } = useAuth();

  if (!isLoggedIn) {
    return <AdminLogin login={login} />;
  }

  if (!isAdmin) {
    return (
      <div className="admin-login">
        <div className="admin-login__box">
          <div className="admin-login__icon admin-login__icon--ban"><Icon name="ban" size={34} /></div>
          <h1 className="admin-login__title">Not authorized</h1>
          <p className="admin-login__sub">This account doesn't have admin access.</p>
          <button className="admin-login__hint" onClick={logout}>Log out</button>
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
        <div className="admin-login__icon admin-login__icon--brick"><Icon name="brick" size={34} /></div>
        <h1 className="admin-login__title">Admin login</h1>
        <p className="admin-login__sub">Block Paradise — Admin Panel</p>

        <label className="admin-login__field">
          <span>Email</span>
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

        <button className="admin-login__btn" type="submit">
          Log in →
        </button>
        {error && <p className="admin-login__error">{error}</p>}
        <button type="button" className="admin-login__hint" onClick={() => navigate("/")}>
          ← Back to shop
        </button>
      </form>
    </div>
  );
}

const emptyForm = { name: "", price: "", img: "", type: "block", stock: "" };

function AdminDashboard({ username, logout }) {
  const { products, addOrUpdateProduct, removeProduct } = useProducts();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("products");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [modalError, setModalError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products
      .filter((p) => filter === "all" || p.type === filter)
      .filter((p) => p.name?.toLowerCase().includes(q));
  }, [products, search, filter]);

  const stats = {
    total: products.length,
    block: products.filter((p) => p.type === "block").length,
    blind: products.filter((p) => p.type === "blind").length,
  };

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setModalError("");
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditId(p.id);
    setForm({ name: p.name, price: p.price, img: p.img, type: p.type, stock: p.stock });
    setModalError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.img) {
      setModalError("Please fill in all fields.");
      return;
    }
    const stockNum = parseInt(form.stock, 10);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setModalError("Stock must be a number, 0 or more.");
      return;
    }
    const result = await addOrUpdateProduct(editId, { ...form, stock: stockNum });
    if (!result.ok) {
      setModalError(result.message);
      return;
    }
    showToast(editId ? "Product updated" : "Product added");
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

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    const result = await removeProduct(id);
    showToast(result.ok ? "Product deleted" : result.message);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="admin">
      <div className="admin__topbar">
        <div className="admin__topbar-left">
          <span className="admin__brand">Block<b>Paradise</b></span>
          <span className="admin__badge">ADMIN</span>
        </div>
        <div className="admin__topbar-right">
          <span className="admin__who">
            <Icon name="user" size={15} /> {username}
          </span>
          <Link to="/" className="admin__ghost-btn">
            <Icon name="globe" size={15} /> View site
          </Link>
          <button className="admin__ghost-btn admin__ghost-btn--danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin__main">
        <nav className="admin__tabs">
          <button
            type="button"
            className={`admin__tab ${activeTab === "products" ? "admin__tab--active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Icon name="package" size={16} /> Products
          </button>
          <button
            type="button"
            className={`admin__tab ${activeTab === "users" ? "admin__tab--active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Icon name="users" size={16} /> Users
          </button>
          <button
            type="button"
            className={`admin__tab ${activeTab === "orders" ? "admin__tab--active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <Icon name="clipboard" size={16} /> Orders
          </button>
        </nav>

        {activeTab === "products" && (
          <>
            <div className="admin__stats">
              <StatCard icon="package" tone="red" label="Products total" value={stats.total} />
              <StatCard icon="brick" tone="green" label="Block Paradise" value={stats.block} />
              <StatCard icon="gift" tone="blue" label="Blind box" value={stats.blind} />
              <StatCard icon="user" tone="yellow" label="Logged in as" value={username} small />
            </div>

            <div className="admin__toolbar">
              <div className="admin__toolbar-left">
                <h2 className="admin__section-label">Product list</h2>
                <div className="admin__search-wrap">
                  <Icon name="search" size={15} className="admin__search-icon" />
                  <input
                    className="admin__search"
                    placeholder="Search product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select className="admin__filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All types</option>
                  <option value="block">Block</option>
                  <option value="blind">Blind Box</option>
                </select>
              </div>
              <button className="admin__add-btn" onClick={openAdd}>+ Add product</button>
            </div>

            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="admin__empty-row">
                      <Icon name="package" size={22} /> No products found
                    </td></tr>
                  ) : (
                    filtered.map((p, i) => (
                      <tr key={p.id}>
                        <td className="admin__idx">{i + 1}</td>
                        <td>
                          <img
                            className="admin__thumb"
                            src={p.img}
                            alt=""
                            onError={(e) => { e.currentTarget.style.background = "var(--surface-muted)"; e.currentTarget.style.opacity = 0.3; }}
                          />
                        </td>
                        <td className="admin__name">{p.name}</td>
                        <td><span className="admin__price-tag">${p.price}</span></td>
                        <td>
                          <span className={`admin__stock admin__stock--${p.stock > 0 ? "in" : "out"}`}>
                            {p.stock > 0 ? p.stock + " left" : "Out of stock"}
                          </span>
                        </td>
                        <td>
                          <span className={`admin__type admin__type--${p.type}`}>
                            {p.type === "block" ? "Block" : "Blind Box"}
                          </span>
                        </td>
                        <td>
                          <button className="admin__edit-btn" onClick={() => openEdit(p)}>Edit</button>
                          <button className="admin__del-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "users" && <UsersPanel />}
        {activeTab === "orders" && <OrdersPanel />}
      </div>

      {modalOpen && (
        <div className="admin__modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <form className="admin__modal" onSubmit={handleSave}>
            <h3 className="admin__modal-title">
              {editId ? (
                <>
                  <Icon name="pencil" size={17} /> Edit product
                </>
              ) : (
                "+ Add product"
              )}
            </h3>

            <div className="admin__form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="admin__modal-row">
              <div className="admin__form-group">
                <label>Price</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="admin__form-group">
                <label>Stock</label>
                <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              </div>
              <div className="admin__form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="block">Block</option>
                  <option value="blind">Blind Box</option>
                </select>
              </div>
            </div>
            <div className="admin__form-group">
              <label>Image</label>
              <div className="admin__upload-row">
                <label className="admin__upload-btn">
                  {uploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Icon name="upload" size={15} /> Upload image
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
                  placeholder="https://... (or upload above)"
                />
              </div>
              {form.img && (
                <img
                  className="admin__upload-preview"
                  src={form.img}
                  alt="Preview"
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                />
              )}
            </div>

            {modalError && <p className="admin__modal-error">{modalError}</p>}

            <div className="admin__modal-btns">
              <button type="button" className="admin__modal-cancel" onClick={closeModal}>Cancel</button>
              <button type="submit" className="admin__modal-save">
                <Icon name="save" size={16} /> Save
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="admin__toast">{toast}</div>}
    </div>
  );
}

function StatCard({ icon, tone, label, value, small }) {
  return (
    <div className="admin__stat-card">
      <div className={`admin__stat-icon admin__stat-icon--${tone}`}>
        <Icon name={icon} size={24} />
      </div>
      <div className="admin__stat-label">{label}</div>
      <div className={`admin__stat-value ${small ? "admin__stat-value--small" : ""}`}>{value}</div>
    </div>
  );
}
