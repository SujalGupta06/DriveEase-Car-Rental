
const express = require("express");
const router = express.Router();

const {
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// GET /api/admin/bookings
router.get("/", protect, adminOnly, getAllBookings);

// PATCH /api/admin/bookings/:id/status
router.patch("/:id/status", protect, adminOnly, updateBookingStatus);

module.exports = router;
