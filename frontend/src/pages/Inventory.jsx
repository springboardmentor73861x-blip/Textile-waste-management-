import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../css/Inventory.css";

function Inventory() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <h1>Waste Inventory</h1>

<p>Manage all uploaded textile waste.</p>

{/* Toolbar */}

<div className="inventory-toolbar">

  <input
    type="text"
    placeholder="Search waste..."
    className="search-box"
  />

  <select className="filter-box">

    <option>All Status</option>

    <option>Pending</option>

    <option>Processed</option>

    <option>Recycled</option>

  </select>

</div>

{/* Inventory Table */}

<div className="table-container">

  <table>

    <thead>

      <tr>

        <th>Image</th>

        <th>Material</th>

        <th>Category</th>

        <th>Quantity</th>

        <th>Status</th>

        <th>Action</th>

      </tr>

    </thead>

    <tbody>

      <tr>

        <td>
          <img
            src="https://via.placeholder.com/70"
            alt="waste"
            className="waste-image"
          />
        </td>

        <td>Cotton Fabric</td>

        <td>Reusable</td>

        <td>120 Kg</td>

        <td>
          <span className="status pending">
            Pending
          </span>
        </td>

        <td>

          <button className="view-btn">
            View
          </button>

          <button className="delete-btn">
            Delete
          </button>

        </td>

      </tr>

    </tbody>

  </table>

</div>

          <h1>Waste Inventory</h1>

          <p>
            Manage all uploaded textile waste.
          </p>

        </div>

      </div>

    

  );

}

export default Inventory;