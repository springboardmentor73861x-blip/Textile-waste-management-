import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FaBell,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaTachometerAlt,
  FaIndustry,
  FaRecycle,
  FaLeaf,
  FaChevronDown,
  FaCheck,
  FaCheckDouble,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

import API from "../services/api";

import "../css/Navbar.css";


// ============================================================
// READ USER
// ============================================================

function readStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    const parsedUser = JSON.parse(rawUser);

    return parsedUser;
  } catch (error) {
    console.error("Failed to read stored user:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("role");

    return null;
  }
}


// ============================================================
// GET USER ID
// ============================================================

function getUserId(user) {
  if (!user) {
    return null;
  }

  const id =
    user.id ??
    user.user_id ??
    localStorage.getItem("user_id");

  if (id === null || id === undefined || id === "") {
    return null;
  }

  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return null;
  }

  return numericId;
}


// ============================================================
// NORMALIZE ROLE
// ============================================================

function getUserRole(user) {
  return String(
    user?.role ||
      localStorage.getItem("role") ||
      ""
  )
    .trim()
    .toLowerCase();
}


// ============================================================
// ROLE LABEL
// ============================================================

function getRoleLabel(role) {
  switch (role) {
    case "admin":
      return "Administrator";

    case "manufacturer":
      return "Manufacturer";

    case "recycler":
      return "Recycler";

    case "manager":
    case "sustainability":
      return "Sustainability";

    default:
      return "User";
  }
}


// ============================================================
// FORMAT NOTIFICATION TIME
// ============================================================

function formatNotificationTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


