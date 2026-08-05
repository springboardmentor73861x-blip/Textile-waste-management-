import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRecycle,
  FaLeaf,
  FaBoxes,
  FaCheckCircle
} from "react-icons/fa";

import "../css/Recovery.css";

function Recovery() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="recovery-container">

          <h1>Recovered Materials</h1>

          <p>Track recovered textile materials after recycling.</p>

          <div className="recovery-cards">

            <div className="recovery-card">

              <FaRecycle className="icon green" />

              <h3>Total Recovered</h3>

              <h2>520 Kg</h2>

            </div>

            <div className="recovery-card">

              <FaLeaf className="icon blue" />

              <h3>Recovery Rate</h3>

              <h2>86%</h2>

            </div>

            <div className="recovery-card">

              <FaBoxes className="icon orange" />

              <h3>Recovered Batches</h3>

              <h2>42</h2>

            </div>

            <div className="recovery-card">

              <FaCheckCircle className="icon purple" />

              <h3>Completed Jobs</h3>

              <h2>35</h2>

            </div>

          </div>

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>Batch ID</th>

                  <th>Material</th>

                  <th>Recovered Qty</th>

                  <th>Recovery %</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>RW-101</td>

                  <td>Cotton Fiber</td>

                  <td>120 Kg</td>

                  <td>92%</td>

                  <td>

                    <span className="completed">

                      Completed

                    </span>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Recovery;