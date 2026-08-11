import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Icon from "./Icon.jsx";
import "./Navbar.css";

const LANGUAGES = ["English", "ខ្មែរ (Khmer)"];

export default function Navbar() {
  const { isLoggedIn, isAdmin, username, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

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

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/" className="navbar__logo" aria-label="Block Paradise home">
          <img src="/images/logo.png" alt="" />
        </Link>
        <span className="navbar__welcome">Block Paradise</span>
      </div>

      <nav className="navbar__actions">
        <Link to="/" className="navbar__link">Shop</Link>
        <a
          href="https://maps.app.goo.gl/x3zyUQthMNTmc6cx5"
          target="_blank"
          rel="noreferrer"
          className="navbar__link"
        >
          Location
        </a>

        <div className="navbar__action" ref={langRef}>
          <button
            type="button"
            className={`navbar__icon-btn${langOpen ? " navbar__icon-btn--open" : ""}`}
            aria-label="Change language"
            aria-haspopup="menu"
            aria-expanded={langOpen}
            onClick={toggleLang}
          >
            <Icon name="globe" size={20} />
          </button>
          {langOpen && (
            <ul className="navbar__menu" role="menu" aria-label="Language">
              {LANGUAGES.map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    role="menuitem"
                    className={`navbar__menu-item${l === lang ? " navbar__menu-item--active" : ""}`}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                  >
                    <span>{l}</span>
                    {l === lang && <Icon name="check" size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link to="/checkout" className="navbar__icon-btn" aria-label="Shopping cart">
          <Icon name="cart" size={20} />
          {count > 0 && <span className="navbar__badge">{count > 99 ? "99+" : count}</span>}
        </Link>

        <div className="navbar__action" ref={userRef}>
          <button
            type="button"
            className={`navbar__icon-btn${userOpen ? " navbar__icon-btn--open" : ""}`}
            aria-label="Account"
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={toggleUser}
          >
            <Icon name="user" size={20} />
          </button>
          {userOpen && (
            <ul className="navbar__menu" role="menu" aria-label="Account menu">
              {isLoggedIn ? (
                <>
                  <li className="navbar__menu-label">{username}</li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        className="navbar__menu-item"
                        role="menuitem"
                        onClick={() => setUserOpen(false)}
                      >
                        <Icon name="shield" size={15} /> Admin
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
                      <Icon name="clipboard" size={15} /> My Orders
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      className="navbar__menu-item navbar__menu-item--danger"
                      onClick={handleLogout}
                    >
                      <Icon name="logOut" size={15} /> Log out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="navbar__menu-item"
                      role="menuitem"
                      onClick={() => setUserOpen(false)}
                    >
                      <Icon name="logIn" size={15} /> Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="navbar__menu-item"
                      role="menuitem"
                      onClick={() => setUserOpen(false)}
                    >
                      <Icon name="userPlus" size={15} /> Create account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}
