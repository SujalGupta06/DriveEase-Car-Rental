
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  CarFront,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  LogOut,
  Pencil,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Profile.css";

const API_URL = "https://driveease-api-4zbo.onrender.com/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
  });

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login?redirect=%2Fprofile");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login?redirect=%2Fprofile");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your profile.");
      }

      const profile = data.user || data.profile || data.customer || data;

      setUser(profile);
      setForm({
        fullName: profile.fullName || profile.name || "",
        phone: profile.phone || "",
      });

      localStorage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = () => {
    setForm({
      fullName: user?.fullName || user?.name || "",
      phone: user?.phone || "",
    });
    setFormError("");
    setSuccess("");
    setEditing(true);
  };

  const handleCancel = () => {
    setForm({
      fullName: user?.fullName || user?.name || "",
      phone: user?.phone || "",
    });
    setEditing(false);
    setFormError("");
    setSuccess("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const phone = form.phone.trim();

    if (fullName.length < 2) {
      setFormError("Name must contain at least 2 characters.");
      return;
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      setFormError("Enter a valid 10-digit phone number.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login?redirect=%2Fprofile");
      return;
    }

    setSaving(true);
    setFormError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          phone,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login?redirect=%2Fprofile");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update your profile.");
      }

      const updatedUser = data.user || {
        ...user,
        fullName,
        phone,
      };

      setUser(updatedUser);
      setForm({
        fullName: updatedUser.fullName || fullName,
        phone: updatedUser.phone || "",
      });

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    navigate("/login");
  };

  const displayName =
    user?.fullName || user?.name || "DriveEase Customer";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div className="profile-state">
            <RefreshCw className="profile-spin" size={30} />
            <h2>Loading your profile...</h2>
            <p>Retrieving your account information.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div className="profile-state">
            <AlertCircle size={36} />
            <h2>Couldn't load your profile</h2>
            <p>{error}</p>
            <button
              type="button"
              className="profile-primary-button"
              onClick={fetchProfile}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-breadcrumb">
            <Link to="/dashboard">Dashboard</Link>
            <span>/</span>
            <span>My Profile</span>
          </div>

          <header className="profile-heading">
            <div>
              <p className="profile-eyebrow">YOUR DRIVE EASE ACCOUNT</p>
              <h1>My Profile</h1>
              <p>
                View your personal information and manage your account.
              </p>
            </div>

            <span className="profile-secure-label">
              <ShieldCheck size={17} />
              Secure Account
            </span>
          </header>

          {success && (
            <div className="profile-feedback profile-feedback-success" role="status">
              <CheckCircle2 size={19} />
              <span>{success}</span>
            </div>
          )}

          <section className="profile-main-card">
            <div className="profile-banner" />

            <div className="profile-identity">
              <div className="profile-avatar">
                {initials || <UserRound size={35} />}
              </div>

              <div className="profile-identity-info">
                <h2>{displayName}</h2>
                <p>{user?.email || "Email not available"}</p>
                <span className="profile-role">
                  <ShieldCheck size={13} />
                  {user?.role === "admin" ? "Administrator" : "Customer"}
                </span>
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-details-heading">
              <div>
                <h3>Personal Information</h3>
                <p>Your account details registered with DriveEase.</p>
              </div>

              {!editing && (
                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={handleEdit}
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form className="profile-edit-form" onSubmit={handleSave}>
                {formError && (
                  <div
                    className="profile-feedback profile-feedback-error"
                    role="alert"
                  >
                    <AlertCircle size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="profile-form-grid">
                  <label className="profile-form-field">
                    <span>Full Name</span>
                    <div className="profile-input-wrap">
                      <UserRound size={18} />
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        minLength={2}
                        maxLength={80}
                        required
                      />
                    </div>
                  </label>

                  <label className="profile-form-field">
                    <span>Phone Number</span>
                    <div className="profile-input-wrap">
                      <Phone size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter 10-digit phone number"
                        inputMode="numeric"
                        maxLength={10}
                      />
                    </div>
                  </label>
                </div>

                <div className="profile-readonly-note">
                  <Mail size={17} />
                  <span>
                    Email: <strong>{user?.email || "Not provided"}</strong>.
                    Email and account type cannot be edited here.
                  </span>
                </div>

                <div className="profile-edit-actions">
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-primary-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <RefreshCw className="profile-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-details-grid">
                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <UserRound size={19} />
                    </div>
                    <div>
                      <span>Full Name</span>
                      <strong>
                        {user?.fullName || user?.name || "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <Mail size={19} />
                    </div>
                    <div>
                      <span>Email Address</span>
                      <strong>{user?.email || "Not provided"}</strong>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <Phone size={19} />
                    </div>
                    <div>
                      <span>Phone Number</span>
                      <strong>{user?.phone || "Not provided"}</strong>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <ShieldCheck size={19} />
                    </div>
                    <div>
                      <span>Account Type</span>
                      <strong>
                        {user?.role === "admin" ? "Administrator" : "Customer"}
                      </strong>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="profile-detail-icon">
                      <CalendarDays size={19} />
                    </div>
                    <div>
                      <span>Member Since</span>
                      <strong>
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "Date unavailable"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="profile-note">
                  <ShieldCheck size={19} />
                  <p>
                    Your profile information is retrieved securely from your
                    authenticated DriveEase account.
                  </p>
                </div>
              </>
            )}
          </section>

          <section className="profile-shortcuts">
            <Link to="/dashboard" className="profile-shortcut">
              <div className="profile-shortcut-icon">
                <UserRound size={21} />
              </div>
              <div>
                <strong>My Dashboard</strong>
                <span>View your account overview</span>
              </div>
              <ArrowRight size={18} />
            </Link>

            <Link to="/bookings" className="profile-shortcut">
              <div className="profile-shortcut-icon">
                <CalendarDays size={21} />
              </div>
              <div>
                <strong>My Bookings</strong>
                <span>Manage your reservations</span>
              </div>
              <ArrowRight size={18} />
            </Link>

            <Link to="/cars" className="profile-shortcut">
              <div className="profile-shortcut-icon">
                <CarFront size={21} />
              </div>
              <div>
                <strong>Explore Cars</strong>
                <span>Find your next rental car</span>
              </div>
              <ArrowRight size={18} />
            </Link>
          </section>

          <div className="profile-logout-row">
            <p>Finished using your account?</p>
            <button
              type="button"
              className="profile-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Profile;
