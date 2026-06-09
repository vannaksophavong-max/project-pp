import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import styles from './CartPage.module.css'
import fallbackImage from '../assets/logo.png'

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity } = useCart()
    const navigate = useNavigate()

    const total = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

    if (cart.length === 0) {
        return (
            <div className={styles.empty}>
                <h1>Your cart is empty</h1>
                <p>Add a few sets to continue shopping.</p>
                <Link to="/" className={styles.button}>
                    Back to shop
                </Link>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <h1>Your Cart</h1>
            <div className={styles.grid}>
                <div className={styles.items}>
                    {cart.map((item) => (
                        <div key={item.product.id} className={styles.item}>
                            <img src={item.product.image_url || fallbackImage} alt={item.product.name} loading="lazy" />
                            <div>
                                <h2>{item.product.name}</h2>
                                <p>${item.product.price?.toFixed(2)}</p>
                                <label>
                                    Qty
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                                    />
                                </label>
                                <button type="button" onClick={() => removeFromCart(item.product.id)} className={styles.remove}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <aside className={styles.summary}>
                    <div className={styles.box}>
                        <h2>Order Summary</h2>
                        <p>{cart.length} items</p>
                        <strong>${total.toFixed(2)}</strong>
                        <button type="button" onClick={() => navigate('/checkout')} className={styles.checkout}>
                            Proceed to Checkout
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}
