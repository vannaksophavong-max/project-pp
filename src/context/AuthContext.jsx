import { createContext, useContext, useState, useCallback } from "react";
import { registerUser, loginUser, logoutUser, googleLogin, facebookLogin } from "../api.js";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("bp_user"));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("bp_token"));

  const isLoggedIn = !!token;
  const isAdmin = !!user?.is_admin;
  const username = user?.username;

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("bp_token", data.token);
      localStorage.setItem("bp_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    try {
      const data = await googleLogin(idToken);
      localStorage.setItem("bp_token", data.token);
      localStorage.setItem("bp_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, []);

  const loginWithFacebook = useCallback(async (accessToken) => {
    try {
      const data = await facebookLogin(accessToken);
      localStorage.setItem("bp_token", data.token);
      localStorage.setItem("bp_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      // Backend expects a "username" (min 8 chars password enforced server-side).
      await registerUser(name, email, password);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await logoutUser();
    } catch {
      // even if the server call fails, clear the local session
    }
    localStorage.removeItem("bp_token");
    localStorage.removeItem("bp_user");
    setToken(null);
    setUser(null);
  }, [token]);

  const value = { username, isLoggedIn, isAdmin, user, token, login, register, logout, loginWithGoogle, loginWithFacebook };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
