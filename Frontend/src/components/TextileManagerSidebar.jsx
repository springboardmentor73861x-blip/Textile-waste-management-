import { NavLink, useNavigate } from "react-router-dom";
import "../styles/TextileManagerSidebar.css";

function TextileManagerSidebar() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") || "Textile Manager";

  return (
    <aside className="textile-manager-sidebar">

      {/* LOGO */}
      <div className="textile-manager-logo">
        <div className="textile-manager-logo-icon">
          ✣
        </div>

        <div className="textile-manager-logo-text">
          <h2>Textile Waste</h2>
          <p>Intelligence Platform</p>
        </div>
      </div>

      {/* TEXTILE MANAGER BANNER */}
      <div className="textile-manager-banner">
        <div className="textile-manager-banner-title">
          Textile Manager
        </div>

        <div className="textile-manager-banner-subtitle">
          Manage • Analyze • Optimize
        </div>
      </div>

      {/* MENU */}
      <nav className="textile-manager-menu">

        <NavLink
          to="/textile-manager-dashboard"
          className={({ isActive }) =>
            `textile-manager-menu-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="tm-menu-icon">⌂</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/textile-manager/upload"
          className={({ isActive }) =>
            `textile-manager-menu-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="tm-menu-icon">⇧</span>
          <span>Upload Textile</span>
        </NavLink>

        <NavLink
          to="/textile-manager/material-classification"
          className={({ isActive }) =>
            `textile-manager-menu-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="tm-menu-icon">▱</span>
          <span>Material Classification</span>
        </NavLink>

        <NavLink
          to="/textile-manager/ai-predictions"
          className={({ isActive }) =>
            `textile-manager-menu-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="tm-menu-icon">▣</span>
          <span>AI Predictions</span>
        </NavLink>

        <NavLink
          to="/textile-manager/recommendations"
          className={({ isActive }) =>
            `textile-manager-menu-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <span className="tm-menu-icon">♧</span>
          <span>Recommendations</span>
        </NavLink>

      </nav>

      {/* BOTTOM SECTION */}
      <div className="textile-manager-bottom-section">

        {/* BACK TO ADMIN */}
        {localStorage.getItem("role") === "admin" && (
  <div className="textile-manager-back-section">

    <button
      type="button"
      className="textile-manager-back-button"
      onClick={() => navigate("/admin-dashboard")}
    >
      <span className="textile-manager-back-icon">
        ←
      </span>

      <span>
        Back to Admin Dashboard
      </span>
    </button>

  </div>
)}

        {/* PROFILE - ALWAYS LAST */}
        <div className="textile-manager-profile-section">
          <button
            type="button"
            className="textile-manager-profile-button"
            onClick={() =>
              navigate("/textile-manager/profile")
            }
          >
            <div className="textile-manager-avatar">
              TM
            </div>

            <div className="textile-manager-profile-text">
              <span className="textile-manager-name">
                {username}
              </span>

              <span className="textile-manager-role">
                Textile Manager
              </span>
            </div>

            <span className="textile-manager-profile-arrow">
              ⌄
            </span>
          </button>
        </div>

      </div>

    </aside>
  );
}

export default TextileManagerSidebar;