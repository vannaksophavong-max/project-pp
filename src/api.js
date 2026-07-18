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

export function logoutUser() {
  return request("/users/logout", { method: "POST", auth: true });
}

// ---- Products (public) ----
export function fetchProducts() {
  return request("/products?limit=100&active=true");
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
