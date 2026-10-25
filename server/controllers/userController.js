
const User = require("../models/User");
const Booking = require("../models/Booking");

// Get logged-in user's profile
const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const safeUser = user.toObject
      ? user.toObject()
      : { ...user };

    delete safeUser.password;

    return res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// Update logged-in user's profile
const updateUserProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    if (
      typeof fullName !== "string" ||
      fullName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name must contain at least 2 characters",
      });
    }

    if (
      typeof phone !== "string" ||
      !/^\d{10}$/.test(phone.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits",
      });
    }

    req.user.fullName = fullName.trim();
    req.user.phone = phone.trim();

    await req.user.save();

    const safeUser = req.user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Get all users for the admin panel, including booking counts
const getAllUsers = async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const role =
      typeof req.query.role === "string"
        ? req.query.role.trim().toLowerCase()
        : "";

    if (role && !["customer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role filter",
      });
    }

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      // Escape special regex characters in user input
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        {
          fullName: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    const [users, totalUsers, totalCustomers, bookingCounts] =
      await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .limit(100)
          .lean(),

        User.countDocuments(),

        User.countDocuments({ role: "customer" }),

        Booking.aggregate([
          {
            $group: {
              _id: "$user",
              totalBookings: { $sum: 1 },
            },
          },
        ]),
      ]);

    const bookingCountMap = new Map(
      bookingCounts.map((item) => [
        String(item._id),
        item.totalBookings,
      ])
    );

    const usersWithBookingCounts = users.map((user) => ({
      ...user,
      totalBookings:
        bookingCountMap.get(String(user._id)) || 0,
    }));

    return res.status(200).json({
      success: true,
      count: usersWithBookingCounts.length,
      totalUsers,
      totalCustomers,
      users: usersWithBookingCounts,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
};
