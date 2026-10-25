import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CarFront,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const navigation = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Manage Cars",
      path: "/admin/cars",
      icon: CarFront,
    },
    {
      label: "Manage Bookings",
      path: "/admin/bookings",
      icon: CalendarDays,
    },
    {
      label: "Customers",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: ChartNoAxesCombined,
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("admin");
    navigate("/admin/login", { replace: true });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      {mobileMenuOpen && (
        <button
          className="admin-mobile-overlay"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileMenuOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-brand">
          <div className="admin-brand-logo">D</div>

          <div className="admin-brand-text">
            <strong>DriveEase</strong>
            <span>ADMIN PANEL</span>
          </div>

          <button
            className="admin-close-menu"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="admin-nav-label">MAIN MENU</div>

        <nav className="admin-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `admin-nav-link ${
                    isActive ? "admin-nav-link-active" : ""
                  }`
                }
                onClick={closeMobileMenu}
              >
                <Icon size={19} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-note">
            <div className="admin-status-dot" />
            <div>
              <strong>System Online</strong>
              <span>DriveEase Management</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main-area">
        <header className="admin-topbar">
          <button
            className="admin-menu-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={23} />
          </button>

          <div className="admin-topbar-title">
            <span>DriveEase</span>
            <span className="admin-topbar-divider">/</span>
            <strong>Administration</strong>
          </div>

          <div className="admin-topbar-badge">
            <span className="admin-status-dot" />
            Admin
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;