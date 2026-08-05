import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCharts from "../components/DashboardCharts";

import {
  FaIndustry,
  FaRecycle,
  FaBoxes,
  FaRobot,
  FaFileAlt,
  FaLeaf,
  FaUpload,
  FaEye,
} from "react-icons/fa";

import "../css/ManufacturerDashboard.css";

function ManufacturerDashboard() {

  const [collapsed, setCollapsed] = useState(false);

  const uploads = [
    {
      id: 1,
      material: "Cotton",
      quantity: "120 Kg",
      status: "Recyclable",
    },
    {
      id: 2,
      material: "Denim",
      quantity: "80 Kg",
      status: "Reusable",
    },
    {
      id: 3,
      material: "Polyester",
      quantity: "150 Kg",
      status: "Processing",
    },
    {
      id: 4,
      material: "Silk",
      quantity: "45 Kg",
      status: "Completed",
    },
  ];

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="manufacturer-dashboard">

          <div className="dashboard-header">

            <div>

              <h1>Manufacturer Dashboard</h1>

              <p>
                Monitor production waste and AI predictions.
              </p>

            </div>

          </div>

          {/* Cards */}

          <div className="cards">

            <div className="card">

              <FaIndustry className="card-icon production" />

              <h3>Production Waste</h3>

              <h1>450 Kg</h1>

            </div>

            <div className="card">

              <FaUpload className="card-icon upload" />

              <h3>Waste Uploaded</h3>

              <h1>120</h1>

            </div>

            <div className="card">

              <FaBoxes className="card-icon inventory" />

              <h3>Inventory</h3>

              <h1>325</h1>

            </div>

            <div className="card">

              <FaRobot className="card-icon ai" />

              <h3>AI Predictions</h3>

              <h1>98%</h1>

            </div>

            <div className="card">

              <FaFileAlt className="card-icon reports" />

              <h3>Reports</h3>

              <h1>18</h1>

            </div>

            <div className="card">

              <FaLeaf className="card-icon recycle" />

              <h3>Recycling Rate</h3>

              <h1>86%</h1>

            </div>

          </div>

          {/* Charts */}

          <DashboardCharts />
                    {/* Recent Uploads */}

          <div className="recent-section">

            <div className="section-header">

              <h2>Recent Waste Uploads</h2>

              <button className="view-all-btn">

                <FaEye />

                View All

              </button>

            </div>

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Material</th>

                    <th>Quantity</th>

                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {uploads.map((item) => (

                    <tr key={item.id}>

                      <td>{item.id}</td>

                      <td>{item.material}</td>

                      <td>{item.quantity}</td>

                      <td>

                        <span className={`status ${item.status.toLowerCase()}`}>

                          {item.status}

                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Quick Actions */}

          <div className="quick-actions">

            <h2>Quick Actions</h2>

            <div className="action-buttons">

              <button className="action-btn">

                <FaUpload />

                Upload Waste

              </button>

              <button className="action-btn">

                <FaBoxes />

                View Inventory

              </button>

              <button className="action-btn">

                <FaFileAlt />

                Generate Report

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default ManufacturerDashboard;