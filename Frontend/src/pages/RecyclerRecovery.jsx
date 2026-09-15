import React, { useEffect, useState } from "react";
import RecyclerSidebar from "../components/RecyclerSidebar";
import API from "../api/auth";
import "../styles/RecyclerDashboard.css";

function RecyclerRecovery() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const loadRecoveryData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/recycler/recovery");
      setData(response.data);
    } catch (err) {
      console.error("Recovery data error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load recycling and recovery data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecoveryData();
  }, []);

  const updateStatus = async (batchId, status) => {
    try {
      setUpdating(batchId);

      await API.patch(`/recycler/batches/${batchId}/status`, {
        status,
      });

      await loadRecoveryData();
    } catch (err) {
      console.error("Status update error:", err);

      alert(
        err.response?.data?.detail ||
          "Unable to update batch status."
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="recycler-layout">
        <RecyclerSidebar />

        <main className="recycler-main">
          <div className="recycler-loading">
            Loading recycling and recovery data...
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
          </div>
        </main>
      </div>
    );
  }

  const summary = data?.summary || {};
  const batches = data?.recent_batches || [];
  const recommendations = data?.recovery_recommendations || [];

  return (
    <div className="recycler-layout">
      <RecyclerSidebar />

      <main className="recycler-main">

        <div className="recycler-page-header">
          <div>
            <h1>Recycling & Recovery</h1>
            <p>
              Manage textile waste processing, recovery and completed batches.
            </p>
          </div>
        </div>

        {/* Summary */}
        <section className="recycler-stats">

          <div className="recycler-stat-card">
            <span>Total Waste</span>
            <strong>
              {summary.total_quantity ?? 0} kg
            </strong>
          </div>

          <div className="recycler-stat-card">
            <span>Recyclable Waste</span>
            <strong>
              {summary.recyclable_quantity ?? 0} kg
            </strong>
          </div>

          <div className="recycler-stat-card">
            <span>Recovery Potential</span>
            <strong>
              {summary.recovery_quantity ?? 0} kg
            </strong>
          </div>

          <div className="recycler-stat-card">
            <span>Recovery Rate</span>
            <strong>
              {summary.recovery_percentage ?? 0}%
            </strong>
          </div>

        </section>

        {/* Processing Status */}
        <section className="recycler-panel">
          <div className="recycler-panel-header">
            <div>
              <h2>Processing Status</h2>
              <p>Current status of textile waste batches.</p>
            </div>
          </div>

          <div className="recycler-status-grid">

            <div className="recycler-status-card">
              <span>Available</span>
              <strong>
                {summary.available_quantity ?? 0} kg
              </strong>
            </div>

            <div className="recycler-status-card">
              <span>Under Processing</span>
              <strong>
                {summary.processing_quantity ?? 0} kg
              </strong>
            </div>

            <div className="recycler-status-card">
              <span>Recovered</span>
              <strong>
                {summary.recovered_quantity ?? 0} kg
              </strong>
            </div>

            <div className="recycler-status-card">
              <span>Completed</span>
              <strong>
                {summary.completed_quantity ?? 0} kg
              </strong>
            </div>

          </div>
        </section>

        {/* Recommendations */}
        <section className="recycler-panel">

          <div className="recycler-panel-header">
            <div>
              <h2>Recovery Recommendations</h2>
              <p>
                Recommended recovery methods based on textile material.
              </p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="recycler-empty">
              No recovery recommendations available.
            </div>
          ) : (
            <div className="recycler-recommendation-grid">

              {recommendations.map((item, index) => (
                <div
                  className="recycler-recommendation-card"
                  key={index}
                >
                  <div className="recycler-recommendation-icon">
                    ♻
                  </div>

                  <div>
                    <h3>
                      {item.material || "Textile Waste"}
                    </h3>

                    <p>
                      {item.recommendation ||
                        "Recovery recommendation available"}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

        {/* Recovery Batches */}
        <section className="recycler-panel">

          <div className="recycler-panel-header">
            <div>
              <h2>Recovery Batches</h2>
              <p>
                Update the processing and recovery status of waste batches.
              </p>
            </div>
          </div>

          {batches.length === 0 ? (
            <div className="recycler-empty">
              No waste batches available.
            </div>
          ) : (
            <div className="batch-table-wrapper">

              <table className="batch-table">

                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Fabric</th>
                    <th>Quantity</th>
                    <th>Category</th>
                    <th>Recyclability</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {batches.map((batch) => (
                    <tr key={batch.id}>

                      <td>
                        <strong>
                          {batch.batch_id}
                        </strong>
                      </td>

                      <td>
                        {batch.fabric_type || "Unknown"}
                      </td>

                      <td>
                        {batch.quantity ?? 0} kg
                      </td>

                      <td>
                        {batch.waste_category || "Unknown"}
                      </td>

                      <td>
                        {batch.recyclability || "Unknown"}
                      </td>

                      <td>

                        <select
                          value={batch.status || "Available"}
                          disabled={updating === batch.id}
                          onChange={(e) =>
                            updateStatus(
                              batch.batch_id,
                              e.target.value
                            )
                          }
                        >

                          <option value="Available">
                            Available
                          </option>

                          <option value="Under Processing">
                            Under Processing
                          </option>

                          <option value="Recovered">
                            Recovered
                          </option>

                          <option value="Completed">
                            Completed
                          </option>

                        </select>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default RecyclerRecovery;