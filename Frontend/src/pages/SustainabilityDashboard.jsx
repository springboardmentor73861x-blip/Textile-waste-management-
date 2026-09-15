import { useEffect, useMemo, useState } from "react";
import SustainabilitySidebar from "../components/SustainabilitySidebar";
import { getSustainabilityDashboard } from "../api/sustainability";
import API from "../api/auth";
import "../styles/SustainabilityDashboard.css";

function Sustainability() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [dashboardResponse, activityResponse] =
          await Promise.all([
            getSustainabilityDashboard(),
            API.get("/activity/recent"),
          ]);

        setData(dashboardResponse);

        setRecentActivity(
          Array.isArray(activityResponse.data)
            ? activityResponse.data.slice(0, 3)
            : []
        );
      } catch (err) {
        console.error(
          "Sustainability Dashboard Error:",
          err.response?.data || err
        );

        setError("Unable to load sustainability data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const averageRecyclability = useMemo(() => {
    if (!data?.fabric_analysis?.length) {
      return 0;
    }

    const total = data.fabric_analysis.reduce(
      (sum, item) =>
        sum + Number(item.recyclability || 0),
      0
    );

    return Math.round(
      total / data.fabric_analysis.length
    );
  }, [data]);

  const score = Number(
    data?.stats?.sustainability_score || 0
  );

  const co2Saved = Number(
    data?.stats?.co2_saved || 0
  );

  const waterSaved = Number(
    data?.stats?.water_saved || 0
  );

  const landSaved = Number(
    data?.stats?.land_saved || 0
  );

  const divertedQuantity = Number(
    data?.stats?.diverted_quantity || 0
  );

  const recentAnalysis =
    data?.recent_analysis?.slice(0, 3) || [];

  const recommendations = [
    {
      title: "Increase Recycling",
      text:
        "Prioritize textile materials with higher recycling potential and route them to appropriate recycling facilities.",
      icon: "♻",
    },
    {
      title: "Promote Reuse",
      text:
        "Review textile materials that can be reused before sending them for recycling or disposal.",
      icon: "↻",
    },
    {
      title: "Monitor High Waste Materials",
      text:
        "Monitor fabric categories with the highest inventory quantities to improve material utilization.",
      icon: "↓",
    },
  ];

  const wasteOverview =
    data?.waste_overview || [];

  const maxWasteValue = Math.max(
    ...wasteOverview.map((item) =>
      Number(item.value || 0)
    ),
    1
  );

  if (loading) {
    return (
      <div className="sustainability-layout">
        <SustainabilitySidebar />

        <main
          className="sustainability-content"
          id="top"
        >
          <div className="sustainability-loading">
            Loading sustainability data...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sustainability-layout">
        <SustainabilitySidebar />

        <main className="sustainability-content">
          <div className="sustainability-error">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="sustainability-layout">
      <SustainabilitySidebar />

      <main className="sustainability-content">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="sustainability-header">
          <div>
            <span className="sustainability-label">
              Sustainability Intelligence
            </span>

            <h1>
              Sustainability Dashboard
            </h1>

            <p>
              Monitor textile waste, recyclability,
              reuse potential and sustainability performance.
            </p>
          </div>

          <button
            type="button"
            className="sustainability-refresh"
            onClick={() => window.location.reload()}
          >
            ↻ Refresh
          </button>
        </header>

        {/* =====================================================
            TOP 4 STATS
        ===================================================== */}

        <section className="sustainability-stats">

          <div className="sustainability-card">
            <div className="sustainability-card-icon">
              ♻
            </div>

            <p>Total Textile Waste</p>

            <h2>
              {data?.stats?.total_textile_waste || 0} kg
            </h2>

            <span>
              Total recorded textile waste
            </span>
          </div>

          <div className="sustainability-card">
            <div className="sustainability-card-icon">
              ↻
            </div>

            <p>Recyclable Waste</p>

            <h2>
              {data?.stats?.recyclable_waste || 0} kg
            </h2>

            <span>
              Identified as recyclable
            </span>
          </div>

          <div className="sustainability-card">
            <div className="sustainability-card-icon">
              ↗
            </div>

            <p>Reusable Waste</p>

            <h2>
              {data?.stats?.reusable_waste || 0} kg
            </h2>

            <span>
              Suitable for reuse
            </span>
          </div>

          <div className="sustainability-card">
            <div className="sustainability-card-icon">
              ★
            </div>

            <p>Sustainability Score</p>

            <h2>
              {score.toFixed(2)}/100
            </h2>

            <span>
              Overall performance
            </span>
          </div>

        </section>

        {/* =====================================================
            ENVIRONMENTAL IMPACT
        ===================================================== */}

        <section
          className="sustainability-stats"
          id="environmental-impact"
        >

          <div className="sustainability-card">
            <div className="sustainability-card-icon">
              🌱
            </div>

            <p>CO₂ Saved</p>

            <h2>
              {co2Saved.toLocaleString()} kg
            </h2>

            <span>
              Estimated CO₂e savings
            </span>
          </div>

          <div className="sustainability-card">
            <div className="sustainability-card-icon">
              💧
            </div>

            <p>Water Saved</p>

            <h2>
              {waterSaved.toLocaleString()} L
            </h2>

            <span>
              Estimated water savings
            </span>
          </div>

          <div className="sustainability-card">
            <div className="sustainability-card-icon">
              🌍
            </div>

            <p>Land Saved</p>

            <h2>
              {landSaved.toLocaleString()} m²
            </h2>

            <span>
              Estimated land-use savings
            </span>
          </div>

          <div className="sustainability-card">
            <div className="sustainability-card-icon">
              ↗
            </div>

            <p>Waste Diverted</p>

            <h2>
              {divertedQuantity.toLocaleString()} kg
            </h2>

            <span>
              Reusable or recyclable waste
            </span>
          </div>

        </section>

        {/* =====================================================
            WASTE OVERVIEW + SCORE
        ===================================================== */}

        <section
          className="sustainability-main-grid"
          id="waste-overview"
        >

          <div className="sustainability-panel waste-overview-panel">

            <div className="panel-heading">
              <div>
                <h2>Waste Overview</h2>

                <p>
                  Textile waste recorded by month
                </p>
              </div>
            </div>

            <div className="waste-chart">

              {wasteOverview.length > 0 ? (
                wasteOverview.map((item, index) => {

                  const value = Number(
                    item.value || 0
                  );

                  const height =
                    (value / maxWasteValue) * 100;

                  return (
                    <div
                      className="waste-bar-column"
                      key={`${item.month}-${index}`}
                    >

                      <span>
                        {value} kg
                      </span>

                      <div className="waste-bar-wrapper">

                        <div
                          className="waste-bar"
                          style={{
                            height: `${height}%`,
                          }}
                          title={`${value} kg`}
                        />

                      </div>

                      <small>
                        {item.month}
                      </small>

                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  No monthly waste data available.
                </div>
              )}

            </div>

          </div>

          <div className="sustainability-panel score-panel">

            <div className="panel-heading">
              <div>
                <h2>Sustainability Score</h2>

                <p>
                  Overall environmental performance
                </p>
              </div>
            </div>

            <div className="score-circle">

              <div className="score-inner">

                <strong>
                  {Math.round(score)}
                </strong>

                <span>
                  out of 100
                </span>

              </div>

            </div>

            <div className="score-status">
              {score >= 85
                ? "Excellent"
                : score >= 70
                ? "Good"
                : score >= 50
                ? "Moderate"
                : "Needs Improvement"}
            </div>

          </div>

        </section>

        {/* =====================================================
            FABRIC ANALYSIS
        ===================================================== */}

        <section
          className="sustainability-panel fabric-panel"
          id="fabric-analysis"
        >

          <div className="panel-heading">

            <div>
              <h2>
                Fabric Sustainability Analysis
              </h2>

              <p>
                Material-level waste and recyclability performance
              </p>
            </div>

            <div className="average-badge">
              Avg. Recyclability:{" "}
              {averageRecyclability}%
            </div>

          </div>

          <div className="table-wrapper">

            <table className="sustainability-table">

              <thead>
                <tr>
                  <th>Fabric Type</th>
                  <th>Waste Quantity</th>
                  <th>Recyclability</th>
                  <th>Reuse Potential</th>
                  <th>Performance</th>
                </tr>
              </thead>

              <tbody>

                {data?.fabric_analysis?.length > 0 ? (

                  data.fabric_analysis.map(
                    (item, index) => (

                      <tr
                        key={`${item.fabric_type}-${index}`}
                      >

                        <td>
                          <strong>
                            {item.fabric_type}
                          </strong>
                        </td>

                        <td>
                          {item.waste_quantity} kg
                        </td>

                        <td>

                          <div className="progress-cell">

                            <span>
                              {item.recyclability}%
                            </span>

                            <div className="progress-track">

                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      Number(
                                        item.recyclability || 0
                                      ),
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        <td>
                          {item.reuse_potential}%
                        </td>

                        <td>

                          <span className="performance-badge">
                            {item.performance}
                          </span>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>
                    <td
                      colSpan="5"
                      className="empty-table"
                    >
                      No fabric analysis available.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =====================================================
            THREE COLUMN ROW
        ===================================================== */}

        <section className="sustainability-three-column">

          {/* RECENT TEXTILE ANALYSIS */}

          <div className="sustainability-panel dashboard-column-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Recent Textile Analysis
                </h2>

                <p>
                  Latest material classification and sustainability results
                </p>
              </div>

              <a
                href="/admin/uploads"
                className="panel-action-link"
              >
                View All →
              </a>

            </div>

            <div className="recent-analysis-list">

              {recentAnalysis.length > 0 ? (

                recentAnalysis.map(
                  (item, index) => (

                    <div
                      className="recent-analysis-item"
                      key={`${item.material}-${item.time}-${index}`}
                    >

                      <div className="recent-analysis-material">

                        <div className="recent-material-icon">
                          {item.material?.charAt(0) || "T"}
                        </div>

                        <div className="recent-analysis-info">

                          <strong>
                            {item.material}
                          </strong>

                          <p>
                            {item.status}
                          </p>

                          <small>
                            {item.time}
                          </small>

                        </div>

                      </div>

                      <div className="recent-analysis-right">

                        <div className="analysis-score">

                          <small>
                            Sustainability
                          </small>

                          <strong>
                            {item.score}/100
                          </strong>

                        </div>

                        <span>
                          {item.recommendation}
                        </span>

                      </div>

                    </div>
                  )

                )

              ) : (

                <div className="empty-state">
                  No recent analysis available.
                </div>

              )}

            </div>

          </div>

          {/* RECENT ACTIVITY */}

          <div className="sustainability-panel dashboard-column-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Recent Activity
                </h2>

                <p>
                  Latest sustainability platform activity
                </p>
              </div>

            </div>

            <div className="recent-activity-list">

              {recentActivity.length > 0 ? (

                recentActivity.map(
                  (item, index) => {

                    const activityDate = item.created_at
                      ? new Date(item.created_at)
                      : null;

                    const formattedDate =
                      activityDate &&
                      !Number.isNaN(activityDate.getTime())
                        ? activityDate.toLocaleString()
                        : "-";

                    return (
                      <div
                        className="recent-activity-item"
                        key={item.id ?? `activity-${index}`}
                      >

                        <div className="recent-activity-left">

                          <div className="recent-activity-icon">
                            ✓
                          </div>

                          <div>

                            <strong>
                              {item.action ||
                                "Platform Activity"}
                            </strong>

                            <p>
                              {item.username ||
                                "System Activity"}
                            </p>

                          </div>

                        </div>

                        <div className="recent-activity-meta">

                          <p>
                            {formattedDate}
                          </p>

                          <span className="recent-activity-status">
                            {item.status || "Completed"}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )

              ) : (

                <div className="empty-state">
                  No recent activity available.
                </div>

              )}

            </div>

          </div>

          {/* QUICK ACTIONS */}

          <div className="sustainability-panel dashboard-column-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Quick Actions
                </h2>

                <p>
                  Common sustainability operations
                </p>
              </div>

            </div>

            <div className="quick-actions-list">

              <a
                href="/sustainability/analyze-textile"
                className="quick-action-item"
              >

                <div className="quick-action-icon">
                  ♻
                </div>

                <div className="quick-action-content">

                  <strong>
                    Analyze Textile
                  </strong>

                  <span>
                    Start a new textile analysis
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </a>

              <a
                href="/sustainability/generate-report"
                className="quick-action-item"
              >

                <div className="quick-action-icon">
                  ▤
                </div>

                <div className="quick-action-content">

                  <strong>
                    Generate Report
                  </strong>

                  <span>
                    Download sustainability report
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </a>

              <a
                href="/sustainability/manage-goals"
                className="quick-action-item"
              >

                <div className="quick-action-icon">
                  ◎
                </div>

                <div className="quick-action-content">

                  <strong>
                    Manage Goals
                  </strong>

                  <span>
                    Review sustainability targets
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </a>

            </div>

          </div>

        </section>

        {/* =====================================================
            ACTION CENTER
        ===================================================== */}

        <section
          className="sustainability-action-center"
          id="action-center"
        >

          <div className="action-center-heading">

            <span className="action-center-label">
              ACTION CENTER
            </span>

            <h2>
              Sustainability Recommendations
            </h2>

            <p>
              Suggested actions based on current textile waste
              and environmental performance.
            </p>

          </div>

          <div className="recommendation-grid">

            {recommendations.map(
              (recommendation) => (

                <div
                  className="recommendation-card"
                  key={recommendation.title}
                >

                  <div className="recommendation-icon">
                    {recommendation.icon}
                  </div>

                  <div className="recommendation-content">

                    <h3>
                      {recommendation.title}
                    </h3>

                    <p>
                      {recommendation.text}
                    </p>

                    <button
                      type="button"
                      className="recommendation-action"
                    >
                      Explore action →
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

        {/* =====================================================
            SUSTAINABILITY PERFORMANCE REPORT
        ===================================================== */}

        <section
          className="sustainability-report-panel"
          id="reports"
        >

          <div className="report-icon">
            ▤
          </div>

          <div className="report-content">

            <span>
              MONTHLY REPORT
            </span>

            <h2>
              Sustainability Performance Report
            </h2>

            <p>
              Download the latest environmental impact,
              textile waste and sustainability performance summary.
            </p>

          </div>

          <a
            href="/admin/reports"
            className="download-report-button"
          >
            ↓ Download Report
          </a>

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="sustainability-footer">
          Sustainability Intelligence Platform • Textile Waste Analytics
        </div>

      </main>

    </div>
  );
}

export default Sustainability;