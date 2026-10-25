import { useEffect, useState } from "react";
import "./Reports.css";

const API_URL = "http://localhost:5000/api/admin/reports";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function Reports() {
  const [report, setReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchReports(selectedYear = year) {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Admin token not found. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}?year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reports.");
      }

      setReport(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports(year);
  }, [year]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const exportCSV = () => {
    if (!report) return;

    const rows = [
      ["DriveEase Reports"],
      ["Report Year", report.year],
      [],
      ["Booking Statistics", "Count"],
      ["Total Bookings", report.summary.totalBookings],
      ["Pending", report.summary.pendingBookings],
      ["Confirmed", report.summary.confirmedBookings],
      ["Completed", report.summary.completedBookings],
      ["Cancelled", report.summary.cancelledBookings],
      ["Total Paid Revenue", report.summary.totalRevenue],
      [],
      ["Month", "Bookings", "Paid Revenue"],
      ...report.monthlySummary.map((item) => [
        months[item.month - 1],
        item.bookings,
        item.revenue,
      ]),
      [],
      ["Popular Cars", "Bookings", "Paid Revenue"],
      ...report.popularCars.map((car) => [
        `${car.brand} ${car.carName}`.trim(),
        car.totalBookings,
        car.paidRevenue,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `driveease-reports-${report.year}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="reports-message">
        <div className="reports-spinner" />
        <p>Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-message">
        <h2>Unable to load reports</h2>
        <p>{error}</p>
        <button onClick={() => fetchReports(year)}>
          Try Again
        </button>
      </div>
    );
  }

  if (!report) return null;

  const summary = report.summary;
  const monthly = report.monthlySummary || [];
  const maxBookings = Math.max(
    1,
    ...monthly.map((item) => item.bookings)
  );

  const statusCards = [
    { label: "Pending", value: summary.pendingBookings, className: "pending" },
    { label: "Confirmed", value: summary.confirmedBookings, className: "confirmed" },
    { label: "Completed", value: summary.completedBookings, className: "completed" },
    { label: "Cancelled", value: summary.cancelledBookings, className: "cancelled" },
  ];

  return (
    <main className="reports-page">
      <header className="reports-header">
        <div>
          <p className="reports-eyebrow">DRIVEEASE ADMINISTRATION</p>
          <h1>Reports &amp; Analytics</h1>
          <p className="reports-subtitle">
            Track booking activity, revenue and car performance.
          </p>
        </div>

        <div className="reports-actions">
          <select
            aria-label="Report year"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {[0, 1, 2, 3, 4].map((offset) => {
              const optionYear = new Date().getFullYear() - offset;

              return (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              );
            })}
          </select>

          <button
            className="reports-export-button"
            onClick={exportCSV}
          >
            ↓ Export CSV
          </button>
        </div>
      </header>

      {/* Main statistics */}
      <section className="reports-stats">
        <article className="report-stat-card">
          <span className="report-stat-icon">📋</span>
          <p>Total Bookings</p>
          <h2>{summary.totalBookings}</h2>
          <span className="report-stat-note">All booking records</span>
        </article>

        <article className="report-stat-card">
          <span className="report-stat-icon">₹</span>
          <p>Total Paid Revenue</p>
          <h2>{formatCurrency(summary.totalRevenue)}</h2>
          <span className="report-stat-note">Successful payments</span>
        </article>

        <article className="report-stat-card">
          <span className="report-stat-icon">✓</span>
          <p>Completed Bookings</p>
          <h2>{summary.completedBookings}</h2>
          <span className="report-stat-note">Successfully completed</span>
        </article>

        <article className="report-stat-card">
          <span className="report-stat-icon">◷</span>
          <p>Pending Bookings</p>
          <h2>{summary.pendingBookings}</h2>
          <span className="report-stat-note">Awaiting resolution</span>
        </article>
      </section>

      {/* Booking status */}
      <section className="reports-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>Booking Status</h2>
            <p>Current status of all booking records</p>
          </div>
        </div>

        <div className="report-status-grid">
          {statusCards.map((item) => (
            <div
              className={`report-status-item ${item.className}`}
              key={item.label}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly activity */}
      <section className="reports-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>Monthly Booking Trends</h2>
            <p>Bookings created in {report.year}</p>
          </div>
        </div>

        <div className="reports-chart">
          {monthly.map((item) => (
            <div className="reports-chart-column" key={item.month}>
              <span className="reports-chart-value">
                {item.bookings}
              </span>

              <div className="reports-chart-track">
                <div
                  className="reports-chart-bar"
                  style={{
                    height: `${(item.bookings / maxBookings) * 100}%`,
                  }}
                  title={`${item.bookings} bookings`}
                />
              </div>

              <span className="reports-chart-month">
                {months[item.month - 1]}
              </span>
            </div>
          ))}
        </div>

        <div className="reports-revenue-summary">
          <span>Paid revenue for {report.year}</span>
          <strong>
            {formatCurrency(
              monthly.reduce((total, item) => total + item.revenue, 0)
            )}
          </strong>
        </div>
      </section>

      {/* Popular cars */}
      <section className="reports-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>Popular Rental Cars</h2>
            <p>Top five cars by booking count</p>
          </div>
        </div>

        {report.popularCars.length === 0 ? (
          <p className="reports-empty">No booking data available yet.</p>
        ) : (
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Total Bookings</th>
                  <th>Paid Revenue</th>
                </tr>
              </thead>

              <tbody>
                {report.popularCars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      <strong>
                        {`${car.brand} ${car.carName}`.trim()}
                      </strong>
                    </td>
                    <td>{car.totalBookings}</td>
                    <td className="reports-table-revenue">
                      {formatCurrency(car.paidRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Reports;