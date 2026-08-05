import { NavLink, useLocation } from "react-router-dom";

import {
  FaBars,
  FaTachometerAlt,
  FaUsers,
  FaRecycle,
  FaIndustry,
  FaLeaf,
  FaBoxes,
  FaUpload,
  FaChartBar,
  FaFileAlt,
  FaClipboardList,
  FaWarehouse,
  FaSignOutAlt,
} from "react-icons/fa";

import "../css/Sidebar.css";

function Sidebar({ collapsed, setCollapsed }) {

  const location = useLocation();

  /* ================= ADMIN MENU ================= */

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
      title: "Waste Inventory",
      icon: <FaRecycle />,
      path: "/inventory",
    },
  ];

  /* ================= MANUFACTURER MENU ================= */

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
      title: "Waste Upload",
      icon: <FaUpload />,
      path: "/upload",
    },
    {
      title: "Inventory",
      icon: <FaBoxes />,
      path: "/inventory",
    },
    {
      title: "Reports",
      icon: <FaFileAlt />,
      path: "/manufacturer-reports",
    },
  ];

  /* ================= RECYCLER MENU ================= */

  const recyclerMenu = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/recycler",
    },
    {
      title: "Received Waste",
      icon: <FaRecycle />,
      path: "/received",
    },
    {
      title: "Processing",
      icon: <FaClipboardList />,
      path: "/processing",
    },
    {
      title: "Recovery",
      icon: <FaWarehouse />,
      path: "/recovery",
    },
    {
      title: "Reports",
      icon: <FaFileAlt />,
      path: "/recycler-reports",
    },
  ];

  /* ================= SUSTAINABILITY MENU ================= */

  const sustainabilityMenu = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/manager",
    },
    {
      title: "Carbon Reports",
      icon: <FaLeaf />,
      path: "/carbon",
    },
    {
      title: "ESG Reports",
      icon: <FaChartBar />,
      path: "/esg",
    },
    {
      title: "Waste Diversion",
      icon: <FaRecycle />,
      path: "/diversion",
    },
    {
      title: "Reports",
      icon: <FaFileAlt />,
      path: "/sustainability-reports",
    },
  ];

  /* ================= MENU SELECTION ================= */

  let menu = adminMenu;
  let title = "🧵 Textile Waste";

  if (location.pathname.startsWith("/manufacturer")) {
    menu = manufacturerMenu;
    title = "🏭 Manufacturer";
  }
  else if (
    location.pathname.startsWith("/production") ||
    location.pathname.startsWith("/upload") ||
    location.pathname.startsWith("/manufacturer-reports")
  ) {
    menu = manufacturerMenu;
    title = "🏭 Manufacturer";
  }

  else if (location.pathname.startsWith("/recycler")) {
    menu = recyclerMenu;
    title = "♻ Recycler";
  }
  else if (
    location.pathname.startsWith("/received") ||
    location.pathname.startsWith("/processing") ||
    location.pathname.startsWith("/recovery") ||
    location.pathname.startsWith("/recycler-reports")
  ) {
    menu = recyclerMenu;
    title = "♻ Recycler";
  }

  else if (location.pathname.startsWith("/manager")) {
    menu = sustainabilityMenu;
    title = "🌱 Sustainability";
  }
  else if (
    location.pathname.startsWith("/carbon") ||
    location.pathname.startsWith("/esg") ||
    location.pathname.startsWith("/diversion") ||
    location.pathname.startsWith("/sustainability-reports")
  ) {
    menu = sustainabilityMenu;
    title = "🌱 Sustainability";
  }

  else {
    menu = adminMenu;
    title = "🧵 Textile Waste";
  }

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      {/* Header */}

      <div className="sidebar-header">

        {!collapsed && (
          <h2>{title}</h2>
        )}

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaBars />
        </button>

      </div>

      {/* Menu */}

      <nav>

        {menu.map((item, index) => (

          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => (isActive ? "active" : "")}
          >

            {item.icon}

            {!collapsed && <span>{item.title}</span>}

          </NavLink>

        ))}

      </nav>

      {/* Logout */}

      <div className="logout-section">

        <NavLink
          to="/login"
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("role");
          }}
        >
          <FaSignOutAlt />

          {!collapsed && <span>Logout</span>}

        </NavLink>

      </div>

    </div>
  );
}

export default Sidebar;