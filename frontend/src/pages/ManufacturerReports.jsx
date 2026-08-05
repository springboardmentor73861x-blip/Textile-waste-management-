import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRecycle,
  FaBoxes,
  FaClock,
  FaFileDownload
} from "react-icons/fa";

import "../css/ManufacturerReports.css";

function ManufacturerReports() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="reports-container">

          <h1>Manufacturer Reports</h1>

          <p>
            View textile waste statistics and reports.
          </p>

          <div className="report-cards">

            <div className="report-card">

              <FaBoxes className="report-icon blue"/>

              <h3>Total Uploaded</h3>

              <h2>245 Kg</h2>

            </div>

            <div className="report-card">

              <FaRecycle className="report-icon green"/>

              <h3>Recycled</h3>

              <h2>180 Kg</h2>

            </div>

            <div className="report-card">

              <FaClock className="report-icon orange"/>

              <h3>Pending</h3>

              <h2>65 Kg</h2>

            </div>

          </div>

          <button className="download-btn">

            <FaFileDownload />

            Download Report

          </button>

        </div>

      </div>

    </div>

  );

}

export default ManufacturerReports;