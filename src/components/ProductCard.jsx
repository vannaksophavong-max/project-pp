import "./ProductCard.css";

export default function ProductCard({ product, onAdd, onBuy }) {
  return (
    <article className="product-card">
      <div className="product-card__studs" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="product-card__image">
        {product.img ? (
          <img src={product.img} alt={product.name} onError={(e) => (e.currentTarget.style.opacity = 0)} />
        ) : (
          <div className="product-card__placeholder">🧱</div>
        )}
      </div>
      <h4 className="product-card__name">{product.name}</h4>
      <p className="product-card__price">${Number(product.price).toFixed(2)}</p>
      <div className="product-card__actions">
        <button className="product-card__btn product-card__btn--ghost" onClick={() => onAdd(product)}>
          Add
        </button>
        <button className="product-card__btn product-card__btn--solid" onClick={() => onBuy(product)}>
          Buy
        </button>
      </div>
    </article>
  );
}
