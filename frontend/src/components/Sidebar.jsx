import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  FaBars,
  FaTachometerAlt,
  FaUsers,
  FaRecycle,
  FaIndustry,
  FaLeaf,
  FaBoxes,
  FaChartBar,
  FaFileAlt,
  FaClipboardList,
  FaWarehouse,
  FaSignOutAlt,
  FaBell,
  FaCog,
  FaCloudUploadAlt,
  FaClipboardCheck,
  FaChartPie,
  FaGlobe,
} from "react-icons/fa";

import "../css/Sidebar.css";


/* =====================================================
   GET USER
===================================================== */

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    return null;
  }
}


/* =====================================================
   GET ROLE
===================================================== */

function getStoredRole() {

  const user = getStoredUser();

  return String(
    user?.role ||
    localStorage.getItem("role") ||
    ""
  )
    .trim()
    .toLowerCase();
}


/* =====================================================
   NORMALIZE ROLE
===================================================== */

function normalizeRole(role) {

  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (
    value === "admin" ||
    value === "administrator"
  ) {
    return "admin";
  }

  if (
    value === "manufacturer" ||
    value === "manufacture"
  ) {
    return "manufacturer";
  }

  if (
    value === "recycler" ||
    value === "recycling"
  ) {
    return "recycler";
  }

  if (
    value === "manager" ||
    value === "sustainability" ||
    value === "sustainability_manager"
  ) {
    return "manager";
  }

  return value;
}


/* =====================================================
   SIDEBAR
===================================================== */

