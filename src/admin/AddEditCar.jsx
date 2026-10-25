import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AddEditCar.css";

const AddEditCar = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    pricePerDay: "",
    rating: 0,
    image: "",
    description: "",
    available: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing car for edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchCar = async () => {
      try {
        setFetching(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/cars"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch cars"
          );
        }

        setSuccess(
        isEditMode
            ? "Vehicle updated successfully."
            : "Vehicle added successfully."
        );
        
        const car = data.cars.find(
          (item) => item._id === id
        );

        if (!car) {
          setError("Car not found");
          return;
        }

        setFormData({
          name: car.name || "",
          brand: car.brand || "",
          category: car.category || "",
          fuel: car.fuel || "Petrol",
          transmission: car.transmission || "Manual",
          seats: car.seats || 5,
          pricePerDay: car.pricePerDay || "",
          rating: car.rating || 0,
          image: car.image || "",
          description: car.description || "",
          available: car.available ?? true,
        });
      } catch (error) {
        console.error(error);
        setError("Failed to load vehicle");
      } finally {
        setFetching(false);
      }
    };

    fetchCar();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.brand ||
      !formData.category ||
      !formData.pricePerDay ||
      !formData.image
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Admin login required.");
        return;
      }

      const url = isEditMode
        ? `http://localhost:5000/api/cars/${id}`
        : "http://localhost:5000/api/cars";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          seats: Number(formData.seats),
          pricePerDay: Number(formData.pricePerDay),
          rating: Number(formData.rating),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save vehicle"
        );
      }

      setSuccess(
        isEditMode
          ? "Vehicle updated successfully."
          : "Vehicle added successfully."
      );

      setTimeout(() => {
        navigate("/admin/cars");
      }, 1000);
    } catch (error) {
      console.error(error);
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="add-edit-page">
        <div className="add-edit-loading">
          Loading vehicle...
        </div>
      </div>
    );
  }

  return (
    <div className="add-edit-page">

      {/* Top Navigation */}
      <div className="add-edit-topbar">
        <button
          className="back-button"
          onClick={() => navigate("/admin/cars")}
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
          Back to Fleet
        </button>

        <div className="page-breadcrumb">
          Admin Portal
          <span>/</span>
          Vehicle Inventory
          <span>/</span>
          {isEditMode ? "Edit Vehicle" : "Add Vehicle"}
        </div>
      </div>

      {/* Header */}
      <div className="add-edit-header">

        <div>
          <p className="eyebrow">
            FLEET MANAGEMENT
          </p>

          <h1>
            {isEditMode
              ? "Edit Vehicle"
              : "Add New Vehicle"}
          </h1>

          <p>
            {isEditMode
              ? "Update vehicle information and fleet settings."
              : "Add a new vehicle to your DriveEase fleet."}
          </p>
        </div>

        <div className="mode-badge">
          <span className="material-symbols-outlined">
            {isEditMode ? "edit_note" : "add_circle"}
          </span>

          {isEditMode ? "EDIT MODE" : "ADD MODE"}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="form-message error-message">
          <span className="material-symbols-outlined">
            error
          </span>
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="form-message success-message">
          <span className="material-symbols-outlined">
            check_circle
          </span>
          {success}
        </div>
      )}

      <form
        className="vehicle-form-layout"
        onSubmit={handleSubmit}
      >

        {/* LEFT SIDE */}
        <div className="vehicle-form-main">

          {/* Core Vehicle Identity */}
          <section className="form-card">

            <div className="section-heading">
              <div className="section-icon">
                <span className="material-symbols-outlined">
                  directions_car
                </span>
              </div>

              <div>
                <h2>Core Vehicle Identity</h2>
                <p>
                  Basic information about the vehicle.
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="input-group full-width">
                <label>
                  Vehicle Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Maruti Swift"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>
                  Brand <span>*</span>
                </label>

                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Maruti Suzuki"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>
                  Category <span>*</span>
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">
                    Select category
                  </option>
                  <option value="Hatchback">
                    Hatchback
                  </option>
                  <option value="Sedan">
                    Sedan
                  </option>
                  <option value="SUV">
                    SUV
                  </option>
                  <option value="Compact SUV">
                    Compact SUV
                  </option>
                  <option value="MPV">
                    MPV
                  </option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  Fuel Type
                </label>

                <select
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleChange}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">
                    Electric
                  </option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  Transmission
                </label>

                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">
                    Automatic
                  </option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  Seats
                </label>

                <input
                  type="number"
                  name="seats"
                  min="1"
                  max="20"
                  value={formData.seats}
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* Pricing */}
          <section className="form-card">

            <div className="section-heading">
              <div className="section-icon purple">
                <span className="material-symbols-outlined">
                  payments
                </span>
              </div>

              <div>
                <h2>Pricing & Rating</h2>
                <p>
                  Set rental pricing and vehicle rating.
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="input-group">
                <label>
                  Price Per Day <span>*</span>
                </label>

                <div className="input-prefix">
                  <span>₹</span>

                  <input
                    type="number"
                    name="pricePerDay"
                    min="0"
                    placeholder="1200"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>
                  Rating
                </label>

                <div className="input-prefix">
                  <span>★</span>

                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.8"
                    value={formData.rating}
                    onChange={handleChange}
                  />
                </div>
              </div>

            </div>
          </section>

          {/* Description */}
          <section className="form-card">

            <div className="section-heading">
              <div className="section-icon orange">
                <span className="material-symbols-outlined">
                  description
                </span>
              </div>

              <div>
                <h2>Vehicle Description</h2>
                <p>
                  Add useful information for customers.
                </p>
              </div>
            </div>

            <div className="input-group">
              <label>
                Description
              </label>

              <textarea
                name="description"
                rows="5"
                placeholder="Describe this vehicle..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Vehicle Image */}
          <section className="form-card">

            <div className="section-heading">
              <div className="section-icon green">
                <span className="material-symbols-outlined">
                  image
                </span>
              </div>

              <div>
                <h2>Vehicle Image</h2>
                <p>
                  Add the image URL used by the fleet.
                </p>
              </div>
            </div>

            <div className="input-group">
              <label>
                Image URL <span>*</span>
              </label>

              <input
                type="url"
                name="image"
                placeholder="https://..."
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            {formData.image && (
              <div className="image-preview">
                <img
                  src={formData.image}
                  alt={formData.name || "Vehicle"}
                />
              </div>
            )}
          </section>

        </div>

        {/* RIGHT SIDE */}
        <aside className="vehicle-form-sidebar">

          {/* Availability */}
          <section className="form-card">

            <div className="section-heading compact">
              <div className="section-icon green">
                <span className="material-symbols-outlined">
                  check_circle
                </span>
              </div>

              <div>
                <h2>Availability</h2>
                <p>
                  Fleet status
                </p>
              </div>
            </div>

            <label className="availability-toggle">

              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />

              <span className="toggle-track">
                <span className="toggle-thumb"></span>
              </span>

              <div>
                <strong>
                  {formData.available
                    ? "Available"
                    : "Unavailable"}
                </strong>

                <small>
                  {formData.available
                    ? "Vehicle can be booked"
                    : "Vehicle is currently unavailable"}
                </small>
              </div>

            </label>
          </section>

          {/* Customer Preview */}
          <section className="form-card preview-card">

            <div className="preview-label">
              CUSTOMER PREVIEW
            </div>

            <div className="customer-preview-image">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt={formData.name}
                />
              ) : (
                <span className="material-symbols-outlined">
                  directions_car
                </span>
              )}
            </div>

            <div className="preview-content">

              <div className="preview-rating">
                <span>★</span>
                {formData.rating || "0.0"}
              </div>

              <h3>
                {formData.name || "Vehicle Name"}
              </h3>

              <p>
                {formData.brand || "Brand"} •{" "}
                {formData.category || "Category"}
              </p>

              <div className="preview-details">
                <span>
                  <span className="material-symbols-outlined">
                    local_gas_station
                  </span>
                  {formData.fuel}
                </span>

                <span>
                  <span className="material-symbols-outlined">
                    settings
                  </span>
                  {formData.transmission}
                </span>

                <span>
                  <span className="material-symbols-outlined">
                    airline_seat_recline_normal
                  </span>
                  {formData.seats}
                </span>
              </div>

              <div className="preview-price">
                <strong>
                  ₹{Number(formData.pricePerDay || 0).toLocaleString(
                    "en-IN"
                  )}
                </strong>
                <span>/ day</span>
              </div>

            </div>
          </section>

        </aside>
      </form>

      {/* Bottom Actions */}
      <div className="form-actions">

        <button
          type="button"
          className="secondary-action"
          onClick={() => navigate("/admin/cars")}
        >
          Discard
        </button>

        <div className="right-actions">

          <button
            type="button"
            className="draft-action"
            onClick={() => {
              localStorage.setItem(
                "driveeaseCarDraft",
                JSON.stringify(formData)
              );

              setSuccess("Draft saved locally.");
            }}
          >
            Save Draft
          </button>

          <button
            type="submit"
            className="primary-action"
            onClick={handleSubmit}
            disabled={loading}
          >
            <span className="material-symbols-outlined">
              {loading
                ? "hourglass_top"
                : isEditMode
                ? "save"
                : "add"}
            </span>

            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Vehicle"
              : "Add Vehicle"}
          </button>

        </div>
      </div>

    </div>
  );
};

export default AddEditCar;