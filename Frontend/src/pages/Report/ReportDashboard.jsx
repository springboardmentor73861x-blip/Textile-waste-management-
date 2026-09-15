import React, { useEffect, useMemo, useState } from "react";
import API from "../../api/auth";
import "../../styles/Report/ReportDashboard.css";


function ReportDashboard() {

  const [dateRange, setDateRange] =
    useState("Last 6 Months");

  const [showFilter, setShowFilter] =
    useState(false);

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // LOAD REPORTS & ANALYTICS DATA
  // =========================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await API.get(
  "/report-dashboard/dashboard"
);

        setData(response.data);

      } catch (err) {

        console.error(
          "Reports & Analytics Dashboard Error:",
          err
        );

        setError(
          "Unable to load reports and analytics data."
        );

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);


  // =========================================================
  // SAFE DATA
  // =========================================================

  const statsData =
    data?.stats || {};

  const totalWasteBatches =
    Number(
      statsData.total_waste_batches || 0
    );

  const totalQuantity =
    Number(
      statsData.total_quantity || 0
    );

  const recyclablePercentage =
    Number(
      statsData.recyclable_percentage || 0
    );

  const co2Saved =
    Number(
      statsData.co2_saved || 0
    );

  const waterSaved =
    Number(
      statsData.water_saved || 0
    );

  const landSaved =
    Number(
      statsData.land_saved || 0
    );


  // =========================================================
  // KPI CARDS
  // =========================================================

  const stats = [

    {
      title: "Total Waste Batches",
      value: totalWasteBatches.toLocaleString(),
      icon: "♻️",
    },

    {
      title: "Total Weight",
      value: `${totalQuantity.toLocaleString()} kg`,
      icon: "⚖️",
    },

    {
      title: "Recyclable",
      value: `${recyclablePercentage.toFixed(2)}%`,
      icon: "🔄",
    },

    {
      title: "CO₂ Saved",
      value: `${co2Saved.toLocaleString()} kg`,
      icon: "🌱",
    },

    {
      title: "Water Saved",
      value: `${waterSaved.toLocaleString()} L`,
      icon: "💧",
    },

    {
      title: "Land Saved",
      value: `${landSaved.toLocaleString()} m²`,
      icon: "🌍",
    },

  ];


  // =========================================================
  // REPORT TYPES
  // =========================================================

  const reportTypes = [

    {
      title: "Waste Classification Report",
      description:
        "Detailed analysis of textile waste categories and quantities.",
      icon: "📊",
    },

    {
      title: "Recycling Report",
      description:
        "Recyclability analysis and recycling recommendations.",
      icon: "♻️",
    },

    {
      title: "Sustainability Report",
      description:
        "Sustainability performance and circularity indicators.",
      icon: "🌿",
    },

    {
      title: "Environmental Impact Report",
      description:
        "CO₂, water and environmental impact assessment.",
      icon: "🌍",
    },

    {
      title: "Circular Economy Report",
      description:
        "Circularity performance, reuse and recovery insights.",
      icon: "🔁",
    },

  ];


  // =========================================================
  // RECENT REPORTS
  // =========================================================

  const recentReports =
    useMemo(() => {

      return (
        data?.recent_reports?.map(
          (report) => ({

            name:
              report.name || "Unnamed Report",

            type:
              report.type || "Report",

            date:
              report.created_at || "-",

            status:
              report.status || "Unknown",

            id:
              report.id,

            downloads:
              report.downloads || 0,

          })
        ) || []
      );

    }, [data]);


  // =========================================================
  // WASTE CATEGORIES
  // =========================================================

  const wasteCategories =
    useMemo(() => {

      const source =
        data?.waste_by_category || [];

      const total =
        source.reduce(
          (sum, item) =>
            sum + Number(item.value || 0),
          0
        );

      return source.map(
        (item) => {

          const value =
            Number(item.value || 0);

          const percentage =
            total > 0
              ? (value / total) * 100
              : 0;

          return {

            label:
              item.category || "Unknown",

            value,

            percentage:
              percentage.toFixed(1),

          };

        }
      );

    }, [data]);


  // =========================================================
  // MATERIAL COMPOSITION
  // =========================================================

  const materialComposition =
    useMemo(() => {

      const source =
        data?.material_composition || [];

      const total =
        source.reduce(
          (sum, item) =>
            sum + Number(item.value || 0),
          0
        );

      return source.map(
        (item) => {

          const value =
            Number(item.value || 0);

          const percentage =
            total > 0
              ? (value / total) * 100
              : 0;

          return {

            label:
              item.material || "Unknown",

            value,

            percentage:
              percentage.toFixed(1),

          };

        }
      );

    }, [data]);


  // =========================================================
  // RECYCLABILITY TREND
  // =========================================================

  const recyclabilityTrend =
    data?.recyclability_trend || [];


  // =========================================================
  // CO2 TREND
  // =========================================================
  //
  // Backend currently does not store historical environmental
  // values by month.
  //
  // Therefore we don't show fake historical CO2 values.
  //
  // =========================================================

  const co2Trend =
    data?.co2_trend || [];


  // =========================================================
  // GENERATE REPORT
  // =========================================================

  const generateReport = async (reportName) => {

  try {

    const response = await API.post(
      "/report-dashboard/generate",
      null,
      {
        params: {
          report_type: reportName,
        },
      }
    );

    const reportId = response.data?.report_id;

    if (!reportId) {
      throw new Error(
        "Report ID was not returned by the backend."
      );
    }

    const downloadResponse = await API.get(
      `/report-dashboard/download/${reportId}`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob(
      [downloadResponse.data],
      {
        type: "application/pdf",
      }
    );

    const url = window.URL.createObjectURL(
      blob
    );

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `${reportName.replace(
        /[^a-z0-9]+/gi,
        "_"
      )}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    // Refresh recent reports
    const dashboardResponse = await API.get(
      "/report-dashboard/dashboard"
    );

    setData(
      dashboardResponse.data
    );

  } catch (err) {

    console.error(
      "Report generation error:",
      err
    );

    alert(
      "Unable to generate the report. Please try again."
    );

  }

};

  // =========================================================
  // EXPORT PDF
  // =========================================================

  const exportPDF = async () => {
  try {
    const response = await API.get(
      "/report-dashboard/dashboard",
      {
        responseType: "json",
      }
    );

    const dashboardData = response.data;

    const reportResponse = await API.post(
      "/report-dashboard/generate",
      null,
      {
        params: {
          report_type: "Reports_Analytics",
        },
      }
    );

    const reportId = reportResponse.data?.report_id;

    if (!reportId) {
      throw new Error("Report ID was not returned by the backend.");
    }

    const downloadResponse = await API.get(
      `/report-dashboard/download/${reportId}`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob(
      [downloadResponse.data],
      { type: "application/pdf" }
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Reports_Analytics.pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("PDF export error:", error);
    alert("Unable to export PDF. Please try again.");
  }
};

  // =========================================================
  // EXPORT EXCEL
  // =========================================================

 const exportExcel = async () => {
  try {
    const response = await API.get(
      "/report-dashboard/export/excel",
      {
        responseType: "blob",
      }
    );

    const blob = new Blob(
      [response.data],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Reports_Analytics.xlsx";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {

    console.error(
      "Excel export error:",
      error
    );

    alert(
      "Unable to export Excel file. Please try again."
    );

  }
};


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="report-dashboard-layout">

        <main className="report-dashboard-main">

          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            Loading reports and analytics data...
          </div>

        </main>

      </div>

    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div className="report-dashboard-layout">

        <main className="report-dashboard-main">

          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>

        </main>

      </div>

    );

  }


  return (

    <div className="report-dashboard-layout">

      <main className="report-dashboard-main">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="report-header">

          <div>

            <h1>
              Reports & Analytics
            </h1>

            <p>
              Reports Dashboard
            </p>

          </div>


          <div className="report-header-actions">

            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value)
              }
              className="date-range-select"
            >

              <option>
                Last 7 Days
              </option>

              <option>
                Last 30 Days
              </option>

              <option>
                Last 6 Months
              </option>

              <option>
                Last 12 Months
              </option>

            </select>


            <button
              className="filter-button"
              onClick={() =>
                setShowFilter(!showFilter)
              }
            >
              ⚙ Filter
            </button>


            <button className="notification-button">
              🔔
            </button>


            <div className="report-avatar">
              S
            </div>

          </div>

        </header>


        {/* =====================================================
            FILTER
        ===================================================== */}

        {showFilter && (

          <div className="report-filter-box">

            <div>

              <label>
                Report Type
              </label>

              <select>

                <option>
                  All Reports
                </option>

                <option>
                  Waste Classification
                </option>

                <option>
                  Recycling
                </option>

                <option>
                  Sustainability
                </option>

                <option>
                  Environmental Impact
                </option>

                <option>
                  Circular Economy
                </option>

              </select>

            </div>


            <div>

              <label>
                Status
              </label>

              <select>

                <option>
                  All
                </option>

                <option>
                  Completed
                </option>

                <option>
                  Pending
                </option>

              </select>

            </div>

          </div>

        )}


        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <section className="report-stats-grid">

          {stats.map(
            (stat, index) => (

              <div
                className="report-stat-card"
                key={index}
              >

                <div className="report-stat-top">

                  <span className="report-stat-icon">
                    {stat.icon}
                  </span>

                  <span className="report-stat-change positive">
                    Live
                  </span>

                </div>


                <h2>
                  {stat.value}
                </h2>

                <p>
                  {stat.title}
                </p>

              </div>

            )
          )}

        </section>


        {/* =====================================================
            GENERATE REPORTS
        ===================================================== */}

        <section className="report-section">

          <div className="section-heading">

            <div>

              <h2>
                Generate Reports
              </h2>

              <p>
                Generate detailed reports from your textile waste data.
              </p>

            </div>

          </div>


          <div className="report-types-grid">

            {reportTypes.map(
              (report, index) => (

                <div
                  className="generate-report-card"
                  key={index}
                >

                  <div className="report-type-icon">
                    {report.icon}
                  </div>


                  <div>

                    <h3>
                      {report.title}
                    </h3>

                    <p>
                      {report.description}
                    </p>


                    <button
                      onClick={() =>
                        generateReport(
                          report.title
                        )
                      }
                      className="generate-report-button"
                    >
                      Generate Report →
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* =====================================================
            ANALYTICS OVERVIEW
        ===================================================== */}

        <section className="report-section">

          <div className="section-heading">

            <div>

              <h2>
                Analytics Overview
              </h2>

              <p>
                Visual representation of your textile waste analytics.
              </p>

            </div>

          </div>


          <div className="analytics-grid">


            {/* =================================================
                WASTE CATEGORY
            ================================================= */}

            <div className="analytics-card">

              <h3>
                Waste by Category
              </h3>


              <div className="donut-wrapper">

                <div className="donut-chart">

                  <div className="donut-center">

                    <strong>
                      {totalQuantity.toLocaleString()}
                    </strong>

                    <span>
                      kg
                    </span>

                  </div>

                </div>

              </div>


              <div className="chart-legend">

                {wasteCategories.length > 0 ? (

                  wasteCategories.map(
                    (item, index) => (

                      <div
                        className="legend-item"
                        key={index}
                      >

                        <span className="legend-dot"></span>

                        <span>
                          {item.label}
                        </span>

                        <strong>
                          {item.percentage}%
                        </strong>

                      </div>

                    )
                  )

                ) : (

                  <div className="empty-state">
                    No waste category data available.
                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                MATERIAL COMPOSITION
            ================================================= */}

            <div className="analytics-card">

              <h3>
                Material Composition
              </h3>


              <div className="donut-wrapper">

                <div className="donut-chart material-donut">

                  <div className="donut-center">

                    <strong>
                      {materialComposition.length}
                    </strong>

                    <span>
                      Materials
                    </span>

                  </div>

                </div>

              </div>


              <div className="chart-legend">

                {materialComposition.length > 0 ? (

                  materialComposition.map(
                    (item, index) => (

                      <div
                        className="legend-item"
                        key={index}
                      >

                        <span className="legend-dot"></span>

                        <span>
                          {item.label}
                        </span>

                        <strong>
                          {item.percentage}%
                        </strong>

                      </div>

                    )
                  )

                ) : (

                  <div className="empty-state">
                    No material composition data available.
                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                RECYCLABILITY TREND
            ================================================= */}

            <div className="analytics-card large-chart-card">

              <h3>
                Recyclability Trend
              </h3>


              {recyclabilityTrend.length > 0 ? (

                <div className="line-chart">

                  <div className="y-axis">

                    <span>
                      100%
                    </span>

                    <span>
                      75%
                    </span>

                    <span>
                      50%
                    </span>

                    <span>
                      25%
                    </span>

                    <span>
                      0%
                    </span>

                  </div>


                  <div className="line-chart-area">

                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>


                    <svg
                      viewBox="0 0 600 220"
                      preserveAspectRatio="none"
                      className="trend-svg"
                    >

                      <polyline
                        points={recyclabilityTrend
                          .map(
                            (item, index) => {

                              const x =
                                recyclabilityTrend.length === 1
                                  ? 300
                                  : (
                                      index /
                                      (
                                        recyclabilityTrend.length - 1
                                      )
                                    ) * 600;

                              const value =
                                Math.min(
                                  Math.max(
                                    Number(
                                      item.value || 0
                                    ),
                                    0
                                  ),
                                  100
                                );

                              const y =
                                220 -
                                (
                                  value /
                                  100
                                ) * 220;

                              return `${x},${y}`;

                            }
                          )
                          .join(" ")
                        }
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />


                      {recyclabilityTrend.map(
                        (item, index) => {

                          const x =
                            recyclabilityTrend.length === 1
                              ? 300
                              : (
                                  index /
                                  (
                                    recyclabilityTrend.length - 1
                                  )
                                ) * 600;

                          const value =
                            Math.min(
                              Math.max(
                                Number(
                                  item.value || 0
                                ),
                                0
                              ),
                              100
                            );

                          const y =
                            220 -
                            (
                              value /
                              100
                            ) * 220;

                          return (

                            <circle
                              key={index}
                              cx={x}
                              cy={y}
                              r="5"
                            />

                          );

                        }
                      )}

                    </svg>


                    <div className="x-axis">

                      {recyclabilityTrend.map(
                        (item, index) => (

                          <span key={index}>
                            {item.month}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                </div>

              ) : (

                <div className="empty-state">
                  No recyclability trend data available.
                </div>

              )}

            </div>


            {/* =================================================
                CO2 SAVINGS
            ================================================= */}

            <div className="analytics-card large-chart-card">

              <h3>
                CO₂ Savings
              </h3>


              <div
                style={{
                  textAlign: "center",
                  padding: "35px 20px",
                }}
              >

                <div
                  style={{
                    fontSize: "42px",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  {co2Saved.toLocaleString()} kg
                </div>


                <p>
                  Estimated total CO₂e saved
                </p>


                {co2Trend.length > 0 &&
                co2Trend.some(
                  (item) =>
                    Number(item.value || 0) > 0
                ) ? (

                  <div className="bar-chart">

                    {co2Trend.map(
                      (item, index) => (

                        <div
                          className="bar-column"
                          key={index}
                        >

                          <span>
                            {item.value}%
                          </span>

                          <div className="bar-background">

                            <div
                              className="bar-fill"
                              style={{
                                height: `${Math.min(
                                  Number(
                                    item.value || 0
                                  ),
                                  100
                                )}%`,
                              }}
                            ></div>

                          </div>

                          <small>
                            {item.month}
                          </small>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div
                    className="empty-state"
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    Historical CO₂ trend data is not
                    available yet. Current total is calculated
                    from recorded recyclable/reusable textile
                    quantities.
                  </div>

                )}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            RECENT REPORTS
        ===================================================== */}

        <section className="report-section">

          <div className="section-heading">

            <div>

              <h2>
                Recent Generated Reports
              </h2>

              <p>
                Recently generated reports and their current status.
              </p>

            </div>


            <button className="view-all-button">
              View All
            </button>

          </div>


          <div className="reports-table-wrapper">

            <table className="reports-table">

              <thead>

                <tr>

                  <th>
                    Report Name
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentReports.length > 0 ? (

                  recentReports.map(
                    (report, index) => (

                      <tr
                        key={
                          report.id ||
                          index
                        }
                      >

                        <td>
                          {report.name}
                        </td>

                        <td>
                          {report.type}
                        </td>

                        <td>
                          {report.date}
                        </td>

                        <td>

                          <span className="status-completed">
                            {report.status}
                          </span>

                        </td>

                        <td>

                          <button
  className="download-button"
  onClick={async () => {

    try {

      const response = await API.get(
        `/report-dashboard/download/${report.id}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${report.name.replace(
          /[^a-z0-9]+/gi,
          "_"
        )}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.error(
        "Report download error:",
        err
      );

      alert(
        "Unable to download the report."
      );

    }

  }}
