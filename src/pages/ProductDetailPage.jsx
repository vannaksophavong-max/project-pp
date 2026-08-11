import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Icon from "../components/Icon.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === id);
  const out = product ? Number(product.stock ?? 0) <= 0 : false;

  if (loading) {
    return (
      <div className="product-detail">
        <Navbar />
        <main className="product-detail__main">
          <p className="product-detail__note">Loading product…</p>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <Navbar />
        <main className="product-detail__main">
          <div className="product-detail__card product-detail__card--empty">
            <Icon name="package" size={42} className="product-detail__empty-icon" />
            <h1 className="product-detail__empty-title">Product not found</h1>
            <p className="product-detail__empty-sub">This product may have been removed from the shop.</p>
            <Link to="/" className="product-detail__btn">Back to shop</Link>
          </div>
        </main>
      </div>
    );
  }

  function handleAdd() {
    addToCart(product);
  }

  function handleBuy() {
    addToCart(product);
    navigate("/checkout");
  }

  return (
    <div className="product-detail">
      <Navbar />
      <main className="product-detail__main">
        <Link to="/" className="product-detail__back">← Back to shop</Link>

        <div className="product-detail__card">
          <div className="product-detail__image">
            {product.img ? (
              <img src={product.img} alt={product.name} onError={(e) => (e.currentTarget.style.opacity = 0)} />
            ) : (
              <div className="product-detail__placeholder">
                <Icon name="brick" size={72} />
              </div>
            )}
            {out && <span className="product-detail__soldout">Out of stock</span>}
          </div>

          <div className="product-detail__info">
            <span className={`product-detail__type product-detail__type--${product.type}`}>
              {product.type === "blind" ? "Blind Box" : "Block Paradise"}
            </span>
            <h1 className="product-detail__name">{product.name}</h1>
            <p className="product-detail__price">${Number(product.price).toFixed(2)}</p>

            <div className="product-detail__desc-wrap">
              <h2 className="product-detail__desc-title">Description</h2>
              <p className="product-detail__desc">
                {product.description || "No description available for this product yet."}
              </p>
            </div>

            <p className={`product-detail__stock ${out ? "product-detail__stock--out" : ""}`}>
              {out ? "Out of stock" : `${product.stock} left in stock`}
            </p>

            <div className="product-detail__actions">
              <button className="product-detail__btn product-detail__btn--ghost" onClick={handleAdd} disabled={out}>
                Add to cart
              </button>
              <button className="product-detail__btn" onClick={handleBuy} disabled={out}>
                Buy now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
