import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">D</span>
            DriveEase
          </Link>

          <p>
            Premium car rental made simple. Find your perfect car
            and enjoy every journey.
          </p>

          <div className="footer-socials">
            <a href="#instagram">Instagram</a>
            <a href="#facebook">Facebook</a>
            <a href="#linkedin">LinkedIn</a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/cars">Cars</Link>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        {/* Customer */}
        <div className="footer-column">
          <h3>Customer</h3>

          <Link to="/login">Login</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/bookings">My Bookings</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h3>Contact</h3>

          <p>Bhilai, Chhattisgarh</p>
          <p>India</p>
          <p>support@driveease.com</p>
          <p>+91 XXXXX XXXXX</p>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>
          © 2026 DriveEase. All rights reserved.
        </p>

        <div>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms & Conditions</a>
        </div>
      </div>

    </footer>
  );
}

export default Footer;