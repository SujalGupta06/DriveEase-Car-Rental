const express = require("express");

const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// Get all cars
router.get("/", getCars);

// Get single car by MongoDB ID
router.get("/:id", getCarById);


// ==========================================
// ADMIN ROUTES
// ==========================================

// Add new car
router.post("/", protect, adminOnly, createCar);

// Update existing car
router.put("/:id", protect, adminOnly, updateCar);

// Delete car
router.delete("/:id", protect, adminOnly, deleteCar);


module.exports = router;