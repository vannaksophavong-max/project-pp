import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import styles from './CheckoutPage.module.css'
import qrImage from '../assets/qr.jpg'

export default function CheckoutPage() {
    const { cart } = useCart()
    const [method, setMethod] = useState('qr')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const total = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)

        try {
            // TODO: implement bulk checkout flow with backend endpoint
            await new Promise((resolve) => setTimeout(resolve, 600))
            navigate('/order-success')
        } catch {
            // TODO: show error message
        } finally {
            setLoading(false)
        }
    }

    if (cart.length === 0) {
        return (
            <div className={styles.empty}>
                <h1>Your cart is empty</h1>
                <p>Add products before checkout.</p>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <h1>Checkout</h1>
            <div className={styles.content}>
                <section className={styles.review}>
                    <h2>Order review</h2>
                    <ul className={styles.items}>
                        {cart.map((item) => (
                            <li key={item.product.id} className={styles.item}>
                                <span>{item.quantity}× {item.product.name}</span>
                                <strong>${(item.quantity * item.product.price).toFixed(2)}</strong>
                            </li>
                        ))}
                    </ul>
                    <p className={styles.total}>Total: ${total.toFixed(2)}</p>
                </section>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <h2>Payment method</h2>
                    <label className={styles.radioLabel}>
                        <input type="radio" name="method" value="qr" checked={method === 'qr'} onChange={() => setMethod('qr')} />
                        QR Code (Bank Transfer)
                    </label>
                    <label className={styles.radioLabel}>
                        <input type="radio" name="method" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                        Cash on Delivery
                    </label>
                    {method === 'qr' && <img src={qrImage} alt="QR payment" className={styles.qr} loading="lazy" />}

                    <label>
                        Notes
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions" />
                    </label>

                    <button type="submit" disabled={loading} className={styles.submit}>
                        {loading ? 'Placing order…' : 'Place Order'}
                    </button>
                </form>
            </div>
        </div>
    )
}
