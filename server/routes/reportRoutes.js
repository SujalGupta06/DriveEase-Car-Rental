const express = require("express");
const router = express.Router();

const { getReports } = require("../controllers/reportController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

router.get("/", protect, adminOnly, getReports);

module.exports = router;