import { useEffect, useState } from "react";
import API from "../api/auth";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/Reports.css";

function Reports() {
  const [data, setData] = useState({
    total_users: 0,
    total_inventory: 0,
    total_uploads: 0,
    total_reports: 0,
    recent_activity: [],
    data_source: {
      primary_source: "Admin Dashboard Database",
      ai_model_source: "EfficientNet-B1",
      data_coverage: "100%",
      last_updated: null,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      /*
       * This page is the ADMIN DASHBOARD REPORT.
       *
       * It uses:
       * - Admin Dashboard data for summary cards
       * - Reports Dashboard data for report count
       * - Reports Dashboard recent_activity for report actions
       *
       * Reports & Analytics is a separate section.
       */

      const [adminResponse, reportsResponse] =
        await Promise.all([
          API.get("/admin/dashboard", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          API.get("/reports/dashboard", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const adminData = adminResponse.data || {};
      const reportsData = reportsResponse.data || {};

      setData({
        total_users: Number(
          adminData.total_users ?? 0
        ),

        total_inventory: Number(
          adminData.total_inventory ?? 0
        ),

        total_uploads: Number(
          adminData.total_uploads ?? 0
        ),

        total_reports: Number(
          reportsData.total_reports ?? 0
        ),

        /*
         * Recent activity on this page must come from
         * /reports/dashboard, NOT /admin/dashboard.
         *
         * This allows activities such as:
         * - Report Generated
         * - Report Downloaded
         *
         * to appear here.
         */

        recent_activity: Array.isArray(
          reportsData.recent_activity
        )
          ? reportsData.recent_activity
          : [],

        data_source: {
          primary_source: "Admin Dashboard Database",
          ai_model_source: "EfficientNet-B1",
          data_coverage: "100%",
          last_updated: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error(
        "Admin Report Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load admin report data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  /*
   * Download the generated report through the backend.
   *
   * Backend endpoint:
   * GET /reports/{report_id}/download
   *
   * Backend records:
   * - Report Downloaded
   * - Username
   * - Role
   * - Date
   *
   * Backend must return an actual PDF.
   */

  const downloadReport = async (reportId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/";
        return false;
      }

      if (!reportId) {
        throw new Error("Report ID is missing.");
      }

      const response = await API.get(
        `/reports/${reportId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const contentType =
        response.headers?.["content-type"] ||
        "application/pdf";

      const blob = new Blob(
        [response.data],
        {
          type: contentType,
        }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      let filename =
        `admin-dashboard-report-${Date.now()}.pdf`;

      const disposition =
        response.headers?.["content-disposition"];

      if (disposition) {
        const filenameMatch =
          disposition.match(
            /filename="?([^"]+)"?/i
          );

        if (
          filenameMatch &&
          filenameMatch[1]
        ) {
          filename = filenameMatch[1];
        }
      }

      /*
       * Make sure downloaded file always
       * has .pdf extension.
       */

      if (
        !filename
          .toLowerCase()
          .endsWith(".pdf")
      ) {
        filename =
          filename.replace(/\.[^/.]+$/, "") +
          ".pdf";
      }

      link.download = filename;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error(
        "Download Report Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to download admin report."
      );

      return false;
    }
  };

  /*
   * Generate Admin Dashboard Report.
   *
   * Flow:
   *
   * 1. Backend generates report
   * 2. Backend records "Report Generated"
   * 3. Backend returns report ID
   * 4. Frontend downloads that exact report
   * 5. Backend records "Report Downloaded"
   * 6. Activity table refreshes
   *
   * No local fake report generation is used.
   */

  const generateReport = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      const reportName =
        "Admin Dashboard Report";

      const reportType =
        "Admin Dashboard";

      const response = await API.post(
        "/reports/generate",
        null,
        {
          params: {
            report_name: reportName,
            report_type: reportType,
          },

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const generatedReport =
        response.data || {};

      /*
       * Backend should return the generated report ID.
       */

      const reportId =
        generatedReport.id;

      if (!reportId) {
        throw new Error(
          "Report was generated but report ID was not returned."
        );
      }

      /*
       * Download through backend so that
       * "Report Downloaded" activity is recorded.
       */

      const downloaded =
        await downloadReport(reportId);

      /*
       * Refresh dashboard/report activity
       * after generation and download.
       */

      await fetchReportData();

      if (downloaded) {
        alert(
          "Admin Dashboard Report generated and downloaded successfully."
        );
      } else {
        alert(
          "Admin Dashboard Report generated successfully, but the download could not be completed."
        );
      }
    } catch (err) {
      console.error(
        "Generate Report Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to generate admin report."
      );
    }
  };

  return (
    <div className="reports-layout">

      <AdminSidebar />

      <main className="reports-content">

        {/* ================= HEADER ================= */}

        <header className="reports-header">

          <div>

            <span className="reports-label">
              Administrator Reports
            </span>

            <h1>
              Admin Report
            </h1>

            <p>
              View and generate reports based on
              administrator dashboard activity and
              platform administration data.
            </p>

          </div>

          <button
            type="button"
            className="reports-refresh"
            onClick={fetchReportData}
          >
            Refresh
          </button>

        </header>


        {/* ================= STATES ================= */}

        {loading ? (

          <div className="reports-state">
            Loading admin report data...
          </div>

        ) : error ? (

          <div className="reports-error">
            {error}
          </div>

        ) : (

          <>

            {/* ================= REPORT HERO ================= */}

            <section className="report-hero">

              <div className="report-hero-icon">
                ▤
              </div>

              <div className="report-hero-content">

                <span>
                  ADMINISTRATOR REPORT
                </span>

                <h2>
                  Admin Dashboard Report
                </h2>

                <p>
                  This report is generated from
                  administrator dashboard data,
                  platform activity, inventory and
                  uploaded textile records.
                </p>

              </div>

              <button
                type="button"
                className="download-report-button"
                onClick={generateReport}
              >
                Generate Report
              </button>

            </section>


            {/* ================= REPORT SUMMARY ================= */}

            <section className="report-section">

              <div className="report-section-heading">

                <div>

                  <h2>
                    Admin Report Summary
                  </h2>

                  <p>
                    Overview of administrator dashboard
                    data and platform activity
                  </p>

                </div>

              </div>


              <div className="report-summary-grid">

                {/* CARD 1 */}

                <div className="report-summary-card">

                  <div className="report-summary-icon">
                    ▤
                  </div>

                  <div className="report-summary-content">

                    <span>
                      Total Users
                    </span>

                    <strong>
                      {data.total_users}
                    </strong>

                    <small>
                      Registered platform users
                    </small>

                  </div>

                </div>


                {/* CARD 2 */}

                <div className="report-summary-card">

                  <div className="report-summary-icon">
                    ◷
                  </div>

                  <div className="report-summary-content">

                    <span>
                      Total Inventory
                    </span>

                    <strong>
                      {data.total_inventory}
                    </strong>

                    <small>
                      Inventory records
                    </small>

                  </div>

                </div>


                {/* CARD 3 */}

                <div className="report-summary-card">

                  <div className="report-summary-icon">
                    ↓
                  </div>

                  <div className="report-summary-content">

                    <span>
                      Total Uploads
                    </span>

                    <strong>
                      {data.total_uploads}
                    </strong>

                    <small>
                      Uploaded textile images
                    </small>

                  </div>

                </div>


                {/* CARD 4 */}

                <div className="report-summary-card">

                  <div className="report-summary-icon">
                    ✓
                  </div>

                  <div className="report-summary-content">

                    <span>
                      Total Reports
                    </span>

                    <strong>
                      {data.total_reports}
                    </strong>

                    <small>
                      Generated administrator reports
                    </small>

                  </div>

                </div>

              </div>

            </section>


            {/* ================= RECENT REPORT ACTIVITY ================= */}

            <section className="report-section">

              <div className="report-section-heading">

                <div>

                  <h2>
                    Recent Report Activity
                  </h2>

                  <p>
                    Latest report generation and
                    download activity
                  </p>

                </div>

              </div>


              {data.recent_activity.length > 0 ? (

                <div className="report-table-wrapper">

                  <table className="report-table">

                    <thead>

                      <tr>

                        <th>
                          #
                        </th>

                        <th>
                          Report
                        </th>

                        <th>
                          Type
                        </th>

                        <th>
                          User
                        </th>

                        <th>
                          Role
                        </th>

                        <th>
                          Activity
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Date
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {data.recent_activity.map(
                        (activity, index) => (

                          <tr
                            key={
                              activity.id ??
                              `${activity.report_id || "report"}-${activity.username || "user"}-${activity.created_at || index}`
                            }
                          >

                            <td>
                              {index + 1}
                            </td>


                            <td>

                              <div className="report-activity-name">

                                {activity.report_name ||
                                  "-"}

                              </div>

                            </td>


                            <td>

                              <div className="report-generated-by">

                                {activity.report_type ||
                                  "-"}

                              </div>

                            </td>


                            <td>

                              <div className="report-activity-name">

                                {activity.username ||
                                  activity.generated_by ||
                                  "-"}

                              </div>

                            </td>


                            <td>

                              <div className="report-generated-by">

                                <strong>

                                  {activity.role === "admin"
                                    ? "Admin"
                                    : activity.role ||
                                      "User"}

                                </strong>

                              </div>

                            </td>


                            <td>

                              {activity.action ||
                                "-"}

                            </td>


                            <td>

                              <span className="report-status">

                                {activity.status ||
                                  "Completed"}

                              </span>

                            </td>


                            <td>

                              {formatDate(
                                activity.created_at
                              )}

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <div className="reports-empty">
                  No recent report activity available.
                </div>

              )}

            </section>


            {/* ================= REPORT DATA SOURCE ================= */}

            <section className="report-section">

              <div className="report-section-heading">

                <div>

                  <h2>
                    Report Data Source
                  </h2>

                  <p>
                    Information about data sources
                    used in the administrator report
                  </p>

                </div>

              </div>


              <div className="report-source-grid">

                <div className="report-source-card">

                  <span>
                    Primary Source
                  </span>

                  <strong>
                    {data.data_source.primary_source}
                  </strong>

                  <small>
                    Current administrator dashboard data
                  </small>

                </div>


                <div className="report-source-card">

                  <span>
                    AI Model Source
                  </span>

                  <strong>
                    {data.data_source.ai_model_source}
                  </strong>

                  <small>
                    Model predictions & analytics
                  </small>

                </div>


                <div className="report-source-card">

                  <span>
                    Data Coverage
                  </span>

                  <strong>
                    {data.data_source.data_coverage}
                  </strong>

                  <small>
                    Platform administration data included
                  </small>

                </div>


                <div className="report-source-card">

                  <span>
                    Last Updated
                  </span>

                  <strong>
                    {formatDate(
                      data.data_source.last_updated
                    )}
                  </strong>

                  <small>
                    Latest available data
                  </small>

                </div>

              </div>

            </section>

          </>

        )}


        <footer className="reports-footer">

          Textile Waste Intelligence Platform
          • Administrative Reporting

        </footer>

      </main>

    </div>
  );
}

export default Reports;