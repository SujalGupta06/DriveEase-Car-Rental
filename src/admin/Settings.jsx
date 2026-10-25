
import { useEffect, useState } from "react";
import "./Settings.css";

const API_BASE = "http://localhost:5000/api";

const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  bookingNotifications: true,
  compactView: false,
};

function Settings() {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("driveEaseAdminPreferences");

      return saved
        ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) }
        : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [preferencesMessage, setPreferencesMessage] = useState("");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState("");

  const adminToken = localStorage.getItem("adminToken");

  // Load admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError("");

      if (!adminToken) {
        setProfileError("Admin session not found. Please log in again.");
        setProfileLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/users/profile`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load admin profile");
        }

        setProfile(data.user || data);
      } catch (error) {
        setProfileError(error.message || "Unable to load profile");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [adminToken]);

  // Save application preferences locally
  const handlePreferenceChange = (key) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));

    setPreferencesMessage("");
  };

  const savePreferences = () => {
    try {
      localStorage.setItem(
        "driveEaseAdminPreferences",
        JSON.stringify(preferences)
      );

      setPreferencesMessage("Preferences saved successfully.");
    } catch {
      setPreferencesMessage("Unable to save preferences in this browser.");
    }
  };

  const resetPreferences = () => {
    setPreferences({ ...DEFAULT_PREFERENCES });

    try {
      localStorage.setItem(
        "driveEaseAdminPreferences",
        JSON.stringify(DEFAULT_PREFERENCES)
      );

      setPreferencesMessage("Preferences reset successfully.");
    } catch {
      setPreferencesMessage("Unable to reset preferences.");
    }
  };

  // Handle password input
  const handlePasswordInput = (event) => {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordMessageType("");
  };

  // Show or hide an individual password
  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  // Change admin password using the backend API
  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordMessageType("");

    if (!adminToken) {
      setPasswordMessage("Admin session not found. Please log in again.");
      setPasswordMessageType("error");
      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all password fields.");
      setPasswordMessageType("error");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      setPasswordMessage(
        "Your new password must be between 8 and 128 characters."
      );
      setPasswordMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        "New password and confirm password do not match."
      );
      setPasswordMessageType("error");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage(
        "Your new password must differ from your current password."
      );
      setPasswordMessageType("error");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/auth/admin/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password.");
      }

      setPasswordMessage(
        data.message || "Password changed successfully!"
      );
      setPasswordMessageType("success");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswords({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
    } catch (error) {
      setPasswordMessage(
        error.message || "Something went wrong. Please try again."
      );
      setPasswordMessageType("error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitial = (name) =>
    name?.trim()?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="settings-page">
      <header className="settings-header">
        <span className="settings-eyebrow">
          DRIVEASE ADMINISTRATION
        </span>

        <h1>Settings</h1>

        <p>Manage your account and application preferences.</p>
      </header>

      {/* Admin Profile */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-icon settings-profile-icon">
            <span aria-hidden="true">👤</span>
          </div>

          <div>
            <h2>Admin Profile</h2>
            <p>Your account information</p>
          </div>
        </div>

        {profileLoading ? (
          <div className="settings-state">
            Loading admin profile...
          </div>
        ) : profileError ? (
          <div className="settings-message error" role="alert">
            {profileError}
          </div>
        ) : (
          <>
            <div className="settings-profile-summary">
              <div className="settings-avatar">
                {getInitial(profile?.fullName)}
              </div>

              <div className="settings-profile-identity">
                <h3>{profile?.fullName || "Admin"}</h3>
                <p>{profile?.email || "No email available"}</p>

                <span className="settings-role-badge">
                  {profile?.role || "admin"}
                </span>
              </div>
            </div>

            <div className="settings-profile-details">
              <div className="settings-detail">
                <span>Full Name</span>
                <strong>{profile?.fullName || "Not available"}</strong>
              </div>

              <div className="settings-detail">
                <span>Email Address</span>
                <strong>{profile?.email || "Not available"}</strong>
              </div>

              <div className="settings-detail">
                <span>Phone Number</span>
                <strong>{profile?.phone || "Not available"}</strong>
              </div>

              <div className="settings-detail">
                <span>Account Role</span>
                <strong>{profile?.role || "admin"}</strong>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Application Preferences */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-icon">
            <span aria-hidden="true">⚙️</span>
          </div>

          <div>
            <h2>Application Preferences</h2>
            <p>Choose your preferred settings</p>
          </div>
        </div>

        <div className="settings-preference-list">
          <div className="settings-preference">
            <div>
              <h3>Email Notifications</h3>
              <p>Preference for email-related notifications.</p>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                preferences.emailNotifications ? "active" : ""
              }`}
              role="switch"
              aria-checked={preferences.emailNotifications}
              aria-label="Email notifications"
              onClick={() =>
                handlePreferenceChange("emailNotifications")
              }
            >
              <span />
            </button>
          </div>

          <div className="settings-preference">
            <div>
              <h3>Booking Notifications</h3>
              <p>Preference for booking alerts in the interface.</p>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                preferences.bookingNotifications ? "active" : ""
              }`}
              role="switch"
              aria-checked={preferences.bookingNotifications}
              aria-label="Booking notifications"
              onClick={() =>
                handlePreferenceChange("bookingNotifications")
              }
            >
              <span />
            </button>
          </div>

          <div className="settings-preference">
            <div>
              <h3>Compact View</h3>
              <p>Preference for a more compact interface.</p>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                preferences.compactView ? "active" : ""
              }`}
              role="switch"
              aria-checked={preferences.compactView}
              aria-label="Compact view"
              onClick={() => handlePreferenceChange("compactView")}
            >
              <span />
            </button>
          </div>
        </div>

        {preferencesMessage && (
          <p className="settings-inline-message" role="status">
            {preferencesMessage}
          </p>
        )}

        <div className="settings-actions">
          <button
            type="button"
            className="settings-button secondary"
            onClick={resetPreferences}
          >
            Reset
          </button>

          <button
            type="button"
            className="settings-button primary"
            onClick={savePreferences}
          >
            Save Preferences
          </button>
        </div>

        <p className="settings-note">
          These preferences are stored in this browser. They do not
          enable email delivery or change notification behavior on the
          server.
        </p>
      </section>

      {/* Security and Change Password */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-icon settings-security-icon">
            <span aria-hidden="true">🔒</span>
          </div>

          <div>
            <h2>Security</h2>
            <p>Keep your administrator account secure</p>
          </div>
        </div>

        <div className="settings-security-info">
          <div>
            <h3>Change Password</h3>
            <p>
              Enter your current password and choose a new password
              for your admin account.
            </p>
          </div>

          <span className="settings-security-badge">
            Password protected
          </span>
        </div>

        <form
          className="settings-password-form"
          onSubmit={handleChangePassword}
        >
          <div className="settings-password-field">
            <label htmlFor="currentPassword">
              Current Password
            </label>

            <div className="settings-password-input-wrap">
              <input
                id="currentPassword"
                name="currentPassword"
                type={
                  showPasswords.currentPassword ? "text" : "password"
                }
                value={passwords.currentPassword}
                onChange={handlePasswordInput}
                autoComplete="current-password"
                placeholder="Enter current password"
                required
              />

              <button
                type="button"
                className="settings-password-visibility"
                onClick={() =>
                  togglePasswordVisibility("currentPassword")
                }
                aria-label={
                  showPasswords.currentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showPasswords.currentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="settings-password-field">
            <label htmlFor="newPassword">New Password</label>

            <div className="settings-password-input-wrap">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.newPassword ? "text" : "password"}
                value={passwords.newPassword}
                onChange={handlePasswordInput}
                autoComplete="new-password"
                placeholder="Enter new password"
                minLength={8}
                maxLength={128}
                required
              />

              <button
                type="button"
                className="settings-password-visibility"
                onClick={() =>
                  togglePasswordVisibility("newPassword")
                }
                aria-label={
                  showPasswords.newPassword
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showPasswords.newPassword ? "Hide" : "Show"}
              </button>
            </div>

            <small>Use at least 8 characters.</small>
          </div>

          <div className="settings-password-field">
            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <div className="settings-password-input-wrap">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showPasswords.confirmPassword ? "text" : "password"
                }
                value={passwords.confirmPassword}
                onChange={handlePasswordInput}
                autoComplete="new-password"
                placeholder="Confirm new password"
                minLength={8}
                maxLength={128}
                required
              />

              <button
                type="button"
                className="settings-password-visibility"
                onClick={() =>
                  togglePasswordVisibility("confirmPassword")
                }
                aria-label={
                  showPasswords.confirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
              >
                {showPasswords.confirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`settings-message ${passwordMessageType}`}
              role={passwordMessageType === "error" ? "alert" : "status"}
            >
              {passwordMessage}
            </div>
          )}

          <div className="settings-password-actions">
            <button
              type="button"
              className="settings-button secondary"
              disabled={passwordLoading}
              onClick={() => {
                setPasswords({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });

                setPasswordMessage("");
                setPasswordMessageType("");

                setShowPasswords({
                  currentPassword: false,
                  newPassword: false,
                  confirmPassword: false,
                });
              }}
            >
              Clear
            </button>

            <button
              type="submit"
              className="settings-button primary"
              disabled={passwordLoading}
            >
              {passwordLoading
                ? "Updating Password..."
                : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Settings;
