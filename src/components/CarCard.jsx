import { Link } from "react-router-dom";
import "./CarCard.css";

function CarCard({ car }) {
  return (
    <article className="car-card">

      {/* Car Image */}
      <div className="car-image-wrapper">
        <img
          src={car.image}
          alt={car.name}
          className="car-image"
        />

        <span className="car-category">
          {car.category}
        </span>
      </div>

      {/* Card Content */}
      <div className="car-card-content">

        {/* Rating */}
        <div className="car-rating">
          ★ {car.rating}
        </div>

        {/* Car Name */}
        <h3>{car.name}</h3>

        {/* Brand */}
        <p className="car-brand">
          {car.brand}
        </p>

        {/* Specifications */}
        <div className="car-specs">
          <span>{car.seats} Seats</span>
          <span>{car.transmission}</span>
          <span>{car.fuel}</span>
        </div>

        {/* Price + Details */}
        <div className="car-card-bottom">

          <div className="car-price">
            <strong>
              ₹{car.pricePerDay.toLocaleString()}
            </strong>
            <span>/ day</span>
          </div>

          <Link
            to={`/cars/${car.id}`}
            className="view-details-btn"
          >
            View Details
          </Link>

        </div>

      </div>

    </article>
  );
}

export default CarCard;