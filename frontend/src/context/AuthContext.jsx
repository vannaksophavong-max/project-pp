import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const initialState = {
    user: null,
    token: null,
    isAdmin: false,
}

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        try {
            const stored = localStorage.getItem('bp_auth')
            return stored ? JSON.parse(stored) : initialState
        } catch {
            return initialState
        }
    })

    useEffect(() => {
        localStorage.setItem('bp_auth', JSON.stringify(auth))
        if (auth.token) {
            localStorage.setItem('bp_token', auth.token)
        } else {
            localStorage.removeItem('bp_token')
        }
    }, [auth])

    const login = (token, user) => {
        setAuth({ user, token, isAdmin: Boolean(user?.is_admin) })
    }

    const logout = () => {
        setAuth(initialState)
        localStorage.removeItem('bp_auth')
        localStorage.removeItem('bp_token')
    }

    const value = useMemo(
        () => ({
            ...auth,
            isAuthenticated: Boolean(auth.token),
            login,
            logout,
        }),
        [auth],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
