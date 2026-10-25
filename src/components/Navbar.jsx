import { Link } from "react-router-dom";
import { User } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">D</div>
          <span>DriveEase</span>
        </Link>

        {/* Navigation */}
        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/cars">Cars</Link>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        {/* Right Side */}
        <div className="navbar-actions">

          <button className="language-btn">
            EN / ₹
          </button>

          <Link to="/login" className="login-btn">
            Log In
          </Link>

          <Link to="/register" className="signup-btn">
            Sign Up
          </Link>

          <Link to="/dashboard" className="profile-btn">
            <User size={18} />
          </Link>

        </div>

      </div>
    </header>
  );
}

export default Navbar;