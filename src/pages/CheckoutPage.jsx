import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // NOTE: the backend currently has no public "create order/payment" endpoint —
  // POST /api/v1/admin/payments exists but requires an admin JWT, so regular
  // customers can't record a payment yet. This confirms the order locally
  // (same as before) until a public checkout endpoint is added server-side.
  function handlePay(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      setError("Please fill in all your details.");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setError("");
    setSuccess({ ...form, total });
    clearCart();
  }

  if (success) {
    return (
      <div className="checkout">
        <div className="checkout__card checkout__success">
          <div className="checkout__success-icon">✅</div>
          <h2>Payment received</h2>
          <p>Thanks, {success.name} — we'll deliver to {success.address}.</p>
          <p className="checkout__success-total">Total paid: ${Number(success.total).toFixed(2)}</p>
          <Link to="/" className="checkout__btn">Back to shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout__card">
        <Link to="/" className="checkout__back">← Continue shopping</Link>
        <h2 className="checkout__title">Your cart</h2>

        {cart.length === 0 ? (
          <p className="checkout__empty">Your cart is empty. Go pick out a block set or blind box!</p>
        ) : (
          <ul className="checkout__list">
            {cart.map((item) => (
              <li className="checkout__item" key={item.productId}>
                <span className="checkout__item-name">
                  {item.name}
                  {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                </span>
                <span className="checkout__item-price">
                  ${Number(item.price * item.quantity).toFixed(2)}
                </span>
                <button className="checkout__item-remove" onClick={() => removeFromCart(item)} aria-label={`Remove ${item.name}`}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="checkout__total">
          Total <span>${total.toFixed(2)}</span>
        </div>

        <form className="checkout__form" onSubmit={handlePay}>
          <input
            className="checkout__input"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="checkout__input"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="checkout__input"
            placeholder="Address / location"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div className="checkout__qr">
            <p>Scan QR to pay</p>
            <img src="/images/qr.jpg" alt="Payment QR code" />
          </div>

          {error && <p className="checkout__error">{error}</p>}

          <button className="checkout__btn" type="submit">Confirm payment</button>
        </form>
      </div>
    </div>
  );
}
