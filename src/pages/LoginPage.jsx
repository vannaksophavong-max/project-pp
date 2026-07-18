import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./LoginPage.css";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    const result = await login(loginForm.email, loginForm.password);
    if (result.ok) {
      navigate("/");
    } else {
      setError(result.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (registerForm.password !== registerForm.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (registerForm.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const result = await register(registerForm.name, registerForm.email, registerForm.password);
    if (result.ok) {
      setMode("login");
      setLoginForm({ email: registerForm.email, password: "" });
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="auth">
      <div className="auth__panel">
        <Link to="/" className="auth__brand">
          <img src="/images/logo.png" alt="" />
          <span>Block Paradise</span>
        </Link>

        <div className="auth__tabs">
          <button
            className={`auth__tab ${mode === "login" ? "auth__tab--active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Log in
          </button>
          <button
            className={`auth__tab ${mode === "register" ? "auth__tab--active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Create account
          </button>
        </div>

        {mode === "login" ? (
          <form className="auth__form" onSubmit={handleLogin}>
            <label className="auth__field">
              <span>Email</span>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label className="auth__field">
              <span>Password</span>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </label>
            {error && <p className="auth__error">{error}</p>}
            <button className="auth__submit" type="submit">
              Log in
            </button>
          </form>
        ) : (
          <form className="auth__form" onSubmit={handleRegister}>
            <label className="auth__field">
              <span>Full name</span>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </label>
            <label className="auth__field">
              <span>Email</span>
              <input
                type="email"
                required
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label className="auth__field">
              <span>Password</span>
              <input
                type="password"
                required
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </label>
            <label className="auth__field">
              <span>Confirm password</span>
              <input
                type="password"
                required
                value={registerForm.confirm}
                onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                placeholder="••••••••"
              />
            </label>
            {error && <p className="auth__error">{error}</p>}
            <button className="auth__submit" type="submit">
              Create account
            </button>
          </form>
        )}

        <Link to="/" className="auth__back">← Back to shop</Link>
      </div>

      <div className="auth__art" aria-hidden="true">
        <div className="auth__brick auth__brick--red" />
        <div className="auth__brick auth__brick--yellow" />
        <div className="auth__brick auth__brick--blue" />
      </div>
    </div>
  );
}
