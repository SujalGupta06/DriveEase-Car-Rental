
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Car = require("../models/Car");

// Create a new booking (Customer)
const createBooking = async (req, res) => {
  try {
    const {
      car,
      pickupLocation,
      returnLocation,
      pickupDate,
      returnDate,
      totalDays,
      totalAmount,
    } = req.body;

    if (
      !car ||
      !pickupLocation ||
      !returnLocation ||
      !pickupDate ||
      !returnDate ||
      !totalDays ||
      totalAmount == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(car)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const startDate = new Date(pickupDate);
    const endDate = new Date(returnDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after pickup date",
      });
    }

    const carExists = await Car.findById(car);

    if (!carExists) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      car,
      pickupLocation,
      returnLocation,
      pickupDate: startDate,
      returnDate: endDate,
      totalDays,
      totalAmount,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "fullName name email phone")
      .populate("car");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

// Get bookings for the logged-in customer
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("car")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your bookings",
    });
  }
};

// Get one booking by ID (owner only, unless admin)
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id)
      .populate("user", "fullName name email phone")
      .populate("car");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const isOwner =
      booking.user &&
      booking.user._id.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this booking",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

// Cancel a booking (Customer)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel another user's booking",
      });
    }

    if (
      booking.bookingStatus === "Completed" ||
      booking.bookingStatus === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: `A ${booking.bookingStatus.toLowerCase()} booking cannot be cancelled`,
      });
    }

    booking.bookingStatus = "Cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

// Check car availability for a date range
const checkCarAvailability = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.query;

    if (
      !carId ||
      !pickupDate ||
      !returnDate ||
      !mongoose.Types.ObjectId.isValid(carId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid car ID, pickup date, and return date are required",
      });
    }

    const startDate = new Date(pickupDate);
    const endDate = new Date(returnDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date range",
      });
    }

    const overlappingBooking = await Booking.findOne({
      car: carId,
      bookingStatus: { $in: ["Pending", "Confirmed"] },
      pickupDate: { $lt: endDate },
      returnDate: { $gt: startDate },
    });

    return res.status(200).json({
      success: true,
      available: !overlappingBooking,
    });
  } catch (error) {
    console.error("Check availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check car availability",
    });
  }
};

// ADMIN: Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "fullName name email phone")
      .populate("car")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ADMIN: Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Cancelled",
      "Completed",
    ];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("user", "fullName name email phone")
      .populate("car");

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkCarAvailability,
  getAllBookings,
  updateBookingStatus,
};
