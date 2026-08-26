import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRobot,
  FaRecycle,
  FaIndustry,
  FaChartLine,
  FaBrain,
  FaLeaf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaArrowUp,
  FaBoxes,
  FaSyncAlt,
} from "react-icons/fa";

import "../css/AIInsights.css";


function AIInsights() {

  const [collapsed, setCollapsed] = useState(false);

  const [activeFilter, setActiveFilter] = useState("All");

  const [predictions, setPredictions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // FETCH REAL AI PREDICTION HISTORY
  // =========================================================

  useEffect(() => {
    fetchPredictions();
  }, []);


  const fetchPredictions = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await API.get(
        "/prediction/history"
      );

      console.log(
        "AI Prediction History:",
        response.data
      );


      let history = [];


      if (Array.isArray(response.data)) {

        history = response.data;

      } else if (
        Array.isArray(response.data?.history)
      ) {

        history = response.data.history;

      } else if (
        Array.isArray(response.data?.data)
      ) {

        history = response.data.data;

      }


      setPredictions(history);

    } catch (err) {

      console.error(
        "AI Insights Error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Could not load AI prediction history."
      );

      setPredictions([]);

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {

    fetchPredictions();

  };


  // =========================================================
  // NORMALIZE NUMBER
  // =========================================================

  const numberValue = (value) => {

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;

  };


  // =========================================================
  // TOTAL WASTE ANALYZED
  // =========================================================

  const totalWaste = useMemo(() => {

    return predictions.reduce(
      (total, item) => {

        return (
          total +
          numberValue(
            item.weight
          )
        );

      },
      0
    );

  }, [predictions]);


  // =========================================================
  // RECYCLABLE WASTE
  // =========================================================

  const recyclableWaste = useMemo(() => {

    return predictions.reduce(
      (total, item) => {

        const category = (
          item.waste_category ||
          item.category ||
          ""
        ).toLowerCase();

        const recyclable =
          category.includes("recycl");

        if (recyclable) {

          return (
            total +
            numberValue(item.weight)
          );

        }

        return total;

      },
      0
    );

  }, [predictions]);


  // =========================================================
  // AVERAGE CONFIDENCE
  // =========================================================

  const averageConfidence = useMemo(() => {

    if (!predictions.length) {
      return 0;
    }

    const total = predictions.reduce(
      (sum, item) => {

        let confidence =
          numberValue(
            item.confidence_percentage
          );

        if (
          confidence === 0 &&
          item.confidence
        ) {

          confidence =
            numberValue(
              item.confidence
            ) * 100;

        }

        return sum + confidence;

      },
      0
    );

    return total / predictions.length;

  }, [predictions]);


  // =========================================================
  // MATERIAL DISTRIBUTION
  // =========================================================

  const materialInsights = useMemo(() => {

    const materialMap = {};

    predictions.forEach((item) => {

      const material =
        item.fabric_type ||
        item.class_name ||
        item.material_type ||
        item.material ||
        "Unknown";


      if (!materialMap[material]) {

        materialMap[material] = {
          material,
          waste: 0,
          count: 0,
        };

      }


      materialMap[material].waste +=
        numberValue(item.weight);

      materialMap[material].count += 1;

    });


    const total = Object.values(
      materialMap
    ).reduce(
      (sum, item) =>
        sum + item.waste,
      0
    );


    const colors = [
      "#2196f3",
      "#9c27b0",
      "#00acc1",
      "#ff9800",
      "#43a047",
      "#e53935",
      "#795548",
      "#607d8b",
      "#8e24aa",
    ];


    return Object.values(
      materialMap
    )
      .sort(
        (a, b) =>
          b.waste - a.waste
      )
      .map(
        (item, index) => ({

          material:
            item.material,

          percentage:
            total > 0
              ? (
                  item.waste /
                  total
                ) * 100
              : 0,

          waste:
            item.waste,

          count:
            item.count,

          color:
            colors[
              index %
              colors.length
            ],

        })
      );

  }, [predictions]);


  // =========================================================
  // TOP MATERIAL
  // =========================================================

  const topMaterial =
    materialInsights.length > 0
      ? materialInsights[0]
      : null;


  // =========================================================
  // RECENT PREDICTIONS
  // =========================================================

  const recentPredictions = useMemo(() => {

    return predictions.map(
      (item) => {

        let confidence =
          numberValue(
            item.confidence_percentage
          );

        if (
          confidence === 0 &&
          item.confidence
        ) {

          confidence =
            numberValue(
              item.confidence
            ) * 100;

        }


        const material =
          item.fabric_type ||
          item.class_name ||
          item.material_type ||
          item.material ||
          "Unknown";


        const category =
          item.waste_category ||
          item.category ||
          "Unknown";


        const recommendation =
          item.recommended_processing ||
          item.recommendation ||
          item.potential_reuse ||
          "Review recycling options";


        return {

          id:
            item.id,

          material,

          category,

          confidence,

          recommendation,

          status:
            confidence >= 90
              ? "High Confidence"
              : "Review Required",

        };

      }
    );

  }, [predictions]);


  // =========================================================
  // FILTER PREDICTIONS
  // =========================================================

  const filteredPredictions =
    activeFilter === "All"
      ? recentPredictions
      : recentPredictions.filter(
          (item) =>
            item.category
              .toLowerCase()
              .includes(
                activeFilter.toLowerCase()
              )
        );


  // =========================================================
  // AI RECOMMENDATIONS
  // GENERATED FROM REAL DATA
  // =========================================================

  const recommendations = useMemo(() => {

    const result = [];


    if (topMaterial) {

      result.push({

        icon: <FaRecycle />,

        title:
          `Increase ${topMaterial.material} Recovery`,

        description:
          `${topMaterial.material} represents approximately ${topMaterial.percentage.toFixed(
            1
          )}% of your analyzed waste. Improving segregation and recovery of this material may increase recycling efficiency.`,

        priority:
          topMaterial.percentage >= 40
            ? "High Priority"
            : "Medium Priority",

        type:
          topMaterial.percentage >= 40
            ? "high"
            : "medium",

      });

    }


    const sortingCount =
      predictions.filter(
        (item) =>
          (
            item.waste_category ||
            item.category ||
            ""
          )
            .toLowerCase()
            .includes("sort")
      ).length;


    if (sortingCount > 0) {

      result.push({

        icon: <FaIndustry />,

        title:
          "Improve Waste Segregation",

        description:
          `${sortingCount} prediction${
            sortingCount === 1
              ? ""
              : "s"
          } require sorting or additional material assessment. Separating textile types before processing can improve recovery.`,

        priority:
          "Medium Priority",

        type:
          "medium",

      });

    }


    if (
      predictions.length > 0 &&
      recyclableWaste === 0
    ) {

      result.push({

        icon: <FaLeaf />,

        title:
          "Review Recycling Classification",

        description:
          "Your current prediction history does not contain material classified as recyclable. Review waste categories and processing recommendations before routing materials.",

        priority:
          "Medium Priority",

        type:
          "medium",

      });

    }


    if (
      predictions.length > 0 &&
      averageConfidence < 80
    ) {

      result.push({

        icon: <FaLightbulb />,

        title:
          "Review Low-Confidence Predictions",

        description:
          `The current average AI confidence is ${averageConfidence.toFixed(
            1
          )}%. Consider reviewing images with lower-confidence predictions before operational decisions.`,

        priority:
          "High Priority",

        type:
          "high",

      });

    }


    if (result.length === 0) {

      result.push({

        icon: <FaLightbulb />,

        title:
          "Continue Uploading Waste Data",

        description:
          "Upload more textile waste images to build a larger prediction history and generate more meaningful AI insights.",

        priority:
          "Recommended",

        type:
          "medium",

      });

    }


    return result;

  }, [
    predictions,
    topMaterial,
    recyclableWaste,
    averageConfidence,
  ]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="dashboard">

        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div
          className={`dashboard-content ${
            collapsed
              ? "collapsed"
              : ""
          }`}
        >

          <Navbar />

          <main className="ai-insights-page">

            <section className="ai-header">

              <div className="ai-header-content">

                <div className="ai-header-icon">
                  <FaRobot />
                </div>

                <div>

                  <h1>
                    AI Insights
                  </h1>

                  <p>
                    Loading AI prediction data...
                  </p>

                </div>

              </div>

            </section>


            <section className="ai-status-card">

              <div className="ai-status-icon">
                <FaBrain />
              </div>

              <div className="ai-status-content">

                <h3>
                  Loading AI Analysis
                </h3>

                <p>
                  Fetching your prediction
                  history from the backend.
                </p>

              </div>

            </section>

          </main>

        </div>

      </div>

    );

  }


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      <div
        className={`dashboard-content ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >

        <Navbar />


        <main className="ai-insights-page">


          {/* =================================================
              HEADER
          ================================================= */}

          <section className="ai-header">

            <div className="ai-header-content">

              <div className="ai-header-icon">
                <FaRobot />
              </div>

              <div>

                <h1>
                  AI Insights
                </h1>

                <p>
                  AI-powered analysis of your
                  textile waste prediction history.
                </p>

              </div>

            </div>


            <button
              className="ai-refresh-btn"
              onClick={handleRefresh}
              type="button"
            >

              <FaSyncAlt />

              Refresh Insights

            </button>

          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <section className="ai-status-card">

              <div className="ai-status-icon">
                <FaExclamationTriangle />
              </div>

              <div className="ai-status-content">

                <h3>
                  Unable to Load AI Data
                </h3>

                <p>
                  {error}
                </p>

              </div>

              <button
                type="button"
                className="ai-refresh-btn"
                onClick={handleRefresh}
              >
                Retry
              </button>

            </section>

          )}


          {/* =================================================
              AI STATUS
          ================================================= */}

          <section className="ai-status-card">

            <div className="ai-status-icon">
              <FaBrain />
            </div>

            <div className="ai-status-content">

              <h3>
                AI Analysis Active
              </h3>

              <p>
                Insights below are generated from
                prediction records stored by your
                backend AI prediction system.
              </p>

            </div>

            <div className="ai-status-badge">

              <FaCheckCircle />

              System Active

            </div>

          </section>


          {/* =================================================
              SUMMARY
          ================================================= */}

          <section className="ai-summary-grid">


            <div className="ai-summary-card blue">

              <div className="summary-icon">
                <FaBoxes />
              </div>

              <div>

                <span>
                  Total Waste Analyzed
                </span>

                <strong>
                  {totalWaste.toFixed(1)} Kg
                </strong>

                <small>
                  {predictions.length} AI prediction
                  {predictions.length === 1
                    ? ""
                    : "s"}
                </small>

              </div>

            </div>


            <div className="ai-summary-card green">

              <div className="summary-icon">
                <FaRecycle />
              </div>

              <div>

                <span>
                  Recyclable Waste
                </span>

                <strong>
                  {recyclableWaste.toFixed(1)} Kg
                </strong>

                <small>
                  Based on prediction categories
                </small>

              </div>

            </div>


            <div className="ai-summary-card purple">

              <div className="summary-icon">
                <FaBrain />
              </div>

              <div>

                <span>
                  AI Predictions
                </span>

                <strong>
                  {predictions.length}
                </strong>

                <small>
                  {averageConfidence > 0
                    ? `${averageConfidence.toFixed(
                        1
                      )}% average confidence`
                    : "No confidence data"}
                </small>

              </div>

            </div>


            <div className="ai-summary-card orange">

              <div className="summary-icon">
                <FaChartLine />
              </div>

              <div>

                <span>
                  Average Confidence
                </span>

                <strong>
                  {averageConfidence.toFixed(1)}%
                </strong>

                <small>
                  Based on stored predictions
                </small>

              </div>

            </div>


          </section>


          {/* =================================================
              MATERIAL ANALYSIS
          ================================================= */}

          <section className="ai-panel">

            <div className="panel-header">

              <div>

                <h2>
                  <FaChartLine />
                  Material Analysis
                </h2>

                <p>
                  AI-detected distribution of
                  materials from your prediction history.
                </p>

              </div>

            </div>


            {materialInsights.length === 0 ? (

              <div className="no-predictions">

                No prediction data available yet.
                Upload textile waste to generate
                AI insights.

              </div>

            ) : (

              <div className="material-analysis-grid">


                {/* LEFT */}

                <div className="material-bars">

                  {materialInsights.map(
                    (item) => (

                      <div
                        className="material-row"
                        key={item.material}
                      >

                        <div className="material-row-top">

                          <span>
                            {item.material}
                          </span>

                          <strong>
                            {item.percentage.toFixed(
                              1
                            )}%
                          </strong>

                        </div>


                        <div className="material-progress">

                          <div
                            className="material-progress-fill"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor:
                                item.color,
                            }}
                          />

                        </div>


                        <div className="material-waste">

                          {item.waste.toFixed(1)}
                          {" Kg"} detected

                          {" • "}

                          {item.count} prediction
                          {item.count === 1
                            ? ""
                            : "s"}

                        </div>

                      </div>

                    )
                  )}

                </div>


                {/* RIGHT */}

                <div className="material-highlight">

                  <div className="highlight-icon">
                    <FaLightbulb />
                  </div>

                  <h3>
                    AI Observation
                  </h3>

                  <p>

                    {topMaterial
                      ? `${topMaterial.material} is currently the dominant material in your prediction history, representing approximately ${topMaterial.percentage.toFixed(
                          1
                        )}% of analyzed waste.`
                      : "Upload textile waste to generate material observations."}

                  </p>


                  {topMaterial && (

                    <>

                      <div className="highlight-stat">

                        <strong>
                          {topMaterial.percentage.toFixed(
                            1
                          )}%
                        </strong>

                        <span>
                          {topMaterial.material} Waste
                        </span>

                      </div>


                      <div className="highlight-message">

                        Improving segregation and
                        recovery of this material may
                        increase recycling efficiency.

                      </div>

                    </>

                  )}

                </div>

              </div>

            )}

          </section>


          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          <section className="ai-panel">

            <div className="panel-header">

              <div>

                <h2>
                  <FaLightbulb />
                  AI Recommendations
                </h2>

                <p>
                  Recommended actions based on
                  your actual prediction data.
                </p>

              </div>

            </div>


            <div className="recommendation-grid">

              {recommendations.map(
                (item, index) => (

                  <div
                    className={`recommendation-card ${item.type}`}
                    key={index}
                  >

                    <div className="recommendation-icon">
                      {item.icon}
                    </div>


                    <div className="recommendation-content">

                      <div className="recommendation-title-row">

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


                      <button
                        type="button"
                        onClick={handleRefresh}
                      >
                        Refresh Analysis
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* =================================================
              RECENT PREDICTIONS
          ================================================= */}

          <section className="ai-panel">

            <div className="panel-header predictions-header">

              <div>

                <h2>
                  <FaBrain />
                  Recent AI Predictions
                </h2>

                <p>
                  Latest material recognition results
                  stored by the backend.
                </p>

              </div>


              <div className="prediction-filters">

                {[
                  "All",
                  "Reusable",
                  "Recyclable",
                  "Needs Sorting",
                ].map(
                  (filter) => (

                    <button
                      key={filter}
                      type="button"
                      className={
                        activeFilter === filter
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveFilter(
                          filter
                        )
                      }
                    >

                      {filter}

                    </button>

                  )
                )}

              </div>

            </div>


            <div className="prediction-table-wrapper">

              <table className="prediction-table">

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

                          <div className="material-name">

                            <div className="material-mini-icon">
                              <FaBoxes />
                            </div>

                            <strong>
                              {item.material}
                            </strong>

                          </div>

                        </td>


                        <td>

                          <span
                            className={`category-badge ${item.category
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >

                            {item.category}

                          </span>

                        </td>


                        <td>

                          <div className="confidence-cell">

                            <div className="confidence-bar">

                              <div
                                style={{
                                  width: `${item.confidence}%`,
                                }}
                              />

                            </div>

                            <strong>
                              {item.confidence.toFixed(
                                1
                              )}%
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
                                ? "prediction-status success"
                                : "prediction-status warning"
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


              {filteredPredictions.length === 0 && (

                <div className="no-predictions">

                  {predictions.length === 0
                    ? "No AI predictions have been recorded yet. Upload textile waste to generate predictions."
                    : "No AI predictions found for this filter."}

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              AI DATA INFORMATION
          ================================================= */}

          <section className="ai-panel">

            <div className="panel-header">

              <div>

                <h2>
                  <FaRobot />
                  AI Model Information
                </h2>

                <p>
                  Information from the connected
                  prediction backend.
                </p>

              </div>

            </div>


            <div className="performance-grid">


              <div className="performance-item">

                <div className="performance-top">

                  <span>
                    Predictions Stored
                  </span>

                  <strong>
                    {predictions.length}
                  </strong>

                </div>

                <div className="performance-progress">

                  <div
                    style={{
                      width:
                        predictions.length > 0
                          ? "100%"
                          : "0%",
                    }}
                  />

                </div>

                <small>
                  Backend prediction history
                </small>

              </div>


              <div className="performance-item">

                <div className="performance-top">

                  <span>
                    Average Confidence
                  </span>

                  <strong>
                    {averageConfidence.toFixed(
                      1
                    )}%
                  </strong>

                </div>

                <div className="performance-progress">

                  <div
                    style={{
                      width: `${Math.min(
                        averageConfidence,
                        100
                      )}%`,
                    }}
                  />

                </div>

                <small>
                  Calculated from stored predictions
                </small>

              </div>


              <div className="performance-item">

                <div className="performance-top">

                  <span>
                    Materials Detected
                  </span>

                  <strong>
                    {materialInsights.length}
                  </strong>

                </div>

                <div className="performance-progress">

                  <div
                    style={{
                      width:
                        materialInsights.length > 0
                          ? "100%"
                          : "0%",
                    }}
                  />

                </div>

                <small>
                  Unique textile classes detected
                </small>

              </div>


            </div>

          </section>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="ai-footer-note">

            <FaBrain />

            <span>

              AI insights are generated from the
              textile waste predictions stored in
              the backend. Review predictions before
              making operational decisions.

            </span>

          </div>


        </main>

      </div>

    </div>

  );

}


export default AIInsights;