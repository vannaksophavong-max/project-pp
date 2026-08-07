// src/api.js
// Central API client — talks to the real Block Paradise backend.
const API = import.meta.env.VITE_API_BASE || "https://block-paradise-backend.onrender.com/api/v1";

function getToken() {
  return localStorage.getItem("bp_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. 204)
  }

  if (!res.ok) {
    const message = data?.message || data?.errors?.[0]?.message || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}

// ---- Auth ----
export function registerUser(username, email, password) {
  return request("/users", { method: "POST", body: { username, email, password } });
}

export function loginUser(email, password) {
  return request("/users/login", { method: "POST", body: { email, password } });
}

export function googleLogin(idToken) {
  return request("/users/oauth/google", { method: "POST", body: { token: idToken } });
}

export function facebookLogin(accessToken) {
  return request("/users/oauth/facebook", { method: "POST", body: { token: accessToken } });
}

export function logoutUser() {
  return request("/users/logout", { method: "POST", auth: true });
}

// ---- Products (public) ----
export function fetchProducts() {
  return request("/products?limit=100&active=true");
}

// ---- Cart (authenticated, per-user) ----
export function fetchCart() {
  return request("/cart", { auth: true });
}

export function addCartItem(productId, quantity = 1) {
  return request("/cart/items", { method: "POST", body: { productId, quantity }, auth: true });
}

export function updateCartItem(productId, quantity) {
  return request(`/cart/items/${productId}`, { method: "PATCH", body: { quantity }, auth: true });
}

export function removeCartItem(productId) {
  return request(`/cart/items/${productId}`, { method: "DELETE", auth: true });
}

export function clearCartItems() {
  return request("/cart", { method: "DELETE", auth: true });
}

// ---- Products (admin) ----
export function adminCreateProduct(payload) {
  return request("/admin/products", { method: "POST", body: payload, auth: true });
}

export function adminUpdateProduct(id, payload) {
  return request(`/admin/products/${id}`, { method: "PATCH", body: payload, auth: true });
}

export function adminDeleteProduct(id) {
  return request(`/admin/products/${id}`, { method: "DELETE", auth: true });
}

export function adminUploadImage(imageDataUrl) {
  return request("/admin/products/upload-image", {
    method: "POST",
    body: { image: imageDataUrl },
    auth: true,
  });
}

// ---- Users (admin) ----
export function adminGetStats() {
  return request("/admin/stats", { auth: true });
}

export function adminGetUsers({ page = 1, limit = 20, search = "" } = {}) {
  return request(
    `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
    { auth: true }
  );
}

export function adminUpdateUser(id, payload) {
  return request(`/admin/users/${id}`, { method: "PATCH", body: payload, auth: true });
}

export function adminResetPassword(id, newPassword) {
  return request(`/admin/users/${id}/reset-password`, {
    method: "PATCH",
    body: { newPassword },
    auth: true,
  });
}

export function adminBanUser(id) {
  return request(`/admin/users/${id}/ban`, { method: "POST", auth: true });
}

export function adminUnbanUser(id) {
  return request(`/admin/users/${id}/unban`, { method: "POST", auth: true });
}

export function adminDeleteUser(id) {
  return request(`/admin/users/${id}`, { method: "DELETE", auth: true });
}

// ---- Category <-> UI type mapping ----
// Backend stores a free-text "category" field. The old vanilla frontend used
// fuzzy matching so "Block", "Blocks", "Block Paradise" etc. all map to "block",
// and anything with "blind" in it maps to "blind". We reuse that here so both
// frontends agree on how existing products are categorized.
export function categoryToType(category) {
  const c = String(category || "").trim().toLowerCase();
  if (c.includes("blind")) return "blind";
  if (c.includes("block")) return "block";
  return "other";
}

export function typeToCategory(type) {
  return type === "blind" ? "Blind Box" : "Block Paradise";
}
