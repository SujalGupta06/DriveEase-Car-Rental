
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  changeAdminPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Register customer
router.post("/register", registerUser);

// Login user/admin
router.post("/login", loginUser);

// Change admin password
router.put(
  "/admin/change-password",
  protect,
  adminOnly,
  changeAdminPassword
);

module.exports = router;
