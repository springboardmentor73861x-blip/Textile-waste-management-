import React, { useEffect, useMemo, useState } from "react";
import SustainabilitySidebar from "../components/SustainabilitySidebar";
import API from "../api/auth";
import "../styles/SustainabilityAnalytics.css";

function SustainabilityAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/analytics/dashboard"
      );

      setAnalyticsData(response.data);
    } catch (err) {
      console.error("Sustainability Analytics Error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load sustainability analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // SAFE DATA HANDLING
  // ------------------------------------------------------------

  const stats = analyticsData?.stats || {};

  const wasteByCategory =
    analyticsData?.waste_by_category || [];

  const materialComposition =
    analyticsData?.material_composition || [];

  const recyclabilityTrend =
    analyticsData?.recyclability_trend || [];

  const environmentalTrend =
    analyticsData?.environmental_trend ||
    analyticsData?.co2_trend ||
    [];

  const recentAnalytics =
    analyticsData?.recent_analytics ||
    analyticsData?.recent_analysis ||
    [];

  // ------------------------------------------------------------
  // DERIVED VALUES
  // ------------------------------------------------------------

  const maxWaste = useMemo(() => {
    if (!wasteByCategory.length) return 1;

    return Math.max(
      ...wasteByCategory.map((item) =>
        Number(
          item.value ??
            item.quantity ??
            item.count ??
            0
        )
      ),
      1
    );
  }, [wasteByCategory]);

  const maxMaterial = useMemo(() => {
    if (!materialComposition.length) return 1;

    return Math.max(
      ...materialComposition.map((item) =>
        Number(
          item.value ??
            item.quantity ??
            item.count ??
            item.percentage ??
            0
        )
      ),
      1
    );
  }, [materialComposition]);

  // ------------------------------------------------------------
  // LOADING
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="sustainability-analytics-page">
        <SustainabilitySidebar />

        <main className="sustainability-analytics-content">
          <div className="analytics-loading">
            <div className="analytics-spinner"></div>
            <p>Loading sustainability analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  // ------------------------------------------------------------
  // ERROR
  // ------------------------------------------------------------

  if (error) {
    return (
      <div className="sustainability-analytics-page">
        <SustainabilitySidebar />

        <main className="sustainability-analytics-content">
          <div className="analytics-header">
            <div>
              <span className="analytics-label">
                SUSTAINABILITY INTELLIGENCE
              </span>

              <h1>Sustainability Analytics</h1>

              <p>
                Detailed analysis of textile waste,
                materials and environmental performance.
              </p>
            </div>

            <button
              className="analytics-refresh-btn"
              onClick={fetchAnalytics}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="analytics-error">
            <div className="error-icon">!</div>

            <h3>Unable to load analytics</h3>

            <p>{error}</p>

            <button
              className="retry-btn"
              onClick={fetchAnalytics}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ------------------------------------------------------------
  // MAIN UI
  // ------------------------------------------------------------

  return (
    <div className="sustainability-analytics-page">
      <SustainabilitySidebar />

      <main className="sustainability-analytics-content">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="analytics-header">
          <div>
            <span className="analytics-label">
              SUSTAINABILITY INTELLIGENCE
            </span>

            <h1>Sustainability Analytics</h1>

            <p>
              Detailed insights into textile waste,
              material performance and environmental impact.
            </p>
          </div>

          <button
            className="analytics-refresh-btn"
            onClick={fetchAnalytics}
          >
            ↻ Refresh
          </button>
        </header>


        {/* =====================================================
            KPI SUMMARY
        ====================================================== */}

        <section className="analytics-summary-grid">

          <div className="analytics-card">
            <div className="analytics-card-icon">
              ♻
            </div>

            <div>
              <span>Total Waste</span>

              <strong>
                {stats.total_textile_waste ?? 0} kg
              </strong>

              <small>
                Recorded textile waste
              </small>
            </div>
          </div>


          <div className="analytics-card">
            <div className="analytics-card-icon">
              %
            </div>

            <div>
              <span>Recyclability</span>

              <strong>
                {stats.recyclability_percentage ??
                  stats.recyclable_percentage ??
                  0}
                %
              </strong>

              <small>
                Waste suitable for recycling
              </small>
            </div>
          </div>


          <div className="analytics-card">
            <div className="analytics-card-icon">
              CO₂
            </div>

            <div>
              <span>CO₂ Impact</span>

              <strong>
                {stats.co2_saved ?? 0}{" "}
                {stats.co2_unit || "kg"}
              </strong>

              <small>
                Estimated emissions saved
              </small>
            </div>
          </div>


          <div className="analytics-card">
            <div className="analytics-card-icon">
              ★
            </div>

            <div>
              <span>Performance</span>

              <strong>
                {stats.sustainability_score ?? 0}/100
              </strong>

              <small>
                Sustainability performance
              </small>
            </div>
          </div>

        </section>


        {/* =====================================================
            ANALYTICS GRID
        ====================================================== */}

        <section className="analytics-main-grid">

          {/* ---------------------------------------------------
              WASTE CATEGORY
          ---------------------------------------------------- */}

          <div className="analytics-panel">

            <div className="panel-header">
              <div>
                <h2>Waste Category Analysis</h2>

                <p>
                  Distribution of textile waste categories.
                </p>
              </div>
            </div>

            {wasteByCategory.length === 0 ? (
              <div className="empty-analytics">
                No waste category data available.
              </div>
            ) : (
              <div className="waste-category-list">

                {wasteByCategory.map((item, index) => {

                  const label =
                    item.category ||
                    item.waste_category ||
                    item.name ||
                    `Category ${index + 1}`;

                  const value = Number(
                    item.value ??
                      item.quantity ??
                      item.count ??
                      0
                  );

                  const percentage = Math.min(
                    (value / maxWaste) * 100,
                    100
                  );

                  return (
                    <div
                      className="waste-category-item"
                      key={`${label}-${index}`}
                    >

                      <div className="category-top">

                        <span>{label}</span>

                        <strong>
                          {value} kg
                        </strong>

                      </div>

                      <div className="category-bar">
                        <div
                          className="category-bar-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>


          {/* ---------------------------------------------------
              MATERIAL COMPOSITION
          ---------------------------------------------------- */}

          <div className="analytics-panel">

            <div className="panel-header">
              <div>
                <h2>Material Composition</h2>

                <p>
                  Textile material distribution across inventory.
                </p>
              </div>
            </div>

            {materialComposition.length === 0 ? (
              <div className="empty-analytics">
                No material composition data available.
              </div>
            ) : (
              <div className="material-list">

                {materialComposition.map((item, index) => {

                  const material =
                    item.material ||
                    item.fabric_type ||
                    item.name ||
                    `Material ${index + 1}`;

                  const rawValue = Number(
                    item.percentage ??
                      item.value ??
                      item.quantity ??
                      item.count ??
                      0
                  );

                  const percentage =
                    item.percentage !== undefined
                      ? rawValue
                      : (rawValue / maxMaterial) * 100;

                  return (
                    <div
                      className="material-item"
                      key={`${material}-${index}`}
                    >

                      <div className="material-info">

                        <span className="material-dot"></span>

                        <span>
                          {material}
                        </span>

                        <strong>
                          {Math.round(
                            Math.min(percentage, 100)
                          )}
                          %
                        </strong>

                      </div>

                      <div className="material-bar">

                        <div
                          className="material-bar-fill"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        ></div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </section>


        {/* =====================================================
            RECYCLABILITY + ENVIRONMENT
        ====================================================== */}

        <section className="analytics-main-grid">

          {/* ---------------------------------------------------
              RECYCLABILITY TREND
          ---------------------------------------------------- */}

          <div className="analytics-panel">

            <div className="panel-header">
              <div>
                <h2>Recyclability Trend</h2>

                <p>
                  Recyclability performance over time.
                </p>
              </div>
            </div>

            {recyclabilityTrend.length === 0 ? (
              <div className="empty-analytics">
                No recyclability trend data available.
              </div>
            ) : (
              <div className="trend-chart">

                {recyclabilityTrend.map(
                  (item, index) => {

                    const value = Number(
                      item.value ??
                        item.percentage ??
                        item.recyclability ??
                        0
                    );

                    const month =
                      item.month ||
                      item.period ||
                      item.label ||
                      `Period ${index + 1}`;

                    return (
                      <div
                        className="trend-column"
                        key={`${month}-${index}`}
                      >

                        <div className="trend-value">
                          {Math.round(value)}%
                        </div>

                        <div className="trend-track">

                          <div
                            className="trend-fill"
                            style={{
                              height: `${Math.min(
                                value,
                                100
                              )}%`,
                            }}
                          ></div>

                        </div>

                        <span className="trend-label">
                          {month}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>


          {/* ---------------------------------------------------
              ENVIRONMENTAL IMPACT
          ---------------------------------------------------- */}

          <div className="analytics-panel">

            <div className="panel-header">
              <div>
                <h2>Environmental Impact</h2>

                <p>
                  Estimated environmental savings generated
                  through waste diversion.
                </p>
              </div>
            </div>

            <div className="environment-grid">

              <div className="environment-item">
                <span className="environment-icon">
                  CO₂
                </span>

                <div>
                  <small>CO₂ Saved</small>

                  <strong>
                    {stats.co2_saved ?? 0}{" "}
                    {stats.co2_unit || "kg"}
                  </strong>
                </div>
              </div>


              <div className="environment-item">
                <span className="environment-icon">
                  💧
                </span>

                <div>
                  <small>Water Saved</small>

                  <strong>
                    {stats.water_saved ?? 0}{" "}
                    {stats.water_unit || "L"}
                  </strong>
                </div>
              </div>


              <div className="environment-item">
                <span className="environment-icon">
                  🌍
                </span>

                <div>
                  <small>Land Saved</small>

                  <strong>
                    {stats.land_saved ?? 0}{" "}
                    {stats.land_unit || "m²"}
                  </strong>
                </div>
              </div>


              <div className="environment-item">
                <span className="environment-icon">
                  ↗
                </span>

                <div>
                  <small>Waste Diverted</small>

                  <strong>
                    {stats.diverted_quantity ?? 0} kg
                  </strong>
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ENVIRONMENTAL TREND
        ====================================================== */}

        <section className="analytics-panel full-width-panel">

          <div className="panel-header">
            <div>
              <h2>Environmental Performance Trend</h2>

              <p>
                Monthly environmental impact generated from
                company textile waste activity.
              </p>
            </div>
          </div>

          {environmentalTrend.length === 0 ? (
            <div className="empty-analytics">
              No environmental trend data available.
            </div>
          ) : (
            <div className="environment-trend-list">

              {environmentalTrend.map(
                (item, index) => {

                  const label =
                    item.month ||
                    item.period ||
                    item.label ||
                    `Period ${index + 1}`;

                  const co2 = Number(
                    item.co2_saved ??
                      item.co2 ??
                      0
                  );

                  const water = Number(
                    item.water_saved ??
                      item.water ??
                      0
                  );

                  return (
                    <div
                      className="environment-trend-row"
                      key={`${label}-${index}`}
                    >

                      <span className="environment-period">
                        {label}
                      </span>

                      <span>
                        CO₂: <strong>{co2}</strong> kg
                      </span>

                      <span>
                        Water: <strong>{water}</strong> L
                      </span>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>


        {/* =====================================================
            RECENT ANALYTICS
        ====================================================== */}

        <section className="analytics-panel full-width-panel">

          <div className="panel-header">

            <div>
              <h2>Recent Analytics</h2>

              <p>
                Latest sustainability analysis generated
                for this company.
              </p>
            </div>

          </div>

          {recentAnalytics.length === 0 ? (
            <div className="empty-analytics">
              No recent analytics available.
            </div>
          ) : (
            <div className="recent-analytics-table">

              <div className="recent-table-header">
                <span>Material</span>
                <span>Waste</span>
                <span>Recyclability</span>
                <span>Performance</span>
                <span>Date</span>
              </div>

              {recentAnalytics.map(
                (item, index) => {

                  const material =
                    item.material ||
                    item.fabric_type ||
                    "Unknown";

                  const waste =
                    item.waste_quantity ??
                    item.quantity ??
                    0;

                  const recyclability =
                    item.recyclability ??
                    item.recyclability_percentage ??
                    0;

                  const performance =
                    item.performance ||
                    item.status ||
                    "Needs Improvement";

                  const date =
                    item.date ||
                    item.time ||
                    item.created_at ||
                    "-";

                  return (
                    <div
                      className="recent-table-row"
                      key={`${material}-${date}-${index}`}
                    >

                      <span className="recent-material">
                        {material}
                      </span>

                      <span>
                        {waste} kg
                      </span>

                      <span>
                        {recyclability}%
                      </span>

                      <span>
                        <b className="performance-badge">
                          {performance}
                        </b>
                      </span>

                      <span className="recent-date">
                        {date}
                      </span>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="analytics-footer">
          Sustainability Intelligence Platform • Textile Waste Analytics
        </footer>

      </main>
    </div>
  );
}

export default SustainabilityAnalytics;