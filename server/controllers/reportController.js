const Booking = require("../models/Booking");

// GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid report year.",
      });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const [
      totalBookings,
      statusCounts,
      revenueResult,
      monthlyResults,
      popularCars,
    ] = await Promise.all([
      Booking.countDocuments(),

      Booking.aggregate([
        {
          $group: {
            _id: "$bookingStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      Booking.aggregate([
        { $match: { paymentStatus: "Paid" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lt: endDate },
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

      Booking.aggregate([
        {
          $group: {
            _id: "$car",
            totalBookings: { $sum: 1 },
            paidRevenue: {
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
        { $sort: { totalBookings: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "cars",
            localField: "_id",
            foreignField: "_id",
            as: "carDetails",
          },
        },
        {
          $unwind: {
            path: "$carDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            totalBookings: 1,
            paidRevenue: 1,
            carName: {
              $ifNull: ["$carDetails.name", "Deleted car"],
            },
            brand: { $ifNull: ["$carDetails.brand", ""] },
          },
        },
      ]),
    ]);

    const statusSummary = {
      Pending: 0,
      Confirmed: 0,
      Cancelled: 0,
      Completed: 0,
    };

    statusCounts.forEach((item) => {
      if (Object.hasOwn(statusSummary, item._id)) {
        statusSummary[item._id] = item.count;
      }
    });

    const monthlySummary = Array.from({ length: 12 }, (_, index) => {
      const item = monthlyResults.find(
        (result) => result._id === index + 1
      );

      return {
        month: index + 1,
        bookings: item?.bookings || 0,
        revenue: item?.revenue || 0,
      };
    });

    res.status(200).json({
      success: true,
      year,
      summary: {
        totalBookings,
        totalRevenue: revenueResult[0]?.total || 0,
        pendingBookings: statusSummary.Pending,
        confirmedBookings: statusSummary.Confirmed,
        cancelledBookings: statusSummary.Cancelled,
        completedBookings: statusSummary.Completed,
      },
      monthlySummary,
      popularCars,
    });
  } catch (error) {
    console.error("Reports API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate reports.",
    });
  }
};

module.exports = { getReports };