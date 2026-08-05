import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaLeaf,
  FaRecycle,
  FaGlobe,
  FaChartLine,
  FaFileDownload
} from "react-icons/fa";

import "../css/SustainabilityReports.css";

function SustainabilityReports() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="report-container">

          <h1>Sustainability Reports</h1>

          <p>
            Overall environmental performance and sustainability indicators.
          </p>

          <div className="report-cards">

            <div className="report-card">

              <FaLeaf className="report-icon green"/>

              <h3>Carbon Saved</h3>

              <h2>18.5 t</h2>

            </div>

            <div className="report-card">

              <FaRecycle className="report-icon blue"/>

              <h3>Waste Recycled</h3>

              <h2>3,850 Kg</h2>

            </div>

            <div className="report-card">

              <FaGlobe className="report-icon teal"/>

              <h3>ESG Score</h3>

              <h2>91%</h2>

            </div>

            <div className="report-card">

              <FaChartLine className="report-icon orange"/>

              <h3>Sustainability Index</h3>

              <h2>95%</h2>

            </div>

          </div>

          <div className="table-container">

            <h2>Annual Sustainability Summary</h2>

            <table>

              <thead>

                <tr>

                  <th>Metric</th>

                  <th>Current</th>

                  <th>Target</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>Carbon Reduction</td>

                  <td>18.5 t</td>

                  <td>20 t</td>

                  <td>92%</td>

                </tr>

                <tr>

                  <td>Waste Diversion</td>

                  <td>86%</td>

                  <td>90%</td>

                  <td>96%</td>

                </tr>

                <tr>

                  <td>Recycling Rate</td>

                  <td>82%</td>

                  <td>85%</td>

                  <td>96%</td>

                </tr>

                <tr>

                  <td>ESG Score</td>

                  <td>91%</td>

                  <td>95%</td>

                  <td>95%</td>

                </tr>

              </tbody>

            </table>

          </div>

          <button className="download-btn">

            <FaFileDownload />

            Download Sustainability Report

          </button>

        </div>

      </div>

    </div>

  );

}

export default SustainabilityReports;