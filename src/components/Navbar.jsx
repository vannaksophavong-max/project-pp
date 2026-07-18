import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { isLoggedIn, username, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/" className="navbar__logo">
          <img src="/images/logo.png" alt="" />
        </Link>
        <div className="navbar__welcome">
          <span className="navbar__welcome-dot" aria-hidden="true" />
          Welcome to Block Paradise
        </div>
      </div>

      <nav className="navbar__nav">
        <Link to="/checkout" className="navbar__pill navbar__pill--cart">
          <span aria-hidden="true">🧺</span> Cart ({count})
        </Link>
        <a href="#menu" className="navbar__pill">Shop</a>
        <a
          href="https://maps.app.goo.gl/x3zyUQthMNTmc6cx5"
          target="_blank"
          rel="noreferrer"
          className="navbar__pill"
        >
          Location
        </a>
        {isLoggedIn ? (
          <>
            <Link to="/admin" className="navbar__pill">Admin</Link>
            <button className="navbar__pill navbar__pill--user" onClick={handleLogout}>
              {username} · Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar__pill navbar__pill--accent">Log in</Link>
        )}
      </nav>
    </header>
  );
}
