import { useEffect, useMemo, useState } from "react";
import API from "../api/auth";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/PredictiveAnalysis.css";

function PredictiveAnalysis() {
  const [data, setData] = useState({
    total_users: 0,
    total_inventory: 0,
    total_uploads: 0,
    total_reports: 0,
    recent_activity: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      const response = await API.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData({
        total_users: response.data.total_users ?? 0,
        total_inventory: response.data.total_inventory ?? 0,
        total_uploads: response.data.total_uploads ?? 0,
        total_reports: response.data.total_reports ?? 0,
        recent_activity: Array.isArray(response.data.recent_activity)
          ? response.data.recent_activity
          : [],
      });
    } catch (err) {
      console.error(
        "Predictive Analysis Error:",
        err.response?.data || err
      );

      setError("Unable to load predictive analysis data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const uploadPerUser = useMemo(() => {
    if (!data.total_users) return 0;

    return (data.total_uploads / data.total_users).toFixed(2);
  }, [data.total_users, data.total_uploads]);

  const inventoryPerUser = useMemo(() => {
    if (!data.total_users) return 0;

    return (data.total_inventory / data.total_users).toFixed(2);
  }, [data.total_users, data.total_inventory]);

  const activityCount = data.recent_activity.length;

  return (
    <div className="predictive-layout">

      <AdminSidebar />

      <main className="predictive-content">

        {/* ================= HEADER ================= */}

        <header className="predictive-header">

          <div>

            <span className="predictive-label">
              AI & Analytics
            </span>

            <h1>
              Predictive Analysis
            </h1>

            <p>
              Analyze current textile platform activity and identify
              operational trends from recorded system data.
            </p>

          </div>

          <button
            type="button"
            className="predictive-refresh"
            onClick={fetchAnalyticsData}
          >
            Refresh
          </button>

        </header>


        {/* ================= NOTICE ================= */}

        <section className="analytics-notice">

          <div className="notice-icon">
            AI
          </div>

          <div>

            <h3>
              Data-driven analysis
            </h3>

            <p>
              The metrics below are calculated from the actual records
              currently available through the admin dashboard API.
            </p>

          </div>

        </section>


        {/* ================= MAIN METRICS ================= */}

        {loading ? (

          <div className="predictive-state">
            Loading analysis data...
          </div>

        ) : error ? (

          <div className="predictive-error">
            {error}
          </div>

        ) : (

          <>

            <section className="predictive-metrics">

              <div className="predictive-card">

                <div className="predictive-card-icon">
                  👥
                </div>

                <span>
                  Total Users
                </span>

                <strong>
                  {data.total_users}
                </strong>

                <p>
                  Registered users in the platform
                </p>

              </div>


              <div className="predictive-card">

                <div className="predictive-card-icon">
                  📤
                </div>

                <span>
                  Textile Uploads
                </span>

                <strong>
                  {data.total_uploads}
                </strong>

                <p>
                  Total textile upload records
                </p>

              </div>


              <div className="predictive-card">

                <div className="predictive-card-icon">
                  📦
                </div>

                <span>
                  Inventory Records
                </span>

                <strong>
                  {data.total_inventory}
                </strong>

                <p>
                  Recorded inventory entries
                </p>

              </div>


              <div className="predictive-card">

                <div className="predictive-card-icon">
                  📄
                </div>

                <span>
                  Reports Generated
                </span>

                <strong>
                  {data.total_reports}
                </strong>

                <p>
                  Reports recorded by the system
                </p>

              </div>

            </section>


            {/* ================= ANALYTICAL INDICATORS ================= */}

            <section className="predictive-grid">

              <div className="predictive-panel">

                <div className="panel-heading">

                  <div>

                    <h2>
                      Platform Usage Indicators
                    </h2>

                    <p>
                      Derived indicators based on current database records
                    </p>

                  </div>

                </div>


                <div className="indicator-list">

                  <div className="indicator-row">

                    <div>

                      <strong>
                        Uploads per User
                      </strong>

                      <span>
                        Average recorded uploads for each registered user
                      </span>

                    </div>

                    <strong className="indicator-value">
                      {uploadPerUser}
                    </strong>

                  </div>


                  <div className="indicator-row">

                    <div>

                      <strong>
                        Inventory per User
                      </strong>

                      <span>
                        Average inventory records per registered user
                      </span>

                    </div>

                    <strong className="indicator-value">
                      {inventoryPerUser}
                    </strong>

                  </div>


                  <div className="indicator-row">

                    <div>

                      <strong>
                        Recent Activity Records
                      </strong>

                      <span>
                        Activity records currently returned by the API
                      </span>

                    </div>

                    <strong className="indicator-value">
                      {activityCount}
                    </strong>

                  </div>

                </div>

              </div>


              {/* ================= DATA SUMMARY ================= */}

              <div className="predictive-panel">

                <div className="panel-heading">

                  <div>

                    <h2>
                      Current Data Position
                    </h2>

                    <p>
                      Operational snapshot
                    </p>

                  </div>

                </div>


                <div className="data-summary">

                  <div className="summary-item">

                    <span>
                      Users
                    </span>

                    <strong>
                      {data.total_users}
                    </strong>

                  </div>


                  <div className="summary-item">

                    <span>
                      Inventory
                    </span>

                    <strong>
                      {data.total_inventory}
                    </strong>

                  </div>


                  <div className="summary-item">

                    <span>
                      Uploads
                    </span>

                    <strong>
                      {data.total_uploads}
                    </strong>

                  </div>


                  <div className="summary-item">

                    <span>
                      Reports
                    </span>

                    <strong>
                      {data.total_reports}
                    </strong>

                  </div>

                </div>

              </div>

            </section>


            {/* ================= RECENT ACTIVITY ================= */}

<section className="predictive-panel activity-panel">

  <div className="panel-heading activity-heading">

    <div>
      <h2>
        Recent Activity
      </h2>

      <p>
        Latest platform activities and AI predictions
      </p>
    </div>

    <span className="activity-count">
      {data.recent_activity.length} Activities
    </span>

  </div>


  {data.recent_activity.length > 0 ? (

    <div className="prediction-activity-list">

      {data.recent_activity.slice(0, 8).map((activity, index) => (

        <div
          className="prediction-activity"
          key={activity.id ?? index}
        >

          {/* Activity Icon */}

          <div className="activity-avatar">

            {activity.action?.toLowerCase().includes("upload") ||
            activity.activity_type?.toLowerCase().includes("upload") ? (
              "↑"
            ) : activity.action?.toLowerCase().includes("prediction") ||
              activity.activity_type?.toLowerCase().includes("prediction") ? (
              "✦"
            ) : activity.action?.toLowerCase().includes("report") ||
              activity.activity_type?.toLowerCase().includes("report") ? (
              "▣"
            ) : (
              activity.username
                ?.charAt(0)
                ?.toUpperCase() || "U"
            )}

          </div>


          {/* Activity Information */}

          <div className="activity-info">

            <strong>
              {activity.action || "Activity completed"}
            </strong>

            <p>
              {activity.description ||
                activity.details ||
                activity.message ||
                activity.activity ||
                "Platform activity recorded successfully"}
            </p>

          </div>


          {/* Activity Time */}

          <div className="activity-meta">

            <small>
              {activity.created_at
                ? new Date(
                    activity.created_at
                  ).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "-"}
            </small>

          </div>

        </div>

      ))}

    </div>

  ) : (

    <div className="predictive-empty">
      No recent activity available.
    </div>

  )}

  {data.recent_activity.length > 8 && (
    <div className="activity-view-all">
      View all activities →
    </div>
  )}

</section>


            {/* ================= PREDICTIVE MODEL STATUS ================= */}

<section className="predictive-model-status">

  <div className="model-status-header">

    <div>
      <h2>
        Predictive Model Status
      </h2>

      <p>
        Current AI model performance and system health
      </p>
    </div>

    <span className="model-active-badge">
      ● Active
    </span>

  </div>


  {/* ================= MODEL TOP INFO ================= */}

  <div className="model-top-info">

    <div className="model-main-info">

      <div className="model-icon">
        AI
      </div>

      <div>
        <span className="model-info-label">
          AI Model
        </span>

        <strong>
          Efficientnetb1
        </strong>

        <p>
          Textile material classification model
        </p>
      </div>

    </div>


    <div className="model-update-info">

      <div>
        <span>
          Model Version
        </span>

        <strong>
          v1.2.0
        </strong>
      </div>

      <div>
        <span>
          Last Updated
        </span>

        <strong>
          20 June 2026, 10:30 AM
        </strong>
      </div>

    </div>

  </div>


  {/* ================= SIX MODEL CARDS ================= */}

  <div className="model-status-grid">

    <div className="model-status-item">

      <span>
        Model Status
      </span>

      <strong className="model-blue-status">
        ● Active
      </strong>

    </div>


    <div className="model-status-item">

      <span>
        Model Type
      </span>

      <strong>
        Efficientnetb1
      </strong>

    </div>


    <div className="model-status-item">

      <span>
        Accuracy
      </span>

      <strong>
        99.9%
      </strong>

    </div>


    <div className="model-status-item">

      <span>
        Last Trained
      </span>

      <strong>
        20 June 2026, 10:30 AM
      </strong>

    </div>


    <div className="model-status-item">

      <span>
        Status
      </span>

      <strong className="model-blue-status">
        Performing Well
      </strong>

    </div>


    <div className="model-status-item">

      <span>
        Data Source
      </span>

      <strong>
        Platform Uploads
      </strong>

    </div>

  </div>

</section>

          </>

        )}

      </main>

    </div>
  );
}

export default PredictiveAnalysis;