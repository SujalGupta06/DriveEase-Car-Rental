import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

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
        setError(data.message || "Login failed");
        return;
      }

      // Check admin role
      if (data.user.role !== "admin") {
        setError("Access denied. Admin account required.");
        return;
      }

      // Save admin information
      localStorage.setItem("adminToken", data.token);

      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      // Remember workstation
      if (remember) {
        localStorage.setItem("rememberAdmin", "true");
      } else {
        localStorage.removeItem("rememberAdmin");
      }

      // Go to admin dashboard
      navigate("/admin/dashboard");

    } catch (error) {
      console.error(error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-glow"></div>

      <div className="admin-login-container">

        <div className="admin-login-card">

          {/* Logo */}
          <div className="admin-logo">
            <span className="material-symbols-outlined">
              directions_car
            </span>
            <span>DriveEase</span>
          </div>

          {/* Admin Badge */}
          <div className="admin-badge">
            <span className="status-dot"></span>
            ADMINISTRATOR PORTAL
          </div>

          {/* Heading */}
          <h1>Admin Portal Access</h1>

          <p className="admin-subtitle">
            Secure access to DriveEase fleet management.
          </p>

          {/* Security Notice */}
          <div className="security-notice">
            <span className="material-symbols-outlined">
              security
            </span>

            <div>
              <strong>Restricted Area</strong>
              <p>
                This portal is restricted to authorized
                DriveEase administrators.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="form-group">

              <label htmlFor="email">
                Admin Work Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="admin@driveease.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>

            {/* Password */}
            <div className="form-group">

              <label htmlFor="password">
                Security Key / Password
              </label>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <span className="material-symbols-outlined">
                    {showPassword
                      ? "visibility_off"
                      : "visibility"}
                  </span>
                </button>

              </div>

            </div>

            {/* 2FA */}
            <div className="form-group">

              <label htmlFor="twoFactor">
                Hardware Security Token / 2FA OTP
                <span className="optional">
                  OPTIONAL
                </span>
              </label>

              <input
                id="twoFactor"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                value={twoFactor}
                onChange={(e) =>
                  setTwoFactor(e.target.value)
                }
              />

            </div>

            {/* Remember */}
            <div className="remember-row">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                />

                <span>
                  Remember this workstation
                </span>

              </label>

            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <span className="material-symbols-outlined">
                  error
                </span>

                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  Enter Admin Portal

                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </>
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="admin-footer">

            <div>
              <span className="status-dot"></span>
              Fleet Telemetry: Online
            </div>

            <span>DriveEase © 2026</span>

          </div>

        </div>

        <p className="admin-security-footer">
          Authorized personnel only. All access attempts
          are logged and monitored.
        </p>

      </div>

    </div>
  );
};

export default AdminLogin;