
const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Customer: get own profile
router.get("/profile", protect, getUserProfile);

// Customer: update own profile
router.put("/profile", protect, updateUserProfile);

// Admin: get all users
router.get("/admin/users", protect, adminOnly, getAllUsers);

// Admin: test route
router.get(
  "/admin-test",
  protect,
  adminOnly,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to DriveEase Admin API",
      admin: req.user,
    });
  }
);

module.exports = router;
