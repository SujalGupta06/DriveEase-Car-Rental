import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Cars.css";

const API_URL = "https://driveease-api-4zbo.onrender.com/api/cars";

function Cars() {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cars");
      }

      // Supports both:
      // { cars: [...] }
      // [...]
      const carList = Array.isArray(data) ? data : data.cars;

      if (!Array.isArray(carList)) {
        throw new Error("Invalid car data received from server");
      }

      setCars(carList);
    } catch (err) {
      console.error("Fetch cars error:", err);
      setError(err.message || "Unable to load cars");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        cars
          .map((car) => car.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [cars]);

  const filteredCars = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return cars.filter((car) => {
      const matchesSearch =
        !searchText ||
        car.name?.toLowerCase().includes(searchText) ||
        car.brand?.toLowerCase().includes(searchText) ||
        car.category?.toLowerCase().includes(searchText) ||
        car.fuel?.toLowerCase().includes(searchText) ||
        car.transmission?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" ||
        car.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [cars, search, category]);

  return (
    <div className="cars-page">

      {/* ================= HEADER ================= */}
      <section className="cars-hero">
        <div className="cars-hero-content">

          <div className="cars-breadcrumb">
            <span>DriveEase</span>
            <span className="material-symbols-outlined">
              chevron_right
            </span>
            <span className="active">
              Browse Cars
            </span>
          </div>

          <div className="cars-heading-row">

            <div>
              <div className="cars-live-label">
                <span className="live-dot"></span>
                LIVE FLEET ACCESS
              </div>

              <h1>
                Find Your Perfect Car
              </h1>

              <p>
                Choose from our well-maintained fleet
                and book your next journey with DriveEase.
              </p>
            </div>

            <div className="cars-fleet-count">
              <span className="material-symbols-outlined">
                directions_car
              </span>

              <div>
                <strong>{cars.length}</strong>
                <span>Vehicles in fleet</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= MAIN ================= */}
      <main className="cars-main">

        {/* SEARCH / FILTER CARD */}
        <section className="cars-search-card">

          <div className="cars-search-header">
            <div>
              <h2>Browse Available Cars</h2>
              <p>
                Search and filter our current fleet.
              </p>
            </div>

            <div className="cars-result-count">
              <strong>{filteredCars.length}</strong>
              <span>
                {filteredCars.length === 1
                  ? "car"
                  : "cars"} available
              </span>
            </div>
          </div>

          <div className="cars-filter-row">

            {/* SEARCH */}
            <div className="cars-search-box">

              <span className="material-symbols-outlined">
                search
              </span>

              <input
                type="text"
                placeholder="Search by car name, brand or category..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    close
                  </span>
                </button>
              )}

            </div>

            {/* CATEGORY */}
            <div className="cars-filter-select">

              <span className="material-symbols-outlined">
                tune
              </span>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "All"
                      ? "All Categories"
                      : item}
                  </option>
                ))}
              </select>

            </div>

            {/* RESET */}
            {(search || category !== "All") && (
              <button
                className="reset-filter-button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                type="button"
              >
                <span className="material-symbols-outlined">
                  restart_alt
                </span>
                Reset
              </button>
            )}

          </div>

        </section>

        {/* ================= STATES ================= */}

        {loading && (
          <div className="cars-state-card">

            <div className="cars-loader">
              <span></span>
            </div>

            <h3>Loading fleet...</h3>

            <p>
              We're getting the latest vehicles for you.
            </p>

          </div>
        )}

        {!loading && error && (
          <div className="cars-state-card error-state">

            <div className="state-icon">
              <span className="material-symbols-outlined">
                error
              </span>
            </div>

            <h3>Unable to load cars</h3>

            <p>{error}</p>

            <button
              className="retry-button"
              onClick={fetchCars}
              type="button"
            >
              <span className="material-symbols-outlined">
                refresh
              </span>
              Try Again
            </button>

          </div>
        )}

        {/* ================= CAR GRID ================= */}

        {!loading &&
          !error &&
          filteredCars.length > 0 && (
            <section className="cars-fleet-section">

              <div className="fleet-section-header">

                <div>
                  <span className="section-label">
                    OUR FLEET
                  </span>

                  <h2>
                    Choose your ride
                  </h2>
                </div>

                <span className="fleet-showing">
                  Showing {filteredCars.length} of{" "}
                  {cars.length} vehicles
                </span>

              </div>

              <div className="cars-grid">

                {filteredCars.map((car) => (

                  <article
                    className="fleet-car-card"
                    key={car._id}
                  >

                    {/* IMAGE */}
                    <div className="fleet-car-image">

                      <img
                        src={car.image}
                        alt={car.name}
                      />

                      <div className="image-overlay"></div>

                      <span
                        className={`availability-badge ${
                          car.available
                            ? "available"
                            : "unavailable"
                        }`}
                      >
                        <span></span>

                        {car.available
                          ? "Available"
                          : "Unavailable"}
                      </span>

                      <div className="car-category-badge">
                        {car.category}
                      </div>

                    </div>

                    {/* CONTENT */}
                    <div className="fleet-car-content">

                      <div className="fleet-car-title-row">

                        <div>
                          <span className="fleet-car-brand">
                            {car.brand}
                          </span>

                          <h3>
                            {car.name}
                          </h3>
                        </div>

                        <div className="fleet-rating">

                          <span className="material-symbols-outlined">
                            star
                          </span>

                          <strong>
                            {car.rating || "4.8"}
                          </strong>

                        </div>

                      </div>

                      {/* SPECS */}
                      <div className="fleet-specs">

                        <div>
                          <span className="material-symbols-outlined">
                            local_gas_station
                          </span>
                          <span>{car.fuel}</span>
                        </div>

                        <div>
                          <span className="material-symbols-outlined">
                            settings
                          </span>
                          <span>
                            {car.transmission}
                          </span>
                        </div>

                        <div>
                          <span className="material-symbols-outlined">
                            airline_seat_recline_normal
                          </span>
                          <span>
                            {car.seats} Seats
                          </span>
                        </div>

                      </div>

                      <div className="fleet-card-divider"></div>

                      {/* PRICE + BUTTON */}
                      <div className="fleet-card-footer">

                        <div className="fleet-price">

                          <span>Starting from</span>

                          <div>
                            <strong>
                              ₹
                              {Number(
                                car.pricePerDay
                              ).toLocaleString("en-IN")}
                            </strong>

                            <small>
                              / day
                            </small>
                          </div>

                        </div>

                        <Link
                          to={`/cars/${car._id}`}
                          className="fleet-details-button"
                        >
                          View Details

                          <span className="material-symbols-outlined">
                            arrow_forward
                          </span>
                        </Link>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            </section>
          )}

        {/* ================= EMPTY ================= */}

        {!loading &&
          !error &&
          filteredCars.length === 0 && (
            <div className="cars-state-card">

              <div className="state-icon">
                <span className="material-symbols-outlined">
                  search_off
                </span>
              </div>

              <h3>No cars found</h3>

              <p>
                Try changing your search or category
                filter.
              </p>

              <button
                className="retry-button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                type="button"
              >
                Show All Cars
              </button>

            </div>
          )}

        {/* ================= TRUST STRIP ================= */}

        {!loading && !error && cars.length > 0 && (
          <section className="cars-trust-section">

            <div className="trust-item">

              <div className="trust-icon">
                <span className="material-symbols-outlined">
                  verified
                </span>
              </div>

              <div>
                <strong>
                  Well Maintained
                </strong>

                <span>
                  Every vehicle is regularly serviced.
                </span>
              </div>

            </div>

            <div className="trust-item">

              <div className="trust-icon">
                <span className="material-symbols-outlined">
                  support_agent
                </span>
              </div>

              <div>
                <strong>
                  24/7 Support
                </strong>

                <span>
                  We're here whenever you need us.
                </span>
              </div>

            </div>

            <div className="trust-item">

              <div className="trust-icon">
                <span className="material-symbols-outlined">
                  security
                </span>
              </div>

              <div>
                <strong>
                  Secure Booking
                </strong>

                <span>
                  Simple and transparent rentals.
                </span>
              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default Cars;