import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import styles from './ProductDetailPage.module.css'
import fallbackImage from '../assets/logo.png'

export default function ProductDetailPage() {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const { addToCart } = useCart()

    useEffect(() => {
        setLoading(true)
        api
            .get(`/api/products/${id}`)
            .then((response) => setProduct(response.data.product || response.data))
            .catch((err) => setError(err.response?.data?.error || 'Unable to load product'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return <div className={styles.loading}>Loading product details…</div>
    }

    if (error) {
        return <div className={styles.error}>{error}</div>
    }

    if (!product) {
        return <div className={styles.error}>Product not found.</div>
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <img src={product.image_url || fallbackImage} alt={product.name} loading="lazy" />
                <div className={styles.details}>
                    <p className={styles.category}>{product.category || 'Other'}</p>
                    <h1>{product.name}</h1>
                    <p className={styles.price}>${Number(product.price).toFixed(2)}</p>
                    <p className={styles.stock}>
                        {product.stock > 5 ? 'In stock' : product.stock > 0 ? `Low stock (${product.stock})` : 'Out of stock'}
                    </p>
                    <p className={styles.description}>{product.description || 'Build your next set with premium bricks.'}</p>
                    <div className={styles.actions}>
                        <label>
                            Quantity
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                            />
                        </label>
                        <button type="button" onClick={() => addToCart(product, quantity)} className={styles.button}>
                            Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
