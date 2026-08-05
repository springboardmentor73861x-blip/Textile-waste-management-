import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
  FaCog,
} from "react-icons/fa";
import "../css/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-theme");
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar">

      <div className="welcome">
        <h2>Welcome, {user?.full_name} 👋</h2>
        <p>{user?.role}</p>
      </div>

      <div className="nav-right">

        {/* Notifications */}

        <div className="icon-box notification">
          <FaBell />
          <span className="badge">3</span>
        </div>

        {/* Dark Mode */}

        <div className="icon-box" onClick={toggleTheme}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </div>

        {/* Profile */}

        <div
          className="profile"
          onClick={() => setShowProfile(!showProfile)}
        >
          <FaUserCircle className="profile-icon" />

          <span>{user?.full_name}</span>

          {showProfile && (
            <div className="profile-menu">

              <div className="profile-header">

                <FaUserCircle className="big-icon" />

                <h3>{user?.full_name}</h3>

                <p>{user?.email}</p>

                <small>{user?.role}</small>

              </div>

              <hr />

              <div className="menu-item">
                <FaUser />
                My Profile
              </div>

              <div className="menu-item">
                <FaCog />
                Settings
              </div>

              <div
                className="menu-item logout"
                onClick={logout}
              >
                <FaSignOutAlt />
                Logout
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Navbar;