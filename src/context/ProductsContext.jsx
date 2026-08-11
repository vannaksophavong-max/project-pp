import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  fetchProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  categoryToType,
  typeToCategory,
} from "../api.js";

const ProductsContext = createContext(null);

function toUiProduct(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: Number(p.price),
    img: p.image_url,
    stock: Number(p.stock ?? 0),
    type: categoryToType(p.category),
  };
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts();
      setProducts((data.products || []).map(toUiProduct));
    } catch (err) {
      setError(err.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addOrUpdateProduct = useCallback(async (id, { name, description, price, img, type, stock }) => {
    const payload = {
      name,
      description: description || "",
      price: Number(price),
      image_url: img,
      category: typeToCategory(type),
      stock: Number(stock || 0),
      is_active: true,
    };
    try {
      if (id) {
        await adminUpdateProduct(id, payload);
      } else {
        await adminCreateProduct(payload);
      }
      await loadProducts();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, [loadProducts]);

  const removeProduct = useCallback(async (id) => {
    try {
      await adminDeleteProduct(id);
      await loadProducts();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, [loadProducts]);

  const value = { products, loading, error, addOrUpdateProduct, removeProduct, refresh: loadProducts };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
