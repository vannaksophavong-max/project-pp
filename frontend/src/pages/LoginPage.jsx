import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import styles from './LoginPage.module.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const auth = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const redirectTo = new URLSearchParams(location.search).get('redirect') || '/'

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const response = await api.post('/api/auth/login', { email, password })
            auth.login(response.data.token, response.data.user)
            navigate(redirectTo, { replace: true })
        } catch (err) {
            setError(err.response?.data?.error || 'Unable to sign in. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1>Log In</h1>
                <p>Access your account and continue shopping.</p>
                {error && <div className={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label>
                        Email
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                    <label>
                        Password
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                    </label>
                    <button type="submit" disabled={loading} className={styles.submit}>
                        {loading ? 'Signing in…' : 'Log In'}
                    </button>
                </form>
                <p className={styles.footerText}>
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    )
}
