import { NavLink, useNavigate } from "react-router-dom";
import "../styles/AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") || "Administrator";

  return (
    <aside className="admin-sidebar">

      {/* LOGO */}

      <div className="admin-logo">

        <div className="logo-icon">
          ♻
        </div>

        <div className="logo-text">
          <h2>Textile Waste</h2>
          <p>Intelligence Platform</p>
        </div>

      </div>


      {/* MENU */}

      <nav className="admin-menu">

        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
        >
          🏠 <span>Dashboard</span>
        </NavLink>


        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
        >
          👥 <span>User Management</span>
        </NavLink>


        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
        >
          📤 <span>Upload Textile</span>
        </NavLink>


        <NavLink
          to="/admin/uploads"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
        >
          📋 <span>Uploads</span>
        </NavLink>


        <NavLink
          to="/admin/inventory"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
        >
          📦 <span>Inventory</span>
        </NavLink>


        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
        >
          📊 <span>Predictive Analysis</span>
        </NavLink>


        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
        >
          📄 <span>Reports</span>
        </NavLink>


        {/* SUSTAINABILITY DASHBOARD */}

        <NavLink
          to="/sustainability-dashboard"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
        >
          ♻ <span>Sustainability Dashboard</span>
        </NavLink>

       
        {/* TEXTILE MANAGER DASHBOARD */}

        <NavLink
            to="/textile-manager-dashboard"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? "active" : ""}`
            }
          >
            ✣ <span>Textile Manager Dashboard</span>
        </NavLink>
          
           {/* RECYCLER DASHBOARD */}

        <NavLink
  to="/recycler/dashboard"
  className={({ isActive }) =>
    `admin-menu-item ${isActive ? "active" : ""}`
  }
>
  ♻ <span>Recycler Dashboard</span>
</NavLink>
  
        <NavLink
          to="/report-dashboard"
          className={({ isActive }) =>
            `admin-menu-item ${isActive ? "active" : ""}`
          }
      >
          📑 <span>Reports & Analytics</span>
        </NavLink>  

        </nav>


      {/* ADMIN PROFILE */}

      <div className="admin-profile-section">

        <button
          className="admin-profile-button"
          onClick={() => navigate("/admin/profile")}
        >

          <div className="admin-avatar">
            👤
          </div>

          <div className="admin-profile-text">
            <span className="administrator-label">
              Administrator
            </span>
          </div>

        </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;