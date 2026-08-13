import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./LoginPage.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"/>
    </svg>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const { login, register, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  const googleBtnRef = useRef(null);
  const googleInitedRef = useRef(false);
  const googleObserverRef = useRef(null);
  const googleRenderedWidthRef = useRef(0);

  const goAfterLogin = useCallback(
    (result) => {
      if (!result.ok) return false;
      if (result.user?.is_admin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
      return true;
    },
    [navigate]
  );

  useEffect(() => {
    // ---- Google Identity Services ----
    const initGoogle = () => {
      if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;

      const render = () => {
        const el = googleBtnRef.current;
        if (!el) return;
        const width = Math.max(200, Math.floor(el.clientWidth));
        if (width === googleRenderedWidthRef.current) return;
        googleRenderedWidthRef.current = width;
        window.google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "medium",
          shape: "pill",
          text: "continue_with",
          width,
        });
      };

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response?.credential) return;
          setError("");
          const result = await loginWithGoogle(response.credential);
          if (!goAfterLogin(result)) setError(result.message);
        },
      });

      if (googleBtnRef.current && !googleInitedRef.current) {
        googleInitedRef.current = true;
        render();

        googleObserverRef.current = new ResizeObserver(() => {
          cancelAnimationFrame(googleObserverRef.current._raf);
          googleObserverRef.current._raf = requestAnimationFrame(render);
        });
        googleObserverRef.current.observe(googleBtnRef.current);
      }
    };

    if (typeof window.google?.accounts?.id === "undefined") {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = initGoogle;
      document.head.appendChild(s);
    } else {
      initGoogle();
    }

    // ---- Facebook SDK ----
    if (FACEBOOK_APP_ID && !window.FB) {
      window.fbAsyncInit = () => {
        window.FB.init({ appId: FACEBOOK_APP_ID, cookie: false, xfbml: false, version: "v21.0" });
      };
      const s = document.createElement("script");
      s.src = "https://connect.facebook.net/en_US/sdk.js";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    return () => {
      googleObserverRef.current?.disconnect();
      googleObserverRef.current = null;
    };
  }, [loginWithGoogle, navigate, goAfterLogin]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    const result = await login(loginForm.email, loginForm.password);
    if (!goAfterLogin(result)) {
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

  async function handleGoogleClick() {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google login is not configured yet.");
      return;
    }
    if (typeof window.google?.accounts?.id === "undefined") {
      setError("Google login failed to load. Please try again.");
    }
  }

  function handleFacebookClick() {
    if (!FACEBOOK_APP_ID) {
      setError("Facebook login is not configured yet.");
      return;
    }
    if (!window.FB) {
      setError("Facebook login failed to load. Please try again.");
      return;
    }
    window.FB.login(
      async (response) => {
        if (response.authResponse?.accessToken) {
          setError("");
          const result = await loginWithFacebook(response.authResponse.accessToken);
          if (!goAfterLogin(result)) setError(result.message);
        } else {
          setError("Facebook login was cancelled.");
        }
      },
      { scope: "public_profile,email" }
    );
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

        <div className="auth__social">
          <div className="auth__divider"><span>or continue with</span></div>
          {GOOGLE_CLIENT_ID && (
            <div
              ref={googleBtnRef}
              className="auth__social-google"
              onClick={handleGoogleClick}
            />
          )}
          <button
            type="button"
            className="auth__social-btn auth__social-btn--facebook"
            onClick={handleFacebookClick}
          >
            <FacebookIcon /> Continue with Facebook
          </button>
        </div>

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
