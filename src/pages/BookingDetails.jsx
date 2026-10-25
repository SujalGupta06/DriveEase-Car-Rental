
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Clock3,
  CreditCard,
  Fuel,
  MapPin,
  Receipt,
  Settings2,
  Users,
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./BookingDetails.css";

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchBooking = useCallback(async (showLoader = true) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/bookings/${id}`)}`
      );
      return;
    }

    try {
      if (showLoader) setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate(
          `/login?redirect=${encodeURIComponent(`/bookings/${id}`)}`
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load booking details."
        );
      }

      if (!data.booking) {
        throw new Error("Booking details were not found.");
      }

      setBooking(data.booking);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "bd-status-confirmed";
      case "Completed":
        return "bd-status-completed";
      case "Cancelled":
        return "bd-status-cancelled";
      default:
        return "bd-status-pending";
    }
  };

  const canCancel =
    booking &&
    ["Pending", "Confirmed"].includes(booking.bookingStatus);

  const handleCancelBooking = async () => {
    if (!booking || !canCancel || cancelLoading) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone."
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/bookings/${id}`)}`
      );
      return;
    }

    try {
      setCancelLoading(true);
      setActionError("");
      setSuccessMessage("");

      const response = await fetch(
        `http://localhost:5000/api/bookings/${id}/cancel`,
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

        navigate(
          `/login?redirect=${encodeURIComponent(`/bookings/${id}`)}`
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel this booking."
        );
      }

      // Refresh the booking from the backend so the status is current.
      await fetchBooking(false);

      setSuccessMessage(
        data.message || "Your booking has been cancelled successfully."
      );
    } catch (err) {
      setActionError(
        err.message || "Something went wrong while cancelling."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="bd-page">
          <div className="bd-message">
            <RefreshCw className="bd-spin" size={32} />
            <h2>Loading booking details...</h2>
            <p>Please wait while we retrieve your reservation.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <main className="bd-page">
          <div className="bd-message">
            <div className="bd-message-icon">
              <Receipt size={32} />
            </div>

            <h2>Unable to Load Booking</h2>
            <p>{error || "This booking could not be found."}</p>

            <div className="bd-message-actions">
              <button
                type="button"
                className="bd-primary-button"
                onClick={() => fetchBooking()}
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <Link
                to="/bookings"
                className="bd-secondary-button"
              >
                Back to My Bookings
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const car =
    booking.car && typeof booking.car === "object"
      ? booking.car
      : null;

  return (
    <>
      <Navbar />

      <main className="bd-page">
        <div className="bd-container">
          <Link to="/bookings" className="bd-back-link">
            <ArrowLeft size={17} />
            Back to My Bookings
          </Link>

          <header className="bd-header">
            <div>
              <p className="bd-eyebrow">YOUR RESERVATION</p>
              <h1>Booking Details</h1>
              <p className="bd-subtitle">
                Review your vehicle, trip schedule, and booking information.
              </p>
            </div>

            <span
              className={`bd-status ${getStatusClass(
                booking.bookingStatus || "Pending"
              )}`}
            >
              {booking.bookingStatus || "Pending"}
            </span>
          </header>

          {successMessage && (
            <div className="bd-feedback bd-feedback-success" role="status">
              <CheckCircle2 size={19} />
              <span>{successMessage}</span>
            </div>
          )}

          {actionError && (
            <div className="bd-feedback bd-feedback-error" role="alert">
              <AlertCircle size={19} />
              <span>{actionError}</span>
            </div>
          )}

          <section className="bd-reference-card">
            <div className="bd-reference-icon">
              <Receipt size={23} />
            </div>

            <div className="bd-reference-info">
              <span>Booking Reference</span>
              <strong>{booking._id}</strong>
            </div>

            <div className="bd-reference-date">
              <span>Booking Created</span>
              <strong>{formatDate(booking.createdAt)}</strong>
            </div>
          </section>

          <div className="bd-layout">
            <div className="bd-main-column">
              <section className="bd-card">
                <div className="bd-card-heading">
                  <CarFront size={21} />
                  <h2>Vehicle Information</h2>
                </div>

                <div className="bd-car-section">
                  <div className="bd-car-image">
                    {car?.image ? (
                      <img
                        src={car.image}
                        alt={car.name || "Rental car"}
                      />
                    ) : (
                      <CarFront size={55} />
                    )}
                  </div>

                  <div className="bd-car-info">
                    <h3>{car?.name || "Rental Car"}</h3>
                    <p>
                      {[car?.brand, car?.category]
                        .filter(Boolean)
                        .join(" • ") || "DriveEase vehicle"}
                    </p>

                    <div className="bd-car-specs">
                      <span>
                        <Users size={15} />
                        {car?.seats ?? "—"} Seats
                      </span>

                      <span>
                        <Fuel size={15} />
                        {car?.fuel || "—"}
                      </span>

                      <span>
                        <Settings2 size={15} />
                        {car?.transmission || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bd-card">
                <div className="bd-card-heading">
                  <CalendarDays size={21} />
                  <h2>Trip Schedule</h2>
                </div>

                <div className="bd-trip-list">
                  <div className="bd-trip-item">
                    <span className="bd-trip-marker bd-marker-pickup" />

                    <div className="bd-trip-content">
                      <span className="bd-trip-label">PICKUP</span>
                      <h3>
                        {booking.pickupLocation || "Not available"}
                      </h3>

                      <p>
                        <CalendarDays size={16} />
                        {formatDate(booking.pickupDate)}
                      </p>
                    </div>
                  </div>

                  <div className="bd-trip-item">
                    <span className="bd-trip-marker bd-marker-return" />

                    <div className="bd-trip-content">
                      <span className="bd-trip-label">RETURN</span>
                      <h3>
                        {booking.returnLocation || "Not available"}
                      </h3>

                      <p>
                        <CalendarDays size={16} />
                        {formatDate(booking.returnDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bd-duration">
                  <Clock3 size={18} />
                  <span>Rental Duration</span>
                  <strong>
                    {booking.totalDays || 0}{" "}
                    {(booking.totalDays || 0) === 1 ? "day" : "days"}
                  </strong>
                </div>
              </section>
            </div>

            <aside className="bd-sidebar">
              <section className="bd-card bd-summary-card">
                <div className="bd-card-heading">
                  <Receipt size={21} />
                  <h2>Booking Summary</h2>
                </div>

                <div className="bd-summary-row">
                  <span>Price per day</span>
                  <strong>{formatPrice(car?.pricePerDay)}</strong>
                </div>

                <div className="bd-summary-row">
                  <span>Rental duration</span>
                  <strong>{booking.totalDays || 0} days</strong>
                </div>

                <div className="bd-summary-row">
                  <span>Payment status</span>
                  <strong>{booking.paymentStatus || "Pending"}</strong>
                </div>

                <div className="bd-summary-total">
                  <span>Total Amount</span>
                  <strong>{formatPrice(booking.totalAmount)}</strong>
                </div>

                <div className="bd-payment-note">
                  <CreditCard size={18} />
                  <p>
                    Payment is currently{" "}
                    <strong>{booking.paymentStatus || "Pending"}</strong>.
                    This page does not process payments.
                  </p>
                </div>
              </section>

              <section className="bd-help-card">
                <MapPin size={21} />
                <h3>Ready for your trip?</h3>
                <p>
                  Review your pickup and return locations before your
                  rental begins.
                </p>

                <Link to="/bookings">
                  View all bookings <ArrowLeft size={15} />
                </Link>
              </section>
            </aside>
          </div>

          <div className="bd-bottom-actions">
            <Link
              to="/bookings"
              className="bd-secondary-button"
            >
              <ArrowLeft size={16} />
              Back to My Bookings
            </Link>

            <Link to="/cars" className="bd-primary-button">
              Browse More Cars
            </Link>

            {canCancel && (
              <button
                type="button"
                className="bd-cancel-button"
                onClick={handleCancelBooking}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <RefreshCw size={16} className="bd-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                {cancelLoading ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default BookingDetails;
