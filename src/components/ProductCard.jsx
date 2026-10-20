import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import "./ProductCard.css";

export default function ProductCard({ product, onAdd, onBuy }) {
  const stock = Number(product.stock ?? 0);
  const out = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;
  const detailTo = `/product/${product.id}`;
  const [justAdded, setJustAdded] = useState(false);

  function handleAddClick() {
    if (out) return;
    onAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <article className={`product-card${out ? " product-card--out" : ""}`}>
      <div className="product-card__studs" aria-hidden="true">
        <span /><span /><span />
      </div>

      <Link to={detailTo} className="product-card__link" aria-label={`View ${product.name} details`}>
        <div className="product-card__image">
          <span className={`product-card__badge product-card__badge--${product.type}`}>
            <Icon name={product.type === "blind" ? "gift" : "brick"} size={12} />
            {product.type === "blind" ? "Blind Box" : "Block Set"}
          </span>

          {lowStock && !out && (
            <span className="product-card__stock-pill">Only {stock} left</span>
          )}

          {product.img ? (
            <img
              src={product.img}
              alt={product.name}
              loading="lazy"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />
          ) : (
            <div className="product-card__placeholder">
              <Icon name="brick" size={44} />
            </div>
          )}

          {out && (
            <div className="product-card__soldout">
              <span>Sold Out</span>
            </div>
          )}
        </div>

        <div className="product-card__body">
          <h4 className="product-card__name">{product.name}</h4>
          {product.description ? (
            <p className="product-card__desc">{product.description}</p>
          ) : (
            <p className="product-card__desc product-card__desc--muted">
              {product.type === "blind"
                ? "Collectible mystery blind box edition"
                : "Authentic building block collector set"}
            </p>
          )}

          <div className="product-card__meta">
            <span className="product-card__price">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className={`product-card__avail${out ? " product-card__avail--out" : ""}`}>
              <span className="product-card__avail-dot" />
              {out ? "Out of stock" : `${stock} in stock`}
            </span>
          </div>
        </div>
      </Link>

      <div className="product-card__actions">
        <button
          type="button"
          className={`product-card__btn product-card__btn--ghost${justAdded ? " product-card__btn--added" : ""}`}
          onClick={handleAddClick}
          disabled={out}
        >
          {justAdded ? (
            <>
              <Icon name="check" size={14} /> Added
            </>
          ) : (
            <>
              <Icon name="cart" size={14} /> Add
            </>
          )}
        </button>
        <button
          type="button"
          className="product-card__btn product-card__btn--solid"
          onClick={() => onBuy(product)}
          disabled={out}
        >
          Buy Now
        </button>
      </div>
    </article>
  );
}
