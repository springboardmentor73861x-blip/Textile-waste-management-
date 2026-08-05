import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRecycle,
  FaTrash,
  FaLeaf,
  FaChartPie,
  FaFileDownload
} from "react-icons/fa";

import "../css/WasteDiversion.css";

function WasteDiversion() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="diversion-container">

          <h1>Waste Diversion</h1>

          <p>
            Monitor textile waste diverted from landfill through recycling and reuse.
          </p>

          {/* KPI Cards */}

          <div className="diversion-cards">

            <div className="diversion-card">

              <FaRecycle className="diversion-icon green"/>

              <h3>Waste Recycled</h3>

              <h2>3,850 Kg</h2>

            </div>

            <div className="diversion-card">

              <FaTrash className="diversion-icon red"/>

              <h3>Landfill Waste</h3>

              <h2>620 Kg</h2>

            </div>

            <div className="diversion-card">

              <FaLeaf className="diversion-icon blue"/>

              <h3>Diversion Rate</h3>

              <h2>86%</h2>

            </div>

            <div className="diversion-card">

              <FaChartPie className="diversion-icon orange"/>

              <h3>Recovery Rate</h3>

              <h2>82%</h2>

            </div>

          </div>

          {/* Table */}

          <div className="table-container">

            <h2>Monthly Waste Diversion</h2>

            <table>

              <thead>

                <tr>

                  <th>Month</th>

                  <th>Total Waste</th>

                  <th>Recycled</th>

                  <th>Landfill</th>

                  <th>Diversion %</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>January</td>

                  <td>850 Kg</td>

                  <td>720 Kg</td>

                  <td>130 Kg</td>

                  <td>84%</td>

                </tr>

                <tr>

                  <td>February</td>

                  <td>910 Kg</td>

                  <td>790 Kg</td>

                  <td>120 Kg</td>

                  <td>87%</td>

                </tr>

                <tr>

                  <td>March</td>

                  <td>980 Kg</td>

                  <td>850 Kg</td>

                  <td>130 Kg</td>

                  <td>86%</td>

                </tr>

              </tbody>

            </table>

          </div>

          <button className="download-btn">

            <FaFileDownload />

            Download Diversion Report

          </button>

        </div>

      </div>

    </div>

  );

}

export default WasteDiversion;