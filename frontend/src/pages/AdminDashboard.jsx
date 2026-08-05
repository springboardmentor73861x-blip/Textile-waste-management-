  
import { useState, useEffect } from "react";
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
  FaRobot,
  FaArrowUp
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
    managers: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        {/* ================= Dashboard Title ================= */}

        <div className="dashboard-title">

          <div>

            <h1>Admin Dashboard</h1>

            <p>
              Monitor users, waste inventory, AI insights and sustainability performance.
            </p>

          </div>

          <button className="dashboard-btn">

            <FaArrowUp />

            System Overview

          </button>

        </div>

        {/* ================= Role Switch ================= */}

        <div className="role-switch">

          <div className="role-card active">

            <h3>👨‍💼 Admin</h3>

            <p>Current Dashboard</p>

            <button disabled>
              Current
            </button>

          </div>

          <div className="role-card">

            <h3>🏭 Manufacturer</h3>

            <p>Production Dashboard</p>

            <button
              onClick={() => navigate("/manufacturer")}
            >
              Switch Dashboard
            </button>

          </div>

          <div className="role-card">

            <h3>♻ Recycler</h3>

            <p>Recycling Dashboard</p>

            <button
              onClick={() => navigate("/recycler")}
            >
              Switch Dashboard
            </button>

          </div>

          <div className="role-card">

            <h3>🌱 Sustainability</h3>

            <p>Environmental Dashboard</p>

            <button
              onClick={() => navigate("/manager")}
            >
              Switch Dashboard
            </button>

          </div>

        </div>

        {loading ? (

          <h2 style={{ textAlign: "center", marginTop: "60px" }}>
            Loading Dashboard...
          </h2>

        ) : (      
             <>
           {/* ================= KPI Cards ================= */}

          <div className="stats-grid">

            <div className="stat-card users">

              <FaUsers className="stat-icon" />

              <div>

                <h4>Total Users</h4>

                <h2>{stats.total_users}</h2>

                <span>Registered Users</span>

              </div>

            </div>

            <div className="stat-card waste">

              <FaRecycle className="stat-icon" />

              <div>

                <h4>Total Waste</h4>

                <h2>{stats.total_waste} Kg</h2>

                <span>Collected Waste</span>

              </div>

            </div>

            <div className="stat-card manufacturer">

              <FaIndustry className="stat-icon" />

              <div>

                <h4>Manufacturers</h4>

                <h2>{stats.manufacturers}</h2>

                <span>Active Companies</span>

              </div>

            </div>

            <div className="stat-card recycler">

              <FaLeaf className="stat-icon" />

              <div>

                <h4>Recyclers</h4>

                <h2>{stats.recyclers}</h2>

                <span>Partner Units</span>

              </div>

            </div>

            <div className="stat-card inventory">

              <FaBoxes className="stat-icon" />

              <div>

                <h4>Waste Inventory</h4>

                <h2>{stats.inventory}</h2>

                <span>Available Items</span>

              </div>

            </div>

            <div className="stat-card pending">

              <FaClock className="stat-icon" />

              <div>

                <h4>Pending Requests</h4>

                <h2>{stats.pending}</h2>

                <span>Need Approval</span>

              </div>

            </div>

          </div>

          {/* ================= Charts ================= */}

          <DashboardCharts />
                    {/* ================= Bottom Section ================= */}

          <div className="bottom-grid">

            {/* AI Prediction */}

            <div className="ai-card">

              <h2>

                <FaRobot />

                AI Prediction

              </h2>

              <h3>Waste Generation Forecast</h3>

              <p>
                Based on historical production data, the AI predicts an
                <strong> 18% increase </strong>
                in textile waste next month.
              </p>

              <div className="accuracy">

                96%

              </div>

              <button>
                View AI Report
              </button>

            </div>

            {/* Recent Activity */}

            <div className="activity-card">

              <h2>Recent Activity</h2>

              <ul>

                <li>
                  👤 New manufacturer registered successfully.
                </li>

                <li>
                  ♻ Waste inventory updated by Recycler.
                </li>

                <li>
                  📦 120 Kg textile waste uploaded.
                </li>

                <li>
                  🌱 Sustainability report generated.
                </li>

                <li>
                  🤖 AI completed waste prediction analysis.
                </li>

              </ul>

            </div>

          </div>
            </>
        )}

      </div>

    </div>

  );

}

export default AdminDashboard;