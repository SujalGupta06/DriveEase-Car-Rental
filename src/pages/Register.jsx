
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Password requirements
  const password = formData.password;

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const requirementCount = [
    hasMinLength,
    hasNumber,
    hasSymbol,
  ].filter(Boolean).length;

  let strength = "Weak";

  if (requirementCount === 2) {
    strength = "Medium";
  }

  if (requirementCount === 3) {
    strength = "Strong";
  }

  // Register user with the backend
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    } = formData;

    // Required fields
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // Password validation
    if (!hasMinLength || !hasNumber || !hasSymbol) {
      setError(
        "Password must contain 8+ characters, a number and a symbol."
      );
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Terms and conditions
    if (!agreeTerms) {
      setError(
        "Please accept the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      setSuccess("Account created successfully! Redirecting to login...");

      // Redirect only after the backend confirms registration
      navigate("/login", {
        state: {
          registrationSuccess: true,
          registeredEmail: email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="register-page">
      {/* Background Decorations */}
      <div className="register-decoration register-decoration-one"></div>
      <div className="register-decoration register-decoration-two"></div>

      <section className="register-card">
        {/* Logo */}
        <Link to="/" className="register-logo">
          <div className="register-logo-icon">D</div>
          <span>DriveEase</span>
        </Link>

        {/* Heading */}
        <div className="register-heading">
          <h1>Create Your DriveEase Account</h1>
          <p>
            Join thousands of drivers enjoying frictionless
            rentals across the country.
          </p>
        </div>

        {/* Google Signup Placeholder */}
        <button
          type="button"
          className="google-register"
          onClick={() =>
            alert("Google signup will be connected later.")
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

          Sign up with Google
        </button>

        {/* Divider */}
        <div className="register-divider">
          <span></span>
          <p>or sign up with email</p>
          <span></span>
        </div>

        {/* Messages */}
        {error && (
          <div className="register-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="register-success" role="status">
            {success}
          </div>
        )}

        {/* Registration Form */}
        <form
          className="register-form"
          onSubmit={handleRegister}
        >
          {/* Full Name */}
          <div className="register-form-group">
            <label htmlFor="fullName">Full Name</label>

            <div className="register-input-wrapper">
              <User size={18} />

              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="register-two-columns">
            <div className="register-form-group">
              <label htmlFor="email">Email Address</label>

              <div className="register-input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="phone">Phone Number</label>

              <div className="register-input-wrapper">
                <Phone size={18} />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit number"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="register-form-group">
            <label htmlFor="password">Password</label>

            <div className="register-input-wrapper">
              <LockKeyhole size={18} />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {password && (
            <div className="password-strength">
              <div className="strength-top">
                <span>Password Strength</span>

                <strong
                  className={`strength-${strength.toLowerCase()}`}
                >
                  {strength}
                </strong>
              </div>

              <div className="strength-bars">
                <span
                  className={
                    requirementCount >= 1 ? "strength-active" : ""
                  }
                ></span>

                <span
                  className={
                    requirementCount >= 2 ? "strength-active" : ""
                  }
                ></span>

                <span
                  className={
                    requirementCount >= 3 ? "strength-active" : ""
                  }
                ></span>
              </div>

              <div className="password-requirements">
                <span className={hasMinLength ? "valid" : ""}>
                  ✓ 8+ characters
                </span>

                <span className={hasNumber ? "valid" : ""}>
                  ✓ 1+ number
                </span>

                <span className={hasSymbol ? "valid" : ""}>
                  ✓ 1+ symbol (!@#$)
                </span>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="register-form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="register-input-wrapper">
              <LockKeyhole size={18} />

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />

            <span>
              I agree to the{" "}
              <a href="#terms">Terms &amp; Conditions</a> and{" "}
              <a href="#privacy">Privacy Policy</a>.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="register-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              "Creating Account..."
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Login */}
        <p className="login-link-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

        {/* Security */}
        <div className="security-badges">
          <div className="security-badge">
            <ShieldCheck size={17} />
            <span>256-bit Encryption</span>
          </div>

          <div className="security-badge">
            <ShieldCheck size={17} />
            <span>Instant Verification</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
