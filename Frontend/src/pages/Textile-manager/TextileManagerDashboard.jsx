import { useEffect, useState } from "react";
import TextileManagerSidebar from "../../components/TextileManagerSidebar";
import API from "../../api/auth";
import "../../styles/Textile-manager/TextileManagerDashboard.css";

function TextileManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dashboardData, setDashboardData] = useState({
    totalWaste: 0,
    analyzed: 0,
    recyclable: 0,
    reusable: 0,
    nonRecyclable: 0,

    materials: [],

    monthlyUploads: [],

    recentAnalysis: [],
  });

  // ============================================================
  // FETCH TEXTILE MANAGER DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found. Please login again.");
          return;
        }

        const response = await API.get("/textile-dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardData({
          totalWaste: response.data.totalWaste ?? 0,
          analyzed: response.data.analyzed ?? 0,
          recyclable: response.data.recyclable ?? 0,
          reusable: response.data.reusable ?? 0,
          nonRecyclable: response.data.nonRecyclable ?? 0,
          materials: response.data.materials ?? [],
          monthlyUploads: response.data.monthlyUploads ?? [],
          recentAnalysis: response.data.recentAnalysis ?? [],
        });
      } catch (err) {
        console.error(
          "Error loading Textile Manager Dashboard:",
          err
        );

        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          setError("You are not authorized to access this dashboard.");
        } else {
          setError(
            err.response?.data?.detail ||
              "Unable to load Textile Manager Dashboard."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ============================================================
  // CALCULATIONS
  // ============================================================

  const total = Number(dashboardData.totalWaste) || 0;

  const recyclablePercentage =
    total > 0
      ? ((dashboardData.recyclable / total) * 100).toFixed(2)
      : "0.00";

  const reusablePercentage =
    total > 0
      ? ((dashboardData.reusable / total) * 100).toFixed(2)
      : "0.00";

  const nonRecyclablePercentage =
    total > 0
      ? ((dashboardData.nonRecyclable / total) * 100).toFixed(2)
      : "0.00";

  const maxUpload =
    dashboardData.monthlyUploads.length > 0
      ? Math.max(
          ...dashboardData.monthlyUploads.map(
            (item) => Number(item.value) || 0
          )
        )
      : 0;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="textile-manager-loading">
        Loading Textile Manager Dashboard...
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="textile-manager-layout">
        <TextileManagerSidebar />

        <main className="textile-manager-content">
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            <h2>Unable to Load Dashboard</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="textile-manager-layout">

      <TextileManagerSidebar />

      <main className="textile-manager-content">

        {/* ================= HEADER ================= */}

        <header className="textile-manager-header">

          <div>
            <h1>Textile Manager Dashboard</h1>

            <p>
              Monitor textile waste, analyze materials and
              manage sustainable processing
            </p>
          </div>

          <div className="textile-manager-header-actions">

            <button
              type="button"
              className="tm-date-button"
            >
              ▣ &nbsp; Sep 11, 2026 &nbsp;⌄
            </button>

            <button
              type="button"
              className="tm-notification-button"
            >
              ♧
              <span>3</span>
            </button>

            <div className="tm-header-avatar">
              TM
            </div>

          </div>

        </header>

        {/* ================= KPI CARDS ================= */}

        <section className="tm-kpi-grid">

          <div className="tm-kpi-card">

            <div className="tm-kpi-icon purple">
              ♧
            </div>

            <div>
              <span>Total Textile Waste</span>

              <strong>
                {dashboardData.totalWaste.toLocaleString()} kg
              </strong>

              <small className="positive">
                +12.5% vs last month ↗
              </small>
            </div>

          </div>

          <div className="tm-kpi-card">

            <div className="tm-kpi-icon blue">
              ◫
            </div>

            <div>
              <span>Analyzed This Month</span>

              <strong>
                {dashboardData.analyzed.toLocaleString()}
              </strong>

              <small>
                {total > 0
                  ? (
                      (dashboardData.analyzed / total) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                % of total waste
              </small>
            </div>

          </div>

          <div className="tm-kpi-card">

            <div className="tm-kpi-icon green">
              ♻
            </div>

            <div>
              <span>Recyclable</span>

              <strong>
                {dashboardData.recyclable.toLocaleString()} kg
              </strong>

              <small>
                {recyclablePercentage}% of total
              </small>
            </div>

          </div>

          <div className="tm-kpi-card">

            <div className="tm-kpi-icon orange">
              ↻
            </div>

            <div>
              <span>Reusable</span>

              <strong>
                {dashboardData.reusable.toLocaleString()} kg
              </strong>

              <small>
                {reusablePercentage}% of total
              </small>
            </div>

          </div>

          <div className="tm-kpi-card">

            <div className="tm-kpi-icon red">
              ▥
            </div>

            <div>
              <span>Non-Recyclable</span>

              <strong>
                {dashboardData.nonRecyclable.toLocaleString()} kg
              </strong>

              <small>
                {nonRecyclablePercentage}% of total
              </small>
            </div>

          </div>

        </section>

        {/* ================= WORKFLOW + CLASSIFICATION ================= */}

        <section className="tm-two-column">

          <div className="tm-panel tm-workflow-panel">

            <div className="tm-panel-heading">
              <div>
                <h2>Textile Analysis Workflow</h2>
              </div>
            </div>

            <div className="tm-workflow">

              <div className="tm-workflow-line" />

              <div className="tm-workflow-step">
                <div className="workflow-circle purple-bg">
                  ⇧
                </div>

                <strong>1. Upload</strong>

                <p>
                  Upload textile
                  <br />
                  waste image
                </p>
              </div>

              <div className="tm-workflow-step">
                <div className="workflow-circle blue-bg">
                  ⛶
                </div>

                <strong>2. Preprocess</strong>

                <p>
                  Image validation
                  <br />
                  & preprocessing
                </p>
              </div>

              <div className="tm-workflow-step">
                <div className="workflow-circle teal-bg">
                  AI
                </div>

                <strong>3. AI Model</strong>

                <p>
                  Efficientnetb1
                  <br />
                  analysis
                </p>
              </div>

              <div className="tm-workflow-step">
                <div className="workflow-circle green-bg">
                  ♢
                </div>

                <strong>4. Classify</strong>

                <p>
                  Material & waste
                  <br />
                  classification
                </p>
              </div>

              <div className="tm-workflow-step">
                <div className="workflow-circle purple-bg">
                  ✧
                </div>

                <strong>5. Recommend</strong>

                <p>
                  Recycling / reuse
                  <br />
                  recommendation
                </p>
              </div>

            </div>

          </div>

          {/* ================= WASTE CLASSIFICATION ================= */}

          <div className="tm-panel">

            <div className="tm-panel-heading">
              <div>
                <h2>Waste Classification Overview</h2>
              </div>
            </div>

            <div className="tm-classification-content">

              <div
                className="tm-donut"
                style={{
                  background: `conic-gradient(
                    #28a745 0deg ${Number(
                      recyclablePercentage
                    ) * 3.6}deg,
                    #f7a928 ${Number(
                      recyclablePercentage
                    ) * 3.6}deg ${
                      (Number(recyclablePercentage) +
                        Number(reusablePercentage)) *
                      3.6
                    }deg,
                    #ef4444 ${
                      (Number(recyclablePercentage) +
                        Number(reusablePercentage)) *
                      3.6
                    }deg 360deg
                  )`,
                }}
              >
                <div>
                  <strong>
                    {total.toLocaleString()}
                  </strong>

                  <span>kg</span>

                  <small>Total</small>
                </div>
              </div>

              <div className="tm-legend">

                <div>
                  <span className="legend-dot green-dot" />

                  <div>
                    <strong>Recyclable</strong>

                    <p>
                      {dashboardData.recyclable.toLocaleString()} kg (
                      {recyclablePercentage}%)
                    </p>
                  </div>
                </div>

                <div>
                  <span className="legend-dot orange-dot" />

                  <div>
                    <strong>Reusable</strong>

                    <p>
                      {dashboardData.reusable.toLocaleString()} kg (
                      {reusablePercentage}%)
                    </p>
                  </div>
                </div>

                <div>
                  <span className="legend-dot red-dot" />

                  <div>
                    <strong>Non-Recyclable</strong>

                    <p>
                      {dashboardData.nonRecyclable.toLocaleString()} kg (
                      {nonRecyclablePercentage}%)
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================= CHARTS ================= */}

        <section className="tm-three-column">

          {/* ================= MATERIAL COMPOSITION ================= */}

          <div className="tm-panel">

            <div className="tm-panel-heading">
              <h2>Material Composition</h2>
            </div>

            <div className="tm-material-layout">

              <div
                className="tm-material-donut"
                style={{
                  background:
                    dashboardData.materials.length > 0
                      ? `conic-gradient(
                          #6842cf 0deg 162deg,
                          #3478d4 162deg 252deg,
                          #45b9bd 252deg 288deg,
                          #f6a623 288deg 317deg,
                          #c8ccd3 317deg 360deg
                        )`
                      : "#e5e7eb",
                }}
              >
                <div />
              </div>

              <div className="tm-material-list">

                {dashboardData.materials.map(
                  (material) => (
                    <div
                      className="tm-material-item"
                      key={material.name}
                    >

                      <span
                        className={`material-dot ${material.color}`}
                      />

                      <span>
                        {material.name}
                      </span>

                      <strong>
                        {material.percentage}%
                      </strong>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

          {/* ================= MONTHLY UPLOAD TREND ================= */}

          <div className="tm-panel">

            <div className="tm-panel-heading">
              <h2>Monthly Upload Trend (kg)</h2>
            </div>

            <div className="tm-chart">

              <div className="tm-chart-y">
                <span>400</span>
                <span>300</span>
                <span>200</span>
                <span>100</span>
                <span>0</span>
              </div>

              <div className="tm-bars">

                {dashboardData.monthlyUploads.map(
                  (item) => (
                    <div
                      className="tm-bar-column"
                      key={item.month}
                    >

                      <span>
                        {item.value}
                      </span>

                      <div
                        className="tm-bar"
                        style={{
                          height: `${
                            maxUpload > 0
                              ? (item.value / maxUpload) * 135
                              : 0
                          }px`,
                        }}
                      />

                      <small>
                        {item.month}
                      </small>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

          {/* ================= TOP MATERIALS ================= */}

          <div className="tm-panel">

            <div className="tm-panel-heading">
              <h2>Top Materials Identified</h2>
            </div>

            <div className="tm-top-materials">

              {dashboardData.materials.map(
                (material) => (
                  <div
                    className="tm-top-material"
                    key={material.name}
                  >

                    <div className="tm-top-material-name">

                      <div
                        className={`material-thumb ${material.color}`}
                      >
                        {material.name.charAt(0)}
                      </div>

                      <span>
                        {material.name}
                      </span>

                    </div>

                    <div className="tm-progress-wrapper">

                      <div className="tm-progress">

                        <div
                          className={`tm-progress-fill ${material.color}`}
                          style={{
                            width: `${material.percentage}%`,
                          }}
                        />

                      </div>

                      <strong>
                        {material.percentage}%
                      </strong>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </section>

        {/* ================= RECENT ANALYSIS ================= */}

        <section className="tm-bottom-grid">

          <div className="tm-panel tm-analysis-panel">

            <div className="tm-panel-heading">

              <div>
                <h2>Recent Textile Analysis</h2>
              </div>

              <button type="button">
                View All Analysis
              </button>

            </div>

            <div className="tm-table-wrapper">

              <table className="tm-analysis-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Material</th>
                    <th>Classification</th>
                    <th>Recyclability</th>
                    <th>Recommendation</th>
                    <th>Confidence</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboardData.recentAnalysis.length > 0 ? (
                    dashboardData.recentAnalysis.map(
                      (item) => (
                        <tr key={item.id}>

                          <td>{item.id}</td>

                          <td>
                            <strong>
                              {item.material}
                            </strong>
                          </td>

                          <td>
                            {item.classification}
                          </td>

                          <td>

                            <span
                              className={
                                item.classification ===
                                "Recyclable"
                                  ? "tm-recycle-icon"
                                  : item.classification ===
                                    "Reusable"
                                  ? "tm-reuse-icon"
                                  : "tm-non-icon"
                              }
                            >
                              {item.classification ===
                              "Recyclable"
                                ? "♻"
                                : item.classification ===
                                  "Reusable"
                                ? "↻"
                                : "×"}
                            </span>

                          </td>

                          <td>
                            {item.recommendation}
                          </td>

                          <td
                            className={
                              item.confidence >= 85
                                ? "confidence-high"
                                : item.confidence >= 70
                                ? "confidence-medium"
                                : "confidence-low"
                            }
                          >
                            {item.confidence}%
                          </td>

                          <td>
                            {item.date}
                          </td>

                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                        }}
                      >
                        No textile analysis records found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* ================= AI MODEL ================= */}

          <div className="tm-ai-card">

            <div className="tm-ai-header">

              <div className="tm-ai-icon">
                AI
              </div>

              <div>

                <h2>AI Model Performance</h2>

                <strong>
                  Effcientnetb1
                </strong>

                <p>
                  Textile Material Classification
                </p>

              </div>

              <span className="tm-active-badge">
                Active
              </span>

            </div>

            <div className="tm-ai-stats">

              <div>
                <span>Total Predictions</span>
                <strong>
                  {dashboardData.analyzed.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Avg. Confidence</span>
                <strong>
                  {dashboardData.recentAnalysis.length > 0
                    ? (
                        dashboardData.recentAnalysis.reduce(
                          (sum, item) =>
                            sum + Number(item.confidence || 0),
                          0
                        ) /
                        dashboardData.recentAnalysis.length
                      ).toFixed(1)
                    : "0.0"}
                  %
                </strong>
              </div>

              <div>
                <span>High Confidence</span>

                <strong>
                  {
                    dashboardData.recentAnalysis.filter(
                      (item) => item.confidence >= 85
                    ).length
                  }

                  <small>
                    {" "}
                    (
                    {dashboardData.recentAnalysis.length > 0
                      ? (
                          (dashboardData.recentAnalysis.filter(
                            (item) => item.confidence >= 85
                          ).length /
                            dashboardData.recentAnalysis.length) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %)
                  </small>
                </strong>

              </div>

              <div>
                <span>Low Confidence</span>

                <strong>
                  {
                    dashboardData.recentAnalysis.filter(
                      (item) => item.confidence < 70
                    ).length
                  }

                  <small>
                    {" "}
                    (
                    {dashboardData.recentAnalysis.length > 0
                      ? (
                          (dashboardData.recentAnalysis.filter(
                            (item) => item.confidence < 70
                          ).length /
                            dashboardData.recentAnalysis.length) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %)
                  </small>
                </strong>

              </div>

            </div>

            <button
              type="button"
              className="tm-start-analysis"
            >
              ✧ &nbsp; Start New Analysis
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default TextileManagerDashboard;