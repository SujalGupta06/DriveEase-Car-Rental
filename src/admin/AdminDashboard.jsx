import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL = "https://driveease-api-4zbo.onrender.com/api/admin/dashboard";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin token not found. Please log in again.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dashboard");
      }

      setDashboard(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchDashboard}>Try Again</button>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const recentBookings = dashboard?.recentBookings || [];
  const monthlyBookings = dashboard?.monthlyBookings || [];

  const statCards = [
    {
      title: "Total Cars",
      value: stats.totalCars ?? 0,
      icon: "🚘",
      description: "Cars in the system",
      className: "cars",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings ?? 0,
      icon: "📋",
      description: "All booking records",
      className: "bookings",
    },
    {
      title: "Registered Customers",
      value: stats.totalCustomers ?? 0,
      icon: "👥",
      description: "Customer accounts",
      className: "customers",
    },
    {
      title: "Paid Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "💰",
      description: "Successful payments",
      className: "revenue",
    },
  ];

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const month = monthlyBookings.find(
      (item) => item._id === index + 1
    );

    return {
      month: monthNames[index],
      bookings: month?.bookings || 0,
      revenue: month?.revenue || 0,
    };
  });

  const maxBookings = Math.max(
    1,
    ...monthlyData.map((item) => item.bookings)
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">DRIVEEASE ADMINISTRATION</p>
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">
            Monitor your cars, bookings, customers and revenue.
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={fetchDashboard}
        >
          ↻ Refresh Data
        </button>
      </div>

      {/* Statistic Cards */}
      <section className="dashboard-stats">
        {statCards.map((card) => (
          <div
            className={`dashboard-stat-card ${card.className}`}
            key={card.title}
          >
            <div className="dashboard-stat-top">
              <span>{card.title}</span>
              <span className="dashboard-stat-icon">
                {card.icon}
              </span>
            </div>

            <h2>{card.value}</h2>
            <p>{card.description}</p>
          </div>
        ))}
      </section>

      {/* Monthly Booking Summary */}
      <section className="dashboard-panel">
        <div className="dashboard-section-heading">
          <div>
            <h2>Monthly Booking Summary</h2>
            <p>Bookings created during {new Date().getFullYear()}</p>
          </div>
        </div>

        <div className="monthly-chart">
          {monthlyData.map((item) => (
            <div className="monthly-chart-column" key={item.month}>
              <span className="monthly-chart-value">
                {item.bookings}
              </span>

              <div className="monthly-chart-track">
                <div
                  className="monthly-chart-bar"
                  style={{
                    height: `${
                      (item.bookings / maxBookings) * 100
                    }%`,
                  }}
                  title={`${item.bookings} bookings`}
                />
              </div>

              <span className="monthly-chart-label">
                {item.month}
              </span>
            </div>
          ))}
        </div>

        <div className="monthly-revenue">
          <span>Paid revenue this year</span>
          <strong>
            {formatCurrency(
              monthlyData.reduce(
                (sum, item) => sum + item.revenue,
                0
              )
            )}
          </strong>
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="dashboard-panel">
        <div className="dashboard-section-heading">
          <div>
            <h2>Recent Bookings</h2>
            <p>The latest five booking records</p>
          </div>

          <span className="dashboard-booking-count">
            {recentBookings.length} records
          </span>
        </div>

        {recentBookings.length === 0 ? (
          <div className="dashboard-empty">
            <span>📋</span>
            <h3>No bookings yet</h3>
            <p>New bookings will appear here.</p>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Pickup Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div className="dashboard-customer">
                        <strong>
                          {booking.user?.fullName || "Unknown"}
                        </strong>
                        <span>
                          {booking.user?.email || "—"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {booking.car
                        ? `${booking.car.brand || ""} ${
                            booking.car.name || ""
                          }`.trim()
                        : "Car unavailable"}
                    </td>

                    <td>{formatDate(booking.pickupDate)}</td>

                    <td className="dashboard-amount">
                      {formatCurrency(booking.totalAmount)}
                    </td>

                    <td>
                      <span
                        className={`dashboard-status ${
                          booking.paymentStatus === "Paid"
                            ? "paid"
                            : booking.paymentStatus === "Failed"
                            ? "failed"
                            : "pending"
                        }`}
                      >
                        {booking.paymentStatus || "Pending"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`dashboard-status ${
                          booking.bookingStatus === "Confirmed"
                            ? "confirmed"
                            : booking.bookingStatus === "Completed"
                            ? "completed"
                            : booking.bookingStatus === "Cancelled"
                            ? "cancelled"
                            : "pending"
                        }`}
                      >
                        {booking.bookingStatus || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;