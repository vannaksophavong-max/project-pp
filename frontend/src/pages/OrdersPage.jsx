import { useEffect, useState } from 'react'
import api from '../api/client'
import styles from './OrdersPage.module.css'

export default function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        api
            .get('/api/user/orders')
            .then((response) => setOrders(response.data.orders || []))
            .catch((err) => setError(err.response?.data?.error || 'Unable to load orders'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <div className={styles.message}>Loading order history…</div>
    }

    if (error) {
        return <div className={styles.error}>{error}</div>
    }

    if (orders.length === 0) {
        return <div className={styles.message}>No orders yet — start shopping!</div>
    }

    return (
        <div className={styles.page}>
            <h1>Order History</h1>
            <div className={styles.list}>
                {orders.map((order) => (
                    <article key={order.id} className={styles.order}>
                        <div>
                            <strong>{order.product_name || order.product_id}</strong>
                            <p>{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <span>${Number(order.amount).toFixed(2)}</span>
                            <span className={styles.status}>{order.status || 'Pending'}</span>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}
