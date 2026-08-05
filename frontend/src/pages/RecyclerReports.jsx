import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRecycle,
  FaBoxes,
  FaLeaf,
  FaFileDownload
} from "react-icons/fa";

import "../css/RecyclerReports.css";

function RecyclerReports() {

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

          <h1>Recycler Reports</h1>

          <p>View recycling performance and recovery statistics.</p>

          <div className="report-cards">

            <div className="report-card">

              <FaBoxes className="report-icon blue"/>

              <h3>Total Waste Received</h3>

              <h2>860 Kg</h2>

            </div>

            <div className="report-card">

              <FaRecycle className="report-icon green"/>

              <h3>Total Recycled</h3>

              <h2>725 Kg</h2>

            </div>

            <div className="report-card">

              <FaLeaf className="report-icon orange"/>

              <h3>Recovery Rate</h3>

              <h2>84%</h2>

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

export default RecyclerReports;