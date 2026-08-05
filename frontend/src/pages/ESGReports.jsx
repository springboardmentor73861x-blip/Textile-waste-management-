import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaLeaf,
  FaUsers,
  FaBalanceScale,
  FaAward,
  FaFileDownload
} from "react-icons/fa";

import "../css/ESGReports.css";

function ESGReports() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="esg-container">

          <h1>ESG Reports</h1>

          <p>
            Monitor Environmental, Social and Governance performance.
          </p>

          <div className="esg-cards">

            <div className="esg-card">

              <FaLeaf className="esg-icon green"/>

              <h3>Environmental</h3>

              <h2>94%</h2>

            </div>

            <div className="esg-card">

              <FaUsers className="esg-icon blue"/>

              <h3>Social</h3>

              <h2>89%</h2>

            </div>

            <div className="esg-card">

              <FaBalanceScale className="esg-icon orange"/>

              <h3>Governance</h3>

              <h2>91%</h2>

            </div>

            <div className="esg-card">

              <FaAward className="esg-icon purple"/>

              <h3>Overall ESG Score</h3>

              <h2>91%</h2>

            </div>

          </div>

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>Category</th>

                  <th>Score</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>Environmental</td>

                  <td>94%</td>

                  <td>Excellent</td>

                </tr>

                <tr>

                  <td>Social</td>

                  <td>89%</td>

                  <td>Good</td>

                </tr>

                <tr>

                  <td>Governance</td>

                  <td>91%</td>

                  <td>Excellent</td>

                </tr>

              </tbody>

            </table>

          </div>

          <button className="download-btn">

            <FaFileDownload />

            Download ESG Report

          </button>

        </div>

      </div>

    </div>

  );

}

export default ESGReports;