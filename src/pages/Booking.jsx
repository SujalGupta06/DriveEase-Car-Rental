
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  ShieldCheck,
  LoaderCircle,
  CircleAlert,
} from "lucide-react";
import "./Booking.css";

const API_URL = "http://localhost:5000/api";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState("idle");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [checkedDates, setCheckedDates] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    pickupLocation: "",
    returnLocation: "",
    pickupDate: "",
    returnDate: "",
  });

  const currentDatesKey = JSON.stringify([
    formData.pickupDate,
    formData.returnDate,
  ]);

  // Load selected car
  useEffect(() => {
    let active = true;

    const fetchCar = async () => {
      setLoadingCar(true);
      setError("");

      try {
        if (!id) {
          throw new Error("No car was selected. Please select a car first.");
        }

        const response = await fetch(`${API_URL}/cars/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load car details.");
        }

        if (active) {
          setCar(data.car || data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load the selected car.");
        }
      } finally {
        if (active) {
          setLoadingCar(false);
        }
      }
    };

    fetchCar();

    return () => {
      active = false;
    };
  }, [id]);

  // Update form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    // A date change invalidates the previous availability result.
    if (name === "pickupDate" || name === "returnDate") {
      setAvailabilityStatus("idle");
      setAvailabilityMessage("");
      setCheckedDates("");
    }
  };

  // Calculate rental duration
  const pickupTimestamp = formData.pickupDate
    ? new Date(formData.pickupDate).getTime()
    : NaN;

  const returnTimestamp = formData.returnDate
    ? new Date(formData.returnDate).getTime()
    : NaN;

  const totalDays =
    Number.isFinite(pickupTimestamp) &&
    Number.isFinite(returnTimestamp) &&
    returnTimestamp > pickupTimestamp
      ? Math.max(
          1,
          Math.ceil(
            (returnTimestamp - pickupTimestamp) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const pricePerDay = Number(
    car?.pricePerDay ?? car?.rentPerDay ?? car?.price ?? 0
  );

  const estimatedTotal = totalDays * pricePerDay;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  // Check availability for the selected dates
  const handleCheckAvailability = async () => {
    setError("");
    setAvailabilityStatus("idle");
    setAvailabilityMessage("");
    setCheckedDates("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!car?._id) {
      setError("Car details are unavailable. Please try again.");
      return;
    }

    if (!formData.pickupDate || !formData.returnDate) {
      setError("Please select both pickup and return dates first.");
      return;
    }

    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);

    if (
      Number.isNaN(pickup.getTime()) ||
      Number.isNaN(returnDate.getTime())
    ) {
      setError("Please enter valid pickup and return dates.");
      return;
    }

    if (pickup <= new Date()) {
      setError("Pickup date must be in the future.");
      return;
    }

    if (returnDate <= pickup) {
      setError("Return date must be after the pickup date.");
      return;
    }

    setCheckingAvailability(true);

    try {
      const params = new URLSearchParams({
        carId: car._id,
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
      });

      const response = await fetch(
        `${API_URL}/bookings/availability?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to check car availability."
        );
      }

      // Do not accept a result if the user changed dates while checking.
      if (
        JSON.stringify([
          formData.pickupDate,
          formData.returnDate,
        ]) !== currentDatesKey
      ) {
        return;
      }

      setCheckedDates(currentDatesKey);
      setAvailabilityStatus(data.available ? "available" : "unavailable");
      setAvailabilityMessage(
        data.message ||
          (data.available
            ? "Car is available for the selected dates."
            : "Car is unavailable for the selected dates.")
      );
    } catch (err) {
      setAvailabilityStatus("error");
      setAvailabilityMessage(
        err.message || "Unable to check car availability."
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Submit booking
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!car?._id) {
      setError("Car details are unavailable. Please try again.");
      return;
    }

    if (
      !formData.pickupLocation.trim() ||
      !formData.returnLocation.trim() ||
      !formData.pickupDate ||
      !formData.returnDate
    ) {
      setError("Please complete all booking fields.");
      return;
    }

    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);

    if (
      Number.isNaN(pickup.getTime()) ||
      Number.isNaN(returnDate.getTime())
    ) {
      setError("Please enter valid pickup and return dates.");
      return;
    }

    if (pickup <= new Date()) {
      setError("Pickup date must be in the future.");
      return;
    }

    if (returnDate <= pickup) {
      setError("Return date must be after the pickup date.");
      return;
    }

    if (
      availabilityStatus !== "available" ||
      checkedDates !== currentDatesKey
    ) {
      setError(
        "Please check availability for your selected dates before booking."
      );
      return;
    }

    setSubmitting(true);

    try {
      const bookingData = {
        car: car._id,
        pickupLocation: formData.pickupLocation.trim(),
        returnLocation: formData.returnLocation.trim(),
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
      };

      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        // The car may have been booked by another user after the check.
        if (response.status === 409) {
          setAvailabilityStatus("unavailable");
          setAvailabilityMessage(
            data.message ||
              "These dates are no longer available. Please choose other dates."
          );
          setCheckedDates("");
        }

        throw new Error(data.message || "Unable to create your booking.");
      }

      const createdBooking = data.booking;

      if (!createdBooking?._id) {
        throw new Error(
          "The server did not return the booking details. Please check My Bookings before trying again."
        );
      }

      sessionStorage.setItem(
        "latestBooking",
        JSON.stringify(createdBooking)
      );

      navigate("/booking-confirmation");
    } catch (err) {
      setError(
        err.message || "Something went wrong while creating your booking."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCar) {
    return (
      <main className="booking-page">
        <div className="booking-loading">
          <LoaderCircle size={32} className="booking-spinner" />
          <p>Loading car details...</p>
        </div>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="booking-page">
        <section className="booking-error-state">
          <CarFront size={42} />
          <h2>Car Not Available</h2>
          <p>{error || "We couldn't load this car."}</p>
          <Link to="/cars" className="booking-back-link">
            <ArrowLeft size={18} />
            Browse Cars
          </Link>
        </section>
      </main>
    );
  }

  const carName =
    [car.brand, car.name].filter(Boolean).join(" ") || "Rental Car";

  const carImage = car.image || car.imageUrl || car.imageURL || "";

  return (
    <main className="booking-page">
      <div className="booking-container">
        <Link to={`/cars/${car._id}`} className="booking-back-link">
          <ArrowLeft size={18} />
          Back to Car Details
        </Link>

        <header className="booking-header">
          <span className="booking-eyebrow">DRIVEEASE RENTALS</span>
          <h1>Complete Your Booking</h1>
          <p>
            Choose your trip details and review your rental before
            submitting your reservation.
          </p>
        </header>

        <div className="booking-layout">
          {/* Booking form */}
          <section className="booking-form-card">
            <div className="booking-section-heading">
              <div className="booking-heading-icon">
                <CalendarDays size={22} />
              </div>

              <div>
                <h2>Your Trip Details</h2>
                <p>Enter your pickup and return information.</p>
              </div>
            </div>

            {error && (
              <div className="booking-error-message" role="alert">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="booking-field">
                <label htmlFor="pickupLocation">
                  <MapPin size={17} />
                  Pickup Location
                </label>

                <input
                  id="pickupLocation"
                  name="pickupLocation"
                  type="text"
                  placeholder="Enter pickup city or location"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="booking-field">
                <label htmlFor="returnLocation">
                  <MapPin size={17} />
                  Return Location
                </label>

                <input
                  id="returnLocation"
                  name="returnLocation"
                  type="text"
                  placeholder="Enter return city or location"
                  value={formData.returnLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="booking-date-grid">
                <div className="booking-field">
                  <label htmlFor="pickupDate">
                    <CalendarDays size={17} />
                    Pickup Date &amp; Time
                  </label>

                  <input
                    id="pickupDate"
                    name="pickupDate"
                    type="datetime-local"
                    value={formData.pickupDate}
                    min={new Date(Date.now() + 60000)
                      .toISOString()
                      .slice(0, 16)}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="returnDate">
                    <CalendarDays size={17} />
                    Return Date &amp; Time
                  </label>

                  <input
                    id="returnDate"
                    name="returnDate"
                    type="datetime-local"
                    value={formData.returnDate}
                    min={formData.pickupDate || undefined}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {totalDays > 0 && (
                <div className="booking-duration">
                  <Clock size={18} />
                  <span>
                    Rental duration: <strong>{totalDays} day(s)</strong>
                  </span>
                </div>
              )}

              {/* New availability check section */}
              <div style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="booking-submit-button"
                  onClick={handleCheckAvailability}
                  disabled={checkingAvailability || submitting}
                >
                  {checkingAvailability ? (
                    <>
                      <LoaderCircle
                        size={19}
                        className="booking-spinner"
                      />
                      Checking Availability...
                    </>
                  ) : (
                    <>
                      Check Availability
                      <CalendarDays size={19} />
                    </>
                  )}
                </button>

                {availabilityMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      marginTop: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      background:
                        availabilityStatus === "available"
                          ? "#ecfdf3"
                          : "#fef2f2",
                      color:
                        availabilityStatus === "available"
                          ? "#166534"
                          : "#991b1b",
                    }}
                  >
                    {availabilityStatus === "available" ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <CircleAlert size={19} />
                    )}
                    <span>{availabilityMessage}</span>
                  </div>
                )}
              </div>

              <div className="booking-submit-area">
                <button
                  type="submit"
                  className="booking-submit-button"
                  disabled={
                    submitting ||
                    checkingAvailability ||
                    availabilityStatus !== "available" ||
                    checkedDates !== currentDatesKey
                  }
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        size={19}
                        className="booking-spinner"
                      />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <CheckCircle2 size={19} />
                    </>
                  )}
                </button>

                <p className="booking-secure-note">
                  <ShieldCheck size={16} />
                  Your reservation will be submitted securely.
                </p>
              </div>
            </form>
          </section>

          {/* Selected car and price summary */}
          <aside className="booking-summary-card">
            <h2>Booking Summary</h2>

            <div className="booking-summary-car">
              {carImage ? (
                <img src={carImage} alt={carName} />
              ) : (
                <div className="booking-image-placeholder">
                  <CarFront size={42} />
                </div>
              )}

              <div>
                <span>{car.brand || "DriveEase"}</span>
                <h3>{carName}</h3>
                <p>{car.category || car.type || "Rental Car"}</p>
              </div>
            </div>

            <div className="booking-summary-features">
              {car.seats != null && <span>{car.seats} Seats</span>}
              {car.fuelType && <span>{car.fuelType}</span>}
              {car.transmission && <span>{car.transmission}</span>}
            </div>

            <div className="booking-summary-divider" />

            <div className="booking-summary-row">
              <span>Price per day</span>
              <strong>{formatCurrency(pricePerDay)}</strong>
            </div>

            <div className="booking-summary-row">
              <span>Rental duration</span>
              <strong>
                {totalDays > 0 ? `${totalDays} day(s)` : "Not selected"}
              </strong>
            </div>

            <div className="booking-summary-divider" />

            <div className="booking-summary-total">
              <span>Estimated Total</span>
              <strong>
                {totalDays > 0
                  ? formatCurrency(estimatedTotal)
                  : formatCurrency(0)}
              </strong>
            </div>

            <p className="booking-price-note">
              Final rental charges are calculated and validated by
              the server when your booking is created.
            </p>

            <div className="booking-summary-security">
              <CreditCard size={19} />
              <span>Payment status will be shown with your booking.</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Booking;