function Sidebar({
  collapsed,
  setCollapsed,
}) {

  const location = useLocation();
  const navigate = useNavigate();

  const userRole = normalizeRole(
    getStoredRole()
  );

  const path = location.pathname;


  /* =====================================================
     ADMIN MENU
  ===================================================== */

  const adminMenu = [

    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin",
    },

    {
      title: "User Management",
      icon: <FaUsers />,
      path: "/users",
    },

    {
      title: "Manufacturers",
      icon: <FaIndustry />,
      path: "/manufacturers",
    },

    {
      title: "Recyclers",
      icon: <FaRecycle />,
      path: "/recyclers",
    },

    {
      title: "Waste Inventory",
      icon: <FaBoxes />,
      path: "/inventory",
    },

    {
      title: "Waste Requests",
      icon: <FaClipboardList />,
      path: "/requests",
    },

    /* ADMIN PROCESSING */

    {
      title: "Processing",
      icon: <FaIndustry />,
      path: "/admin-processing",
    },

    /* ADMIN RECOVERY */

    {
      title: "Recovery",
      icon: <FaWarehouse />,
      path: "/admin-recovery",
    },

    {
      title: "Reports",
      icon: <FaChartBar />,
      path: "/reports",
    },

    {
      title: "Sustainability",
      icon: <FaLeaf />,
      path: "/manager",
    },

    {
      title: "Notifications",
      icon: <FaBell />,
      path: "/notifications",
    },

    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },

  ];


  /* =====================================================
     MANUFACTURER MENU
  ===================================================== */

  const manufacturerMenu = [

    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/manufacturer",
    },

    {
      title: "Production Waste",
      icon: <FaIndustry />,
      path: "/production",
    },

    {
      title: "Upload Waste",
      icon: <FaCloudUploadAlt />,
      path: "/manufacturer/upload-waste",
    },

    {
      title: "My Inventory",
      icon: <FaBoxes />,
      path: "/inventory",
    },

    {
      title: "Requests",
      icon: <FaClipboardList />,
      path: "/manufacturer-requests",
    },

    {
      title: "Reports",
      icon: <FaChartBar />,
      path: "/manufacturer-reports",
    },

    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },

  ];


  /* =====================================================
     RECYCLER MENU
  ===================================================== */

  const recyclerMenu = [

    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/recycler",
    },

    {
      title: "Available Waste",
      icon: <FaRecycle />,
      path: "/available-waste",
    },

    /*
       RECYCLER PROCESSING
       Different from Admin Processing
    */

    {
      title: "Processing",
      icon: <FaIndustry />,
      path: "/processing",
    },

    /*
       RECYCLER RECOVERY
    */

    {
      title: "Recovery",
      icon: <FaWarehouse />,
      path: "/recovery",
    },

    {
      title: "Recycling Requests",
      icon: <FaClipboardCheck />,
      path: "/recycler-requests",
    },

    {
      title: "Reports",
      icon: <FaChartBar />,
      path: "/recycler-reports",
    },

    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },

  ];


  /* =====================================================
     SUSTAINABILITY MENU
  ===================================================== */

  const sustainabilityMenu = [

    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/manager",
    },

    {
      title: "Sustainability Intelligence",
      icon: <FaLeaf />,
      path: "/manager",
    },

    {
      title: "Carbon Reports",
      icon: <FaGlobe />,
      path: "/carbon",
    },

    {
      title: "ESG Reports",
      icon: <FaFileAlt />,
      path: "/esg",
    },

    {
      title: "Waste Diversion",
      icon: <FaRecycle />,
      path: "/diversion",
    },

    {
      title: "Performance",
      icon: <FaChartPie />,
      path: "/performance",
    },

    {
      title: "Reports",
      icon: <FaChartBar />,
      path: "/sustainability-reports",
    },

    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },

  ];


  /* =====================================================
     AREA DETECTION
  ===================================================== */

  /*
     VERY IMPORTANT:

     /admin-processing is ADMIN AREA

     /processing is RECYCLER AREA

     So admin and recycler UI won't mix.
  */

  const isAdminProcessingArea =
    path === "/admin-processing";

  const isAdminRecoveryArea =
    path === "/admin-recovery";


  const isRecyclerArea =
    path === "/recycler" ||
    path.startsWith("/recycler/") ||
    path === "/available-waste" ||
    path === "/processing" ||
    path === "/recovery" ||
    path === "/recycler-requests" ||
    path === "/recycler-reports";


  const isManufacturerArea =
    path === "/manufacturer" ||
    path.startsWith("/manufacturer/") ||
    path === "/production" ||
    path === "/upload" ||
    path === "/waste-upload" ||
    path === "/inventory" ||
    path === "/manufacturer-requests" ||
    path === "/manufacturer-reports";


  const isSustainabilityArea =
    path === "/manager" ||
    path.startsWith("/manager/") ||
    path === "/sustainability" ||
    path.startsWith("/sustainability/") ||
    path === "/carbon" ||
    path === "/esg" ||
    path === "/diversion" ||
    path === "/performance" ||
    path === "/sustainability-reports";


  /* =====================================================
     SELECT MENU
  ===================================================== */

  let menu = adminMenu;

  let subtitle = "Administration Portal";


  /* =====================================================
     ADMIN
  ===================================================== */

  if (userRole === "admin") {

    /*
       Admin processing/recovery must NEVER
       switch to recycler menu.
    */

    if (
      isAdminProcessingArea ||
      isAdminRecoveryArea
    ) {

      menu = adminMenu;

      subtitle = "Administration Portal";

    }

    else if (isManufacturerArea) {

      menu = manufacturerMenu;

      subtitle = "Manufacturer Dashboard";

    }

    else if (isRecyclerArea) {

      menu = recyclerMenu;

      subtitle = "Recycler Dashboard";

    }

    else if (isSustainabilityArea) {

      menu = sustainabilityMenu;

      subtitle = "Sustainability Dashboard";

    }

    else {

      menu = adminMenu;

      subtitle = "Administration Portal";

    }

  }


  /* =====================================================
     MANUFACTURER
  ===================================================== */

  if (userRole === "manufacturer") {

    menu = manufacturerMenu;

    subtitle = "Manufacturer Portal";

  }


  /* =====================================================
     RECYCLER
  ===================================================== */

  if (userRole === "recycler") {

    menu = recyclerMenu;

    subtitle = "Recycler Portal";

  }


  /* =====================================================
     MANAGER
  ===================================================== */

  if (userRole === "manager") {

    menu = sustainabilityMenu;

    subtitle = "Sustainability Portal";

  }


  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("access_token");

    document.body.classList.remove(
      "dark-theme"
    );

    navigate("/login", {
      replace: true,
    });

  };


  /* =====================================================
     UI
  ===================================================== */

  return (

    <aside
      className={
        collapsed
          ? "app-sidebar collapsed"
          : "app-sidebar"
      }
    >

      <div className="app-sidebar-header">

        {!collapsed && (

          <div className="app-sidebar-brand">

            <div className="app-sidebar-logo">
              🧵
            </div>

            <div>

              <h2>
                Textile Waste AI
              </h2>

              <span>
                {subtitle}
              </span>

            </div>

          </div>

        )}

        <button
          type="button"
          className="app-sidebar-collapse-btn"
          onClick={() =>
            setCollapsed(
              current => !current
            )
          }
        >

          <FaBars />

        </button>

      </div>


      <div className="app-sidebar-section-title">

        {!collapsed && "Workspace"}

      </div>


      <nav className="app-sidebar-nav">

        {menu.map((item, index) => (

          <NavLink
            key={`${item.path}-${index}`}
            to={item.path}
            className={({ isActive }) =>
              `app-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >

            {item.icon}

            {!collapsed && (

              <span>
                {item.title}
              </span>

            )}

          </NavLink>

        ))}

      </nav>


      <div className="app-sidebar-footer">

        <button
          type="button"
          className="app-sidebar-logout"
          onClick={logout}
        >

          <FaSignOutAlt />

          {!collapsed && (
            <span>
              Logout
            </span>
          )}

        </button>

      </div>

    </aside>

  );
}

export default Sidebar;