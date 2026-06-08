import { useState, useEffect, useRef } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react"; // Using motion for smoother feel
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  LogOut,
  Ticket,
  Mail,
  Activity,
  Menu,
  X,
  User,
  ChevronRight,
  Shield,
} from "lucide-react";
import apiClient from "../api/client";
import "../assets/styles/layout/applayout.scss"; // Renamed to .scss

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminNavItems = [
    { name: "Admin View", path: "/admin?tab=overview", icon: Shield },
    { name: "Payments", path: "/admin?tab=payments", icon: CreditCard },
    { name: "Users", path: "/admin?tab=users", icon: Users },
    { name: "Settings", path: "/admin?tab=settings", icon: Settings },
  ];

  const userNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Billing", path: "/billing", icon: CreditCard },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const SidebarContent = ({ onClick }) => (
    <div className="sidebar-inner">
      <Link to="/dashboard" className="al-logo" onClick={onClick}>
        <div className="al-logo-icon">
          <Activity size={18} color="#fff" />
        </div>
        <span className="al-logo-text">
          Web <span>Monitor</span>
        </span>
      </Link>

      <nav className="al-nav">
        {isAdmin && <div className="al-nav-section-label">System Admin</div>}
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            onClick={onClick}
            className={({ isActive }) =>
              `al-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} className="al-nav-icon" />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="al-user-section">
        <div className="al-user-card">
          <div className="al-user-avatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="al-user-info">
            <div className="al-user-name">{user?.fullname || user?.name}</div>
            <div className="al-user-status">System Operational</div>
          </div>
        </div>
        <button className="al-logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="al-root">
      {/* Desktop Sidebar */}
      <aside className="al-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="al-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="al-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                className="al-drawer-close"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
              <SidebarContent onClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="al-main-wrap">
        {/* Mobile top bar */}
        <header className="al-topbar">
          <button
            className="al-topbar-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="mobile-title">Web Monitor</span>
          <div className="al-topbar-user">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </header>

        <main className="al-main">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="al-bottom-nav">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `al-bottom-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
