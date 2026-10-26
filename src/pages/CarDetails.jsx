import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CarDetails.css";

const API_URL = "https://driveease-api-4zbo.onrender.com/api/cars";

function CarDetails() {
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CAR DETAILS
  // ==========================================
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch car");
        }

        setCar(data.car);
      } catch (error) {
        console.error("Fetch car error:", error);
        setError(error.message || "Unable to load car details");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <>
        <Navbar />

        <main className="car-details-page">
          <div className="car-not-found">
            <h2>Loading Car Details...</h2>

            <p>
              Please wait while we load the vehicle information.
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // ERROR / CAR NOT FOUND
  // ==========================================
  if (error || !car) {
    return (
      <>
        <Navbar />

        <main className="car-details-page">
          <div className="car-not-found">
            <h2>Car Not Found</h2>

            <p>
              {error || "The car you are looking for does not exist."}
            </p>

            <Link to="/cars" className="back-cars-btn">
              Back to Cars
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // CAR DETAILS PAGE
  // ==========================================
  return (
    <>
      <Navbar />

      <main className="car-details-page">
        <div className="car-details-container">

          {/* ==========================================
              BREADCRUMB
          ========================================== */}
          <div className="car-details-breadcrumb">
            <Link to="/">Home</Link>

            <span>/</span>

            <Link to="/cars">Cars</Link>

            <span>/</span>

            <span>{car.name}</span>
          </div>


          {/* ==========================================
              MAIN DETAILS
          ========================================== */}
          <section className="car-details-main">

            {/* LEFT - CAR IMAGE */}
            <div className="car-details-image">

              <img
                src={car.image}
                alt={car.name}
              />

              <span className="car-details-category">
                {car.category}
              </span>

            </div>


            {/* RIGHT - CAR INFORMATION */}
            <div className="car-details-info">

              {/* Rating */}
              <div className="car-details-rating">
                ★ {car.rating || "4.8"}
              </div>


              {/* Brand */}
              <p className="car-details-brand">
                {car.brand}
              </p>


              {/* Car Name */}
              <h1>{car.name}</h1>


              {/* Description */}
              <p className="car-details-description">
                {car.description ||
                  `Comfortable and reliable ${car.name} available for rent. Perfect for city rides, family trips, and long journeys.`}
              </p>


              {/* ==========================================
                  SPECIFICATIONS
              ========================================== */}
              <div className="car-details-specs">

                {/* Seats */}
                <div className="detail-spec">
                  <span>Seats</span>

                  <strong>
                    {car.seats}
                  </strong>
                </div>


                {/* Fuel */}
                <div className="detail-spec">
                  <span>Fuel</span>

                  <strong>
                    {car.fuel}
                  </strong>
                </div>


                {/* Transmission */}
                <div className="detail-spec">
                  <span>Transmission</span>

                  <strong>
                    {car.transmission}
                  </strong>
                </div>


                {/* Category */}
                <div className="detail-spec">
                  <span>Category</span>

                  <strong>
                    {car.category}
                  </strong>
                </div>

              </div>


              {/* ==========================================
                  PRICE
              ========================================== */}
              <div className="car-details-price">

                <span>
                  Starting from
                </span>

                <div>

                  <strong>
                    ₹
                    {Number(car.pricePerDay).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <span>
                    / day
                  </span>

                </div>

              </div>


              {/* ==========================================
                  AVAILABILITY
              ========================================== */}
              <div className="car-availability-details">

                {car.available ? (
                  <span>
                    ✓ Available for booking
                  </span>
                ) : (
                  <span>
                    ✕ Currently unavailable
                  </span>
                )}

              </div>


              {/* ==========================================
                  BOOKING BUTTON
              ========================================== */}
              {car.available ? (
                <Link
                  to={`/booking/${car._id}`}
                  className="book-car-btn"
                >
                  Book This Car
                </Link>
              ) : (
                <button
                  className="book-car-btn"
                  disabled
                >
                  Currently Unavailable
                </button>
              )}

            </div>

          </section>


          {/* ==========================================
              EXTRA CAR INFORMATION
          ========================================== */}
          <section className="car-extra-info">


            {/* ==========================================
                OVERVIEW
            ========================================== */}
            <div className="info-section">

              <h2>
                Overview
              </h2>

              <p>
                The {car.name} is a{" "}
                {car.category?.toLowerCase()} from{" "}
                {car.brand}. It offers a comfortable
                driving experience and is suitable for
                city travel, family trips, and longer
                journeys.
              </p>

            </div>


            {/* ==========================================
                AMENITIES
            ========================================== */}
            <div className="info-section">

              <h2>
                Amenities
              </h2>

              <div className="amenities-grid">


                {/* Air Conditioning */}
                <div className="amenity-item">

                  <span>
                    ❄
                  </span>

                  <div>

                    <strong>
                      Air Conditioning
                    </strong>

                    <small>
                      Climate controlled cabin
                    </small>

                  </div>

                </div>


                {/* Bluetooth */}
                <div className="amenity-item">

                  <span>
                    ◉
                  </span>

                  <div>

                    <strong>
                      Bluetooth
                    </strong>

                    <small>
                      Wireless music connectivity
                    </small>

                  </div>

                </div>


                {/* Music System */}
                <div className="amenity-item">

                  <span>
                    ◉
                  </span>

                  <div>

                    <strong>
                      Music System
                    </strong>

                    <small>
                      Built-in audio system
                    </small>

                  </div>

                </div>


                {/* GPS */}
                <div className="amenity-item">

                  <span>
                    ✓
                  </span>

                  <div>

                    <strong>
                      GPS Navigation
                    </strong>

                    <small>
                      Navigation support
                    </small>

                  </div>

                </div>

              </div>

            </div>


            {/* ==========================================
                RENTAL POLICY
            ========================================== */}
            <div className="info-section">

              <h2>
                Rental Policy
              </h2>

              <div className="policy-list">


                {/* Driver License */}
                <div className="policy-item">

                  <strong>
                    Driver's License
                  </strong>

                  <span>
                    A valid driving license is required
                    at pickup.
                  </span>

                </div>


                {/* Fuel Policy */}
                <div className="policy-item">

                  <strong>
                    Fuel Policy
                  </strong>

                  <span>
                    Vehicle should be returned with
                    the same fuel level.
                  </span>

                </div>


                {/* Cancellation */}
                <div className="policy-item">

                  <strong>
                    Cancellation
                  </strong>

                  <span>
                    Cancellation policies depend on
                    the booking details.
                  </span>

                </div>


                {/* Vehicle Condition */}
                <div className="policy-item">

                  <strong>
                    Vehicle Condition
                  </strong>

                  <span>
                    Please return the vehicle in the
                    same condition as pickup.
                  </span>

                </div>

              </div>

            </div>

          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}

export default CarDetails;