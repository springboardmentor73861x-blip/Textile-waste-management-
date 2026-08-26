import { useEffect, useState } from "react";
import {
  FaLock,
  FaBell,
  FaMoon,
  FaSun,
  FaSave,
  FaUserCog,
  FaShieldAlt,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../css/Settings.css";

function Settings() {
  const [collapsed, setCollapsed] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleSave = () => {
    localStorage.setItem(
      "notifications",
      notifications
    );

    localStorage.setItem(
      "darkMode",
      darkMode
    );

    setMessage("Settings saved successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleChangePassword = () => {
    alert(
      "Password change functionality will be connected to the backend later."
    );
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* CONTENT */}

      <div
        className={`dashboard-content ${
          collapsed ? "collapsed" : ""
        }`}
      >

        <Navbar />

        <main className="settings-page">

          {/* PAGE HEADER */}

          <div className="settings-header">

            <div className="settings-header-icon">
              <FaUserCog />
            </div>

            <div>
              <h1>Settings</h1>

              <p>
                Manage your account and platform preferences.
              </p>
            </div>

          </div>


          {/* SECURITY */}

          <section className="settings-card">

            <div className="settings-card-header">

              <div className="settings-section-icon security">
                <FaLock />
              </div>

              <div>
                <h2>Security</h2>

                <p>
                  Manage your account security.
                </p>
              </div>

            </div>


            <div className="settings-row">

              <div className="settings-row-info">

                <h3>Password</h3>

                <p>
                  Change your account password.
                </p>

              </div>

              <button
                type="button"
                className="settings-action-btn"
                onClick={handleChangePassword}
              >
                <FaLock />
                Change Password
              </button>

            </div>

          </section>


          {/* PREFERENCES */}

          <section className="settings-card">

            <div className="settings-card-header">

              <div className="settings-section-icon preferences">
                <FaShieldAlt />
              </div>

              <div>
                <h2>Preferences</h2>

                <p>
                  Control your dashboard preferences.
                </p>
              </div>

            </div>


            {/* NOTIFICATIONS */}

            <div className="settings-row">

              <div className="settings-row-left">

                <div className="settings-option-icon notification">
                  <FaBell />
                </div>

                <div className="settings-row-info">

                  <h3>Notifications</h3>

                  <p>
                    Receive waste processing and request
                    notifications.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className={`toggle-switch ${
                  notifications ? "active" : ""
                }`}
                onClick={() =>
                  setNotifications(
                    (current) => !current
                  )
                }
                aria-label="Toggle notifications"
              >
                <span />
              </button>

            </div>


            {/* DARK MODE */}

            <div className="settings-row">

              <div className="settings-row-left">

                <div className="settings-option-icon dark">
                  {darkMode ? <FaMoon /> : <FaSun />}
                </div>

                <div className="settings-row-info">

                  <h3>Dark Mode</h3>

                  <p>
                    Use dark theme throughout the platform.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className={`toggle-switch ${
                  darkMode ? "active" : ""
                }`}
                onClick={() =>
                  setDarkMode(
                    (current) => !current
                  )
                }
                aria-label="Toggle dark mode"
              >
                <span />
              </button>

            </div>

          </section>


          {/* SAVE */}

          <div className="settings-save-area">

            {message && (
              <div className="settings-success">
                {message}
              </div>
            )}

            <button
              type="button"
              className="save-settings-btn"
              onClick={handleSave}
            >
              <FaSave />
              Save Changes
            </button>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Settings;