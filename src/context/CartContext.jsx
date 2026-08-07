import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";
import { fetchCart, addCartItem, removeCartItem, clearCartItems } from "../api.js";

const CartContext = createContext(null);

function toItem(product) {
  return {
    productId: product.id,
    name: product.name,
    price: Number(product.price || 0),
    img: product.img ?? null,
    type: product.type,
    quantity: 1,
  };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const lastUserIdRef = useRef(null);

  // Load a user's saved cart whenever the signed-in account changes.
  useEffect(() => {
    const userId = user?.id ?? null;

    if (userId && userId !== lastUserIdRef.current) {
      lastUserIdRef.current = userId;
      setCart([]);
      fetchCart()
        .then((data) => setCart(Array.isArray(data?.items) ? data.items : []))
        .catch(() => setCart([]));
    } else if (!userId && lastUserIdRef.current !== null) {
      // Logged out (or switched to a guest): never leak the previous
      // account's cart into the next session.
      lastUserIdRef.current = null;
      setCart([]);
    }
  }, [user?.id]);

  const addToCart = useCallback(
    async (product) => {
      const item = toItem(product);
      if (!user) {
        setCart((prev) => [...prev, item]);
        return;
      }
      try {
        const data = await addCartItem(item.productId, 1);
        setCart(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setCart((prev) => [...prev, item]);
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (item) => {
      const productId = item?.productId ?? item?.id;
      if (!productId) return;

      if (!user) {
        setCart((prev) => prev.filter((i) => i.productId !== productId));
        return;
      }
      try {
        const data = await removeCartItem(productId);
        setCart(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setCart((prev) => prev.filter((i) => i.productId !== productId));
      }
    },
    [user]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        await clearCartItems();
      } catch {
        // ignore — clear locally regardless
      }
    }
    setCart([]);
  }, [user]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0),
    [cart]
  );

  const count = useMemo(
    () => cart.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [cart]
  );

  const value = { cart, addToCart, removeFromCart, clearCart, total, count };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
