import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRobot,
  FaRecycle,
  FaChartLine,
  FaLeaf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowUp,
  FaBrain,
  FaLightbulb,
} from "react-icons/fa";

import "../css/RecyclerAI.css";


function RecyclerAI() {

  const [collapsed, setCollapsed] = useState(false);

  const [selectedMaterial, setSelectedMaterial] =
    useState("All");


  const analysisData = [
    {
      id: 1,
      material: "Cotton Waste",
      type: "Natural Fiber",
      confidence: "96%",
      recovery: "92%",
      recommendation: "High Recovery Potential",
      status: "Optimized",
    },

    {
      id: 2,
      material: "Polyester Fabric",
      type: "Synthetic Fiber",
      confidence: "94%",
      recovery: "81%",
      recommendation: "Chemical Separation",
      status: "Review",
    },

    {
      id: 3,
      material: "Mixed Textile",
      type: "Blended Fiber",
      confidence: "89%",
      recovery: "68%",
      recommendation: "Advanced Sorting",
      status: "Processing",
    },

    {
      id: 4,
      material: "Denim Waste",
      type: "Cotton Blend",
      confidence: "93%",
      recovery: "86%",
      recommendation: "Mechanical Recycling",
      status: "Optimized",
    },
  ];


  const filteredData =
    selectedMaterial === "All"
      ? analysisData
      : analysisData.filter(
          (item) =>
            item.type === selectedMaterial
        );


  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      <div
        className={`dashboard-content ${
          collapsed ? "collapsed" : ""
        }`}
      >

        <Navbar />


        <main className="recycler-ai-container">


          {/* =================================================
              HEADER
          ================================================= */}

          <section className="ai-header">

            <div className="ai-header-content">

              <span className="ai-label">
                AI RECYCLING INTELLIGENCE
              </span>

              <h1>
                AI Insights
              </h1>

              <p>
                Machine learning insights for better
                textile recycling decisions.
              </p>

            </div>


            <div className="ai-header-icon">

              <FaRobot />

            </div>

          </section>



          {/* =================================================
              AI STATUS
          ================================================= */}

          <section className="ai-status-bar">

            <div className="ai-status-left">

              <div className="ai-live-icon">

                <FaBrain />

              </div>


              <div>

                <h3>
                  AI Engine Active
                </h3>

                <p>
                  Analysis updated automatically
                </p>

              </div>

            </div>


            <div className="ai-active">

              <span></span>

              System Active

            </div>

          </section>



          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section className="ai-cards">


            <div className="ai-card">

              <div className="ai-card-top">

                <div className="ai-card-icon blue">

                  <FaRecycle />

                </div>

                <span className="trend positive">

                  <FaArrowUp />
                  12.4%

                </span>

              </div>


              <p>
                Material Prediction
              </p>

              <h2>
                96%
              </h2>

              <small>
                AI classification accuracy
              </small>

            </div>



            <div className="ai-card">

              <div className="ai-card-top">

                <div className="ai-card-icon purple">

                  <FaBrain />

                </div>

                <span className="trend positive">

                  <FaArrowUp />
                  4.8%

                </span>

              </div>


              <p>
                Waste Classification
              </p>

              <h2>
                96%
              </h2>

              <small>
                Detection confidence
              </small>

            </div>



            <div className="ai-card">

              <div className="ai-card-top">

                <div className="ai-card-icon green">

                  <FaChartLine />

                </div>

                <span className="trend positive">

                  <FaArrowUp />
                  18%

                </span>

              </div>


              <p>
                Recovery Optimization
              </p>

              <h2>
                +18%
              </h2>

              <small>
                Expected efficiency improvement
              </small>

            </div>



            <div className="ai-card">

              <div className="ai-card-top">

                <div className="ai-card-icon orange">

                  <FaLeaf />

                </div>

                <span className="trend positive">

                  <FaArrowUp />
                  8.2%

                </span>

              </div>


              <p>
                Carbon Reduction
              </p>

              <h2>
                2.4
                <span> Tons</span>
              </h2>

              <small>
                Estimated carbon savings
              </small>

            </div>


          </section>



          {/* =================================================
              ANALYSIS SECTION
          ================================================= */}

          <section className="ai-section">


            <div className="section-heading">

              <div>

                <span>
                  AI ANALYSIS
                </span>

                <h2>
                  Material Intelligence
                </h2>

                <p>
                  AI-powered classification and
                  recycling recommendations.
                </p>

              </div>


              <select
                value={selectedMaterial}
                onChange={(e) =>
                  setSelectedMaterial(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Materials
                </option>

                <option value="Natural Fiber">
                  Natural Fiber
                </option>

                <option value="Synthetic Fiber">
                  Synthetic Fiber
                </option>

                <option value="Blended Fiber">
                  Blended Fiber
                </option>

                <option value="Cotton Blend">
                  Cotton Blend
                </option>

              </select>

            </div>



            <div className="ai-table-wrapper">

              <table className="ai-table">

                <thead>

                  <tr>

                    <th>
                      Material
                    </th>

                    <th>
                      Detected Type
                    </th>

                    <th>
                      Confidence
                    </th>

                    <th>
                      Recovery
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

                  {filteredData.map(
                    (item) => (

                      <tr key={item.id}>

                        <td>

                          <div className="material-name">

                            <div className="material-icon">

                              <FaRecycle />

                            </div>

                            <strong>
                              {item.material}
                            </strong>

                          </div>

                        </td>


                        <td>
                          {item.type}
                        </td>


                        <td>

                          <div className="confidence">

                            <div className="confidence-bar">

                              <span
                                style={{
                                  width:
                                    item.confidence,
                                }}
                              ></span>

                            </div>

                            <strong>
                              {item.confidence}
                            </strong>

                          </div>

                        </td>


                        <td>

                          <strong className="recovery-value">

                            {item.recovery}

                          </strong>

                        </td>


                        <td>

                          <span className="recommendation">

                            {item.recommendation}

                          </span>

                        </td>


                        <td>

                          <span
                            className={`ai-status ${item.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >

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
              LOWER SECTION
          ================================================= */}

          <section className="ai-bottom-grid">


            {/* RECOMMENDATIONS */}

            <div className="recommendation-card">

              <div className="recommendation-header">

                <div className="recommendation-title">

                  <div className="recommendation-icon">

                    <FaLightbulb />

                  </div>

                  <div>

                    <span>
                      AI RECOMMENDATIONS
                    </span>

                    <h2>
                      Smart Recycling Actions
                    </h2>

                  </div>

                </div>

              </div>


              <div className="recommendation-list">


                <div className="recommendation-item">

                  <FaCheckCircle />

                  <div>

                    <strong>
                      Increase cotton fiber processing
                    </strong>

                    <p>
                      Cotton currently shows the
                      highest recovery potential.
                    </p>

                  </div>

                </div>



                <div className="recommendation-item">

                  <FaCheckCircle />

                  <div>

                    <strong>
                      Separate polyester materials
                    </strong>

                    <p>
                      Chemical separation can improve
                      polyester recovery efficiency.
                    </p>

                  </div>

                </div>



                <div className="recommendation-item warning">

                  <FaExclamationTriangle />

                  <div>

                    <strong>
                      Advanced sorting required
                    </strong>

                    <p>
                      Mixed fabrics require additional
                      AI-assisted sorting.
                    </p>

                  </div>

                </div>


              </div>

            </div>



            {/* AI PERFORMANCE */}

            <div className="performance-card">

              <div className="performance-header">

                <span>
                  AI PERFORMANCE
                </span>

                <h2>
                  Model Accuracy
                </h2>

              </div>


              <div className="accuracy-circle">

                <div>

                  <strong>
                    96%
                  </strong>

                  <span>
                    Accuracy
                  </span>

                </div>

              </div>


              <div className="performance-info">

                <div>

                  <span>
                    Classification
                  </span>

                  <strong>
                    96%
                  </strong>

                </div>


                <div>

                  <span>
                    Material Detection
                  </span>

                  <strong>
                    94%
                  </strong>

                </div>


                <div>

                  <span>
                    Recovery Prediction
                  </span>

                  <strong>
                    91%
                  </strong>

                </div>

              </div>

            </div>


          </section>


        </main>

      </div>

    </div>

  );

}


export default RecyclerAI;