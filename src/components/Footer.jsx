import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__accent-bar" aria-hidden="true">
        <span className="footer__accent-seg footer__accent-seg--red" />
        <span className="footer__accent-seg footer__accent-seg--yellow" />
        <span className="footer__accent-seg footer__accent-seg--blue" />
        <span className="footer__accent-seg footer__accent-seg--green" />
      </div>

      <div className="footer__inner">
        <div className="footer__brand-col">
          <Link to="/" className="footer__brand">
            <div className="footer__logo">
              <img src="/images/logo.png" alt="" />
            </div>
            <div>
              <span className="footer__brand-name">Block Paradise</span>
              <span className="footer__brand-tag">Building Sets & Blind Boxes</span>
            </div>
          </Link>
          <p className="footer__desc">
            Curated building block sets and collectible mystery blind boxes — packed with care and delivered straight from our shop floor to your shelf.
          </p>
          <div className="footer__badges">
            <span className="footer__pill">
              <Icon name="checkCircle" size={14} /> Authentic Sets
            </span>
            <span className="footer__pill">
              <Icon name="truck" size={14} /> Fast Delivery
            </span>
          </div>
        </div>

        <div className="footer__links-col">
          <h4 className="footer__heading">Explore</h4>
          <ul className="footer__list">
            <li><Link to="/">All Products</Link></li>
            <li><Link to="/?type=block">Block Paradise Sets</Link></li>
            <li><Link to="/?type=blind">Mystery Blind Boxes</Link></li>
            <li><Link to="/checkout">Shopping Cart</Link></li>
          </ul>
        </div>

        <div className="footer__links-col">
          <h4 className="footer__heading">Account</h4>
          <ul className="footer__list">
            <li><Link to="/orders">Track My Orders</Link></li>
            <li><Link to="/login">Sign In / Register</Link></li>
            <li>
              <a
                href="https://maps.app.goo.gl/x3zyUQthMNTmc6cx5"
                target="_blank"
                rel="noreferrer"
              >
                Store Location ↗
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__links-col">
          <h4 className="footer__heading">Payment & Pickup</h4>
          <p className="footer__note">
            We accept instant <strong>Bakong KHQR</strong> transfers and <strong>Cash on Delivery</strong> across Cambodia.
          </p>
          <div className="footer__pay-methods">
            <span className="footer__pay-tag footer__pay-tag--qr">Bakong QR</span>
            <span className="footer__pay-tag footer__pay-tag--cod">Cash on Delivery</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <span>© {new Date().getFullYear()} Block Paradise. All rights reserved.</span>
          <span className="footer__bottom-made">Built for collectors & builders</span>
        </div>
      </div>
    </footer>
  );
}

