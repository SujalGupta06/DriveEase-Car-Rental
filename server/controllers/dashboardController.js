const Car = require("../models/Car");
const User = require("../models/User");
const Booking = require("../models/Booking");

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCars,
      totalBookings,
      totalCustomers,
      revenueResult,
      recentBookings,
      monthlyBookings,
    ] = await Promise.all([
      // Total cars
      Car.countDocuments(),

      // All bookings
      Booking.countDocuments(),

      // Customer accounts only
      User.countDocuments({ role: "customer" }),

      // Revenue from paid bookings only
      Booking.aggregate([
        { $match: { paymentStatus: "Paid" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Latest 5 bookings
      Booking.find()
        .populate("user", "fullName email")
        .populate("car", "name brand image")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Monthly bookings and paid revenue for this year
      Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), 0, 1),
              $lt: new Date(new Date().getFullYear() + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "Paid"] },
                  "$totalAmount",
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const revenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCars,
        totalBookings,
        totalCustomers,
        totalRevenue: revenue,
      },
      recentBookings,
      monthlyBookings,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
    });
  }
};

module.exports = { getDashboardStats };