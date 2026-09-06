import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCharts from "../components/DashboardCharts";

import API from "../services/api";

import {
  FaIndustry,
  FaRecycle,
  FaBoxes,
  FaRobot,
  FaFileAlt,
  FaUpload,
  FaEye,
  FaArrowRight,
  FaChartLine,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";

import "../css/ManufacturerDashboard.css";


function ManufacturerDashboard() {

  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  const [dashboardData, setDashboardData] = useState({
    productionWaste: 0,
    wasteUploaded: 0,
    inventory: 0,
    aiPredictions: 0,
    reports: 0,
    recyclingRate: 0,
  });

  const [uploads, setUploads] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================================
  // NAVIGATION
  // ============================================================

  const goToUpload = () => {
    navigate("/upload");
  };

  const goToInventory = () => {
    navigate("/inventory");
  };

  const goToReports = () => {
    navigate("/manufacturer-reports");
  };

  const goToProduction = () => {
    navigate("/production");
  };

  const goToRequests = () => {
    navigate("/manufacturer-requests");
  };


  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);
        setError("");

        // ------------------------------------------------------
        // GET WASTE DATA
        // ------------------------------------------------------

        const response = await API.get("/waste/");

        console.log("Dashboard waste response:", response.data);


        // ------------------------------------------------------
        // HANDLE DIFFERENT RESPONSE FORMATS
        // ------------------------------------------------------

        let wasteList = [];

        if (Array.isArray(response.data)) {

          wasteList = response.data;

        } else if (Array.isArray(response.data?.items)) {

          wasteList = response.data.items;

        } else if (Array.isArray(response.data?.data)) {

          wasteList = response.data.data;

        }


        // ------------------------------------------------------
        // CALCULATE DASHBOARD VALUES
        // ------------------------------------------------------

        let totalQuantity = 0;

        let availableQuantity = 0;

        wasteList.forEach((item) => {

          const quantity = Number(
            item.quantity ??
            item.weight ??
            0
          );

          totalQuantity += quantity;


          const status = String(
            item.status ?? ""
          ).toLowerCase();


          if (
            status === "available" ||
            status === "recyclable" ||
            status === "reusable" ||
            status === ""
          ) {

            availableQuantity += quantity;

          }

        });


        // ------------------------------------------------------
        // RECENT UPLOADS
        // ------------------------------------------------------

        const recentUploads = wasteList
          .slice()
          .reverse()
          .slice(0, 4)
          .map((item, index) => {

            const material =
              item.waste_type ??
              item.waste_category ??
              item.material ??
              "Unknown";

            const quantity =
              item.quantity ??
              item.weight ??
              0;

            const unit =
              item.unit ??
              "Kg";

            const status =
              item.status ??
              "Available";

            return {
              id: item.id ?? index + 1,
              material,
              quantity: `${quantity} ${unit}`,
              status: status,
            };

          });


        setUploads(recentUploads);


        // ------------------------------------------------------
        // SET DASHBOARD STATISTICS
        // ------------------------------------------------------

        setDashboardData({

          productionWaste: totalQuantity,

          wasteUploaded: wasteList.length,

          inventory: availableQuantity,

          // AI prediction percentage will be shown from
          // available prediction data if your backend provides it.
          // For now it is calculated from records containing
          // AI/prediction information.
          aiPredictions: calculateAIPercentage(wasteList),

          // Reports endpoint can be connected separately later.
          reports: 0,

          // Recycling rate based on waste status.
          recyclingRate: calculateRecyclingRate(wasteList),

        });


      } catch (err) {

        console.error(
          "Manufacturer dashboard error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          "Unable to load dashboard data."
        );

      } finally {

        setLoading(false);

      }

    };


    loadDashboard();

  }, []);


  // ============================================================
  // AI PREDICTION CALCULATION
  // ============================================================

  const calculateAIPercentage = (wasteList) => {

    if (!wasteList.length) {
      return 0;
    }

    const predicted = wasteList.filter((item) => {

      return (
        item.ai_prediction ||
        item.prediction ||
        item.waste_category ||
        item.recommended_process
      );

    });

    return Math.round(
      (predicted.length / wasteList.length) * 100
    );

  };


  // ============================================================
  // RECYCLING RATE
  // ============================================================

  const calculateRecyclingRate = (wasteList) => {

    if (!wasteList.length) {
      return 0;
    }

    const recycled = wasteList.filter((item) => {

      const status = String(
        item.status ?? ""
      ).toLowerCase();

      return (
        status === "recycled" ||
        status === "completed"
      );

    });


    return Math.round(
      (recycled.length / wasteList.length) * 100
    );

  };


  return (

    <div className="dashboard">

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <div
        className={`dashboard-content ${
          collapsed ? "collapsed" : ""
        }`}
      >

        {/* ======================================================
            NAVBAR
        ====================================================== */}

        <Navbar />


        {/* ======================================================
            PAGE
        ====================================================== */}

        <main className="manufacturer-dashboard">


          {/* ====================================================
              HERO
          ==================================================== */}

          <section className="dashboard-hero">

            <div className="hero-content">

              <div className="hero-icon">
                <FaIndustry />
              </div>

              <div>

                <span className="hero-label">
                  MANUFACTURER PORTAL
                </span>

                <h1>
                  Manufacturer Dashboard
                </h1>

                <p>
                  Monitor production waste, manage textile
                  inventory and improve recycling performance
                  using data-driven insights.
                </p>

              </div>

            </div>


            <div className="hero-status">

              <span className="status-dot"></span>

              System Active

            </div>

          </section>


          {/* ====================================================
              WELCOME / UPLOAD BANNER
          ==================================================== */}

          <section className="manufacturer-welcome">

            <div className="welcome-left">

              <div className="welcome-icon">
                <FaRecycle />
              </div>

              <div>

                <span className="section-label">
                  SUSTAINABLE PRODUCTION
                </span>

                <h2>
                  Turn production waste into value.
                </h2>

                <p>
                  Upload your textile waste and let AI identify
                  the best recycling opportunity.
                </p>

              </div>

            </div>


            <button
              type="button"
              className="upload-main-btn"
              onClick={goToUpload}
            >

              <FaUpload />

              <span>
                Upload Waste
              </span>

              <FaArrowRight />

            </button>

          </section>


          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (

            <div
              style={{
                padding: "12px 16px",
                marginBottom: "20px",
                borderRadius: "8px",
                background: "#fff3f3",
                color: "#c62828",
                border: "1px solid #ffcdd2",
              }}
            >

              {error}

            </div>

          )}


          {/* ====================================================
              STATISTICS
          ==================================================== */}

          <section className="stats-grid">


            {/* Production Waste */}

            <div className="stat-card production-card">

              <div className="stat-top">

                <div className="stat-icon production">
                  <FaIndustry />
                </div>

                <span className="stat-trend positive">
                  Live
                </span>

              </div>

              <div className="stat-content">

                <p>
                  Production Waste
                </p>

                <h2>

                  {loading
                    ? "..."
                    : dashboardData.productionWaste}

                  <small> Kg</small>

                </h2>

                <span className="stat-description">
                  Total recorded waste
                </span>

              </div>

            </div>


            {/* Waste Uploaded */}

            <div className="stat-card upload-card">

              <div className="stat-top">

                <div className="stat-icon upload">
                  <FaUpload />
                </div>

                <span className="stat-trend positive">
                  Live
                </span>

              </div>

              <div className="stat-content">

                <p>
                  Waste Uploaded
                </p>

                <h2>

                  {loading
                    ? "..."
                    : dashboardData.wasteUploaded}

                </h2>

                <span className="stat-description">
                  Total uploads
                </span>

              </div>

            </div>


            {/* Inventory */}

            <div className="stat-card inventory-card">

              <div className="stat-top">

                <div className="stat-icon inventory">
                  <FaBoxes />
                </div>

                <span className="stat-trend positive">
                  Live
                </span>

              </div>

              <div className="stat-content">

                <p>
                  Current Inventory
                </p>

                <h2>

                  {loading
                    ? "..."
                    : dashboardData.inventory}

                  <small> Kg</small>

                </h2>

                <span className="stat-description">
                  Available waste
                </span>

              </div>

            </div>


            {/* AI Predictions */}

            <div className="stat-card ai-card">

              <div className="stat-top">

                <div className="stat-icon ai">
                  <FaRobot />
                </div>

                <span className="stat-trend positive">
                  Live
                </span>

              </div>

              <div className="stat-content">

                <p>
                  AI Predictions
                </p>

                <h2>

                  {loading
                    ? "..."
                    : dashboardData.aiPredictions}

                  <small>%</small>

                </h2>

                <span className="stat-description">
                  Waste prediction coverage
                </span>

              </div>

            </div>


            {/* Reports */}

            <div className="stat-card reports-card">

              <div className="stat-top">

                <div className="stat-icon reports">
                  <FaFileAlt />
                </div>

                <span className="stat-trend positive">
                  Live
                </span>

              </div>

              <div className="stat-content">

                <p>
                  Reports
                </p>

                <h2>

                  {loading
                    ? "..."
                    : dashboardData.reports}

                </h2>

                <span className="stat-description">
                  Generated reports
                </span>

              </div>

            </div>


            {/* Recycling Rate */}

            <div className="stat-card recycle-card">

              <div className="stat-top">

                <div className="stat-icon recycle">
                  <FaRecycle />
                </div>

                <span className="stat-trend positive">
                  Live
                </span>

              </div>

              <div className="stat-content">

                <p>
                  Recycling Rate
                </p>

                <h2>

                  {loading
                    ? "..."
                    : dashboardData.recyclingRate}

                  <small>%</small>

                </h2>

                <span className="stat-description">
                  Current performance
                </span>

              </div>

            </div>

          </section>


          {/* ====================================================
              ANALYTICS HEADER
          ==================================================== */}

          <section className="analytics-header">

            <div>

              <span className="section-label">
                ANALYTICS
              </span>

              <h2>
                Waste & AI Analytics
              </h2>

              <p>
                Monitor waste generation and recycling
                performance.
              </p>

            </div>

            <div className="analytics-icon">
              <FaChartLine />
            </div>

          </section>


          {/* ====================================================
              CHARTS
          ==================================================== */}

          <DashboardCharts />


          {/* ====================================================
              RECENT UPLOADS
          ==================================================== */}

          <section className="recent-section">

            <div className="section-header">

              <div>

                <span className="section-label">
                  ACTIVITY
                </span>

                <h2>
                  Recent Waste Uploads
                </h2>

                <p>
                  Latest textile waste submitted for analysis.
                </p>

              </div>

              <button
                type="button"
                className="view-all-btn"
                onClick={goToUpload}
              >

                <FaEye />

                View All

                <FaArrowRight />

              </button>

            </div>


            <div className="table-container">

              <table>

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>

                </thead>


                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="4"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                        }}
                      >
                        Loading waste data...
                      </td>

                    </tr>

                  ) : uploads.length === 0 ? (

                    <tr>

                      <td
                        colSpan="4"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                        }}
                      >
                        No waste uploads found.
                      </td>

                    </tr>

                  ) : (

                    uploads.map((item) => (

                      <tr key={item.id}>

                        <td>

                          <span className="table-id">
                            #{String(item.id).padStart(3, "0")}
                          </span>

                        </td>


                        <td>

                          <div className="material-cell">

                            <div className="material-icon">
                              <FaBoxes />
                            </div>

                            <strong>
                              {item.material}
                            </strong>

                          </div>

                        </td>


                        <td>
                          <strong>
                            {item.quantity}
                          </strong>
                        </td>


                        <td>

                          <span
                            className={`status ${String(
                              item.status
                            )
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >

                            {String(item.status).toLowerCase() ===
                            "completed" ? (

                              <FaCheckCircle />

                            ) : (

                              <span className="status-small-dot"></span>

                            )}

                            {item.status}

                          </span>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </section>


          {/* ====================================================
              QUICK ACTIONS
          ==================================================== */}

          <section className="quick-actions">

            <div className="quick-header">

              <div>

                <span className="section-label">
                  SHORTCUTS
                </span>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Access frequently used manufacturer tools.
                </p>

              </div>

            </div>


            <div className="action-buttons">


              {/* Upload */}

              <button
                type="button"
                className="action-btn"
                onClick={goToUpload}
              >

                <span className="action-icon upload-action">
                  <FaUpload />
                </span>

                <span className="action-text">

                  <strong>
                    Upload Waste
                  </strong>

                  <small>
                    Add new textile waste data
                  </small>

                </span>

                <FaArrowRight className="action-arrow" />

              </button>


              {/* Inventory */}

              <button
                type="button"
                className="action-btn"
                onClick={goToInventory}
              >

                <span className="action-icon inventory-action">
                  <FaBoxes />
                </span>

                <span className="action-text">

                  <strong>
                    View Inventory
                  </strong>

                  <small>
                    Manage textile materials
                  </small>

                </span>

                <FaArrowRight className="action-arrow" />

              </button>


              {/* Reports */}

              <button
                type="button"
                className="action-btn"
                onClick={goToReports}
              >

                <span className="action-icon report-action">
                  <FaFileAlt />
                </span>

                <span className="action-text">

                  <strong>
                    Generate Report
                  </strong>

                  <small>
                    Create waste report
                  </small>

                </span>

                <FaArrowRight className="action-arrow" />

              </button>


              {/* Requests */}

              <button
                type="button"
                className="action-btn"
                onClick={goToRequests}
              >

                <span className="action-icon request-action">
                  <FaClipboardList />
                </span>

                <span className="action-text">

                  <strong>
                    Waste Requests
                  </strong>

                  <small>
                    Manage recycling requests
                  </small>

                </span>

                <FaArrowRight className="action-arrow" />

              </button>


              {/* Production */}

              <button
                type="button"
                className="action-btn"
                onClick={goToProduction}
              >

                <span className="action-icon production-action">
                  <FaIndustry />
                </span>

                <span className="action-text">

                  <strong>
                    Production Waste
                  </strong>

                  <small>
                    Monitor production waste
                  </small>

                </span>

                <FaArrowRight className="action-arrow" />

              </button>

            </div>

          </section>



        </main>

      </div>

    </div>

  );
}


export default ManufacturerDashboard;