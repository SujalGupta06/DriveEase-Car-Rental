
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  CarFront,
  Fuel,
  Gauge,
  MapPin,
  Clock3,
  Users,
  CreditCard,
  Receipt,
  Headphones,
  Home,
  BadgeCheck,
} from "lucide-react";
import "./BookingConfirmation.css";

const API_URL = "https://driveease-api-4zbo.onrender.com/api";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCarName = (car) => {
  if (!car) return "Rental Car";

  return [car.brand, car.name].filter(Boolean).join(" ") || "Rental Car";
};

function BookingConfirmation() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadBooking = async () => {
      let savedBooking = null;

      // Load the booking saved after successful booking creation.
      try {
        const saved = sessionStorage.getItem("latestBooking");

        if (saved) {
          savedBooking = JSON.parse(saved);

          if (active) {
            setBooking(savedBooking);
          }
        }
      } catch (error) {
        console.error("Unable to load saved booking:", error);
      }

      // Refresh the booking using the backend.
      const bookingId = savedBooking?._id;
      const token = localStorage.getItem("token");

      if (bookingId && token) {
        try {
          const response = await fetch(
            `${API_URL}/bookings/${bookingId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Unable to refresh booking details.");
          }

          const data = await response.json();

          if (active && data.booking) {
            setBooking(data.booking);

            sessionStorage.setItem(
              "latestBooking",
              JSON.stringify(data.booking)
            );
          }
        } catch (error) {
          // Keep the saved booking visible if the refresh fails.
          console.error("Unable to refresh booking:", error);
        }
      }

      if (active) {
        setLoading(false);
      }
    };

    loadBooking();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="dc-page">
        <div className="dc-empty">
          <div className="dc-success-icon">
            <CheckCircle2 size={36} />
          </div>
          <h2>Loading your booking...</h2>
          <p>Please wait while we retrieve your reservation details.</p>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="dc-page">
        <header className="dc-header">
          <Link to="/" className="dc-home-link">
            <CarFront size={25} />
            <span>DriveEase</span>
          </Link>
        </header>

        <section className="dc-empty">
          <div className="dc-success-icon">
            <Receipt size={36} />
          </div>

          <h1>No Recent Booking Found</h1>

          <p>
            We couldn't find a recent booking on this page. You can
            check your bookings or explore available cars.
          </p>

          <div className="dc-actions">
            <Link to="/bookings" className="dc-button dc-button-primary">
              View My Bookings
              <ArrowRight size={18} />
            </Link>

            <Link to="/cars" className="dc-button dc-button-secondary">
              Browse Cars
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const bookingStatus = booking.bookingStatus || "Pending";
  const paymentStatus = booking.paymentStatus || "Pending";

  const isConfirmed = bookingStatus === "Confirmed";

  const statusClass = {
    Confirmed: "dc-status-confirmed",
    Pending: "dc-status-pending",
    Cancelled: "dc-status-cancelled",
    Completed: "dc-status-completed",
  }[bookingStatus] || "dc-status-pending";

  const confirmationTitle = {
    Confirmed: "Booking Confirmed!",
    Pending: "Booking Received!",
    Cancelled: "Booking Cancelled",
    Completed: "Trip Completed!",
  }[bookingStatus] || "Booking Details";

  const statusDescription = {
    Confirmed:
      "Your reservation is confirmed. Keep your booking reference for future use.",
    Pending:
      "Your booking has been received and is awaiting confirmation.",
    Cancelled:
      "This reservation has been cancelled. Review your booking details below.",
    Completed:
      "Your rental trip is complete. You can review your booking details below.",
  }[bookingStatus] ||
    "Your rental booking details are available below.";

  const car = booking.car || {};

  const carName = getCarName(car);

  const bookingReference =
    booking._id || booking.bookingId || "Not available";

  const totalAmount = Number(booking.totalAmount) || 0;

  const totalDays =
    Number(booking.totalDays) ||
    (booking.pickupDate && booking.returnDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(booking.returnDate).getTime() -
              new Date(booking.pickupDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 1);

  const dailyRate = Number(car.pricePerDay) || 0;

  const pickupDate = booking.pickupDate;
  const returnDate = booking.returnDate;

  const carImage =
    car.image ||
    car.imageUrl ||
    car.imageURL ||
    "";

  return (
    <main className="dc-page">
      {/* Header */}
      <header className="dc-header">
        <Link to="/" className="dc-home-link">
          <CarFront size={25} />
          <span>DriveEase</span>
        </Link>

        <Link to="/" className="dc-home-link">
          <Home size={18} />
          <span>Home</span>
        </Link>
      </header>

      {/* Confirmation heading */}
      <section className="dc-confirmation">
        <div className="dc-success-icon">
          {bookingStatus === "Cancelled" ? (
            <Receipt size={38} />
          ) : (
            <CheckCircle2 size={42} />
          )}
        </div>

        <h1>{confirmationTitle}</h1>

        <p className="dc-subtitle">{statusDescription}</p>

        <div className={`dc-status ${statusClass}`}>
          <span />
          {bookingStatus}
        </div>
      </section>

      {/* Booking information */}
      <section className="dc-content">
        <div className="dc-main-card">
          <div className="dc-card-heading">
            <div>
              <h2>Your Rental Details</h2>
              <p>Review the information for your reservation.</p>
            </div>

            <BadgeCheck size={25} />
          </div>

          {/* Car details */}
          <div className="dc-car-card">
            {carImage ? (
              <img
                src={carImage}
                alt={carName}
                className="dc-car-image"
              />
            ) : (
              <div className="dc-car-image dc-car-image-placeholder">
                <CarFront size={56} />
              </div>
            )}

            <div className="dc-car-info">
              <span className="dc-car-brand">
                {car.brand || "DriveEase"}
              </span>

              <h3>{carName}</h3>

              <p>
                {car.category || car.type || "Rental Vehicle"}
              </p>

              <div className="dc-car-features">
                {car.seats != null && (
                  <span>
                    <Users size={16} />
                    {car.seats} Seats
                  </span>
                )}

                {car.fuelType && (
                  <span>
                    <Fuel size={16} />
                    {car.fuelType}
                  </span>
                )}

                {car.transmission && (
                  <span>
                    <Gauge size={16} />
                    {car.transmission}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pickup and return */}
          <div className="dc-section">
            <h3 className="dc-section-title">
              <CalendarDays size={20} />
              Trip Schedule
            </h3>

            <div className="dc-trip-grid">
              <div className="dc-trip-item">
                <span className="dc-trip-label">Pickup</span>

                <div className="dc-trip-location">
                  <MapPin size={18} />
                  <strong>
                    {booking.pickupLocation || "Not specified"}
                  </strong>
                </div>

                <p>{formatDate(pickupDate)}</p>

                {formatTime(pickupDate) && (
                  <span className="dc-trip-time">
                    <Clock3 size={15} />
                    {formatTime(pickupDate)}
                  </span>
                )}
              </div>

              <div className="dc-trip-item">
                <span className="dc-trip-label">Return</span>

                <div className="dc-trip-location">
                  <MapPin size={18} />
                  <strong>
                    {booking.returnLocation ||
                      booking.pickupLocation ||
                      "Not specified"}
                  </strong>
                </div>

                <p>{formatDate(returnDate)}</p>

                {formatTime(returnDate) && (
                  <span className="dc-trip-time">
                    <Clock3 size={15} />
                    {formatTime(returnDate)}
                  </span>
                )}
              </div>
            </div>

            <div className="dc-duration">
              <Clock3 size={18} />
              <span>
                Rental Duration: <strong>{totalDays} day(s)</strong>
              </span>
            </div>
          </div>

          {/* Payment information */}
          <div className="dc-section">
            <h3 className="dc-section-title">
              <CreditCard size={20} />
              Payment Information
            </h3>

            <div className="dc-price-row">
              <span>Rental duration</span>
              <span>{totalDays} day(s)</span>
            </div>

            {dailyRate > 0 && (
              <div className="dc-price-row">
                <span>Price per day</span>
                <span>{formatCurrency(dailyRate)}</span>
              </div>
            )}

            <div className="dc-price-row dc-total-row">
              <strong>Total Amount</strong>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <div className="dc-payment-status">
              <span>Payment Status</span>

              <strong
                className={
                  paymentStatus.toLowerCase() === "paid"
                    ? "dc-payment-paid"
                    : "dc-payment-pending"
                }
              >
                {paymentStatus}
              </strong>
            </div>
          </div>

          {/* Booking reference */}
          <div className="dc-reference">
            <div>
              <span>Booking Reference</span>
              <strong>{bookingReference}</strong>
            </div>

            <Receipt size={22} />
          </div>
        </div>

        {/* Help and next steps */}
        <aside className="dc-side-card">
          <div className="dc-side-icon">
            <Headphones size={27} />
          </div>

          <h3>Need Help?</h3>

          <p>
            You can review your reservation and check its latest
            status from your bookings dashboard.
          </p>

          <Link to="/bookings" className="dc-button dc-button-secondary">
            View My Bookings
            <ArrowRight size={18} />
          </Link>
        </aside>
      </section>

      {/* Actions */}
      <nav className="dc-actions">
        {booking._id && (
          <Link
            to={`/bookings/${booking._id}`}
            className="dc-button dc-button-primary"
          >
            <Receipt size={19} />
            View Booking Details
          </Link>
        )}

        <Link
          to="/bookings"
          className="dc-button dc-button-secondary"
        >
          View My Bookings
        </Link>

        <Link
          to="/cars"
          className="dc-button dc-button-secondary"
        >
          Browse More Cars
        </Link>
      </nav>

      {/* Support tray */}
      <footer className="dc-footer">
        <p>
          Thank you for choosing <strong>DriveEase</strong>.
          Drive safe and enjoy your journey!
        </p>

        <Link to="/" className="dc-footer-link">
          Back to Home
        </Link>
      </footer>
    </main>
  );
}

export default BookingConfirmation;
