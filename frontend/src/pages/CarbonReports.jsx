import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaCloud,
  FaLeaf,
  FaGlobe,
  FaFileDownload
} from "react-icons/fa";

import "../css/CarbonReports.css";

function CarbonReports() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="carbon-container">

          <h1>Carbon Reports</h1>

          <p>
            Monitor carbon emissions and environmental impact.
          </p>

          <div className="carbon-cards">

            <div className="carbon-card">

              <FaCloud className="carbon-icon red"/>

              <h3>Total CO₂ Emitted</h3>

              <h2>24.8 t</h2>

            </div>

            <div className="carbon-card">

              <FaLeaf className="carbon-icon green"/>

              <h3>Carbon Saved</h3>

              <h2>18.5 t</h2>

            </div>

            <div className="carbon-card">

              <FaGlobe className="carbon-icon blue"/>

              <h3>Carbon Offset</h3>

              <h2>74%</h2>

            </div>

          </div>

          {/* Monthly Report */}

          <div className="report-table">

            <h2>Monthly Carbon Summary</h2>

            <table>

              <thead>

                <tr>

                  <th>Month</th>

                  <th>CO₂ Emitted</th>

                  <th>CO₂ Saved</th>

                  <th>Offset %</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>January</td>

                  <td>5.2 t</td>

                  <td>3.9 t</td>

                  <td>75%</td>

                </tr>

                <tr>

                  <td>February</td>

                  <td>4.8 t</td>

                  <td>3.7 t</td>

                  <td>77%</td>

                </tr>

                <tr>

                  <td>March</td>

                  <td>6.0 t</td>

                  <td>4.3 t</td>

                  <td>72%</td>

                </tr>

              </tbody>

            </table>

          </div>

          <button className="download-btn">

            <FaFileDownload />

            Download Carbon Report

          </button>

        </div>

      </div>

    </div>

  );

}

export default CarbonReports;