import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { createOrder } from "../api.js";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [qrPaid, setQrPaid] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  async function handlePay(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      setError("Please fill in all your details.");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (paymentMethod === "qr" && !qrPaid) {
      setError("Please confirm you have paid via Bakong before placing your order.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const data = await createOrder({
        customer_name: form.name,
        phone: form.phone,
        address: form.address,
        payment_method: paymentMethod,
      });
      await clearCart();
      setSuccess({ ...form, total, reference: data.order?.reference, paymentMethod });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="checkout">
        <div className="checkout__card checkout__success">
          <div className="checkout__success-icon">✅</div>
          <h2>Order placed!</h2>
          <p>Thanks, {success.name} — we'll deliver to {success.address}.</p>
          {success.reference && (
            <p className="checkout__success-ref">
              Order number: <strong>{success.reference}</strong>
            </p>
          )}
          {success.paymentMethod === "qr" ? (
            <p className="checkout__success-total">Paid via Bakong: ${Number(success.total).toFixed(2)}</p>
          ) : (
            <p className="checkout__success-total">Total to pay on delivery: ${Number(success.total).toFixed(2)}</p>
          )}
          <div className="checkout__success-actions">
            <Link to="/orders" className="checkout__btn">View my orders</Link>
            <Link to="/" className="checkout__btn checkout__btn--ghost">Back to shop</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="checkout">
        <div className="checkout__card">
          <Link to="/" className="checkout__back">← Continue shopping</Link>
          <h2 className="checkout__title">Log in to checkout</h2>
          <p className="checkout__empty">
            Please log in so your order can be saved to your account.
          </p>
          <button className="checkout__btn" type="button" onClick={() => navigate("/login")}>
            Log in / Create account
          </button>
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

          <fieldset className="checkout__methods">
            <legend>Payment method</legend>
            <label className="checkout__method">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay in cash when you receive your order.</small>
              </span>
            </label>
            <label className="checkout__method">
              <input
                type="radio"
                name="paymentMethod"
                value="qr"
                checked={paymentMethod === "qr"}
                onChange={() => setPaymentMethod("qr")}
              />
              <span>
                <strong>Bakong QR</strong>
                <small>Scan with the Bakong app and pay now.</small>
              </span>
            </label>
          </fieldset>

          {paymentMethod === "qr" && (
            <div className="checkout__qr">
              <p>Scan this QR with your Bakong app and pay ${total.toFixed(2)}</p>
              <img src="/images/qr.jpg" alt="Bakong payment QR code" />
              <p className="checkout__qr-note">
                After paying, please check the box below to confirm.
              </p>
              <label className="checkout__qr-confirm">
                <input
                  type="checkbox"
                  checked={qrPaid}
                  onChange={(e) => setQrPaid(e.target.checked)}
                />
                <span>I have paid via Bakong (you'll verify transfers manually by order number).</span>
              </label>
            </div>
          )}

          {error && <p className="checkout__error">{error}</p>}

          <button className="checkout__btn" type="submit" disabled={submitting}>
            {submitting ? "Placing order..." : paymentMethod === "qr" ? "Confirm payment & place order" : "Place order"}
          </button>
        </form>
      </div>
    </div>
  );
}
