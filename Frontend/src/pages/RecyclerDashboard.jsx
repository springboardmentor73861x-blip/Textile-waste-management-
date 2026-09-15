import React, { useEffect, useState } from "react";
import API from "../api/auth";
import RecyclerSidebar from "../components/RecyclerSidebar";
import "../styles/RecyclerDashboard.css";

function RecyclerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/recycler/dashboard"
      );

      setData(response.data || {});
    } catch (err) {
      console.error(
        "Recycler Dashboard Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load recycler dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const updateStatus = async (
    batchId,
    status
  ) => {
    try {
      await API.patch(
        `/recycler/batches/${batchId}/status`,
        { status }
      );

      await fetchDashboard();
    } catch (err) {
      console.error(
        "Status Update Error:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to update batch status."
      );
    }
  };

  if (loading) {
    return (
      <div className="recycler-layout">
        <RecyclerSidebar />

        <main className="recycler-main">
          <div className="recycler-loading">
            Loading Recycler Dashboard...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recycler-layout">
        <RecyclerSidebar />

        <main className="recycler-main">
          <div className="recycler-error">
            {error}
            <button onClick={fetchDashboard}>
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const summary = data?.summary || {};

  const batches =
    data?.recent_batches || [];

  const materials =
    data?.material_distribution || [];

  const recommendations =
    data?.recovery_recommendations || [];

  return (
    <div className="recycler-layout">
      <RecyclerSidebar />

      <main className="recycler-main">

        {/* HEADER */}
        <header className="recycler-header">
          <div>
            <span className="recycler-eyebrow">
              RECYCLING OPERATIONS
            </span>

            <h1>Recycler Dashboard</h1>

            <p>
              Monitor textile waste batches,
              recovery opportunities and
              recycling progress.
            </p>
          </div>

          
        </header>

        {/* SUMMARY CARDS */}
        <section className="recycler-stats">

          <div className="recycler-stat-card">
            <div className="stat-icon navy">▦</div>
            <div>
              <span>Total Waste Batches</span>
              <strong>
                {summary.total_batches ?? 0}
              </strong>
            </div>
          </div>

          <div className="recycler-stat-card">
            <div className="stat-icon green">▤</div>
            <div>
              <span>Total Waste Quantity</span>
              <strong>
                {summary.total_quantity ?? 0} kg
              </strong>
            </div>
          </div>

          <div className="recycler-stat-card">
            <div className="stat-icon green">♻</div>
            <div>
              <span>Recyclable Waste</span>
              <strong>
                {summary.recyclable_quantity ?? 0} kg
              </strong>
            </div>
          </div>

          <div className="recycler-stat-card">
            <div className="stat-icon navy">↗</div>
            <div>
              <span>Recovery Potential</span>
              <strong>
                {summary.recovery_percentage ?? 0}%
              </strong>
            </div>
          </div>

          <div className="recycler-stat-card">
            <div className="stat-icon orange">◷</div>
            <div>
              <span>Under Processing</span>
              <strong>
                {summary.processing_quantity ?? 0} kg
              </strong>
            </div>
          </div>
        </section>

        {/* PROCESSING STATUS */}
        <section className="recycler-status-grid">

          <div className="recycler-panel">
            <div className="panel-heading">
              <div>
                <h2>Processing Status</h2>
                <p>
                  Current recycling workflow
                </p>
              </div>
            </div>

            <div className="status-progress">

              <div className="status-box">
                <span>Available</span>
                <strong>
                  {summary.available_quantity ?? 0} kg
                </strong>
              </div>

              <div className="status-arrow">→</div>

              <div className="status-box processing">
                <span>Under Processing</span>
                <strong>
                  {summary.processing_quantity ?? 0} kg
                </strong>
              </div>

              <div className="status-arrow">→</div>

              <div className="status-box recovered">
                <span>Recovered</span>
                <strong>
                  {summary.recovered_quantity ?? 0} kg
                </strong>
              </div>

              <div className="status-arrow">→</div>

              <div className="status-box completed">
                <span>Completed</span>
                <strong>
                  {summary.completed_quantity ?? 0} kg
                </strong>
              </div>

            </div>
          </div>

        </section>

        {/* TWO COLUMNS */}
        <section className="recycler-two-columns">

          {/* MATERIAL */}
          <div className="recycler-panel">
            <div className="panel-heading">
              <div>
                <h2>Waste by Material</h2>
                <p>
                  Textile material distribution
                </p>
              </div>
            </div>

            {materials.length === 0 ? (
              <div className="empty-state">
                No material data available.
              </div>
            ) : (
              <div className="material-list">
                {materials.map((item) => (
                  <div
                    className="material-row"
                    key={item.material}
                  >
                    <div>
                      <strong>
                        {item.material}
                      </strong>
                    </div>

                    <span>
                      {item.quantity} kg
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECOMMENDATIONS */}
          <div className="recycler-panel">
            <div className="panel-heading">
              <div>
                <h2>Recovery Recommendations</h2>
                <p>
                  Recommended recovery routes
                </p>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="empty-state">
                No recommendations available.
              </div>
            ) : (
              <div className="recommendation-list">
                {recommendations.map(
                  (item) => (
                    <div
                      className="recommendation-row"
                      key={item.recommendation}
                    >
                      <div className="recommendation-icon">
                        ♻
                      </div>

                      <div>
                        <strong>
                          {item.recommendation}
                        </strong>
                        <span>
                          {item.quantity} kg
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

        </section>

        {/* BATCH TABLE */}
        <section className="recycler-panel batch-panel">

          <div className="panel-heading">
            <div>
              <h2>Recent Waste Batches</h2>
              <p>
                Manage and update recycling batches
              </p>
            </div>
          </div>

          {batches.length === 0 ? (
            <div className="empty-state">
              No waste batches found for this company.
            </div>
          ) : (
            <div className="batch-table-wrapper">

              <table className="batch-table">

                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Category</th>
                    <th>Recyclability</th>
                    <th>Status</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>

                <tbody>

                  {batches.map((batch) => (
                    <tr key={batch.batch_id}>

                      <td>
                        <strong>
                          {batch.batch_id}
                        </strong>
                      </td>

                      <td>
                        {batch.fabric_type}
                      </td>

                      <td>
                        {batch.quantity} kg
                      </td>

                      <td>
                        {batch.waste_category}
                      </td>

                      <td>
                        <span className="recyclability-badge">
                          {batch.recyclability}
                        </span>
                      </td>

                      <td>
                        <select
                          value={batch.status}
                          onChange={(e) =>
                            updateStatus(
                              batch.batch_id,
                              e.target.value
                            )
                          }
                          className="status-select"
                        >
                          <option>
                            Available
                          </option>

                          <option>
                            Under Processing
                          </option>

                          <option>
                            Recovered
                          </option>

                          <option>
                            Completed
                          </option>
                        </select>
                      </td>

                      <td>
                        <span className="recommendation-badge">
                          {batch.recommendation}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* AI ANALYSIS */}
        <section className="recycler-panel">

          <div className="panel-heading">
            <div>
              <h2>Recent AI Textile Analysis</h2>
              <p>
                Latest material and waste intelligence
              </p>
            </div>
          </div>

          {(data?.recent_analysis || []).length === 0 ? (
            <div className="empty-state">
              No recent AI analysis available.
            </div>
          ) : (
            <div className="analysis-grid">

              {data.recent_analysis.map(
                (item) => (
                  <div
                    className="analysis-card"
                    key={item.id}
                  >
                    <div className="analysis-top">
                      <span className="analysis-ai">
                        AI
                      </span>

                      <strong>
                        {item.score ?? 0}/100
                      </strong>
                    </div>

                    <h3>
                      {item.material}
                    </h3>

                    <p>
                      {item.waste_type}
                    </p>

                    <div className="analysis-meta">
                      <span>
                        Confidence:{" "}
                        {item.confidence || "-"}
                      </span>

                      <span>
                        {item.recycle === "True" ||
                        item.recycle === true
                          ? "Recyclable"
                          : "Review"}
                      </span>
                    </div>
                  </div>
                )
              )}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default RecyclerDashboard;