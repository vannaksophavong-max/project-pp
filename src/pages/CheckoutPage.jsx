import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { createOrder } from "../api.js";
import Icon from "../components/Icon.jsx";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { cart, removeFromCart, total, clearCart, count } = useCart();
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
      setError("Please fill in all your delivery details.");
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
      <div className="checkout-page">
        <Navbar />
        <main className="checkout-page__main checkout-page__main--narrow">
          <div className="checkout__card checkout__success">
            <div className="checkout__success-icon">
              <Icon name="checkCircle" size={42} />
            </div>
            <span className="checkout__eyebrow">Order Confirmed</span>
            <h2>Thank you for your order!</h2>
            <p className="checkout__success-lead">
              Thanks, <strong>{success.name}</strong> — we're preparing your items for delivery to{" "}
              <strong>{success.address}</strong>.
            </p>

            <div className="checkout__receipt">
              {success.reference && (
                <div className="checkout__receipt-row">
                  <span>Order Reference</span>
                  <strong className="checkout__receipt-mono">{success.reference}</strong>
                </div>
              )}
              <div className="checkout__receipt-row">
                <span>Payment Method</span>
                <strong>{success.paymentMethod === "qr" ? "Bakong KHQR" : "Cash on Delivery"}</strong>
              </div>
              <div className="checkout__receipt-row checkout__receipt-row--total">
                <span>{success.paymentMethod === "qr" ? "Paid via Bakong" : "Total Due on Delivery"}</span>
                <strong className="checkout__receipt-price">${Number(success.total).toFixed(2)}</strong>
              </div>
            </div>

            <div className="checkout__success-actions">
              <Link to="/orders" className="checkout__btn">
                <Icon name="clipboard" size={17} /> Track My Orders
              </Link>
              <Link to="/" className="checkout__btn checkout__btn--ghost">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="checkout-page">
        <Navbar />
        <main className="checkout-page__main checkout-page__main--narrow">
          <div className="checkout__card checkout__auth-card">
            <div className="checkout__auth-icon">
              <Icon name="user" size={32} />
            </div>
            <h2 className="checkout__title">Sign in to checkout</h2>
            <p className="checkout__empty">
              Please sign in or create an account so your order and tracking details are saved to your profile.
            </p>
            <div className="checkout__success-actions">
              <button className="checkout__btn" type="button" onClick={() => navigate("/login")}>
                <Icon name="logIn" size={17} /> Log in / Create account
              </button>
              <Link to="/" className="checkout__btn checkout__btn--ghost">
                ← Continue shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />

      <main className="checkout-page__main">
        <div className="checkout__header">
          <div>
            <Link to="/" className="checkout__back">
              <Icon name="arrowLeft" size={15} /> Continue shopping
            </Link>
            <h1 className="checkout__page-title">Checkout</h1>
          </div>
          <span className="checkout__item-count">
            {count} {count === 1 ? "item" : "items"} in cart
          </span>
        </div>

        <div className="checkout__grid">
          {/* ---- Left Column: Cart Items & Summary ---- */}
          <section className="checkout__card checkout__summary-card">
            <div className="checkout__section-head">
              <h2 className="checkout__title">Order Summary</h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  className="checkout__clear-btn"
                  onClick={clearCart}
                >
                  Clear all
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="checkout__empty-box">
                <div className="checkout__empty-icon">
                  <Icon name="cart" size={32} />
                </div>
                <h3>Your cart is empty</h3>
                <p>Go pick out a building block set or mystery blind box!</p>
                <Link to="/" className="checkout__btn checkout__btn--sm">
                  Browse Products
                </Link>
              </div>
            ) : (
              <ul className="checkout__list">
                {cart.map((item) => {
                  const thumb = item.img || item.image_url;
                  const qty = item.quantity || 1;
                  return (
                    <li className="checkout__item" key={item.productId || item.id}>
                      {thumb ? (
                        <img
                          className="checkout__item-thumb"
                          src={thumb}
                          alt=""
                          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                        />
                      ) : (
                        <div className="checkout__item-thumb checkout__item-thumb--placeholder">
                          <Icon name="brick" size={20} />
                        </div>
                      )}
                      <div className="checkout__item-info">
                        <span className="checkout__item-name">{item.name}</span>
                        <span className="checkout__item-sub">
                          ${Number(item.price).toFixed(2)} {qty > 1 ? `× ${qty}` : "each"}
                        </span>
                      </div>
                      <span className="checkout__item-price">
                        ${Number(item.price * qty).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className="checkout__item-remove"
                        onClick={() => removeFromCart(item)}
                        aria-label={`Remove ${item.name}`}
                        title="Remove item"
                      >
                        <Icon name="x" size={15} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="checkout__totals">
              <div className="checkout__totals-row">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="checkout__totals-row">
                <span>Delivery</span>
                <span className="checkout__totals-free">Calculated at dispatch</span>
              </div>
              <div className="checkout__total">
                <span>Total Amount</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* ---- Right Column: Shipping & Payment Form ---- */}
          <section className="checkout__card checkout__form-card">
            <h2 className="checkout__title">Delivery & Payment</h2>

            <form className="checkout__form" onSubmit={handlePay}>
              <label className="checkout__field">
                <span>Recipient Name</span>
                <input
                  className="checkout__input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label className="checkout__field">
                <span>Phone Number</span>
                <input
                  className="checkout__input"
                  placeholder="e.g. 012 345 678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>

              <label className="checkout__field">
                <span>Delivery Address / Location</span>
                <input
                  className="checkout__input"
                  placeholder="Street, Sangkat, Khan, City"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </label>

              <fieldset className="checkout__methods">
                <legend>Select Payment Method</legend>
                <label className={`checkout__method${paymentMethod === "cod" ? " checkout__method--active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div className="checkout__method-body">
                    <div className="checkout__method-top">
                      <strong>Cash on Delivery</strong>
                      <span className="checkout__method-tag checkout__method-tag--cod">COD</span>
                    </div>
                    <small>Pay in cash when your package arrives at your door.</small>
                  </div>
                </label>

                <label className={`checkout__method${paymentMethod === "qr" ? " checkout__method--active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={() => setPaymentMethod("qr")}
                  />
                  <div className="checkout__method-body">
                    <div className="checkout__method-top">
                      <strong>Bakong QR</strong>
                      <span className="checkout__method-tag checkout__method-tag--qr">Instant KHQR</span>
                    </div>
                    <small>Scan with any Bakong-supported banking app and pay now.</small>
                  </div>
                </label>
              </fieldset>

              {paymentMethod === "qr" && (
                <div className="checkout__qr">
                  <div className="checkout__qr-head">
                    <strong>Scan with Bakong App</strong>
                    <span>Amount to transfer: <b>${total.toFixed(2)}</b></span>
                  </div>
                  <div className="checkout__qr-frame">
                    <img src="/images/qr.jpg" alt="Bakong payment QR code" />
                  </div>
                  <label className="checkout__qr-confirm">
                    <input
                      type="checkbox"
                      checked={qrPaid}
                      onChange={(e) => setQrPaid(e.target.checked)}
                    />
                    <span>
                      I have completed the Bakong transfer for <strong>${total.toFixed(2)}</strong>.
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <p className="checkout__error">
                  <Icon name="ban" size={16} /> {error}
                </p>
              )}

              <button
                className="checkout__btn checkout__btn--submit"
                type="submit"
                disabled={submitting || cart.length === 0}
              >
                {submitting
                  ? "Placing order..."
                  : paymentMethod === "qr"
                  ? `Confirm Payment & Place Order ($${total.toFixed(2)})`
                  : `Place Order · $${total.toFixed(2)}`}
              </button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
