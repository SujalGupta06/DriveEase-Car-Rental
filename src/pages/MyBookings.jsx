
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CarFront,
  Clock3,
  MapPin,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  XCircle,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./MyBookings.css";

const API_URL = "http://localhost:5000/api";

const FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login?redirect=%2Fbookings");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/bookings/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login?redirect=%2Fbookings");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      setError(err.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const getStatus = (booking) => booking.bookingStatus || "Pending";

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "my-booking-status-confirmed";
      case "Completed":
        return "my-booking-status-completed";
      case "Cancelled":
        return "my-booking-status-cancelled";
      default:
        return "my-booking-status-pending";
    }
  };

  const bookingCounts = useMemo(() => {
    const counts = {
      All: bookings.length,
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0,
    };

    bookings.forEach((booking) => {
      const status = getStatus(booking);

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeFilter === "All") return bookings;

    return bookings.filter(
      (booking) => getStatus(booking) === activeFilter
    );
  }, [bookings, activeFilter]);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login?redirect=%2Fbookings");
      return;
    }

    try {
      setCancellingId(bookingId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login?redirect=%2Fbookings");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking.");
      }

      setSuccess("Your booking has been cancelled successfully.");

      await fetchBookings();
    } catch (err) {
      setError(err.message || "Unable to cancel booking.");
    } finally {
      setCancellingId("");
    }
  };

  const handleRefresh = async () => {
    setSuccess("");
    await fetchBookings();
  };

  return (
    <>
      <Navbar />

      <main className="my-bookings-page">
        <div className="my-bookings-container">
          <header className="my-bookings-header">
            <div>
              <p className="my-bookings-eyebrow">
                YOUR DRIVE EASE ACCOUNT
              </p>

              <h1>My Bookings</h1>

              <p className="my-bookings-subtitle">
                Manage your reservations and keep track of your trips.
              </p>
            </div>

            <button
              type="button"
              className="my-bookings-refresh"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "my-bookings-spinning" : ""}
              />
              Refresh
            </button>
          </header>

          <section className="my-bookings-summary">
            <div className="my-bookings-summary-icon">
              <ClipboardList size={24} />
            </div>

            <div>
              <span>Total Reservations</span>
              <strong>{bookings.length}</strong>
            </div>
          </section>

          {success && (
            <div
              className="my-bookings-feedback my-bookings-success"
              role="status"
            >
              <CheckCircle2 size={19} />
              <span>{success}</span>
              <button
                type="button"
                aria-label="Dismiss success message"
                onClick={() => setSuccess("")}
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="my-bookings-error" role="alert">
              <span>{error}</span>

              <button type="button" onClick={handleRefresh}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <section
              className="my-bookings-filters"
              aria-label="Filter bookings by status"
            >
              <div className="my-bookings-filters-heading">
                <h2>All Reservations</h2>
                <span>{filteredBookings.length} booking(s)</span>
              </div>

              <div className="my-bookings-filter-list">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`my-bookings-filter ${
                      activeFilter === filter
                        ? "my-bookings-filter-active"
                        : ""
                    }`}
                    onClick={() => setActiveFilter(filter)}
                    aria-pressed={activeFilter === filter}
                  >
                    {filter}
                    <span>{bookingCounts[filter]}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {loading ? (
            <div className="my-bookings-message">
              <RefreshCw
                size={28}
                className="my-bookings-spinning"
              />
              <h2>Loading your bookings...</h2>
              <p>Please wait while we retrieve your reservations.</p>
            </div>
          ) : error && bookings.length === 0 ? (
            <div className="my-bookings-message">
              <AlertCircle size={32} />
              <h2>Unable to display bookings</h2>
              <p>
                Please check your connection and try loading your
                reservations again.
              </p>
              <button
                type="button"
                className="my-bookings-primary-button"
                onClick={handleRefresh}
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="my-bookings-empty">
              <div className="my-bookings-empty-icon">
                <CarFront size={42} />
              </div>

              <h2>No bookings yet</h2>

              <p>
                Your reservations will appear here after you book a car
                with DriveEase.
              </p>

              <Link
                to="/cars"
                className="my-bookings-primary-button"
              >
                Explore Cars <ArrowRight size={18} />
              </Link>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="my-bookings-empty">
              <div className="my-bookings-empty-icon">
                <ClipboardList size={38} />
              </div>

              <h2>No {activeFilter.toLowerCase()} bookings</h2>

              <p>
                You don't have any bookings with this status right now.
                Select another filter to see your reservations.
              </p>

              <button
                type="button"
                className="my-bookings-primary-button"
                onClick={() => setActiveFilter("All")}
              >
                View All Bookings <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <section className="my-bookings-list">
              {filteredBookings.map((booking) => {
                const car =
                  booking.car && typeof booking.car === "object"
                    ? booking.car
                    : null;

                const status = getStatus(booking);

                const canCancel =
                  status !== "Cancelled" &&
                  status !== "Completed";

                return (
                  <article
                    className="my-booking-card"
                    key={booking._id}
                  >
                    <div className="my-booking-card-top">
                      <div className="my-booking-reference">
                        <span>BOOKING REFERENCE</span>
                        <strong>#{booking._id}</strong>
                      </div>

                      <span
                        className={`my-booking-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="my-booking-main">
                      <div className="my-booking-image">
                        {car?.image ? (
                          <img
                            src={car.image}
                            alt={car.name || "Booked car"}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <CarFront size={42} />
                        )}
                      </div>

                      <div className="my-booking-car-info">
                        <h2>{car?.name || "Rental Car"}</h2>

                        <p>
                          {[car?.brand, car?.category]
                            .filter(Boolean)
                            .join(" • ") || "DriveEase vehicle"}
                        </p>

                        <div className="my-booking-location">
                          <MapPin size={15} />
                          <span>
                            {booking.pickupLocation ||
                              "Pickup location N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="my-booking-total">
                        <span>Total Amount</span>
                        <strong>
                          {formatPrice(booking.totalAmount)}
                        </strong>
                        <small>
                          {booking.totalDays || 0} day(s)
                        </small>
                      </div>
                    </div>

                    <div className="my-booking-dates">
                      <div>
                        <CalendarDays size={17} />
                        <div>
                          <span>Pickup Date</span>
                          <strong>
                            {formatDate(booking.pickupDate)}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <CalendarDays size={17} />
                        <div>
                          <span>Return Date</span>
                          <strong>
                            {formatDate(booking.returnDate)}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <Clock3 size={17} />
                        <div>
                          <span>Payment</span>
                          <strong>
                            {booking.paymentStatus || "Pending"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="my-booking-card-actions">
                      <Link
                        to={`/bookings/${booking._id}`}
                        className="my-booking-details-button"
                      >
                        View Details <ArrowRight size={16} />
                      </Link>

                      {canCancel && (
                        <button
                          type="button"
                          className="my-booking-cancel-button"
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancellingId === booking._id}
                        >
                          <XCircle size={16} />
                          {cancellingId === booking._id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          <div className="my-bookings-back-link">
            <Link to="/cars">
              <ArrowLeft size={16} />
              Browse available cars
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default MyBookings;
