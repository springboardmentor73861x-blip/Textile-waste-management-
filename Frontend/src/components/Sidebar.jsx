import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        <h2>♻ Textile Waste</h2>
        <p>Intelligence Platform</p>
      </div>

      <nav className="menu">

        <NavLink to="/dashboard">
          🏠 <span>Dashboard</span>
        </NavLink>

        <NavLink to="/inventory">
          📦 <span>Inventory</span>
        </NavLink>

        <NavLink to="/result">
          📄 <span>Prediction Result</span>
        </NavLink> 

        <NavLink to="/upload">
          📤 <span>Upload Textile</span>
        </NavLink>

        <NavLink to="/profile">
          👤 <span>Profile</span>
        </NavLink>

      </nav>

      <div className="logout">

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            window.location.href = "/";
          }}
        >
          🚪 Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;