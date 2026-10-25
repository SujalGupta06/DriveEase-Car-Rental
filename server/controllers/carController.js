const mongoose = require("mongoose");
const Car = require("../models/Car");

// ==========================================
// GET ALL CARS
// GET /api/cars
// ==========================================
const getCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    console.error("Get cars error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cars",
    });
  }
};

// ==========================================
// GET SINGLE CAR
// GET /api/cars/:id
// ==========================================
const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    console.error("Get car by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch car",
    });
  }
};

// ==========================================
// CREATE CAR
// POST /api/cars
// ==========================================
const createCar = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      fuel,
      transmission,
      seats,
      pricePerDay,
      rating,
      image,
      description,
      available,
    } = req.body;

    if (
      !name ||
      !brand ||
      !category ||
      !fuel ||
      !transmission ||
      !seats ||
      !pricePerDay ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required car details",
      });
    }

    const car = await Car.create({
      name,
      brand,
      category,
      fuel,
      transmission,
      seats,
      pricePerDay,
      rating,
      image,
      description,
      available,
    });

    res.status(201).json({
      success: true,
      message: "Car created successfully",
      car,
    });
  } catch (error) {
    console.error("Create car error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create car",
    });
  }
};

// ==========================================
// UPDATE CAR
// PUT /api/cars/:id
// ==========================================
const updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      car,
    });
  } catch (error) {
    console.error("Update car error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update car",
    });
  }
};

// ==========================================
// DELETE CAR
// DELETE /api/cars/:id
// ==========================================
const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    await car.deleteOne();

    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error("Delete car error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete car",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};