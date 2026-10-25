import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingSearch.css";

function BookingSearch() {
  const navigate = useNavigate();

  const [fleetType, setFleetType] = useState("All Fleet");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    navigate("/cars", {
      state: {
        fleetType,
        pickupLocation,
        dropoffLocation,
        pickupDate,
        returnDate,
      },
    });
  };

  return (
    <section className="booking-search-section">
      <div className="booking-search">

        {/* Fleet Type */}
        <div className="fleet-row">
          <div className="fleet-title">
            <span>FLEET TYPE</span>
            <small>Free cancellation up to 24h</small>
          </div>

          <div className="fleet-pills">
            {["All Fleet", "Sedan", "SUV", "Electric", "Sports"].map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  className={
                    fleetType === type
                      ? "fleet-pill active"
                      : "fleet-pill"
                  }
                  onClick={() => setFleetType(type)}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>

        <form onSubmit={handleSearch}>

          <div className="search-fields">

            {/* Pickup */}
            <div className="search-field">
              <label>Pickup Location</label>

              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
              >
                <option value="">Select location</option>
                <option value="Bhilai">Bhilai</option>
                <option value="Durg">Durg</option>
                <option value="Raipur">Raipur</option>
                <option value="Bilaspur">Bilaspur</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            {/* Drop-off */}
            <div className="search-field">
              <label>Drop-off Location</label>

              <select
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                required
              >
                <option value="">Select location</option>
                <option value="Bhilai">Bhilai</option>
                <option value="Durg">Durg</option>
                <option value="Raipur">Raipur</option>
                <option value="Bilaspur">Bilaspur</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            {/* Pickup Date */}
            <div className="search-field">
              <label>Pickup Date & Time</label>

              <input
                type="datetime-local"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
              />
            </div>

            {/* Return Date */}
            <div className="search-field">
              <label>Return Date & Time</label>

              <input
                type="datetime-local"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>

            {/* Search Button */}
            <button className="search-button" type="submit">
              Search Available Cars
              <span>→</span>
            </button>

          </div>

        </form>

      </div>
    </section>
  );
}

export default BookingSearch;