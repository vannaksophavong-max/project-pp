import { Link } from 'react-router-dom'
import styles from './OrderSuccessPage.module.css'

export default function OrderSuccessPage() {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1>Order received</h1>
                <p>Thank you for your purchase! Your order is being processed.</p>
                <p className={styles.ref}>Reference number: #{Math.floor(Math.random() * 900000 + 100000)}</p>
                <Link to="/" className={styles.button}>
                    Back to shop
                </Link>
            </div>
        </div>
    )
}
