import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaLeaf,
  FaGlobe,
  FaRecycle,
  FaChartLine,
  FaTree,
  FaCloud
} from "react-icons/fa";

import "../css/SustainabilityDashboard.css";

function SustainabilityDashboard() {

  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="dashboard-header">

          <h1>Sustainability Dashboard</h1>

          <p>
            Monitor environmental performance and ESG metrics.
          </p>

        </div>

        <div className="cards">

          <div className="card">

            <FaLeaf className="card-icon green"/>

            <h3>Carbon Saved</h3>

            <h1>18.5 t</h1>

          </div>

          <div className="card">

            <FaRecycle className="card-icon blue"/>

            <h3>Waste Diverted</h3>

            <h1>82%</h1>

          </div>

          <div className="card">

            <FaGlobe className="card-icon teal"/>

            <h3>ESG Score</h3>

            <h1>91%</h1>

          </div>

          <div className="card">

            <FaCloud className="card-icon purple"/>

            <h3>CO₂ Reduction</h3>

            <h1>14.2 t</h1>

          </div>

          <div className="card">

            <FaTree className="card-icon orange"/>

            <h3>Trees Equivalent</h3>

            <h1>640</h1>

          </div>

          <div className="card">

            <FaChartLine className="card-icon dark"/>

            <h3>Monthly Growth</h3>

            <h1>+12%</h1>

          </div>

        </div>

      </div>

    </div>

  );

}

export default SustainabilityDashboard;