import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styles from './ProductCard.module.css'
import fallbackImage from '../../assets/logo.png'

export default function ProductCard({ product }) {
    const stockText = useMemo(() => {
        if (product.stock === 0) return 'Out of stock'
        if (product.stock <= 5) return 'Low stock'
        return 'In stock'
    }, [product.stock])

    return (
        <article className={styles.card}>
            <Link to={`/product/${product.id}`} className={styles.imageLink}>
                <div className={styles.imageWrapper}>
                    <img
                        src={product.image_url || fallbackImage}
                        loading="lazy"
                        width="320"
                        height="240"
                        alt={product.name}
                    />
                </div>
            </Link>
            <div className={styles.body}>
                <div className={styles.row}>
                    <span className={styles.category}>{product.category || 'Other'}</span>
                    <span className={styles.price}>${product.price?.toFixed(2) || '0.00'}</span>
                </div>
                <Link to={`/product/${product.id}`} className={styles.title}>
                    {product.name}
                </Link>
                <p className={styles.stock}>{stockText}</p>
            </div>
        </article>
    )
}
