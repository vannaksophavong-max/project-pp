import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import styles from './Navbar.module.css'
import logo from '../../assets/logo.png'

export default function Navbar() {
    const { isAuthenticated, user, logout, isAdmin } = useAuth()
    const { cart } = useCart()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <Link to="/" className={styles.logoLink}>
                    <img src={logo} alt="Block Paradise" className={styles.logo} />
                    <span>Block Paradise</span>
                </Link>
            </div>

            <button
                className={styles.toggle}
                onClick={() => setMenuOpen((value) => !value)}
                aria-label="Toggle navigation"
            >
                ☰
            </button>

            <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
                <NavLink to="/" end onClick={() => setMenuOpen(false)}>
                    Shop
                </NavLink>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer">
                    Location
                </a>
                <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
                    Cart <span className={styles.badge}>{cart.length}</span>
                </NavLink>
                {isAuthenticated ? (
                    <>
                        {isAdmin && (
                            <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                                👑 Admin
                            </NavLink>
                        )}
                        <span className={styles.user}>Hi, {user?.username || 'Customer'}</span>
                        <button className={styles.logout} onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                        Login
                    </NavLink>
                )}
            </nav>
        </header>
    )
}
