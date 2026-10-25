import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/Booking";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Profile from "./pages/Profile";
import UserDashboard from "./pages/UserDashboard";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";
import BookingConfirmation from "./pages/BookingConfirmation";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import ManageCars from "./admin/ManageCars";
import AddEditCar from "./admin/AddEditCar";
import ManageBookings from "./admin/ManageBookings";
import ManageUsers from "./admin/ManageUsers";
import Reports from "./admin/Reports";
import Settings from "./admin/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CUSTOMER ROUTES */}

        <Route path="/" element={<Home />} />

        <Route path="/cars" element={<Cars />} />

        <Route
          path="/cars/:id"
          element={<CarDetails />}
        />

        <Route
          path="/booking/:id"
          element={<Booking />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<Profile />} />

        <Route
          path="/dashboard"
          element={<UserDashboard />}
        />

        <Route
          path="/bookings"
          element={<MyBookings />}
        />

        <Route
          path="/bookings/:id"
          element={<BookingDetails />}
        />

        <Route
          path="/booking-confirmation"
          element={<BookingConfirmation />}
        />

        {/* ADMIN LOGIN - OUTSIDE THE ADMIN LAYOUT */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* SHARED ADMIN LAYOUT */}

        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="cars"
            element={<ManageCars />}
          />

          <Route
            path="cars/add"
            element={<AddEditCar />}
          />

          <Route
            path="cars/edit/:id"
            element={<AddEditCar />}
          />

          <Route
            path="bookings"
            element={<ManageBookings />}
          />

          <Route
            path="users"
            element={<ManageUsers />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;