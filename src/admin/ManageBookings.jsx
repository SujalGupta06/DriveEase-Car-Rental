
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  IndianRupee,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import "./ManageBookings.css";

const API_URL = "https://driveease-api-4zbo.onrender.com/api";

const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  // Fetch all bookings
  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Admin session not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/bookings/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load bookings.");
      }

      const list = Array.isArray(data)
        ? data
        : data.bookings || data.data || [];

      if (!Array.isArray(list)) {
        throw new Error("The server returned an invalid bookings list.");
      }

      setBookings(list);
    } catch (err) {
      setError(err.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Formatting helpers
  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "mb-status-confirmed";
      case "Completed":
        return "mb-status-completed";
      case "Cancelled":
        return "mb-status-cancelled";
      default:
        return "mb-status-pending";
    }
  };

  const getPaymentClass = (status) => {
    if (status === "Paid") return "mb-payment-paid";
    if (status === "Failed") return "mb-payment-failed";
    return "mb-payment-pending";
  };

  const getCustomerName = (booking) =>
    booking.user?.fullName ||
    booking.user?.name ||
    booking.user?.email ||
    "Unknown customer";

  const getCarName = (booking) => {
    const car = booking.car;

    if (!car || typeof car !== "object") {
      return "Car unavailable";
    }

    return (
      [car.brand, car.name].filter(Boolean).join(" ") ||
      car.model ||
      "Rental car"
    );
  };

  // Search and filters
  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const customer = getCustomerName(booking).toLowerCase();
      const email = (booking.user?.email || "").toLowerCase();
      const car = getCarName(booking).toLowerCase();
      const id = String(booking._id || "").toLowerCase();

      const matchesSearch =
        !query ||
        customer.includes(query) ||
        email.includes(query) ||
        car.includes(query) ||
        id.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        booking.bookingStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        (booking.paymentStatus || "Pending") === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, search, statusFilter, paymentFilter]);

  // Dashboard statistics
  const stats = useMemo(() => {
    const total = bookings.length;

    const pending = bookings.filter(
      (booking) => booking.bookingStatus === "Pending"
    ).length;

    const confirmed = bookings.filter(
      (booking) => booking.bookingStatus === "Confirmed"
    ).length;

    const completed = bookings.filter(
      (booking) => booking.bookingStatus === "Completed"
    ).length;

    const cancelled = bookings.filter(
      (booking) => booking.bookingStatus === "Cancelled"
    ).length;

    const paidRevenue = bookings
      .filter((booking) => booking.paymentStatus === "Paid")
      .reduce(
        (sum, booking) => sum + Number(booking.totalAmount || 0),
        0
      );

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      paidRevenue,
    };
  }, [bookings]);

  // Update booking status
  const updateBookingStatus = async (bookingId, bookingStatus) => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Admin session not found. Please log in again.");
      return;
    }

    if (!BOOKING_STATUSES.includes(bookingStatus)) {
      setError("Invalid booking status selected.");
      return;
    }

    const previousBookings = bookings;

    setUpdatingId(bookingId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/bookings/admin/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update booking status."
        );
      }

      const updatedBooking = data.booking || data.data?.booking || data.data;

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                ...(updatedBooking &&
                typeof updatedBooking === "object"
                  ? updatedBooking
                  : {}),
                bookingStatus:
                  updatedBooking?.bookingStatus || bookingStatus,
              }
            : booking
        )
      );

      setNotice(`Booking status updated to ${bookingStatus}.`);
    } catch (err) {
      setBookings(previousBookings);
      setError(err.message || "Unable to update booking status.");
    } finally {
      setUpdatingId("");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPaymentFilter("All");
  };

  return (
    <main className="mb-page">
      <header className="mb-header">
        <div>
          <p className="mb-eyebrow">DRIVEEASE ADMINISTRATION</p>
          <h1>Manage Bookings</h1>
          <p className="mb-subtitle">
            Review reservations, track payments, and manage booking status.
          </p>
        </div>

        <button
          className="mb-refresh"
          type="button"
          onClick={fetchBookings}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "mb-spin" : ""}
          />
          Refresh Data
        </button>
      </header>

      {error && (
        <div className="mb-alert mb-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={fetchBookings}>
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div className="mb-alert mb-alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
        </div>
      )}

      {/* Statistics */}
      <section className="mb-stats">
        <article className="mb-stat-card">
          <div className="mb-stat-top">
            <span>Total Bookings</span>
            <div className="mb-stat-icon mb-blue">
              <CalendarDays size={21} />
            </div>
          </div>
          <strong>{stats.total}</strong>
          <small>All reservations</small>
        </article>

        <article className="mb-stat-card">
          <div className="mb-stat-top">
            <span>Pending</span>
            <div className="mb-stat-icon mb-orange">
              <Clock3 size={21} />
            </div>
          </div>
          <strong>{stats.pending}</strong>
          <small>Awaiting processing</small>
        </article>

        <article className="mb-stat-card">
          <div className="mb-stat-top">
            <span>Confirmed</span>
            <div className="mb-stat-icon mb-green">
              <CheckCircle2 size={21} />
            </div>
          </div>
          <strong>{stats.confirmed}</strong>
          <small>Confirmed reservations</small>
        </article>

        <article className="mb-stat-card">
          <div className="mb-stat-top">
            <span>Completed</span>
            <div className="mb-stat-icon mb-purple">
              <CarFront size={21} />
            </div>
          </div>
          <strong>{stats.completed}</strong>
          <small>Finished rentals</small>
        </article>

        <article className="mb-stat-card">
          <div className="mb-stat-top">
            <span>Paid Revenue</span>
            <div className="mb-stat-icon mb-green">
              <IndianRupee size={21} />
            </div>
          </div>
          <strong className="mb-revenue-value">
            {formatPrice(stats.paidRevenue)}
          </strong>
          <small>Bookings marked as paid</small>
        </article>
      </section>

      {/* Booking table */}
      <section className="mb-panel">
        <div className="mb-panel-heading">
          <div>
            <h2>All Reservations</h2>
            <p>Search, filter, and manage customer bookings.</p>
          </div>

          <span className="mb-record-count">
            {filteredBookings.length} records
          </span>
        </div>

        <div className="mb-toolbar">
          <label className="mb-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search customer, email, car or booking ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="mb-filter">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by booking status"
            >
              <option value="All">All booking statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <label className="mb-filter">
            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              aria-label="Filter by payment status"
            >
              <option value="All">All payments</option>
              <option value="Pending">Payment pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="mb-state">
            <RefreshCw size={30} className="mb-spin" />
            <h3>Loading bookings...</h3>
            <p>Fetching reservations from the server.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="mb-state">
            <div className="mb-empty-icon">
              <CalendarDays size={28} />
            </div>

            <h3>
              {bookings.length === 0
                ? "No bookings found"
                : "No matching bookings"}
            </h3>

            <p>
              {bookings.length === 0
                ? "Customer reservations will appear here when available."
                : "Try changing your search or filters."}
            </p>

            {(search ||
              statusFilter !== "All" ||
              paymentFilter !== "All") && (
              <button
                className="mb-reset"
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="mb-table-wrap">
            <table className="mb-table">
              <thead>
                <tr>
                  <th>Booking / Customer</th>
                  <th>Car</th>
                  <th>Rental Dates</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Booking Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div className="mb-customer">
                        <strong>{getCustomerName(booking)}</strong>
                        <span>
                          {booking.user?.email || "No email"}
                        </span>
                        <small>
                          ID:{" "}
                          {String(booking._id || "")
                            .slice(-8)
                            .toUpperCase()}
                        </small>
                      </div>
                    </td>

                    <td>
                      <div className="mb-car">
                        <div className="mb-car-icon">
                          <CarFront size={19} />
                        </div>
                        <span>{getCarName(booking)}</span>
                      </div>
                    </td>

                    <td>
                      <div className="mb-dates">
                        <span>
                          <CalendarDays size={14} />
                          {formatDate(booking.pickupDate)}
                        </span>
                        <span>
                          <span className="mb-date-arrow">→</span>
                          {formatDate(booking.returnDate)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <strong className="mb-amount">
                        {formatPrice(booking.totalAmount)}
                      </strong>
                      <small className="mb-days">
                        {booking.totalDays || 0} rental days
                      </small>
                    </td>

                    <td>
                      <span
                        className={`mb-status ${getPaymentClass(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus || "Pending"}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`mb-status-select ${getStatusClass(
                          booking.bookingStatus
                        )}`}
                        value={booking.bookingStatus || "Pending"}
                        disabled={updatingId === booking._id}
                        onChange={(event) => {
                          const nextStatus = event.target.value;

                          if (
                            nextStatus === booking.bookingStatus
                          ) {
                            return;
                          }

                          if (
                            window.confirm(
                              `Change this booking's status to ${nextStatus}?`
                            )
                          ) {
                            updateBookingStatus(
                              booking._id,
                              nextStatus
                            );
                          }
                        }}
                        aria-label={`Update status for booking ${booking._id}`}
                      >
                        {BOOKING_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingId === booking._id && (
                        <small className="mb-updating">
                          Updating...
                        </small>
                      )}
                    </td>

                    <td>
                      <Link
                        to={`/admin/bookings/${booking._id}`}
                        className="mb-view-button"
                        title="View booking details"
                        aria-label="View booking details"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="mb-table-footer">
          <span>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </span>

          <span>
            <Users size={15} />
            {stats.cancelled} cancelled reservations
          </span>
        </footer>
      </section>
    </main>
  );
}

export default ManageBookings;