// ============================================================
// NAVBAR
// ============================================================

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ----------------------------------------------------------
  // USER
  // ----------------------------------------------------------

  const [user, setUser] = useState(() =>
    readStoredUser()
  );

  const role = getUserRole(user);

  const userId = getUserId(user);


  // ==========================================================
  // DARK MODE
  // ==========================================================

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") === "true"
    );
  });


  // ==========================================================
  // DROPDOWNS
  // ==========================================================

  const [showProfile, setShowProfile] =
    useState(false);

  const [showDashboards, setShowDashboards] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);


  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const [notifications, setNotifications] =
    useState([]);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [notificationError, setNotificationError] =
    useState("");

  const [notificationRefresh, setNotificationRefresh] =
    useState(0);


  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  const unreadCount = notifications.filter(
    (notification) =>
      notification &&
      (
        notification.is_read === false ||
        notification.is_read === 0 ||
        notification.is_read === "false"
      )
  ).length;


  // ==========================================================
  // UPDATE USER WHEN STORAGE CHANGES
  // ==========================================================

  useEffect(() => {
    const updateUser = () => {
      const storedUser = readStoredUser();

      setUser(storedUser);
    };

    window.addEventListener(
      "storage",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateUser
      );
    };
  }, []);


  // ==========================================================
  // DARK MODE
  // ==========================================================

  useEffect(() => {
    document.body.classList.toggle(
      "dark-theme",
      darkMode
    );

    localStorage.setItem(
      "darkMode",
      String(darkMode)
    );
  }, [darkMode]);


  // ==========================================================
  // CLOSE DROPDOWNS WHEN PAGE CHANGES
  // ==========================================================

  useEffect(() => {
    setShowProfile(false);
    setShowDashboards(false);
    setShowNotifications(false);
  }, [location.pathname]);


  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  const fetchNotifications = useCallback(
    async (showLoading = true) => {
      if (!userId) {
        console.warn(
          "Navbar: User ID not available."
        );

        setNotifications([]);
        return;
      }

      try {
        if (showLoading) {
          setNotificationLoading(true);
        }

        setNotificationError("");

        console.log(
          "=========================================="
        );

        console.log(
          "FETCHING NOTIFICATIONS"
        );

        console.log(
          "USER ID:",
          userId
        );

        const response = await API.get(
          `/notifications/?user_id=${userId}`
        );

        console.log(
          "NOTIFICATION RESPONSE:",
          response.data
        );

        console.log(
          "=========================================="
        );


        // ------------------------------------------------------
        // BACKEND RESPONSE
        // ------------------------------------------------------

        const data = response.data;


        if (
          data &&
          data.success === true &&
          Array.isArray(data.notifications)
        ) {
          setNotifications(
            data.notifications
          );

          return;
        }


        // ------------------------------------------------------
        // FALLBACK
        // ------------------------------------------------------

        if (Array.isArray(data)) {
          setNotifications(data);

          return;
        }


        // ------------------------------------------------------
        // INVALID RESPONSE
        // ------------------------------------------------------

        console.warn(
          "Unexpected notification response:",
          data
        );

        setNotifications([]);

      } catch (error) {
        console.error(
          "=========================================="
        );

        console.error(
          "NOTIFICATION FETCH ERROR"
        );

        console.error(error);

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "DATA:",
          error.response?.data
        );

        console.error(
          "=========================================="
        );

        setNotificationError(
          error.response?.data?.detail ||
            "Unable to load notifications."
        );

      } finally {
        if (showLoading) {
          setNotificationLoading(false);
        }
      }
    },
    [userId]
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchNotifications(true);
  }, [
    fetchNotifications,
    notificationRefresh,
  ]);


  // ==========================================================
  // AUTO REFRESH
  // EVERY 10 SECONDS
  // ==========================================================

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [
    userId,
    fetchNotifications,
  ]);


  // ==========================================================
  // TOGGLE NOTIFICATIONS
  // ==========================================================

  const toggleNotifications = () => {
    setShowNotifications(
      (current) => !current
    );

    setShowProfile(false);
    setShowDashboards(false);


    // --------------------------------------------------------
    // Refresh immediately when opening
    // --------------------------------------------------------

    if (!showNotifications) {
      fetchNotifications(true);
    }
  };


  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================

  const markAsRead = async (
    notificationId
  ) => {
    if (!notificationId) {
      return;
    }

    try {
      console.log(
        "Marking notification as read:",
        notificationId
      );

      await API.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => {
              if (
                notification.id ===
                notificationId
              ) {
                return {
                  ...notification,
                  is_read: true,
                };
              }

              return notification;
            }
          )
      );

    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };


  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const markAllAsRead = async () => {
    if (!userId) {
      return;
    }

    try {
      console.log(
        "Marking all notifications as read for:",
        userId
      );

      await API.put(
        `/notifications/read-all?user_id=${userId}`
      );

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };


  // ==========================================================
  // MANUAL REFRESH
  // ==========================================================

  const refreshNotifications = () => {
    setNotificationRefresh(
      (current) => current + 1
    );
  };


  // ==========================================================
  // THEME TOGGLE
  // ==========================================================

  const toggleTheme = () => {
    setDarkMode(
      (current) => !current
    );
  };


  // ==========================================================
  // SWITCH DASHBOARD
  // ADMIN CAN ACCESS EVERYTHING
  // ==========================================================

  const switchDashboard = (path) => {
    if (role !== "admin") {
      return;
    }

    setShowDashboards(false);

    navigate(path);
  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");

    document.body.classList.remove(
      "dark-theme"
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <header className="navbar">


      {/* ====================================================
          WELCOME
      ==================================================== */}

      <div className="welcome">

        <h2>
          Welcome,{" "}
          {user?.full_name || "User"} 👋
        </h2>

        <p>
          Manage the complete Textile Waste AI platform.
        </p>

      </div>


      {/* ====================================================
          RIGHT SIDE
      ==================================================== */}

      <div className="nav-right">


        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <div className="notification-wrapper">

          <button
            type="button"
            className={
              showNotifications
                ? "icon-box notification active"
                : "icon-box notification"
            }
            aria-label="Notifications"
            title="Notifications"
            onClick={toggleNotifications}
          >

            <FaBell />

            {unreadCount > 0 && (
              <span className="badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}

          </button>


          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

          {showNotifications && (

            <div className="notification-dropdown">


              {/* ===============================================
                  HEADER
              =============================================== */}

              <div className="notification-header">

                <div>

                  <h3>
                    Notifications
                  </h3>

                  <span>
                    {unreadCount} unread
                  </span>

                </div>


                <div className="notification-actions">

                  <button
                    type="button"
                    className="notification-refresh-btn"
                    title="Refresh notifications"
                    onClick={
                      refreshNotifications
                    }
                  >
                    <FaSpinner
                      className={
                        notificationLoading
                          ? "notification-spinner"
                          : ""
                      }
                    />
                  </button>


                  {unreadCount > 0 && (

                    <button
                      type="button"
                      className="mark-all-btn"
                      onClick={markAllAsRead}
                    >

                      <FaCheckDouble />

                      Mark all as read

                    </button>

                  )}

                </div>

              </div>


              {/* ===============================================
                  CONTENT
              =============================================== */}

              <div className="notification-list">


                {/* =============================================
                    LOADING
                ============================================= */}

                {notificationLoading && (

                  <div className="notification-empty">

                    <FaSpinner className="notification-spinner" />

                    <p>
                      Loading notifications...
                    </p>

                  </div>

                )}


                {/* =============================================
                    ERROR
                ============================================= */}

                {!notificationLoading &&
                  notificationError && (

                    <div className="notification-empty">

                      <FaTimes />

                      <p>
                        {notificationError}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          fetchNotifications(true)
                        }
                      >
                        Retry
                      </button>

                    </div>

                  )}


                {/* =============================================
                    EMPTY
                ============================================= */}

                {!notificationLoading &&
                  !notificationError &&
                  notifications.length === 0 && (

                    <div className="notification-empty">

                      <FaBell />

                      <p>
                        No notifications
                      </p>

                      <small>
                        You're all caught up.
                      </small>

                    </div>

                  )}


                {/* =============================================
                    NOTIFICATIONS
                ============================================= */}

                {!notificationLoading &&
                  !notificationError &&
                  notifications.length > 0 && (

                    notifications.map(
                      (notification) => {

                        const isUnread =
                          notification.is_read === false ||
                          notification.is_read === 0 ||
                          notification.is_read ===
                            "false";

                        return (

                          <div
                            key={
                              notification.id
                            }
                            className={
                              isUnread
                                ? "notification-item unread"
                                : "notification-item read"
                            }
                            onClick={() => {

                              if (isUnread) {
                                markAsRead(
                                  notification.id
                                );
                              }

                            }}
                          >

                            {/* =================================
                                ICON
                            ================================= */}

                            <div className="notification-icon">

                              <FaBell />

                            </div>


                            {/* =================================
                                CONTENT
                            ================================= */}

                            <div className="notification-content">

                              <div className="notification-title-row">

                                <strong>
                                  {
                                    notification.title ||
                                    "Notification"
                                  }
                                </strong>

                                {isUnread && (
                                  <span className="unread-dot" />
                                )}

                              </div>


                              <p>
                                {
                                  notification.message ||
                                  ""
                                }
                              </p>


                              <small>
                                {
                                  formatNotificationTime(
                                    notification.created_at
                                  )
                                }
                              </small>

                            </div>


                            {/* =================================
                                READ BUTTON
                            ================================= */}

                            {isUnread && (

                              <button
                                type="button"
                                className="notification-read-btn"
                                title="Mark as read"
                                onClick={(event) => {

                                  event.stopPropagation();

                                  markAsRead(
                                    notification.id
                                  );

                                }}
                              >

                                <FaCheck />

                              </button>

                            )}

                          </div>

                        );
                      }
                    )

                  )}

              </div>

            </div>

          )}

        </div>


        {/* ==================================================
            DASHBOARD SWITCHER
            ADMIN ONLY
        ================================================== */}

        {role === "admin" && (

          <div className="dashboard-switcher">

            <button
              type="button"
              className="dashboard-switcher-btn"
              onClick={() =>
                setShowDashboards(
                  (current) => !current
                )
              }
            >

              <FaTachometerAlt />

              <span>
                Dashboards
              </span>

              <FaChevronDown />

            </button>


            {showDashboards && (

              <div className="dashboard-switcher-menu">


                {/* ADMIN */}

                <button
                  type="button"
                  className={
                    location.pathname ===
                    "/admin"
                      ? "active-dashboard"
                      : ""
                  }
                  onClick={() =>
                    switchDashboard(
                      "/admin"
                    )
                  }
                >

                  <FaTachometerAlt />

                  <span>
                    Admin Dashboard
                  </span>

                </button>


                {/* MANUFACTURER */}

                <button
                  type="button"
                  className={
                    location.pathname ===
                    "/manufacturer"
                      ? "active-dashboard"
                      : ""
                  }
                  onClick={() =>
                    switchDashboard(
                      "/manufacturer"
                    )
                  }
                >

                  <FaIndustry />

                  <span>
                    Manufacturer
                  </span>

                </button>


                {/* RECYCLER */}

                <button
                  type="button"
                  className={
                    location.pathname ===
                    "/recycler"
                      ? "active-dashboard"
                      : ""
                  }
                  onClick={() =>
                    switchDashboard(
                      "/recycler"
                    )
                  }
                >

                  <FaRecycle />

                  <span>
                    Recycler
                  </span>

                </button>


                {/* SUSTAINABILITY */}

                <button
                  type="button"
                  className={
                    location.pathname ===
                    "/manager"
                      ? "active-dashboard"
                      : ""
                  }
                  onClick={() =>
                    switchDashboard(
                      "/manager"
                    )
                  }
                >

                  <FaLeaf />

                  <span>
                    Sustainability
                  </span>

                </button>

              </div>

            )}

          </div>

        )}


        {/* ==================================================
            DARK MODE
        ================================================== */}

        <button
          type="button"
          className="icon-box"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          title={
            darkMode
              ? "Light Mode"
              : "Dark Mode"
          }
        >

          {darkMode ? (
            <FaSun />
          ) : (
            <FaMoon />
          )}

        </button>


        {/* ==================================================
            PROFILE
        ================================================== */}

        <div
          className="profile"
          onClick={() =>
            setShowProfile(
              (current) => !current
            )
          }
        >

          <FaUserCircle
            className="profile-icon"
          />


          <div className="profile-name">

            <span>
              {user?.full_name || "User"}
            </span>

            <small>
              {getRoleLabel(role)}
            </small>

          </div>


          <FaChevronDown
            className="profile-arrow"
          />


          {showProfile && (

            <div
              className="profile-menu"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="profile-header">

                <FaUserCircle
                  className="big-icon"
                />

                <h3>
                  {user?.full_name || "User"}
                </h3>

                <p>
                  {user?.email || ""}
                </p>

                <small>
                  {getRoleLabel(role)}
                </small>

              </div>


              <hr />


              <button
                type="button"
                className="menu-item"
                onClick={() =>
                  navigate("/profile")
                }
              >

                <FaUser />

                My Profile

              </button>


              <button
                type="button"
                className="menu-item"
                onClick={() =>
                  navigate("/settings")
                }
              >

                <FaCog />

                Settings

              </button>


              <button
                type="button"
                className="menu-item logout"
                onClick={logout}
              >

                <FaSignOutAlt />

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}


export default Navbar;