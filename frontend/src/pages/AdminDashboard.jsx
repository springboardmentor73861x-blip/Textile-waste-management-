import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCharts from "../components/DashboardCharts";
import API from "../services/api";

import {
  FaUsers,
  FaRecycle,
  FaIndustry,
  FaLeaf,
  FaBoxes,
  FaClock,
  FaArrowRight,
  FaUserCog,
  FaWarehouse,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";

import "../css/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  const [stats, setStats] = useState({
    total_users: 0,
    total_waste: 0,
    manufacturers: 0,
    recyclers: 0,
    inventory: 0,
    pending: 0,
    managers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/admin/dashboard");

        const data =
          response?.data?.data ??
          response?.data ??
          {};

        if (!mounted) return;

        setStats({
          total_users: Number(data.total_users ?? 0),
          total_waste: Number(data.total_waste ?? 0),
          manufacturers: Number(data.manufacturers ?? 0),
          recyclers: Number(data.recyclers ?? 0),
          inventory: Number(data.inventory ?? 0),
          pending: Number(data.pending ?? 0),
          managers: Number(data.managers ?? 0),
        });
      } catch (err) {
        console.error("Admin Dashboard Error:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="admin-dashboard-page">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className={`admin-dashboard-content ${
          collapsed ? "collapsed" : ""
        }`}
      >

        {/* ===================================================
            NAVBAR
        ==================================================== */}

        <Navbar />

        {/* ===================================================
            PAGE HEADER
        ==================================================== */}

        <section className="admin-dashboard-header">

          <div className="admin-header-text">

            <span className="admin-header-label">
              ADMIN CONTROL CENTER
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Monitor users, textile waste, inventory,
              reports and overall platform performance.
            </p>

          </div>

          <div className="admin-header-action">

            <button
              type="button"
              onClick={() => navigate("/users")}
            >
              <FaUserCog />
              Manage Users
              <FaArrowRight />
            </button>

          </div>

        </section>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="admin-dashboard-error">
            <strong>Dashboard Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading ? (

          <section className="admin-dashboard-loading">

            <div className="admin-spinner"></div>

            <h2>
              Loading Dashboard...
            </h2>

            <p>
              Fetching latest platform statistics.
            </p>

          </section>

        ) : (

          <>

            {/* ===============================================
                KPI CARDS
            ================================================ */}

            <section className="admin-stats-grid">

              {/* TOTAL USERS */}

              <div className="admin-stat-card users">

                <div className="admin-stat-icon">
                  <FaUsers />
                </div>

                <div className="admin-stat-content">

                  <span>
                    Total Users
                  </span>

                  <h2>
                    {stats.total_users.toLocaleString()}
                  </h2>

                  <small>
                    Registered users
                  </small>

                </div>

              </div>

              {/* TOTAL WASTE */}

              <div className="admin-stat-card waste">

                <div className="admin-stat-icon">
                  <FaRecycle />
                </div>

                <div className="admin-stat-content">

                  <span>
                    Total Waste
                  </span>

                  <h2>
                    {stats.total_waste.toLocaleString()} Kg
                  </h2>

                  <small>
                    Collected textile waste
                  </small>

                </div>

              </div>

              {/* MANUFACTURERS */}

              <div className="admin-stat-card manufacturer">

                <div className="admin-stat-icon">
                  <FaIndustry />
                </div>

                <div className="admin-stat-content">

                  <span>
                    Manufacturers
                  </span>

                  <h2>
                    {stats.manufacturers.toLocaleString()}
                  </h2>

                  <small>
                    Active companies
                  </small>

                </div>

              </div>

              {/* RECYCLERS */}

              <div className="admin-stat-card recycler">

                <div className="admin-stat-icon">
                  <FaLeaf />
                </div>

                <div className="admin-stat-content">

                  <span>
                    Recyclers
                  </span>

                  <h2>
                    {stats.recyclers.toLocaleString()}
                  </h2>

                  <small>
                    Partner recycling units
                  </small>

                </div>

              </div>

              {/* INVENTORY */}

              <div className="admin-stat-card inventory">

                <div className="admin-stat-icon">
                  <FaBoxes />
                </div>

                <div className="admin-stat-content">

                  <span>
                    Waste Inventory
                  </span>

                  <h2>
                    {stats.inventory.toLocaleString()}
                  </h2>

                  <small>
                    Available inventory items
                  </small>

                </div>

              </div>

              {/* PENDING */}

              <div className="admin-stat-card pending">

                <div className="admin-stat-icon">
                  <FaClock />
                </div>

                <div className="admin-stat-content">

                  <span>
                    Pending Requests
                  </span>

                  <h2>
                    {stats.pending.toLocaleString()}
                  </h2>

                  <small>
                    Waiting for approval
                  </small>

                </div>

              </div>

            </section>

            {/* =================================================
                ADMIN QUICK ACCESS
            ================================================== */}

            <section className="admin-quick-section">

              <div className="admin-section-heading">

                <div>
                  <span>
                    PLATFORM MANAGEMENT
                  </span>

                  <h2>
                    Quick Access
                  </h2>
                </div>

                <p>
                  Manage important platform modules
                  from one place.
                </p>

              </div>

              <div className="admin-quick-grid">

                {/* USER MANAGEMENT */}

                <button
                  type="button"
                  className="admin-quick-card blue"
                  onClick={() => navigate("/users")}
                >

                  <div className="quick-icon">
                    <FaUserCog />
                  </div>

                  <div className="quick-content">
                    <h3>
                      User Management
                    </h3>

                    <p>
                      Add, edit, delete and manage
                      platform users and roles.
                    </p>
                  </div>

                  <FaArrowRight className="quick-arrow" />

                </button>

                {/* INVENTORY */}

                <button
                  type="button"
                  className="admin-quick-card green"
                  onClick={() => navigate("/inventory")}
                >

                  <div className="quick-icon">
                    <FaWarehouse />
                  </div>

                  <div className="quick-content">
                    <h3>
                      Waste Inventory
                    </h3>

                    <p>
                      Monitor textile waste collected
                      across the platform.
                    </p>
                  </div>

                  <FaArrowRight className="quick-arrow" />

                </button>

                {/* REPORTS */}

                <button
                  type="button"
                  className="admin-quick-card purple"
                  onClick={() => navigate("/reports")}
                >

                  <div className="quick-icon">
                    <FaChartLine />
                  </div>

                  <div className="quick-content">
                    <h3>
                      Reports
                    </h3>

                    <p>
                      View platform statistics and
                      performance reports.
                    </p>
                  </div>

                  <FaArrowRight className="quick-arrow" />

                </button>

                {/* REQUESTS */}

                <button
                  type="button"
                  className="admin-quick-card orange"
                  onClick={() => navigate("/waste-requests")}
                >

                  <div className="quick-icon">
                    <FaClipboardList />
                  </div>

                  <div className="quick-content">
                    <h3>
                      Waste Requests
                    </h3>

                    <p>
                      Review and manage pending
                      waste-related requests.
                    </p>
                  </div>

                  <FaArrowRight className="quick-arrow" />

                </button>

              </div>

            </section>

            {/* =================================================
                CHARTS
            ================================================== */}

            <section className="admin-charts-section">

              <div className="admin-section-heading">

                <div>
                  <span>
                    PLATFORM ANALYTICS
                  </span>

                  <h2>
                    Waste & Performance Overview
                  </h2>
                </div>

              </div>

              <DashboardCharts />

            </section>

            {/* =================================================
                BOTTOM SECTION
            ================================================== */}

            <section className="admin-bottom-grid">

                {/* RECENT ACTIVITY */}

              <div className="admin-activity-card">

                <div className="admin-activity-header">

                  <div>
                    <span>
                      PLATFORM ACTIVITY
                    </span>

                    <h2>
                      Recent Activity
                    </h2>
                  </div>

                  <FaClock />

                </div>

                <ul>

                  <li>
                    <span className="activity-dot blue"></span>

                    <div>
                      <strong>
                        New manufacturer registered
                      </strong>

                      <small>
                        User Management
                      </small>
                    </div>
                  </li>

                  <li>
                    <span className="activity-dot green"></span>

                    <div>
                      <strong>
                        Waste inventory updated
                      </strong>

                      <small>
                        Recycler
                      </small>
                    </div>
                  </li>

                  <li>
                    <span className="activity-dot orange"></span>

                    <div>
                      <strong>
                        120 Kg textile waste uploaded
                      </strong>

                      <small>
                        Manufacturer
                      </small>
                    </div>
                  </li>

                  <li>
                    <span className="activity-dot purple"></span>

                    <div>
                      <strong>
                        Sustainability report generated
                      </strong>

                      <small>
                        Sustainability
                      </small>
                    </div>
                  </li>

                </ul>

              </div>

            </section>

          </>

        )}

      </main>

    </div>
  );
}

export default AdminDashboard;