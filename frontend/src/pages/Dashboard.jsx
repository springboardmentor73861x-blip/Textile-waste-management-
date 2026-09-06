import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRecycle,
  FaBoxes,
  FaIndustry,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaLeaf,
  FaArrowUp,
} from "react-icons/fa";

import "../css/Dashboard.css";

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const stats = [
    {
      title: "Total Waste Received",
      value: "8,420",
      unit: "Kg",
      change: "+14.8%",
      icon: <FaRecycle />,
      color: "blue",
    },
    {
      title: "Available Waste",
      value: "3,240",
      unit: "Kg",
      change: "+8.4%",
      icon: <FaBoxes />,
      color: "green",
    },
    {
      title: "Active Manufacturers",
      value: "32",
      unit: "",
      change: "+4",
      icon: <FaIndustry />,
      color: "orange",
    },
    {
      title: "Recycling Rate",
      value: "86",
      unit: "%",
      change: "+6.4%",
      icon: <FaChartLine />,
      color: "purple",
    },
  ];

  const wasteStatus = [
    {
      title: "Pending Requests",
      value: "18",
      icon: <FaClock />,
      color: "orange",
    },
    {
      title: "Currently Processing",
      value: "24",
      icon: <FaRecycle />,
      color: "blue",
    },
    {
      title: "Completed Jobs",
      value: "142",
      icon: <FaCheckCircle />,
      color: "green",
    },
    {
      title: "Recovered Materials",
      value: "6,920 Kg",
      icon: <FaLeaf />,
      color: "teal",
    },
  ];

  const recentRequests = [
    {
      id: "REQ-101",
      material: "Cotton Waste",
      company: "ABC Textiles",
      quantity: "250 Kg",
      date: "10 Aug 2026",
      status: "Approved",
    },
    {
      id: "REQ-102",
      material: "Polyester Fabric",
      company: "XYZ Fabrics",
      quantity: "180 Kg",
      date: "09 Aug 2026",
      status: "Processing",
    },
    {
      id: "REQ-103",
      material: "Mixed Textile",
      company: "Green Industries",
      quantity: "320 Kg",
      date: "08 Aug 2026",
      status: "Pending",
    },
    {
      id: "REQ-104",
      material: "Cotton Fiber",
      company: "Eco Manufacturing",
      quantity: "150 Kg",
      date: "07 Aug 2026",
      status: "Completed",
    },
  ];

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

        <main className="main-dashboard">

          {/* ================= HERO ================= */}

          <section className="dashboard-hero">

            <div className="hero-content">

              <span className="hero-eyebrow">
                TEXTILE WASTE MANAGEMENT
              </span>

              <h1>
                Dashboard
              </h1>

              <p>
                Monitor textile waste collection, recycling,
                recovery and sustainability performance.
              </p>

            </div>

            <div className="system-status">

              <span className="status-dot"></span>

              System Active

            </div>

          </section>


          {/* ================= STATISTICS ================= */}

          <section className="dashboard-stats">

            {stats.map((item, index) => (

              <div
                className={`dashboard-stat-card ${item.color}`}
                key={index}
              >

                <div className="stat-top">

                  <div className="stat-icon">
                    {item.icon}
                  </div>

                  <span className="stat-change">

                    <FaArrowUp />

                    {item.change}

                  </span>

                </div>

                <p>
                  {item.title}
                </p>

                <h2>

                  {item.value}

                  {item.unit && (
                    <small>
                      {item.unit}
                    </small>
                  )}

                </h2>

              </div>

            ))}

          </section>


          {/* ================= WASTE OVERVIEW ================= */}

          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <span>
                  WASTE MANAGEMENT
                </span>

                <h2>
                  Waste Overview
                </h2>

                <p>
                  Current waste management activities
                  across the platform.
                </p>

              </div>

              <div className="section-header-icon">
                <FaRecycle />
              </div>

            </div>


            <div className="waste-status-grid">

              {wasteStatus.map((item, index) => (

                <div
                  className={`waste-status-card ${item.color}`}
                  key={index}
                >

                  <div className="waste-status-icon">
                    {item.icon}
                  </div>

                  <div>

                    <p>
                      {item.title}
                    </p>

                    <h3>
                      {item.value}
                    </h3>

                  </div>

                </div>

              ))}

            </div>

          </section>


          {/* ================= PERFORMANCE ================= */}

          <section className="dashboard-columns">

            {/* RECYCLING PERFORMANCE */}

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>

                  <span>
                    PERFORMANCE
                  </span>

                  <h2>
                    Recycling Performance
                  </h2>

                </div>

                <FaChartLine />

              </div>


              <div className="performance-item">

                <div className="performance-label">

                  <span>
                    Recycling Rate
                  </span>

                  <strong>
                    86%
                  </strong>

                </div>

                <div className="progress-track">

                  <div
                    className="progress-fill green"
                    style={{ width: "86%" }}
                  />

                </div>

                <small>
                  Target: 80%
                </small>

              </div>


              <div className="performance-item">

                <div className="performance-label">

                  <span>
                    Waste Recovery
                  </span>

                  <strong>
                    91%
                  </strong>

                </div>

                <div className="progress-track">

                  <div
                    className="progress-fill blue"
                    style={{ width: "91%" }}
                  />

                </div>

                <small>
                  Target: 85%
                </small>

              </div>


              <div className="performance-item">

                <div className="performance-label">

                  <span>
                    Waste Diversion
                  </span>

                  <strong>
                    84%
                  </strong>

                </div>

                <div className="progress-track">

                  <div
                    className="progress-fill purple"
                    style={{ width: "84%" }}
                  />

                </div>

                <small>
                  Target: 80%
                </small>

              </div>

            </div>


            {/* ENVIRONMENTAL IMPACT */}

            <div className="dashboard-panel impact-panel">

              <div className="panel-header">

                <div>

                  <span>
                    ENVIRONMENTAL IMPACT
                  </span>

                  <h2>
                    Sustainability Impact
                  </h2>

                </div>

                <FaLeaf />

              </div>


              <div className="impact-main">

                <div className="impact-icon">
                  <FaLeaf />
                </div>

                <div>

                  <span>
                    Carbon Reduction
                  </span>

                  <h2>
                    5.8 Tons
                  </h2>

                  <p>
                    Estimated CO₂ emissions reduced through
                    textile recycling activities.
                  </p>

                </div>

              </div>


              <div className="impact-bottom">

                <div>

                  <FaArrowUp />

                  <strong>
                    11.2%
                  </strong>

                  <span>
                    Lower emissions
                  </span>

                </div>

                <div>

                  <FaRecycle />

                  <strong>
                    8.42T
                  </strong>

                  <span>
                    Waste diverted
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* ================= RECENT REQUESTS ================= */}

          <section className="recent-section">

            <div className="recent-header">

              <div>

                <span>
                  RECENT ACTIVITY
                </span>

                <h2>
                  Recent Waste Requests
                </h2>

                <p>
                  Latest waste requests received from
                  manufacturers.
                </p>

              </div>

              <button
                type="button"
                className="view-all-btn"
              >
                View All
              </button>

            </div>


            <div className="dashboard-table-wrapper">

              <table className="dashboard-table">

                <thead>

                  <tr>

                    <th>
                      REQUEST ID
                    </th>

                    <th>
                      MATERIAL
                    </th>

                    <th>
                      COMPANY
                    </th>

                    <th>
                      QUANTITY
                    </th>

                    <th>
                      DATE
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentRequests.map((item) => (

                    <tr key={item.id}>

                      <td>
                        <strong className="request-id">
                          {item.id}
                        </strong>
                      </td>

                      <td>
                        {item.material}
                      </td>

                      <td>
                        {item.company}
                      </td>

                      <td>
                        {item.quantity}
                      </td>

                      <td>
                        {item.date}
                      </td>

                      <td>

                        <span
                          className={`request-status ${item.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >

                          <span></span>

                          {item.status}

                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>


          {/* ================= QUICK ACTIONS ================= */}

          <section className="quick-actions">

            <div className="quick-action">

              <FaTruck />

              <div>
                <h3>
                  Waste Collection
                </h3>

                <p>
                  Manage incoming waste.
                </p>
              </div>

            </div>


            <div className="quick-action">

              <FaRecycle />

              <div>
                <h3>
                  Processing
                </h3>

                <p>
                  Monitor active recycling jobs.
                </p>
              </div>

            </div>


            <div className="quick-action">

              <FaLeaf />

              <div>
                <h3>
                  Sustainability
                </h3>

                <p>
                  View environmental performance.
                </p>
              </div>

            </div>

          </section>


          {/* ================= FOOTER ALERT ================= */}

          <div className="dashboard-message">

            <FaCheckCircle />

            <div>

              <strong>
                Platform Performance is Healthy
              </strong>

              <p>
                Waste recycling and recovery targets are
                currently performing above the expected
                monthly levels.
              </p>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;