import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Icon from "../components/Icon.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);

  const product = products.find((p) => String(p.id) === String(id));
  const stock = product ? Number(product.stock ?? 0) : 0;
  const out = stock <= 0;

  const related = product
    ? products
        .filter((p) => String(p.id) !== String(product.id))
        .sort((a, b) => (a.type === product.type ? -1 : 1) - (b.type === product.type ? -1 : 1))
        .slice(0, 4)
    : [];

  if (loading) {
    return (
      <div className="product-detail">
        <Navbar />
        <main className="product-detail__main">
          <div className="product-detail__skeleton" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <Navbar />
        <main className="product-detail__main">
          <div className="product-detail__card product-detail__card--empty">
            <div className="product-detail__empty-icon">
              <Icon name="package" size={40} />
            </div>
            <h1 className="product-detail__empty-title">Product not found</h1>
            <p className="product-detail__empty-sub">
              This item may have been sold out or removed from our catalog.
            </p>
            <Link to="/" className="product-detail__btn product-detail__btn--inline">
              <Icon name="arrowLeft" size={16} /> Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  function handleAdd() {
    if (out) return;
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  function handleBuy() {
    if (out) return;
    addToCart(product);
    navigate("/checkout");
  }

  function handleRelatedBuy(item) {
    addToCart(item);
    navigate("/checkout");
  }

  return (
    <div className="product-detail">
      <Navbar />

      <main className="product-detail__main">
        <nav className="product-detail__crumbs" aria-label="Breadcrumb">
          <Link to="/" className="product-detail__crumb-back">
            <Icon name="arrowLeft" size={15} /> Back to shop
          </Link>
          <span className="product-detail__crumb-sep">/</span>
          <Link to={`/?type=${product.type}`} className="product-detail__crumb-link">
            {product.type === "blind" ? "Mystery Blind Boxes" : "Block Paradise Sets"}
          </Link>
          <span className="product-detail__crumb-sep">/</span>
          <span className="product-detail__crumb-current">{product.name}</span>
        </nav>

        <div className="product-detail__card">
          <div className="product-detail__image-wrap">
            <div className="product-detail__image">
              {product.img ? (
                <img
                  src={product.img}
                  alt={product.name}
                  onError={(e) => (e.currentTarget.style.opacity = 0)}
                />
              ) : (
                <div className="product-detail__placeholder">
                  <Icon name="brick" size={76} />
                </div>
              )}
              {out && <span className="product-detail__soldout">Out of stock</span>}
            </div>
          </div>

          <div className="product-detail__info">
            <div className="product-detail__badges">
              <span className={`product-detail__type product-detail__type--${product.type}`}>
                <Icon name={product.type === "blind" ? "gift" : "brick"} size={13} />
                {product.type === "blind" ? "Blind Box" : "Block Paradise"}
              </span>
              <span className={`product-detail__stock ${out ? "product-detail__stock--out" : ""}`}>
                <span className="product-detail__stock-dot" />
                {out ? "Out of stock" : `${stock} left in stock`}
              </span>
            </div>

            <h1 className="product-detail__name">{product.name}</h1>

            <div className="product-detail__price-box">
              <span className="product-detail__price">${Number(product.price).toFixed(2)}</span>
              <span className="product-detail__price-note">Includes local taxes · Ready to ship</span>
            </div>

            <div className="product-detail__desc-wrap">
              <h2 className="product-detail__desc-title">Product Overview</h2>
              <p className="product-detail__desc">
                {product.description || "Authentic collector edition packed carefully at our store and ready for display or gifting."}
              </p>
            </div>

            <div className="product-detail__perks">
              <div className="product-detail__perk">
                <span className="product-detail__perk-icon">
                  <Icon name="truck" size={16} />
                </span>
                <div>
                  <strong>Fast Local Delivery</strong>
                  <span>Dispatched directly from our Phnom Penh store</span>
                </div>
              </div>
              <div className="product-detail__perk">
                <span className="product-detail__perk-icon">
                  <Icon name="creditCard" size={16} />
                </span>
                <div>
                  <strong>Flexible Payment</strong>
                  <span>Pay with Bakong KHQR or Cash on Delivery</span>
                </div>
              </div>
            </div>

            <div className="product-detail__actions">
              <button
                type="button"
                className={`product-detail__btn product-detail__btn--ghost${justAdded ? " product-detail__btn--added" : ""}`}
                onClick={handleAdd}
                disabled={out}
              >
                {justAdded ? (
                  <>
                    <Icon name="check" size={17} /> Added to cart
                  </>
                ) : (
                  <>
                    <Icon name="cart" size={17} /> Add to cart
                  </>
                )}
              </button>
              <button
                type="button"
                className="product-detail__btn"
                onClick={handleBuy}
                disabled={out}
              >
                Buy now <Icon name="arrowRight" size={17} />
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="product-detail__related">
            <div className="product-detail__related-head">
              <h2>You might also like</h2>
              <Link to="/" className="product-detail__related-more">
                View all products →
              </Link>
            </div>
            <div className="product-detail__related-grid">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onAdd={addToCart}
                  onBuy={handleRelatedBuy}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
