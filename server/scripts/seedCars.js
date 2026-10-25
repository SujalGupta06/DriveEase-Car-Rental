const mongoose = require("mongoose");
require("dotenv").config();

const Car = require("../models/Car");

const cars = [
  {
    name: "Maruti Swift",
    brand: "Maruti Suzuki",
    category: "Hatchback",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 5,
    pricePerDay: 1200,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    description: "Comfortable and economical hatchback for city travel.",
    available: true,
  },
  {
    name: "Hyundai Creta",
    brand: "Hyundai",
    category: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 2000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
    description: "Premium SUV with comfortable interiors and smooth driving.",
    available: true,
  },
  {
    name: "Tata Nexon",
    brand: "Tata",
    category: "Compact SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 1700,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    description: "Compact SUV suitable for city and highway trips.",
    available: true,
  },
  {
    name: "Mahindra Thar",
    brand: "Mahindra",
    category: "SUV",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 4,
    pricePerDay: 2500,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
    description: "Rugged SUV designed for adventure and long drives.",
    available: true,
  },
  {
    name: "Toyota Innova Crysta",
    brand: "Toyota",
    category: "MPV",
    fuel: "Diesel",
    transmission: "Automatic",
    seats: 7,
    pricePerDay: 3000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    description: "Spacious 7-seater MPV ideal for family and group trips.",
    available: true,
  },
  {
    name: "Kia Seltos",
    brand: "Kia",
    category: "SUV",
    fuel: "Petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 2200,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
    description: "Modern SUV with premium features and comfortable seating.",
    available: true,
  },
];

const seedCars = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Remove existing cars so we don't create duplicates
    await Car.deleteMany({});

    // Insert all 6 cars
    const insertedCars = await Car.insertMany(cars);

    console.log(`${insertedCars.length} cars inserted successfully`);

    insertedCars.forEach((car) => {
      console.log(
        `${car.name} - ₹${car.pricePerDay}/day`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed cars:", error.message);
    process.exit(1);
  }
};

seedCars();