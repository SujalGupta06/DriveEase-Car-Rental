
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageCars.css";

const API_URL = "https://driveease-api-4zbo.onrender.com/api/cars";

const ManageCars = () => {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState("");

  // Fetch cars from MongoDB through the backend
  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load cars");
      }

      setCars(data.cars || []);
    } catch (err) {
      console.error("Fetch cars error:", err);
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Search by name, brand, category or fuel
  const filteredCars = cars.filter((car) => {
    const searchText = search.toLowerCase().trim();

    return (
      car.name?.toLowerCase().includes(searchText) ||
      car.brand?.toLowerCase().includes(searchText) ||
      car.category?.toLowerCase().includes(searchText) ||
      car.fuel?.toLowerCase().includes(searchText)
    );
  });

  // Open the Add Vehicle form
  const handleAddCar = () => {
    navigate("/admin/cars/add");
  };

  // Open the Edit Vehicle form for the selected car
  const handleEditCar = (carId) => {
    navigate(`/admin/cars/edit/${carId}`);
  };

  // Delete a car through the protected backend API
  const handleDeleteCar = async (car) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${car.name}?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Admin login required. Please log in again.");
      return;
    }

    try {
      setDeletingId(car._id);
      setError("");
      setNotice("");

      const response = await fetch(`${API_URL}/${car._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete car");
      }

      setCars((previousCars) =>
        previousCars.filter((item) => item._id !== car._id)
      );

      setNotice(`${car.name} deleted successfully.`);
    } catch (err) {
      console.error("Delete car error:", err);
      setError(err.message || "Unable to delete car");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="manage-cars-page">
      {/* Page header */}
      <header className="manage-cars-header">
        <div>
          <p className="manage-cars-eyebrow">FLEET MANAGEMENT</p>
          <h1>Manage Cars</h1>
          <p className="manage-cars-subtitle">
            Manage your fleet, vehicle information, pricing and availability.
          </p>
        </div>

        <div className="manage-cars-header-actions">
          <button
            type="button"
            className="manage-refresh-button"
            onClick={fetchCars}
            disabled={loading}
          >
            <span className="material-symbols-outlined">
              refresh
            </span>
            Refresh
          </button>

          <button
            type="button"
            className="manage-add-button"
            onClick={handleAddCar}
          >
            <span className="material-symbols-outlined">
              add
            </span>
            Add New Vehicle
          </button>
        </div>
      </header>

      {/* Status messages */}
      {error && (
        <div className="manage-alert manage-alert-error" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {notice && (
        <div className="manage-alert manage-alert-success" role="status">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      )}

      {/* Fleet statistics */}
      <section className="manage-stats">
        <article className="manage-stat-card">
          <div className="manage-stat-icon blue">
            <span className="material-symbols-outlined">
              directions_car
            </span>
          </div>
          <div>
            <p>Total Vehicles</p>
            <h2>{cars.length}</h2>
          </div>
        </article>

        <article className="manage-stat-card">
          <div className="manage-stat-icon green">
            <span className="material-symbols-outlined">
              check_circle
            </span>
          </div>
          <div>
            <p>Available</p>
            <h2>{cars.filter((car) => car.available).length}</h2>
          </div>
        </article>

        <article className="manage-stat-card">
          <div className="manage-stat-icon orange">
            <span className="material-symbols-outlined">
              event_busy
            </span>
          </div>
          <div>
            <p>Unavailable</p>
            <h2>{cars.filter((car) => !car.available).length}</h2>
          </div>
        </article>
      </section>

      {/* Fleet table */}
      <section className="manage-table-card">
        <div className="manage-table-toolbar">
          <div>
            <h2>Vehicle Inventory</h2>
            <p>View and manage your registered vehicles.</p>
          </div>

          <div className="manage-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="search"
              placeholder="Search vehicles..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search vehicles"
            />
          </div>
        </div>

        {loading ? (
          <div className="manage-state">
            <span className="material-symbols-outlined manage-spinner">
              progress_activity
            </span>
            <p>Loading vehicles...</p>
          </div>
        ) : error && cars.length === 0 ? (
          <div className="manage-state">
            <span className="material-symbols-outlined">cloud_off</span>
            <p>Could not load vehicles.</p>
            <button type="button" onClick={fetchCars}>
              Try Again
            </button>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="manage-state">
            <span className="material-symbols-outlined">
              directions_car
            </span>
            <p>
              {search
                ? "No vehicles match your search."
                : "No vehicles have been added yet."}
            </p>
            {!search && (
              <button type="button" onClick={handleAddCar}>
                Add Your First Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="manage-table-wrapper">
            <table className="manage-cars-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>Fuel / Transmission</th>
                  <th>Price / Day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      <div className="manage-vehicle-cell">
                        <img
                          src={car.image}
                          alt={car.name}
                          className="manage-car-image"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />

                        <div>
                          <strong>{car.name}</strong>
                          <span>{car.brand}</span>
                          <small>
                            {car.seats} seats · {car.transmission}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="manage-category">
                        {car.category}
                      </span>
                    </td>

                    <td>
                      <div className="manage-fuel-cell">
                        <span>{car.fuel}</span>
                        <small>{car.transmission}</small>
                      </div>
                    </td>

                    <td>
                      <strong className="manage-price">
                        ₹{Number(car.pricePerDay).toLocaleString("en-IN")}
                      </strong>
                      <span className="manage-per-day">/ day</span>
                    </td>

                    <td>
                      <span
                        className={`manage-status ${
                          car.available ? "available" : "unavailable"
                        }`}
                      >
                        <span className="manage-status-dot"></span>
                        {car.available ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    <td>
                      <div className="manage-row-actions">
                        <button
                          type="button"
                          className="manage-edit-button"
                          onClick={() => handleEditCar(car._id)}
                          title={`Edit ${car.name}`}
                          aria-label={`Edit ${car.name}`}
                        >
                          <span className="material-symbols-outlined">
                            edit
                          </span>
                          Edit
                        </button>

                        <button
                          type="button"
                          className="manage-delete-button"
                          onClick={() => handleDeleteCar(car)}
                          disabled={deletingId === car._id}
                          title={`Delete ${car.name}`}
                          aria-label={`Delete ${car.name}`}
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                          {deletingId === car._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="manage-table-footer">
          <span>
            Showing {filteredCars.length} of {cars.length} vehicles
          </span>
        </div>
      </section>
    </div>
  );
};

export default ManageCars;