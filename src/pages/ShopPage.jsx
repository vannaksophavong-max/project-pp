import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
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
  const [filter, setFilter] = useState(() => {
    const t = searchParams.get("type");
    return t === "block" || t === "blind" ? t : "all";
  });
  const [sort, setSort] = useState("featured");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [toastProduct, setToastProduct] = useState(null);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    const t = searchParams.get("type");
    if (t === "block" || t === "blind") {
      setFilter(t);
    } else if (!t) {
      setFilter("all");
    }
  }, [searchParams]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = priceMin === "" ? -Infinity : Number(priceMin);
    const max = priceMax === "" ? Infinity : Number(priceMax);
    const filtered = products.filter((p) => {
      if (q && !(p.name || "").toLowerCase().includes(q) && !(p.description || "").toLowerCase().includes(q)) {
        return false;
      }
      const price = Number(p.price) || 0;
      return price >= min && price <= max;
    });
    return sortProducts(filtered, sort);
  }, [products, query, priceMin, priceMax, sort]);

  const hasPriceFilter = priceMin !== "" || priceMax !== "";
  const hasAnyFilter = query.trim() !== "" || filter !== "all" || hasPriceFilter || sort !== "featured";

  function clearPrice() {
    setPriceMin("");
    setPriceMax("");
  }

  function resetAllFilters() {
    setQuery("");
    setFilter("all");
    setSort("featured");
    setPriceMin("");
    setPriceMax("");
  }

  const blocks = matches.filter((p) => p.type === "block");
  const blinds = matches.filter((p) => p.type === "blind");

  function handleAdd(product) {
    addToCart(product);
    setToastProduct(product);
  }

  useEffect(() => {
    if (!toastProduct) return;
    const t = setTimeout(() => setToastProduct(null), 3200);
    return () => clearTimeout(t);
  }, [toastProduct]);

  function handleBuy(product) {
    addToCart(product);
    navigate("/checkout");
  }

  return (
    <div className="shop">
      <Navbar />

      <main className="shop__main">
        {/* ---- Hero Banner ---- */}
        <section className="hero">
          <div className="hero__text">
            <span className="hero__eyebrow">
              <Icon name="sparkles" size={13} /> Building sets · Mystery blind boxes
            </span>
            <h1 className="hero__title">
              Stack something <span className="hero__title-accent">wonderful.</span>
            </h1>
            <p className="hero__subtitle">
              Hand-picked building block sets and collectible mystery blind boxes — every pack ships straight from our shop floor to your display shelf.
            </p>

            <div className="hero__actions">
              <a href="#menu" className="hero__cta">
                Browse the Shelf <Icon name="arrowRight" size={16} />
              </a>
              <button
                type="button"
                className="hero__cta-secondary"
                onClick={() => {
                  setFilter("blind");
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Icon name="gift" size={16} /> Explore Blind Boxes
              </button>
            </div>

            <div className="hero__highlights">
              <div className="hero__highlight">
                <span className="hero__highlight-dot hero__highlight-dot--green" />
                <span>Authentic Collector Sets</span>
              </div>
              <div className="hero__highlight">
                <span className="hero__highlight-dot hero__highlight-dot--blue" />
                <span>Bakong QR & Cash on Delivery</span>
              </div>
              <div className="hero__highlight">
                <span className="hero__highlight-dot hero__highlight-dot--yellow" />
                <span>Fast Local Dispatch</span>
              </div>
            </div>
          </div>

          <div className="hero__art" aria-hidden="true">
            <div className="hero__art-glow" />
            <svg viewBox="0 0 360 250" className="hero__svg">
              <defs>
                <linearGradient id="brickRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF6E73" />
                  <stop offset="100%" stopColor="#E44348" />
                </linearGradient>
                <linearGradient id="brickBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5C74FF" />
                  <stop offset="100%" stopColor="#2C42D6" />
                </linearGradient>
                <linearGradient id="brickYellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFD65A" />
                  <stop offset="100%" stopColor="#E8AE1A" />
                </linearGradient>
                <linearGradient id="brickGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22C37E" />
                  <stop offset="100%" stopColor="#128A54" />
                </linearGradient>
              </defs>

              {/* Base shadow */}
              <ellipse cx="180" cy="222" rx="145" ry="12" fill="var(--ink)" opacity="0.08" />

              {/* Left Red Brick */}
              <g transform="translate(0, 4)">
                <rect x="44" y="130" width="24" height="14" rx="5" fill="#E44348" />
                <rect x="76" y="130" width="24" height="14" rx="5" fill="#E44348" />
                <rect x="34" y="140" width="80" height="72" rx="14" fill="url(#brickRedGrad)" />
                <rect x="44" y="150" width="60" height="10" rx="5" fill="#FFFFFF" opacity="0.22" />
              </g>

              {/* Center Blue Tower Brick */}
              <g>
                <rect x="132" y="82" width="22" height="14" rx="5" fill="#2C42D6" />
                <rect x="163" y="82" width="22" height="14" rx="5" fill="#2C42D6" />
                <rect x="194" y="82" width="22" height="14" rx="5" fill="#2C42D6" />
                <rect x="122" y="92" width="104" height="124" rx="16" fill="url(#brickBlueGrad)" />
                <rect x="134" y="104" width="80" height="10" rx="5" fill="#FFFFFF" opacity="0.2" />
                <circle cx="174" cy="162" r="24" fill="#FFFFFF" opacity="0.14" />
                <text x="174" y="170" textAnchor="middle" fill="#FFFFFF" fontFamily="var(--font-display)" fontWeight="800" fontSize="26">?</text>
              </g>

              {/* Right Yellow Tall Brick */}
              <g>
                <rect x="246" y="50" width="24" height="14" rx="5" fill="#E8AE1A" />
                <rect x="278" y="50" width="24" height="14" rx="5" fill="#E8AE1A" />
                <rect x="234" y="60" width="80" height="156" rx="16" fill="url(#brickYellowGrad)" />
                <rect x="246" y="72" width="56" height="10" rx="5" fill="#FFFFFF" opacity="0.35" />
              </g>

              {/* Top Green Accent Mini Brick */}
              <g>
                <rect x="74" y="82" width="16" height="10" rx="4" fill="#128A54" />
                <rect x="96" y="82" width="16" height="10" rx="4" fill="#128A54" />
                <rect x="66" y="90" width="54" height="38" rx="10" fill="url(#brickGreenGrad)" />
              </g>
            </svg>

            <div className="hero__float-card hero__float-card--top">
              <span className="hero__float-icon hero__float-icon--yellow">
                <Icon name="gift" size={16} />
              </span>
              <div>
                <strong>Mystery Series</strong>
                <span>Unbox rare figures</span>
              </div>
            </div>

            <div className="hero__float-card hero__float-card--bottom">
              <span className="hero__float-icon hero__float-icon--green">
                <Icon name="brick" size={16} />
              </span>
              <div>
                <strong>{products.length > 0 ? `${products.length}+ Items` : "Fresh Drops"}</strong>
                <span>Ready to ship today</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Catalog Header & Unified Filter Bar ---- */}
        <div className="shop__catalog-head" id="catalog">
          <div>
            <span className="shop__eyebrow">Storefront Catalog</span>
            <h2 className="shop__section-title">Explore Our Collection</h2>
          </div>
          <p className="shop__catalog-sub">
            Showing <strong>{matches.length}</strong> {matches.length === 1 ? "product" : "products"} available
          </p>
        </div>

        <div className="shop__control-bar">
          <div className="shop__toolbar">
            <div className="shop__search-wrap">
              <Icon name="search" size={17} className="shop__search-icon" />
              <input
                className="shop__search"
                type="search"
                placeholder="Search sets, blind boxes, keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
              {query && (
                <button
                  type="button"
                  className="shop__search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>

            <div className="shop__filters" role="tablist" aria-label="Product category">
              <button
                type="button"
                className={`shop__filter ${filter === "all" ? "shop__filter--active" : ""}`}
                onClick={() => setFilter("all")}
              >
                <span>All Items</span>
                <span className="shop__filter-badge">{matches.length}</span>
              </button>
              <button
                type="button"
                className={`shop__filter ${filter === "block" ? "shop__filter--active" : ""}`}
                onClick={() => setFilter("block")}
              >
                <Icon name="brick" size={14} />
                <span>Block Sets</span>
                <span className="shop__filter-badge">{blocks.length}</span>
              </button>
              <button
                type="button"
                className={`shop__filter ${filter === "blind" ? "shop__filter--active" : ""}`}
                onClick={() => setFilter("blind")}
              >
                <Icon name="gift" size={14} />
                <span>Blind Boxes</span>
                <span className="shop__filter-badge">{blinds.length}</span>
              </button>
            </div>
          </div>

          <div className="shop__controls">
            <div className="shop__price-wrap">
              <span className="shop__control-label">Price range:</span>
              <label className="shop__price">
                <span className="shop__price-currency">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  aria-label="Minimum price"
                />
              </label>
              <span className="shop__price-sep">to</span>
              <label className="shop__price">
                <span className="shop__price-currency">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  aria-label="Maximum price"
                />
              </label>
              {hasPriceFilter && (
                <button type="button" className="shop__clear-price" onClick={clearPrice}>
                  Clear price
                </button>
              )}
            </div>

            <div className="shop__controls-right">
              {hasAnyFilter && (
                <button type="button" className="shop__reset-btn" onClick={resetAllFilters}>
                  Reset filters
                </button>
              )}
              <select
                className="shop__sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* ---- Error / Loading / Empty States ---- */}
        {error && !loading && (
          <div className="shop__alert-error">
            <Icon name="ban" size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="shop__grid" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-skeleton" />
            ))}
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="shop__empty-card">
            <div className="shop__empty-icon">
              <Icon name="package" size={36} />
            </div>
            <h3>No matching products found</h3>
            <p>Try adjusting your search keywords or clearing your price filter.</p>
            {hasAnyFilter && (
              <button type="button" className="shop__empty-reset" onClick={resetAllFilters}>
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* ---- Product Rows ---- */}
        {!loading && (filter === "all" || filter === "block") && (matches.length > 0 || filter === "block") && (
          <section className="shop__row" id="menu">
            <div className="shop__row-head">
              <div className="shop__row-title-wrap">
                <span className="shop__row-icon shop__row-icon--block">
                  <Icon name="brick" size={18} />
                </span>
                <div>
                  <h3 className="shop__label">Block Paradise Sets</h3>
                  <p className="shop__row-sub">Detailed architectural builds, characters & creative brick sets</p>
                </div>
              </div>
              <span className="shop__count">{blocks.length} set{blocks.length === 1 ? "" : "s"}</span>
            </div>
            <ProductGrid
              items={blocks}
              onAdd={handleAdd}
              onBuy={handleBuy}
              empty="No block sets match your current filters."
            />
          </section>
        )}

        {!loading && (filter === "all" || filter === "blind") && (matches.length > 0 || filter === "blind") && (
          <section className="shop__row">
            <div className="shop__row-head">
              <div className="shop__row-title-wrap">
                <span className="shop__row-icon shop__row-icon--blind">
                  <Icon name="gift" size={18} />
                </span>
                <div>
                  <h3 className="shop__label">Mystery Blind Boxes</h3>
                  <p className="shop__row-sub">Sealed collectible series — every box is a surprise unboxing</p>
                </div>
              </div>
              <span className="shop__count">{blinds.length} box{blinds.length === 1 ? "" : "es"}</span>
            </div>
            <ProductGrid
              items={blinds}
              onAdd={handleAdd}
              onBuy={handleBuy}
              empty="No blind boxes match your current filters."
            />
          </section>
        )}
      </main>

      {toastProduct && (
        <div className="shop__toast" role="status" aria-live="polite">
          <span className="shop__toast-icon">
            <Icon name="check" size={15} />
          </span>
          <span className="shop__toast-text">
            Added <strong>{toastProduct.name}</strong> to cart
          </span>
          <Link to="/checkout" className="shop__toast-link">
            View Cart →
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}

function sortProducts(list, sort) {
  const arr = [...list];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    case "price-desc":
      return arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    case "name":
      return arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    default:
      return arr;
  }
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
