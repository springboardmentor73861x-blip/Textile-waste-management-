
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Report/ReportSidebar.css";

function ReportSidebar() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Admin";

  const menuItems = [
    {
      label: "Dashboard",
      icon: "▦",
      path: "/admin-dashboard",
    },
    {
      label: "Waste Management",
      icon: "♻",
      path: "/admin/inventory",
    },
    {
      label: "Image Analysis",
      icon: "▣",
      path: "/admin/uploads",
    },
    {
      label: "Material Classification",
      icon: "◈",
      path: "/textile-manager/material-classification",
    },
    {
      label: "Waste Classification",
      icon: "◆",
      path: "/result",
    },
    {
      label: "Recycling Recommendations",
      icon: "↻",
      path: "/textile-manager/recommendations",
    },
    {
      label: "Sustainability Dashboard",
      icon: "🌿",
      path: "/sustainability-dashboard",
    },
    {
      label: "Inventory Management",
      icon: "▤",
      path: "/inventory",
    },
    {
      label: "Reports & Analytics",
      icon: "▥",
      path: "/admin/reports",
    },
    {
      label: "Users & Roles",
      icon: "♙",
      path: "/admin/users",
    },
    {
      label: "Analytics",
      icon: "◒",
      path: "/admin/analytics",
    },
    {
      label: "Settings",
      icon: "⚙",
      path: "/admin/profile",
    },
  ];

  return (
    <aside className="report-sidebar">
      {/* Logo */}
      <div className="report-sidebar-logo">
        <div className="report-logo-icon">♻</div>

        <div className="report-logo-text">
          <h2>Textile Waste</h2>
          <span>Intelligence Platform</span>
        </div>
      </div>

      {/* Sidebar Menu */}
      <nav className="report-sidebar-menu">
        <p className="report-menu-title">MAIN MENU</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `report-menu-item ${
                isActive ? "report-menu-item-active" : ""
              }`
            }
          >
            <span className="report-menu-icon">{item.icon}</span>
            <span className="report-menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile */}
      <div className="report-sidebar-bottom">
        <div
          className="report-profile"
          onClick={() => navigate("/admin/profile")}
        >
          <div className="report-profile-avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="report-profile-info">
            <strong>{username}</strong>
            <span>Administrator</span>
          </div>

          <span className="report-profile-arrow">›</span>
        </div>
      </div>
    </aside>
  );
}

export default ReportSidebar;
