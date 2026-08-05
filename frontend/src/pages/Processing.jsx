import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../css/Processing.css";

function Processing() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="processing-container">

          <h1>Processing Waste</h1>

          <p>Monitor textile waste currently under processing.</p>

          <div className="toolbar">

            <input
              type="text"
              placeholder="Search..."
              className="search-box"
            />

            <select className="status-filter">

              <option>All</option>

              <option>Pending</option>

              <option>In Progress</option>

              <option>Completed</option>

            </select>

          </div>

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Material</th>

                  <th>Quantity</th>

                  <th>Machine</th>

                  <th>Status</th>

                  <th>Progress</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>1</td>

                  <td>Cotton</td>

                  <td>120 Kg</td>

                  <td>Shredder A</td>

                  <td>

                    <span className="processing">

                      In Progress

                    </span>

                  </td>

                  <td>

                    <progress value="65" max="100"></progress>

                    65%

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

export default Processing;