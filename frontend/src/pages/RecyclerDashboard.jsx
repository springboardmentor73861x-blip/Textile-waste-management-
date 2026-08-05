import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRecycle,
  FaBoxes,
  FaLeaf,
  FaCheckCircle,
  FaClock,
  FaTruck
} from "react-icons/fa";

import "../css/RecyclerDashboard.css";

function RecyclerDashboard() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="cards">

          <div className="card">

            <FaBoxes className="card-icon blue"/>

            <h3>Received Waste</h3>

            <h1>145 Kg</h1>

          </div>

          <div className="card">

            <FaRecycle className="card-icon green"/>

            <h3>Recycled Waste</h3>

            <h1>92 Kg</h1>

          </div>

          <div className="card">

            <FaLeaf className="card-icon purple"/>

            <h3>Recovered Fiber</h3>

            <h1>58 Kg</h1>

          </div>

          <div className="card">

            <FaClock className="card-icon orange"/>

            <h3>Pending Waste</h3>

            <h1>53 Kg</h1>

          </div>

          <div className="card">

            <FaTruck className="card-icon teal"/>

            <h3>Collections</h3>

            <h1>18</h1>

          </div>

          <div className="card">

            <FaCheckCircle className="card-icon dark"/>

            <h3>Completed Jobs</h3>

            <h1>35</h1>

          </div>

        </div>

      </div>

    </div>

  );

}

export default RecyclerDashboard;