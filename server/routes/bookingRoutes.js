
const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkCarAvailability,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

// IMPORTANT: Import middleware directly
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// ==========================================
// PUBLIC: CHECK CAR AVAILABILITY
// ==========================================
router.get("/availability", checkCarAvailability);

// ==========================================
// CUSTOMER: AUTHENTICATED BOOKING ROUTES
// ==========================================
router.post("/", protect, createBooking);

router.get("/my", protect, getMyBookings);

router.get("/:id", protect, getBookingById);

router.patch("/:id/cancel", protect, cancelBooking);

// ==========================================
// ADMIN: BOOKING MANAGEMENT
// ==========================================
router.get("/admin/all", protect, adminOnly, getAllBookings);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateBookingStatus
);

module.exports = router;
