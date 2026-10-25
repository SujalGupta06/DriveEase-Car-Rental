import { Link } from "react-router-dom";
import cars from "../data/cars";
import "./FeaturedFleet.css";

function FeaturedFleet() {
  const featuredCars = cars.slice(0, 4);

  return (
    <section className="featured-section">
      <div className="featured-container">

        {/* Heading */}
        <div className="featured-header">

          <div>
            <span className="featured-label">
              VERIFIED SELECTION
            </span>

            <h2>Featured Fleet in High Demand</h2>

            <p>
              Explore our most popular vehicles, carefully selected
              for comfort, reliability and performance.
            </p>
          </div>

          <Link to="/cars" className="view-all-link">
            View all vehicles →
          </Link>

        </div>

        {/* Cars */}
        <div className="featured-grid">
          {featuredCars.map((car) => (
            <div className="featured-card" key={car.id}>

              <div className="featured-image-wrapper">

                <img
                  src={car.image}
                  alt={car.name}
                  className="featured-image"
                />

                <span className="category-badge">
                  {car.category}
                </span>

              </div>

              <div className="featured-card-content">

                <div className="rating">
                  ★ {car.rating}
                </div>

                <h3>{car.name}</h3>

                <p className="car-description">
                  {car.brand} • Premium rental vehicle
                </p>

                <div className="car-specs">
                  <span>👤 {car.seats} Seats</span>
                  <span>⚙ {car.transmission}</span>
                </div>

                <div className="featured-card-footer">

                  <div>
                    <span className="price">
                      ₹{car.pricePerDay.toLocaleString("en-IN")}
                    </span>
                    <span className="per-day"> / day</span>
                  </div>

                  <Link
                    to={`/cars/${car.id}`}
                    className="details-link"
                  >
                    View Details
                  </Link>

                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeaturedFleet;