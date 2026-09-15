import React from "react";
import { NavLink } from "react-router-dom";

function RecyclerSidebar() {
  const username =
    localStorage.getItem("username") || "Recycler";

  const email =
    localStorage.getItem("email") || "";

  return (
    <aside className="recycler-sidebar">

      <div className="recycler-brand">
        <div className="recycler-brand-icon">♻</div>

        <div>
          <h2>Textile Waste</h2>
          <span>Intelligence Platform</span>
        </div>
      </div>

      <nav className="recycler-nav">

        <NavLink
          to="/recycler/dashboard"
          className={({ isActive }) =>
            `recycler-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `recycler-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span>↑</span>
          Upload / AI Analysis
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `recycler-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span>▤</span>
          Waste Inventory
        </NavLink>

        <NavLink
          to="/recycler/recovery"
          className={({ isActive }) =>
            `recycler-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span>♻</span>
          Recycling / Recovery
        </NavLink>

        <NavLink
          to="/recycler/profile"
          className={({ isActive }) =>
            `recycler-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span>◉</span>
          My Profile
        </NavLink>

      </nav>

      <div className="recycler-sidebar-user">
        <div className="recycler-avatar">
          {username.charAt(0).toUpperCase()}
        </div>

        <div className="recycler-user-info">
          <strong>{username}</strong>
          <span>{email}</span>
        </div>
      </div>

    </aside>
  );
}

export default RecyclerSidebar;