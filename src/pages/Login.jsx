import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const redirectPath =
    searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // ================================
    // VALIDATION
    // ================================

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setIsLoading(true);

      // ================================
      // BACKEND LOGIN
      // ================================

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      // ================================
      // SAVE REAL JWT
      // ================================

      localStorage.setItem(
        "token",
        data.token
      );

      // ================================
      // SAVE USER
      // ================================

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // ================================
      // REMEMBER ME
      // ================================

      localStorage.setItem(
        "rememberMe",
        rememberMe ? "true" : "false"
      );

      // ================================
      // REDIRECT
      // ================================

      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-decoration login-decoration-one"></div>

      <div className="login-decoration login-decoration-two"></div>

      <section className="login-card">

        {/* Logo */}
        <Link
          to="/"
          className="login-logo"
        >
          <div className="login-logo-icon">
            D
          </div>

          <span>
            DriveEase
          </span>
        </Link>

        {/* Heading */}
        <div className="login-heading">

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to continue your car rental journey
          </p>

        </div>

        {/* Demo Credentials */}
        <div className="demo-box">

          <strong>
            Demo Credentials
          </strong>

          <div className="demo-row">

            <span>
              Email
            </span>

            <code>
              user@driveease.in
            </code>

          </div>

          <div className="demo-row">

            <span>
              Password
            </span>

            <code>
              password123
            </code>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="login-form"
        >

          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <div className="input-wrapper">

              <Mail size={19} />

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />

            </div>

          </div>

          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">

              <LockKeyhole size={19} />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}

              </button>

            </div>

          </div>

          {/* Remember + Forgot */}
          <div className="login-options">

            <label className="remember-me">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              <span>
                Remember me
              </span>

            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                alert(
                  "Forgot password feature coming soon."
                )
              }
            >
              Forgot Password?
            </button>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-submit"
            disabled={isLoading}
          >

            {isLoading ? (
              "Logging in..."
            ) : (
              <>
                Login
                <ArrowRight size={18} />
              </>
            )}

          </button>

        </form>

        {/* Divider */}
        <div className="login-divider">

          <span></span>

          <p>
            Or continue with
          </p>

          <span></span>

        </div>

        {/* Google */}
        <button
          type="button"
          className="google-login"
          onClick={() =>
            alert(
              "Google login will be connected later."
            )
          }
        >

          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >

            <path
              fill="#4285F4"
              d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
            />

            <path
              fill="#34A853"
              d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.75Z"
            />

            <path
              fill="#FBBC05"
              d="M6.54 13.83A5.85 5.85 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.36l3.24-2.53Z"
            />

            <path
              fill="#EA4335"
              d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.15 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C6.31 7.86 8.46 6.14 12 6.14Z"
            />

          </svg>

          Continue with Google

        </button>

        {/* Register */}
        <p className="register-text">

          Don't have an account?{" "}

          <Link to="/register">
            Create Account
          </Link>

        </p>

        {/* Footer */}
        <div className="login-footer">

          <a href="#terms">
            Terms of Service
          </a>

          <span>•</span>

          <a href="#privacy">
            Privacy Policy
          </a>

          <span>•</span>

          <a href="#help">
            Help Desk
          </a>

        </div>

      </section>

    </main>
  );
}

export default Login;