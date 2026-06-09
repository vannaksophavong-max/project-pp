import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

const initialCart = []

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('bp_cart')) || initialCart
        } catch {
            return initialCart
        }
    })

    useEffect(() => {
        localStorage.setItem('bp_cart', JSON.stringify(cart))
    }, [cart])

    const addToCart = (product, quantity = 1) => {
        setCart((current) => {
            const existing = current.find((item) => item.product.id === product.id)
            if (existing) {
                return current.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item,
                )
            }

            return [...current, { product, quantity }]
        })
    }

    const removeFromCart = (productId) => {
        setCart((current) => current.filter((item) => item.product.id !== productId))
    }

    const updateQuantity = (productId, quantity) => {
        setCart((current) =>
            current
                .map((item) =>
                    item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
                )
                .filter((item) => item.quantity > 0),
        )
    }

    const clearCart = () => setCart([])

    const value = useMemo(
        () => ({ cart, addToCart, removeFromCart, updateQuantity, clearCart }),
        [cart],
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within CartProvider')
    }
    return context
}
