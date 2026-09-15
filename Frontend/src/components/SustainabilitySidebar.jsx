import { useNavigate } from "react-router-dom";
import "../styles/SustainabilitySidebar.css";

function SustainabilitySidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sustainability-sidebar">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="sustainability-logo">

        <div className="sustainability-logo-icon">
          ♻
        </div>

        <div className="sustainability-logo-text">

          <h2>
            Textile Waste
          </h2>

          <p>
            Intelligence Platform
          </p>

        </div>

      </div>

      {/* =====================================================
          SUSTAINABILITY MENU
      ===================================================== */}

      <nav className="sustainability-menu">

        <a
          href="#top"
          className="sustainability-menu-item active"
        >
          ▦

          <span>
            Dashboard
          </span>
        </a>

        <a
          href="#waste-overview"
          className="sustainability-menu-item"
        >
          ♻

          <span>
            Waste Overview
          </span>
        </a>

        <a
          href="#environmental-impact"
          className="sustainability-menu-item"
        >
          ◎

          <span>
            Environmental Impact
          </span>
        </a>

        <a
          href="#reports"
          className="sustainability-menu-item"
        >
          ▤

          <span>
            Reports
          </span>
        </a>

        <a
          href="/sustainability-analytics"
          className="sustainability-menu-item"
        >
          ▥

          <span>
            Analytics
          </span>
        </a>

        <a
          href="/sustainability/profile"
          className="sustainability-menu-item"
        >
          ⚙

          <span>
            Settings
          </span>
        </a>

      </nav>

      {/* =====================================================
          BACK TO ADMIN
      ===================================================== */}

      {localStorage.getItem("role") === "admin" && (
  <div className="sustainability-back-section">

    <button
      type="button"
      className="sustainability-back-button"
      onClick={() => navigate("/admin-dashboard")}
    >

      <span className="sustainability-back-icon">
        ←
      </span>

      <span>
        Admin Dashboard
      </span>

    </button>

  </div>
)}

      {/* =====================================================
          SUSTAINABILITY MANAGER PROFILE
      ===================================================== */}

      <div className="sustainability-profile-section">

        <button
          type="button"
          className="sustainability-profile-button"
          onClick={() =>
            navigate("/sustainability/profile")
          }
        >

          <div className="sustainability-avatar">
            S
          </div>

          <div className="sustainability-profile-text">

            <span className="sustainability-manager-name">
              Sustainability Manager
            </span>

            <span className="sustainability-manager-role">
              Sustainability Manager
            </span>

          </div>

        </button>

      </div>

    </aside>
  );
}

export default SustainabilitySidebar;