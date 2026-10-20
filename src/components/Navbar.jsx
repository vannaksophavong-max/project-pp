import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Icon from "./Icon.jsx";
import "./Navbar.css";

const LANGUAGES = ["English", "ខ្មែរ (Khmer)"];

export default function Navbar() {
  const { isLoggedIn, isAdmin, username, logout } = useAuth();
  const { count, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [lang, setLang] = useState(LANGUAGES[0]);
  const [userOpen, setUserOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const userRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    function handleDown(e) {
      if (e.key === "Escape") {
        setUserOpen(false);
        setLangOpen(false);
        return;
      }
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    }
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleDown);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleDown);
    };
  }, []);

  function handleLogout() {
    setUserOpen(false);
    logout();
    navigate("/login");
  }

  function toggleUser() {
    setUserOpen((v) => !v);
    setLangOpen(false);
  }

  function toggleLang() {
    setLangOpen((v) => !v);
    setUserOpen(false);
  }

  const isShopActive = location.pathname === "/" || location.pathname.startsWith("/product/");
  const isOrdersActive = location.pathname === "/orders";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <Link to="/" className="navbar__brand-link" aria-label="Block Paradise home">
            <div className="navbar__logo">
              <img src="/images/logo.png" alt="" />
            </div>
            <div className="navbar__brand-text">
              <span className="navbar__welcome">Block Paradise</span>
              <span className="navbar__tagline">Bricks & Blind Boxes</span>
            </div>
          </Link>
        </div>

        <nav className="navbar__nav" aria-label="Primary">
          <Link
            to="/"
            className={`navbar__link${isShopActive ? " navbar__link--active" : ""}`}
          >
            <Icon name="brick" size={15} />
            <span>Shop</span>
          </Link>

          {isLoggedIn && (
            <Link
              to="/orders"
              className={`navbar__link${isOrdersActive ? " navbar__link--active" : ""}`}
            >
              <Icon name="clipboard" size={15} />
              <span>My Orders</span>
            </Link>
          )}

          <a
            href="https://maps.app.goo.gl/x3zyUQthMNTmc6cx5"
            target="_blank"
            rel="noreferrer"
            className="navbar__link"
          >
            <Icon name="mapPin" size={15} />
            <span>Location</span>
          </a>

          {isAdmin && (
            <Link to="/admin" className="navbar__link navbar__link--admin">
              <Icon name="shield" size={14} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className="navbar__actions">
          <div className="navbar__action" ref={langRef}>
            <button
              type="button"
              className={`navbar__icon-btn${langOpen ? " navbar__icon-btn--open" : ""}`}
              aria-label="Change language"
              aria-haspopup="menu"
              aria-expanded={langOpen}
              onClick={toggleLang}
              title="Language"
            >
              <Icon name="globe" size={19} />
              <span className="navbar__lang-code">{lang.startsWith("English") ? "EN" : "KH"}</span>
            </button>
            {langOpen && (
              <ul className="navbar__menu" role="menu" aria-label="Language">
                <li className="navbar__menu-label">Select Language</li>
                {LANGUAGES.map((l) => (
                  <li key={l}>
                    <button
                      type="button"
                      role="menuitem"
                      className={`navbar__menu-item${l === lang ? " navbar__menu-item--active" : ""}`}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                    >
                      <span>{l}</span>
                      {l === lang && <Icon name="check" size={15} />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/checkout"
            className={`navbar__cart-btn${count > 0 ? " navbar__cart-btn--has-items" : ""}`}
            aria-label="Shopping cart"
          >
            <span className="navbar__cart-icon">
              <Icon name="cart" size={19} />
              {count > 0 && (
                <span className="navbar__badge">{count > 99 ? "99+" : count}</span>
              )}
            </span>
            <span className="navbar__cart-label">
              {count > 0 ? `$${total.toFixed(2)}` : "Cart"}
            </span>
          </Link>

          <div className="navbar__action" ref={userRef}>
            <button
              type="button"
              className={`navbar__user-btn${userOpen ? " navbar__user-btn--open" : ""}`}
              aria-label="Account"
              aria-haspopup="menu"
              aria-expanded={userOpen}
              onClick={toggleUser}
            >
              {isLoggedIn && username ? (
                <span className="navbar__avatar">
                  {username.charAt(0).toUpperCase()}
                </span>
              ) : (
                <Icon name="user" size={19} />
              )}
            </button>
            {userOpen && (
              <ul className="navbar__menu navbar__menu--user" role="menu" aria-label="Account menu">
                {isLoggedIn ? (
                  <>
                    <li className="navbar__user-header">
                      <span className="navbar__user-avatar-lg">
                        {(username || "U").charAt(0).toUpperCase()}
                      </span>
                      <div className="navbar__user-meta">
                        <span className="navbar__user-name">{username}</span>
                        <span className="navbar__user-role">
                          {isAdmin ? "Administrator" : "Member"}
                        </span>
                      </div>
                    </li>
                    <li className="navbar__menu-divider" />
                    {isAdmin && (
                      <li>
                        <Link
                          to="/admin"
                          className="navbar__menu-item"
                          role="menuitem"
                          onClick={() => setUserOpen(false)}
                        >
                          <Icon name="shield" size={16} /> Admin Console
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        to="/orders"
                        className="navbar__menu-item"
                        role="menuitem"
                        onClick={() => setUserOpen(false)}
                      >
                        <Icon name="clipboard" size={16} /> My Orders
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/checkout"
                        className="navbar__menu-item"
                        role="menuitem"
                        onClick={() => setUserOpen(false)}
                      >
                        <Icon name="cart" size={16} /> Shopping Cart
                      </Link>
                    </li>
                    <li className="navbar__menu-divider" />
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        className="navbar__menu-item navbar__menu-item--danger"
                        onClick={handleLogout}
                      >
                        <Icon name="logOut" size={16} /> Log out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="navbar__menu-label">Welcome to Block Paradise</li>
                    <li>
                      <Link
                        to="/login"
                        className="navbar__menu-item"
                        role="menuitem"
                        onClick={() => setUserOpen(false)}
                      >
                        <Icon name="logIn" size={16} /> Log in
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login"
                        className="navbar__menu-item"
                        role="menuitem"
                        onClick={() => setUserOpen(false)}
                      >
                        <Icon name="userPlus" size={16} /> Create account
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
