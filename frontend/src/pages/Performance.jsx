import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import API from "../services/api";

import {
  FaChartLine,
  FaRecycle,
  FaLeaf,
  FaIndustry,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaFileDownload,
  FaBoxes,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

import "../css/Performance.css";


function Performance() {
  const [collapsed, setCollapsed] = useState(false);

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ============================================================
  // FETCH WASTE REQUESTS
  // ============================================================

  useEffect(() => {
    fetchPerformanceData();
  }, []);


  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/waste-requests/");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setRequests(data);

    } catch (err) {
      console.error(
        "Performance API Error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        "Unable to load performance data."
      );

      setRequests([]);

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // NORMALIZE STATUS
  // ============================================================

  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toLowerCase();
  };


  // ============================================================
  // NUMERIC VALUE
  // ============================================================

  const getQuantity = (item) => {
    const value = Number(item?.quantity);

    return Number.isFinite(value)
      ? value
      : 0;
  };


  // ============================================================
  // PROGRESS
  // ============================================================

  const getProgress = (item) => {
    const value = Number(item?.progress);

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, value)
    );
  };


  // ============================================================
  // COMPLETED
  // ============================================================

  const isCompleted = (item) => {
    return (
      normalizeStatus(item?.status) ===
        "completed" ||
      getProgress(item) === 100
    );
  };


  // ============================================================
  // PERFORMANCE CALCULATIONS
  // ============================================================

  const performance = useMemo(() => {

    if (!requests.length) {

      return {
        totalRequests: 0,
        completedRequests: 0,
        totalQuantity: 0,
        processedQuantity: 0,

        recoveryRate: 0,
        overallPerformance: 0,
        sustainabilityScore: 0,
        resourceEfficiency: 0,
        esgCompliance: 0,

        averageProgress: 0,
      };
    }


    const totalRequests =
      requests.length;


    const completedRequests =
      requests.filter(
        isCompleted
      ).length;


    const totalQuantity =
      requests.reduce(
        (sum, item) =>
          sum + getQuantity(item),
        0
      );


    const processedQuantity =
      requests
        .filter(isCompleted)
        .reduce(
          (sum, item) =>
            sum + getQuantity(item),
          0
        );


    // ----------------------------------------------------------
    // RECOVERY / COMPLETION RATE
    // ----------------------------------------------------------

    const recoveryRate =
      totalQuantity > 0
        ? (processedQuantity /
            totalQuantity) *
          100
        : 0;


    // ----------------------------------------------------------
    // AVERAGE PROCESSING PROGRESS
    // ----------------------------------------------------------

    const totalProgress =
      requests.reduce(
        (sum, item) =>
          sum + getProgress(item),
        0
      );


    const averageProgress =
      totalRequests > 0
        ? totalProgress /
          totalRequests
        : 0;


    // ----------------------------------------------------------
    // ESG COMPLIANCE
    // ----------------------------------------------------------

    const esgCompliance =
      totalRequests > 0
        ? (completedRequests /
            totalRequests) *
          100
        : 0;


    // ----------------------------------------------------------
    // RESOURCE EFFICIENCY
    // ----------------------------------------------------------

    const resourceEfficiency =
      averageProgress;


    // ----------------------------------------------------------
    // SUSTAINABILITY SCORE
    //
    // Recovery          50%
    // Processing        30%
    // ESG Compliance    20%
    // ----------------------------------------------------------

    const sustainabilityScore =
      (
        recoveryRate * 0.5 +
        averageProgress * 0.3 +
        esgCompliance * 0.2
      );


    // ----------------------------------------------------------
    // OVERALL PERFORMANCE
    //
    // Weighted operational score
    // ----------------------------------------------------------

    const overallPerformance =
      (
        recoveryRate * 0.5 +
        averageProgress * 0.3 +
        esgCompliance * 0.2
      );


    return {

      totalRequests,

      completedRequests,

      totalQuantity,

      processedQuantity,

      recoveryRate,

      overallPerformance,

      sustainabilityScore,

      resourceEfficiency,

      esgCompliance,

      averageProgress,
    };

  }, [requests]);


  // ============================================================
  // MATERIAL PERFORMANCE
  // ============================================================

  const materialPerformance = useMemo(() => {

    const map = {};


    requests.forEach((item) => {

      const material =
        String(
          item?.material ||
          "Unknown"
        ).trim();


      if (!map[material]) {

        map[material] = {

          material,

          requests: 0,

          quantity: 0,

          completed: 0,

          completedQuantity: 0,

          progress: 0,
        };
      }


      map[material].requests += 1;


      map[material].quantity +=
        getQuantity(item);


      map[material].progress +=
        getProgress(item);


      if (isCompleted(item)) {

        map[material].completed += 1;

        map[material].completedQuantity +=
          getQuantity(item);
      }

    });


    return Object.values(map)
      .map((item) => {

        const performance =
          item.quantity > 0
            ? (
                item.completedQuantity /
                item.quantity
              ) * 100
            : 0;


        const averageProgress =
          item.requests > 0
            ? item.progress /
              item.requests
            : 0;


        return {

          ...item,

          performance,

          averageProgress,
        };

      })
      .sort(
        (a, b) =>
          b.quantity -
          a.quantity
      );

  }, [requests]);


  // ============================================================
  // FORMAT NUMBER
  // ============================================================

  const formatNumber = (value) => {

    if (!Number.isFinite(value)) {
      return "0";
    }

    if (
      Number.isInteger(value)
    ) {
      return value.toString();
    }

    return value.toFixed(1);
  };


  // ============================================================
  // FORMAT PERCENTAGE
  // ============================================================

  const formatPercent = (value) => {

    if (!Number.isFinite(value)) {
      return "0%";
    }

    return `${Math.round(value)}%`;
  };


  // ============================================================
  // DOWNLOAD
  // ============================================================

  const handleDownload = () => {

    const rows = [
      [
        "Metric",
        "Value",
      ],

      [
        "Total Requests",
        performance.totalRequests,
      ],

      [
        "Completed Requests",
        performance.completedRequests,
      ],

      [
        "Total Quantity",
        performance.totalQuantity,
      ],

      [
        "Processed Quantity",
        performance.processedQuantity,
      ],

      [
        "Recovery Rate",
        `${performance.recoveryRate.toFixed(1)}%`,
      ],

      [
        "Overall Performance",
        `${performance.overallPerformance.toFixed(1)}%`,
      ],

      [
        "Sustainability Score",
        `${performance.sustainabilityScore.toFixed(1)}%`,
      ],

      [
        "Resource Efficiency",
        `${performance.resourceEfficiency.toFixed(1)}%`,
      ],

      [
        "ESG Compliance",
        `${performance.esgCompliance.toFixed(1)}%`,
      ],
    ];


    const csv = rows
      .map(
        (row) =>
          row.join(",")
      )
      .join("\n");


    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "performance-report.csv";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };


  // ============================================================
  // LOADING
  // ============================================================

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

          <main className="performance-container">

            <div className="performance-loading">

              <FaSpinner className="loading-spinner" />

              <h3>
                Loading performance data...
              </h3>

              <p>
                Fetching live waste recovery
                information.
              </p>

            </div>

          </main>

        </div>

      </div>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

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

          <main className="performance-container">

            <div className="performance-error">

              <div className="error-icon">

                <FaExclamationTriangle />

              </div>

              <h3>
                Unable to load performance
              </h3>

              <p>
                {error}
              </p>

              <button
                onClick={
                  fetchPerformanceData
                }
              >
                Try Again
              </button>

            </div>

          </main>

        </div>

      </div>
    );
  }


  return (

    <div className="dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

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

        {/* ====================================================
            NAVBAR
        ==================================================== */}

        <Navbar />


        <main className="performance-container">


          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="performance-header">

            <div className="performance-title">

              <span className="performance-label">

                OPERATIONAL INSIGHTS

              </span>


              <h1>
                Performance
              </h1>


              <p>
                Monitor operational efficiency,
                waste recovery, sustainability
                progress and overall performance.
              </p>

            </div>


            <div className="performance-live">

              <span className="live-dot"></span>

              <span>
                Live Data
              </span>

            </div>


            <button
              className="performance-download-btn"
              onClick={
                handleDownload
              }
            >

              <FaFileDownload />

              Download Report

            </button>

          </section>


          {/* ==================================================
              KPI CARDS
          ================================================== */}

          <section className="performance-cards">


            {/* OVERALL PERFORMANCE */}

            <div className="performance-card">

              <div className="performance-card-top">

                <div className="performance-icon blue">

                  <FaChartLine />

                </div>


                <span className="performance-trend success">

                  <FaArrowUp />

                  Live

                </span>

              </div>


              <div className="performance-card-content">

                <span className="performance-card-label">

                  OVERALL PERFORMANCE

                </span>


                <h2>

                  {formatPercent(
                    performance.overallPerformance
                  )}

                </h2>


                <p>
                  Based on completed waste recovery
                </p>

              </div>

            </div>


            {/* WASTE RECOVERY */}

            <div className="performance-card">

              <div className="performance-card-top">

                <div className="performance-icon green">

                  <FaRecycle />

                </div>


                <span className="performance-trend success">

                  <FaCheckCircle />

                  {performance.completedRequests}

                </span>

              </div>


              <div className="performance-card-content">

                <span className="performance-card-label">

                  WASTE RECOVERY

                </span>


                <h2>

                  {formatPercent(
                    performance.recoveryRate
                  )}

                </h2>


                <p>

                  {formatNumber(
                    performance.processedQuantity
                  )}{" "}
                  units processed

                </p>

              </div>

            </div>


            {/* SUSTAINABILITY */}

            <div className="performance-card">

              <div className="performance-card-top">

                <div className="performance-icon leaf">

                  <FaLeaf />

                </div>


                <span className="performance-trend success">

                  <FaLeaf />

                  {formatPercent(
                    performance.sustainabilityScore
                  )}

                </span>

              </div>


              <div className="performance-card-content">

                <span className="performance-card-label">

                  SUSTAINABILITY SCORE

                </span>


                <h2>

                  {formatPercent(
                    performance.sustainabilityScore
                  )}

                </h2>


                <p>
                  Recovery and operational completion
                </p>

              </div>

            </div>


            {/* RESOURCE EFFICIENCY */}

            <div className="performance-card">

              <div className="performance-card-top">

                <div className="performance-icon orange">

                  <FaIndustry />

                </div>


                <span className="performance-trend success">

                  <FaBoxes />

                  Live

                </span>

              </div>


              <div className="performance-card-content">

                <span className="performance-card-label">

                  RESOURCE EFFICIENCY

                </span>


                <h2>

                  {formatPercent(
                    performance.resourceEfficiency
                  )}

                </h2>


                <p>
                  Effective waste utilization
                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              PERFORMANCE ANALYSIS
          ================================================== */}

          <section className="performance-overview">


            <div className="performance-section-header">

              <div>

                <span className="section-label">

                  PERFORMANCE ANALYSIS

                </span>


                <h2>
                  Operational Performance
                </h2>


                <p>
                  Current performance across key
                  sustainability indicators.
                </p>

              </div>


              <div className="performance-header-icon">

                <FaChartLine />

              </div>

            </div>


            <div className="performance-metrics">


              {/* WASTE RECYCLING */}

              <div className="performance-metric">

                <div className="metric-top">

                  <span>
                    Waste Recycling
                  </span>

                  <strong>
                    {formatPercent(
                      performance.recoveryRate
                    )}
                  </strong>

                </div>


                <div className="performance-progress">

                  <span
                    className="progress-green"
                    style={{
                      width: `${performance.recoveryRate}%`,
                    }}
                  ></span>

                </div>


                <small>

                  {performance.recoveryRate >= 90
                    ? "Excellent performance"
                    : performance.recoveryRate >= 70
                    ? "Good performance"
                    : "Needs improvement"}

                </small>

              </div>


              {/* CARBON EFFICIENCY */}

              <div className="performance-metric">

                <div className="metric-top">

                  <span>
                    Carbon Efficiency
                  </span>

                  <strong>
                    {formatPercent(
                      performance.sustainabilityScore
                    )}
                  </strong>

                </div>


                <div className="performance-progress">

                  <span
                    className="progress-blue"
                    style={{
                      width: `${performance.sustainabilityScore}%`,
                    }}
                  ></span>

                </div>


                <small>
                  Calculated from sustainability
                  performance
                </small>

              </div>


              {/* RESOURCE UTILIZATION */}

              <div className="performance-metric">

                <div className="metric-top">

                  <span>
                    Resource Utilization
                  </span>

                  <strong>
                    {formatPercent(
                      performance.resourceEfficiency
                    )}
                  </strong>

                </div>


                <div className="performance-progress">

                  <span
                    className="progress-orange"
                    style={{
                      width: `${performance.resourceEfficiency}%`,
                    }}
                  ></span>

                </div>


                <small>
                  Based on waste processing progress
                </small>

              </div>


              {/* ESG */}

              <div className="performance-metric">

                <div className="metric-top">

                  <span>
                    ESG Compliance
                  </span>

                  <strong>
                    {formatPercent(
                      performance.esgCompliance
                    )}
                  </strong>

                </div>


                <div className="performance-progress">

                  <span
                    className="progress-purple"
                    style={{
                      width: `${performance.esgCompliance}%`,
                    }}
                  ></span>

                </div>


                <small>
                  Completed operational requests
                </small>

              </div>

            </div>

          </section>


          {/* ==================================================
              MATERIAL PERFORMANCE
          ================================================== */}

          <section className="performance-table-section">


            <div className="performance-section-header">

              <div>

                <span className="section-label">

                  MATERIAL RESULTS

                </span>


                <h2>
                  Material Performance
                </h2>


                <p>
                  Performance based on actual
                  completed waste requests.
                </p>

              </div>


              <div className="performance-header-icon trophy">

                <FaTrophy />

              </div>

            </div>


            {materialPerformance.length === 0 ? (

              <div className="performance-empty">

                <FaBoxes />

                <h3>
                  No performance data available
                </h3>

                <p>
                  Completed waste recovery
                  requests will appear here.
                </p>

              </div>

            ) : (

              <div className="performance-table-wrapper">

                <table className="performance-table">

                  <thead>

                    <tr>

                      <th>
                        MATERIAL
                      </th>

                      <th>
                        REQUESTS
                      </th>

                      <th>
                        QUANTITY
                      </th>

                      <th>
                        COMPLETED
                      </th>

                      <th>
                        PERFORMANCE
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {materialPerformance.map(
                      (item, index) => (

                        <tr
                          key={`${item.material}-${index}`}
                        >

                          <td>

                            <div className="material-name">

                              <span className="material-icon">

                                <FaRecycle />

                              </span>

                              {item.material}

                            </div>

                          </td>


                          <td>
                            {item.requests}
                          </td>


                          <td>

                            {formatNumber(
                              item.quantity
                            )}

                          </td>


                          <td>

                            <span className="completed-count">

                              {item.completed}

                              {" / "}

                              {item.requests}

                            </span>

                          </td>


                          <td>

                            <span
                              className={`score-badge ${
                                item.performance >= 90
                                  ? "excellent"
                                  : item.performance >= 70
                                  ? "good"
                                  : "low"
                              }`}
                            >

                              {formatPercent(
                                item.performance
                              )}

                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* ==================================================
              PERFORMANCE INSIGHT
          ================================================== */}

          <section className="performance-insight">

            <div className="insight-icon">

              <FaTrophy />

            </div>


            <div className="insight-content">

              <span>
                PERFORMANCE INSIGHT
              </span>


              <h3>

                {performance.overallPerformance >= 90
                  ? "Operational performance is excellent"
                  : performance.overallPerformance >= 70
                  ? "Operational performance is stable"
                  : "Operational performance needs attention"}

              </h3>


              <p>

                {performance.totalRequests === 0

                  ? "There is currently no waste request data available for performance analysis."

                  : `${performance.completedRequests} of ${performance.totalRequests} waste requests have been completed, with ${formatNumber(
                      performance.processedQuantity
                    )} units processed.`}

              </p>

            </div>

          </section>


        </main>

      </div>

    </div>
  );
}


export default Performance;