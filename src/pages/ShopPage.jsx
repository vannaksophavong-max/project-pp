import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Icon from "../components/Icon.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import "./ShopPage.css";

export default function ShopPage() {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filter, setFilter] = useState("all"); // "all" | "block" | "blind"

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => !q || (p.name || "").toLowerCase().includes(q));
  }, [products, query]);

  const blocks = matches.filter((p) => p.type === "block");
  const blinds = matches.filter((p) => p.type === "blind");

  function handleAdd(product) {
    addToCart(product);
  }

  function handleBuy(product) {
    addToCart(product);
    navigate("/checkout");
  }

  return (
    <div className="shop">
      <Navbar />

      <main className="shop__main">
        <section className="hero">
          <div className="hero__text">
            <span className="hero__eyebrow">Building sets · Blind boxes</span>
            <h1 className="hero__title">Stack something wonderful.</h1>
            <p className="hero__subtitle">
              Hand-picked block sets and mystery blind boxes — every pack ships from our shop
              floor to your shelf.
            </p>
            <a href="#menu" className="hero__cta">Browse the shelf ↓</a>
          </div>
          <div className="hero__art" aria-hidden="true">
            <svg viewBox="0 0 320 220" className="hero__svg">
              <rect x="40" y="130" width="70" height="60" rx="10" fill="var(--brick-red)" />
              <circle cx="60" cy="122" r="8" fill="var(--brick-red)" />
              <circle cx="90" cy="122" r="8" fill="var(--brick-red)" />
              <rect x="120" y="90" width="80" height="100" rx="10" fill="var(--brick-blue)" />
              <circle cx="140" cy="82" r="8" fill="var(--brick-blue)" />
              <circle cx="170" cy="82" r="8" fill="var(--brick-blue)" />
              <circle cx="200" cy="82" r="8" fill="var(--brick-blue)" />
              <rect x="210" y="60" width="70" height="130" rx="10" fill="var(--brick-yellow)" />
              <circle cx="230" cy="52" r="8" fill="var(--brick-yellow)" />
              <circle cx="260" cy="52" r="8" fill="var(--brick-yellow)" />
              <rect x="30" y="192" width="260" height="10" rx="5" fill="var(--ink)" opacity="0.08" />
            </svg>
          </div>
        </section>

        <h2 className="shop__section-title">Our products</h2>

        {loading && <p style={{ padding: "0 1rem" }}>Loading products…</p>}
        {error && !loading && (
          <p style={{ padding: "0 1rem", color: "crimson" }}>{error}</p>
        )}

        <div className="shop__toolbar">
          <div className="shop__search-wrap">
            <Icon name="search" size={17} className="shop__search-icon" />
            <input
              className="shop__search"
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <div className="shop__filters">
            {(["all", "block", "blind"]).map((f) => (
              <button
                key={f}
                type="button"
                className={`shop__filter ${filter === f ? "shop__filter--active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? (
                  "All"
                ) : (
                  <>
                    <Icon name={f === "block" ? "brick" : "gift"} size={14} />
                    {f === "block" ? "Block" : "Blind Box"}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && matches.length === 0 && (
          <p className="shop__empty">No products match "{query}".</p>
        )}

        {(filter === "all" || filter === "block") && (
          <section className="shop__row">
            <div className="shop__row-head">
              <h3 className="shop__label" id="menu">Block Paradise</h3>
              <span className="shop__count">{blocks.length} set{blocks.length === 1 ? "" : "s"}</span>
            </div>
            <ProductGrid items={blocks} onAdd={handleAdd} onBuy={handleBuy} empty="No block sets yet — check back soon." />
          </section>
        )}

        {(filter === "all" || filter === "blind") && (
          <section className="shop__row">
            <div className="shop__row-head">
              <h3 className="shop__label">Blind Box</h3>
              <span className="shop__count">{blinds.length} box{blinds.length === 1 ? "" : "es"}</span>
            </div>
            <ProductGrid items={blinds} onAdd={handleAdd} onBuy={handleBuy} empty="No blind boxes yet — check back soon." />
          </section>
        )}
      </main>
    </div>
  );
}

function ProductGrid({ items, onAdd, onBuy, empty }) {
  if (!items.length) {
    return <p className="shop__empty">{empty}</p>;
  }

  return (
    <div className="shop__grid">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd} onBuy={onBuy} />
      ))}
    </div>
  );
}
