import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRobot,
  FaBrain,
  FaRecycle,
  FaIndustry,
  FaLeaf,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaBoxes,
  FaSyncAlt,
  FaArrowUp,
} from "react-icons/fa";

import "../css/ManufacturerAIInsights.css";


function ManufacturerAIInsights() {

  const [collapsed, setCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");


  /* =========================================================
     MATERIAL ANALYSIS
  ========================================================= */

  const materialInsights = [

    {
      material: "Cotton",
      percentage: 42,
      quantity: "1,540 Kg",
      color: "#2196f3",
      recommendation:
        "Suitable for recycled yarn production.",
    },

    {
      material: "Polyester",
      percentage: 28,
      quantity: "1,025 Kg",
      color: "#9c27b0",
      recommendation:
        "Suitable for polyester recycling.",
    },

    {
      material: "Denim",
      percentage: 18,
      quantity: "660 Kg",
      color: "#00acc1",
      recommendation:
        "Can be reused for regenerated fiber.",
    },

    {
      material: "Blended",
      percentage: 12,
      quantity: "435 Kg",
      color: "#ff9800",
      recommendation:
        "Requires material separation.",
    },

  ];


  /* =========================================================
     AI PREDICTIONS
  ========================================================= */

  const predictions = [

    {
      id: 1,
      material: "Cotton Fabric",
      category: "Reusable",
      confidence: 96.8,
      recommendation:
        "Suitable for recycled yarn",
      status: "High Confidence",
    },

    {
      id: 2,
      material: "Polyester",
      category: "Recyclable",
      confidence: 94.2,
      recommendation:
        "Send for polyester recycling",
      status: "High Confidence",
    },

    {
      id: 3,
      material: "Denim",
      category: "Reusable",
      confidence: 91.6,
      recommendation:
        "Use for regenerated fiber",
      status: "High Confidence",
    },

    {
      id: 4,
      material: "Mixed Fabric",
      category: "Needs Sorting",
      confidence: 78.4,
      recommendation:
        "Separate fabric components",
      status: "Review Required",
    },

  ];


  /* =========================================================
     RECOMMENDATIONS
  ========================================================= */

  const recommendations = [

    {
      icon: <FaRecycle />,
      title: "Increase Cotton Recovery",
      description:
        "Cotton represents the largest portion of your textile waste. Better segregation can improve recovery.",
      priority: "High Priority",
      type: "high",
    },

    {
      icon: <FaIndustry />,
      title: "Improve Waste Segregation",
      description:
        "Mixed textile waste is reducing recycling efficiency. Sort materials before processing.",
      priority: "Medium Priority",
      type: "medium",
    },

    {
      icon: <FaLeaf />,
      title: "Increase Recycling Rate",
      description:
        "Route recyclable materials directly to verified recycling partners.",
      priority: "Medium Priority",
      type: "medium",
    },

  ];


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredPredictions =
    activeFilter === "All"
      ? predictions
      : predictions.filter(
          (item) =>
            item.category === activeFilter
        );


  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {
    window.location.reload();
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className={`dashboard-content ${
          collapsed ? "collapsed" : ""
        }`}
      >

        <Navbar />


        <main className="manufacturer-ai-page">


          {/* =================================================
              HEADER
          ================================================= */}

          <section className="manufacturer-ai-header">

            <div className="manufacturer-ai-header-left">

              <div className="manufacturer-ai-header-icon">
                <FaRobot />
              </div>

              <div>

                <span className="manufacturer-ai-label">
                  MANUFACTURER AI
                </span>

                <h1>
                  AI Insights
                </h1>

                <p>
                  Analyze your textile waste using
                  AI-powered material classification
                  and recycling recommendations.
                </p>

              </div>

            </div>


            <button
              type="button"
              className="manufacturer-ai-refresh"
              onClick={handleRefresh}
            >

              <FaSyncAlt />

              Refresh Insights

            </button>

          </section>



          {/* =================================================
              AI ACTIVE STATUS
          ================================================= */}

          <section className="manufacturer-ai-status">

            <div className="manufacturer-ai-status-icon">
              <FaBrain />
            </div>

            <div className="manufacturer-ai-status-content">

              <h3>
                AI Analysis Active
              </h3>

              <p>
                Your production waste is being analyzed
                for material type, recyclability and
                recovery opportunities.
              </p>

            </div>

            <div className="manufacturer-ai-active">

              <FaCheckCircle />

              System Active

            </div>

          </section>



          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <section className="manufacturer-ai-summary">


            <div className="manufacturer-ai-card blue">

              <div className="manufacturer-ai-card-icon">
                <FaBoxes />
              </div>

              <div>

                <span>
                  Waste Analyzed
                </span>

                <strong>
                  3,660 Kg
                </strong>

                <small>
                  <FaArrowUp />
                  12.5% from last period
                </small>

              </div>

            </div>



            <div className="manufacturer-ai-card green">

              <div className="manufacturer-ai-card-icon">
                <FaRecycle />
              </div>

              <div>

                <span>
                  Recyclable Waste
                </span>

                <strong>
                  2,600 Kg
                </strong>

                <small>
                  <FaArrowUp />
                  18.2% improvement
                </small>

              </div>

            </div>



            <div className="manufacturer-ai-card purple">

              <div className="manufacturer-ai-card-icon">
                <FaBrain />
              </div>

              <div>

                <span>
                  AI Predictions
                </span>

                <strong>
                  128
                </strong>

                <small>
                  96.4% average confidence
                </small>

              </div>

            </div>



            <div className="manufacturer-ai-card orange">

              <div className="manufacturer-ai-card-icon">
                <FaChartLine />
              </div>

              <div>

                <span>
                  Efficiency Score
                </span>

                <strong>
                  87%
                </strong>

                <small>
                  <FaArrowUp />
                  Performance increasing
                </small>

              </div>

            </div>


          </section>



          {/* =================================================
              MATERIAL ANALYSIS
          ================================================= */}

          <section className="manufacturer-ai-panel">

            <div className="manufacturer-ai-panel-header">

              <div>

                <h2>
                  <FaChartLine />
                  Material Analysis
                </h2>

                <p>
                  AI-detected material distribution
                  from your production waste.
                </p>

              </div>

            </div>


            <div className="manufacturer-material-grid">


              {/* LEFT */}

              <div className="manufacturer-material-bars">

                {materialInsights.map((item) => (

                  <div
                    className="manufacturer-material-row"
                    key={item.material}
                  >

                    <div className="manufacturer-material-top">

                      <span>
                        {item.material}
                      </span>

                      <strong>
                        {item.percentage}%
                      </strong>

                    </div>


                    <div className="manufacturer-material-progress">

                      <div
                        style={{
                          width:
                            `${item.percentage}%`,
                          backgroundColor:
                            item.color,
                        }}
                      />

                    </div>


                    <div className="manufacturer-material-quantity">

                      {item.quantity} detected

                    </div>

                  </div>

                ))}

              </div>



              {/* RIGHT */}

              <div className="manufacturer-ai-observation">

                <div className="manufacturer-observation-icon">
                  <FaLightbulb />
                </div>

                <h3>
                  AI Observation
                </h3>

                <p>
                  Cotton is currently the dominant
                  material in your production waste,
                  representing approximately 42%.
                </p>


                <div className="manufacturer-observation-stat">

                  <strong>
                    42%
                  </strong>

                  <span>
                    Cotton Waste
                  </span>

                </div>


                <div className="manufacturer-observation-message">

                  Improving cotton segregation can
                  significantly increase your recycling
                  efficiency.

                </div>

              </div>


            </div>

          </section>



          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          <section className="manufacturer-ai-panel">

            <div className="manufacturer-ai-panel-header">

              <div>

                <h2>
                  <FaLightbulb />
                  AI Recommendations
                </h2>

                <p>
                  Recommended actions based on
                  your production waste.
                </p>

              </div>

            </div>


            <div className="manufacturer-recommendations">

              {recommendations.map(
                (item, index) => (

                  <div
                    key={index}
                    className={`manufacturer-recommendation ${item.type}`}
                  >

                    <div className="manufacturer-recommendation-icon">
                      {item.icon}
                    </div>


                    <div className="manufacturer-recommendation-content">

                      <div className="manufacturer-recommendation-title">

                        <h3>
                          {item.title}
                        </h3>

                        <span>
                          {item.priority}
                        </span>

                      </div>


                      <p>
                        {item.description}
                      </p>


                      <button type="button">
                        View Recommendation
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>



          {/* =================================================
              PREDICTIONS
          ================================================= */}

          <section className="manufacturer-ai-panel">

            <div className="manufacturer-ai-panel-header predictions-header">

              <div>

                <h2>
                  <FaBrain />
                  Recent AI Predictions
                </h2>

                <p>
                  Latest material recognition results.
                </p>

              </div>


              <div className="manufacturer-ai-filters">

                {[
                  "All",
                  "Reusable",
                  "Recyclable",
                  "Needs Sorting",
                ].map((filter) => (

                  <button
                    type="button"
                    key={filter}
                    className={
                      activeFilter === filter
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveFilter(filter)
                    }
                  >

                    {filter}

                  </button>

                ))}

              </div>

            </div>



            <div className="manufacturer-ai-table-wrapper">

              <table className="manufacturer-ai-table">

                <thead>

                  <tr>

                    <th>
                      Material
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Confidence
                    </th>

                    <th>
                      Recommendation
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredPredictions.map(
                    (item) => (

                      <tr key={item.id}>

                        <td>

                          <div className="manufacturer-material-name">

                            <div>
                              <FaBoxes />
                            </div>

                            <strong>
                              {item.material}
                            </strong>

                          </div>

                        </td>


                        <td>

                          <span
                            className={`manufacturer-category ${item.category
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >

                            {item.category}

                          </span>

                        </td>


                        <td>

                          <div className="manufacturer-confidence">

                            <div className="manufacturer-confidence-bar">

                              <div
                                style={{
                                  width:
                                    `${item.confidence}%`,
                                }}
                              />

                            </div>

                            <strong>
                              {item.confidence}%
                            </strong>

                          </div>

                        </td>


                        <td>
                          {item.recommendation}
                        </td>


                        <td>

                          <span
                            className={
                              item.status ===
                              "High Confidence"
                                ? "manufacturer-prediction-success"
                                : "manufacturer-prediction-warning"
                            }
                          >

                            {item.status ===
                            "High Confidence" ? (
                              <FaCheckCircle />
                            ) : (
                              <FaExclamationTriangle />
                            )}

                            {item.status}

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>



          {/* =================================================
              AI PERFORMANCE
          ================================================= */}

          <section className="manufacturer-ai-panel">

            <div className="manufacturer-ai-panel-header">

              <div>

                <h2>
                  <FaRobot />
                  AI Performance
                </h2>

                <p>
                  Current AI model performance.
                </p>

              </div>

            </div>


            <div className="manufacturer-ai-performance">


              <div className="manufacturer-performance-item">

                <div>

                  <span>
                    Material Recognition
                  </span>

                  <strong>
                    96.4%
                  </strong>

                </div>

                <div className="manufacturer-performance-progress">

                  <div
                    style={{
                      width: "96.4%",
                    }}
                  />

                </div>

                <small>
                  Excellent accuracy
                </small>

              </div>



              <div className="manufacturer-performance-item">

                <div>

                  <span>
                    Category Classification
                  </span>

                  <strong>
                    93.8%
                  </strong>

                </div>

                <div className="manufacturer-performance-progress">

                  <div
                    style={{
                      width: "93.8%",
                    }}
                  />

                </div>

                <small>
                  High accuracy
                </small>

              </div>



              <div className="manufacturer-performance-item">

                <div>

                  <span>
                    Recycling Recommendation
                  </span>

                  <strong>
                    91.7%
                  </strong>

                </div>

                <div className="manufacturer-performance-progress">

                  <div
                    style={{
                      width: "91.7%",
                    }}
                  />

                </div>

                <small>
                  Reliable recommendations
                </small>

              </div>


            </div>

          </section>



          {/* =================================================
              FOOTER NOTE
          ================================================= */}

          <div className="manufacturer-ai-footer">

            <FaBrain />

            <span>
              AI insights are generated from your
              production waste data. Review recommendations
              before making operational decisions.
            </span>

          </div>


        </main>

      </div>

    </div>
  );
}


export default ManufacturerAIInsights;