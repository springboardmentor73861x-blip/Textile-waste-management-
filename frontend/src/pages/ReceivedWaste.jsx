import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../css/ReceivedWaste.css";

function ReceivedWaste() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="received-container">

          <h1>Received Waste</h1>

          <p>View all textile waste received from manufacturers.</p>

          {/* Search */}

          <div className="toolbar">

            <input
              type="text"
              placeholder="Search Waste..."
              className="search-box"
            />

            <select className="status-filter">

              <option>All Status</option>

              <option>Pending</option>

              <option>Processing</option>

              <option>Completed</option>

            </select>

          </div>

          {/* Table */}

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Image</th>

                  <th>Material</th>

                  <th>Quantity</th>

                  <th>Source</th>

                  <th>Status</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>1</td>

                  <td>

                    <img
                      src="https://via.placeholder.com/60"
                      alt="waste"
                      className="waste-img"
                    />

                  </td>

                  <td>Cotton</td>

                  <td>120 Kg</td>

                  <td>ABC Textiles</td>

                  <td>

                    <span className="pending">
                      Pending
                    </span>

                  </td>

                  <td>

                    <button className="view-btn">

                      View

                    </button>

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

export default ReceivedWaste;