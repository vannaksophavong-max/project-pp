import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client'
import ProductCard from '../components/Products/ProductCard'
import styles from './HomePage.module.css'
import heroImage from '../assets/block.jpg'

const categories = [
    { value: 'all', label: 'All' },
    { value: 'block', label: 'Block Paradise' },
    { value: 'blindbox', label: 'Blind Box' },
    { value: 'other', label: 'Other Products' },
]

const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price Low→High' },
    { value: 'price-desc', label: 'Price High→Low' },
]

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [category, setCategory] = useState(searchParams.get('category') || 'all')
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest')

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (category !== 'all') params.set('category', category)
            if (sort !== 'newest') params.set('sort', sort)
            setSearchParams(params)
        }, 300)

        return () => clearTimeout(timer)
    }, [search, category, sort, setSearchParams])

    useEffect(() => {
        setLoading(true)
        setError(null)

        const query = {}
        if (search) query.search = search
        if (category !== 'all') query.category = category

        api
            .get('/api/products', { params: query })
            .then((response) => setProducts(response.data.products || []))
            .catch((err) => setError(err.message || 'Unable to load products'))
            .finally(() => setLoading(false))
    }, [search, category])

    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            if (sort === 'price-asc') return Number(a.price) - Number(b.price)
            if (sort === 'price-desc') return Number(b.price) - Number(a.price)
            return new Date(b.created_at) - new Date(a.created_at)
        })
    }, [products, sort])

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroCopy}>
                    <p className={styles.tagline}>Build your world with premium bricks.</p>
                    <h1>Block Paradise</h1>
                    <p>Shop collectible sets, blind boxes, and custom block products.</p>
                </div>
                <div className={styles.heroMedia}>
                    <img src={heroImage} alt="Block Paradise hero" loading="eager" />
                </div>
            </section>

            <section className={styles.controls}>
                <div className={styles.filters}>
                    <div className={styles.tabs}>
                        {categories.map((item) => (
                            <button
                                key={item.value}
                                className={`${styles.tab} ${category === item.value ? styles.active : ''}`}
                                onClick={() => setCategory(item.value)}
                                type="button"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.actions}>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search products..."
                            className={styles.search}
                        />
                        <select value={sort} onChange={(event) => setSort(event.target.value)} className={styles.sort}>
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className={styles.gridSection}>
                {loading && <p className={styles.message}>Loading products…</p>}
                {error && (
                    <div className={styles.messageError}>
                        <p>{error}</p>
                        <button type="button" onClick={() => window.location.reload()} className={styles.retry}>
                            Retry
                        </button>
                    </div>
                )}
                {!loading && !error && sortedProducts.length === 0 && (
                    <p className={styles.message}>No products found. Try a different search or category.</p>
                )}
                <div className={styles.grid}>
                    {sortedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    )
}