>
  ↓ Download
</button>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No generated reports available.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =====================================================
            EXPORT
        ===================================================== */}

        <section className="report-section">

          <div className="section-heading">

            <div>

              <h2>
                Export Options
              </h2>

              <p>
                Download your reports in the required format.
              </p>

            </div>

          </div>


          <div className="export-grid">

            <div className="export-card">

              <div className="export-icon">
                📄
              </div>

              <div>

                <h3>
                  PDF Export
                </h3>

                <p>
                  Download professional PDF reports.
                </p>

              </div>

              <button
                onClick={exportPDF}
              >
                Export PDF
              </button>

            </div>


            <div className="export-card">

              <div className="export-icon">
                📊
              </div>

              <div>

                <h3>
                  Excel Export
                </h3>

                <p>
                  Download analytical data in Excel format.
                </p>

              </div>

              <button
                onClick={exportExcel}
              >
                Export Excel
              </button>

            </div>

          </div>

        </section>


        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className="report-summary-card">

          <div>

            <span className="summary-icon">
              📈
            </span>

          </div>


          <div>

            <h2>
              Report Summary
            </h2>


            <p>
              Current textile waste analytics are based on
              recorded inventory data. Environmental impact
              values are calculated estimates based on
              recyclable and reusable textile quantities.
            </p>


            <div className="summary-highlights">

              <span>
                ♻️ {recyclablePercentage.toFixed(2)}% recyclable
              </span>

              <span>
                🌱 {co2Saved.toLocaleString()} kg CO₂ saved
              </span>

              <span>
                💧 {waterSaved.toLocaleString()} L water saved
              </span>

              <span>
                🌍 {landSaved.toLocaleString()} m² land saved
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="report-footer">

          <p>
            Textile Waste Intelligence Platform © 2026
          </p>

          <p>
            Reports & Analytics
          </p>

        </footer>

      </main>

    </div>

  );

}


export default ReportDashboard;