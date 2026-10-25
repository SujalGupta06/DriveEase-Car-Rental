
import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  XCircle,
  Gauge,
  LayoutDashboard,
  UserRound,
  LogOut,
  House,
  Menu,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./UserDashboard.css";

const API_URL = "http://localhost:5000/api";

function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login?redirect=%2Fdashboard");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [bookingResponse, profileResponse] = await Promise.all([
        fetch(`${API_URL}/bookings/my`, { headers }),
        fetch(`${API_URL}/users/profile`, { headers }),
      ]);

      if (
        bookingResponse.status === 401 ||
        profileResponse.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login?redirect=%2Fdashboard");
        return;
      }

      const bookingData = await bookingResponse.json();
      const profileData = await profileResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(
          bookingData.message || "Unable to load your bookings."
        );
      }

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || "Unable to load your profile."
        );
      }

      const bookingList = Array.isArray(bookingData)
        ? bookingData
        : bookingData.bookings;

      if (!Array.isArray(bookingList)) {
        throw new Error("The server returned invalid booking data.");
      }

      setBookings(bookingList);

      const profile =
        profileData.user ||
        profileData.profile ||
        profileData.customer ||
        profileData;

      setUser(profile);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const statusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "ud-status-confirmed";
      case "Completed":
        return "ud-status-completed";
      case "Cancelled":
        return "ud-status-cancelled";
      default:
        return "ud-status-pending";
    }
  };

  const now = new Date();

  const activeBookings = bookings.filter((booking) =>
    ["Pending", "Confirmed"].includes(booking.bookingStatus)
  );

  const upcomingBookings = bookings.filter((booking) => {
    const pickup = new Date(booking.pickupDate);

    return (
      ["Pending", "Confirmed"].includes(booking.bookingStatus) &&
      !Number.isNaN(pickup.getTime()) &&
      pickup >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
    );
  });

  const completedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Completed"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.bookingStatus === "Cancelled"
  );

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.pickupDate) -
        new Date(a.createdAt || a.pickupDate)
    )
    .slice(0, 4);

  const displayName =
    user?.fullName || user?.name || user?.email || "Customer";

  const firstName =
    displayName.trim().split(/\s+/)[0] || "Customer";

  const avatarInitials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "C";

  const Sidebar = () => (
    <>
      <aside
        className={`ud-sidebar ${
          sidebarOpen ? "ud-sidebar-open" : ""
        }`}
      >
        <div className="ud-sidebar-heading">
          <Link
            to="/"
            className="ud-sidebar-brand"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="ud-brand-icon">D</span>
            <span>DriveEase</span>
          </Link>

          <button
            type="button"
            className="ud-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <p className="ud-sidebar-label">CUSTOMER MENU</p>

        <nav className="ud-sidebar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `ud-nav-link ${isActive ? "ud-nav-active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/cars"
            className={({ isActive }) =>
              `ud-nav-link ${isActive ? "ud-nav-active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <CarFront size={19} />
            <span>Explore Cars</span>
          </NavLink>

          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `ud-nav-link ${isActive ? "ud-nav-active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarDays size={19} />
            <span>My Bookings</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `ud-nav-link ${isActive ? "ud-nav-active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <UserRound size={19} />
            <span>My Profile</span>
          </NavLink>

          <Link
            to="/"
            className="ud-nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <House size={19} />
            <span>Back to Home</span>
          </Link>
        </nav>

        <div className="ud-sidebar-account">
          <div className="ud-sidebar-avatar">{avatarInitials}</div>
          <div className="ud-sidebar-user">
            <strong>{firstName}</strong>
            <span>Customer account</span>
          </div>
        </div>

        <button
          type="button"
          className="ud-sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>

      <button
        type="button"
        aria-label="Close navigation overlay"
        className={`ud-sidebar-overlay ${
          sidebarOpen ? "ud-overlay-visible" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      />
    </>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="ud-page">
          <div className="ud-layout">
            <Sidebar />
            <div className="ud-container">
              <button
                type="button"
                className="ud-mobile-menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} /> Menu
              </button>

              <div className="ud-state-card">
                <RefreshCw className="ud-spin" size={30} />
                <h2>Loading your dashboard...</h2>
                <p>Fetching your account and reservation details.</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="ud-page">
          <div className="ud-layout">
            <Sidebar />
            <div className="ud-container">
              <button
                type="button"
                className="ud-mobile-menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} /> Menu
              </button>

              <div className="ud-state-card">
                <XCircle size={36} />
                <h2>Unable to load dashboard</h2>
                <p>{error}</p>

                <button
                  className="ud-primary-button"
                  onClick={fetchDashboard}
                  type="button"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="ud-page">
        <div className="ud-layout">
          <Sidebar />

          <div className="ud-container">
            <button
              type="button"
              className="ud-mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
              Menu
            </button>

            <section className="ud-welcome">
              <div>
                <p className="ud-eyebrow">
                  YOUR DRIVE EASE ACCOUNT
                </p>

                <h1>Welcome back, {firstName}!</h1>

                <p>
                  Manage your reservations and get ready for your next journey.
                </p>
              </div>

              <Link to="/cars" className="ud-primary-button">
                <CarFront size={18} />
                Explore Cars
              </Link>
            </section>

            <section className="ud-profile-strip">
              <div
                className="ud-avatar"
                aria-label={`${displayName}'s avatar`}
                title={displayName}
              >
                {avatarInitials}
              </div>

              <div className="ud-profile-info">
                <strong>
                  {user?.fullName || user?.name || "DriveEase Customer"}
                </strong>
                <span>{user?.email || "Email not available"}</span>
              </div>

              <Link to="/profile" className="ud-profile-link">
                View Profile <ArrowRight size={15} />
              </Link>
            </section>

            <section className="ud-stats-grid">
              <article className="ud-stat-card">
                <div className="ud-stat-icon ud-icon-blue">
                  <CalendarDays size={22} />
                </div>
                <span>Total Bookings</span>
                <strong>{bookings.length}</strong>
                <small>All your reservations</small>
              </article>

              <article className="ud-stat-card">
                <div className="ud-stat-icon ud-icon-orange">
                  <Clock3 size={22} />
                </div>
                <span>Upcoming Trips</span>
                <strong>{upcomingBookings.length}</strong>
                <small>Pending or confirmed</small>
              </article>

              <article className="ud-stat-card">
                <div className="ud-stat-icon ud-icon-green">
                  <CheckCircle2 size={22} />
                </div>
                <span>Completed</span>
                <strong>{completedBookings.length}</strong>
                <small>Finished rentals</small>
              </article>

              <article className="ud-stat-card">
                <div className="ud-stat-icon ud-icon-red">
                  <XCircle size={22} />
                </div>
                <span>Cancelled</span>
                <strong>{cancelledBookings.length}</strong>
                <small>Cancelled reservations</small>
              </article>
            </section>

            <section className="ud-section">
              <div className="ud-section-heading">
                <div>
                  <h2>Recent Bookings</h2>
                  <p>Your latest car rental reservations.</p>
                </div>

                <Link to="/bookings" className="ud-view-all">
                  View All <ArrowRight size={16} />
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="ud-empty-card">
                  <div className="ud-empty-icon">
                    <CarFront size={30} />
                  </div>

                  <h3>No bookings yet</h3>
                  <p>
                    Your reservations will appear here after you book a car.
                  </p>

                  <Link to="/cars" className="ud-primary-button">
                    Browse Available Cars
                  </Link>
                </div>
              ) : (
                <div className="ud-bookings-list">
                  {recentBookings.map((booking) => {
                    const car =
                      booking.car && typeof booking.car === "object"
                        ? booking.car
                        : null;

                    return (
                      <article
                        className="ud-booking-card"
                        key={booking._id}
                      >
                        <div className="ud-booking-image">
                          {car?.image ? (
                            <img
                              src={car.image}
                              alt={car.name || "Rental car"}
                            />
                          ) : (
                            <CarFront size={35} />
                          )}
                        </div>

                        <div className="ud-booking-main">
                          <div className="ud-booking-title-row">
                            <h3>{car?.name || "Rental Car"}</h3>

                            <span
                              className={`ud-status ${statusClass(
                                booking.bookingStatus
                              )}`}
                            >
                              {booking.bookingStatus || "Pending"}
                            </span>
                          </div>

                          <span className="ud-booking-reference">
                            Booking ID: {booking._id}
                          </span>

                          <div className="ud-booking-details">
                            <span>
                              <CalendarDays size={15} />
                              {formatDate(booking.pickupDate)} –{" "}
                              {formatDate(booking.returnDate)}
                            </span>

                            <span>
                              <MapPin size={15} />
                              {booking.pickupLocation ||
                                "Location unavailable"}
                            </span>
                          </div>
                        </div>

                        <div className="ud-booking-side">
                          <strong>
                            {formatPrice(booking.totalAmount)}
                          </strong>
                          <span>
                            {booking.totalDays || 0} rental days
                          </span>

                          <Link
                            to={`/bookings/${booking._id}`}
                            className="ud-details-link"
                          >
                            View Details <ArrowRight size={15} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="ud-bottom-grid">
              <div className="ud-shortcut-card">
                <div className="ud-shortcut-icon">
                  <CarFront size={23} />
                </div>

                <h3>Find Your Next Ride</h3>
                <p>
                  Explore our fleet and find a car for your next trip.
                </p>

                <Link to="/cars">
                  Browse Cars <ArrowRight size={16} />
                </Link>
              </div>

              <div className="ud-shortcut-card">
                <div className="ud-shortcut-icon ud-shortcut-purple">
                  <Gauge size={23} />
                </div>

                <h3>Manage Reservations</h3>
                <p>
                  Review your bookings and check their latest status.
                </p>

                <Link to="/bookings">
                  My Bookings <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            <div className="ud-dashboard-footer">
              <span>
                Active reservations:{" "}
                <strong>{activeBookings.length}</strong>
              </span>

              <button
                type="button"
                onClick={fetchDashboard}
                className="ud-refresh-button"
              >
                <RefreshCw size={15} />
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default UserDashboard;
