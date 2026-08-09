import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./LoginPage.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
    </svg>
  );
}

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
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: "100%",
        });
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
      // cleanup: nothing to tear down for the 3rd-party SDKs
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
          <div
            ref={googleBtnRef}
            className="auth__social-google"
            onClick={handleGoogleClick}
          >
            <button type="button" className="auth__social-btn auth__social-btn--google">
              <GoogleIcon /> Continue with Google
            </button>
          </div>
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
