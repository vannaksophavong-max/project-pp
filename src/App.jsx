import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ProductsProvider } from "./context/ProductsContext.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ShopPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
