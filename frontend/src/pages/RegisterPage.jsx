import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import styles from './RegisterPage.module.css'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const auth = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)

        if (!email.includes('@')) {
            setError('Please enter a valid email address.')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        if (password !== confirm) {
            setError('Passwords must match.')
            return
        }

        setLoading(true)

        try {
            const response = await api.post('/api/auth/register', { username, email, password })
            auth.login(response.data.token, response.data.user)
            navigate('/', { replace: true })
        } catch (err) {
            setError(err.response?.data?.error || 'Unable to register. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1>Create Account</h1>
                <p>Register and save your orders, cart, and profile details.</p>
                {error && <div className={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label>
                        Username
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </label>
                    <label>
                        Email
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                    <label>
                        Password
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                    </label>
                    <label>
                        Confirm Password
                        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                    </label>
                    <button type="submit" disabled={loading} className={styles.submit}>
                        {loading ? 'Creating account…' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    )
}
