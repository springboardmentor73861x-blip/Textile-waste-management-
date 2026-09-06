import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaLeaf,
  FaRecycle,
  FaCloud,
  FaChartLine,
  FaFileDownload,
  FaCheckCircle,
  FaArrowUp,
  FaGlobe,
  FaSpinner,
} from "react-icons/fa";

import API from "../services/api";
import "../css/SustainabilityReports.css";


function SustainabilityReports() {
  const [collapsed, setCollapsed] = useState(false);

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================================
  // LOAD WASTE REQUESTS
  // ============================================================

  useEffect(() => {
    fetchReportData();
  }, []);


  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/waste-requests/");

      console.log("Sustainability Reports API:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];

      setRequests(data);

    } catch (err) {
      console.error(
        "Sustainability Reports Error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        "Unable to load sustainability report data."
      );

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
  // NUMBER HELPER
  // ============================================================

  const getQuantity = (item) => {
    const quantity = Number(item?.quantity);

    return Number.isFinite(quantity)
      ? quantity
      : 0;
  };


  // ============================================================
  // REPORT CALCULATIONS
  // ============================================================

  const report = useMemo(() => {

    const totalRequests = requests.length;


    const completedRequests = requests.filter(
      (item) =>
        normalizeStatus(item.status) === "completed"
    );


    const processingRequests = requests.filter(
      (item) =>
        normalizeStatus(item.status) === "processing"
    );


    const approvedRequests = requests.filter(
      (item) =>
        normalizeStatus(item.status) === "approved"
    );


    const totalWaste = requests.reduce(
      (sum, item) =>
        sum + getQuantity(item),
      0
    );


    const recoveredWaste =
      completedRequests.reduce(
        (sum, item) =>
          sum + getQuantity(item),
        0
      );


    const recoveryRate =
      totalWaste > 0
        ? Math.round(
            (recoveredWaste / totalWaste) * 100
          )
        : 0;


    /*
      Operational/environmental indicators are derived
      from actual completed recovery data.

      These are platform indicators, not scientific
      carbon calculations.
    */

    const environmentalScore =
      recoveryRate;


    const carbonEfficiency =
      recoveryRate;


    const resourceUtilization =
      totalWaste > 0
        ? Math.round(
            (recoveredWaste / totalWaste) * 100
          )
        : 0;


    /*
      Completed requests are considered compliant
      operationally.
    */

    const esgCompliance =
      totalRequests > 0
        ? Math.round(
            (completedRequests.length /
              totalRequests) *
              100
          )
        : 0;


    /*
      Overall score combines the main operational
      sustainability indicators.
    */

    const overallScore =
      Math.round(
        (
          environmentalScore +
          carbonEfficiency +
          resourceUtilization +
          esgCompliance
        ) / 4
      );


    return {
      totalRequests,
      completedRequests,
      processingRequests,
      approvedRequests,

      totalWaste,
      recoveredWaste,

      recoveryRate,

      environmentalScore,
      carbonEfficiency,
      resourceUtilization,
      esgCompliance,

      overallScore,
    };

  }, [requests]);


  // ============================================================
  // MONTHLY DATA
  // ============================================================

  const monthlyData = useMemo(() => {

    const completed = requests.filter(
      (item) =>
        normalizeStatus(item.status) === "completed"
    );


    const grouped = {};


    completed.forEach((item) => {

      /*
        Try common date fields.
      */

      const rawDate =
        item.created_at ||
        item.createdAt ||
        item.collection_date ||
        item.collectionDate ||
        item.date;


      if (!rawDate) {
        return;
      }


      const date = new Date(rawDate);


      if (Number.isNaN(date.getTime())) {
        return;
      }


      const monthKey =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;


      if (!grouped[monthKey]) {

        grouped[monthKey] = {
          year: date.getFullYear(),
          month: date.getMonth(),

          total: 0,

          recovered: 0,

          count: 0,
        };

      }


      grouped[monthKey].total +=
        getQuantity(item);

      grouped[monthKey].recovered +=
        getQuantity(item);

      grouped[monthKey].count += 1;

    });


    return Object.values(grouped)
      .sort((a, b) => {

        if (a.year !== b.year) {
          return a.year - b.year;
        }

        return a.month - b.month;

      })
      .slice(-6)
      .map((item) => {

        const recovery =
          item.total > 0
            ? Math.round(
                (item.recovered /
                  item.total) *
                  100
              )
            : 0;


        const esg =
          item.count > 0
            ? Math.min(
                100,
                Math.round(
                  (item.count /
                    item.count) *
                    100
                )
              )
            : 0;


        const overall =
          Math.round(
            (recovery + esg) / 2
          );


        return {
          ...item,

          monthName: new Date(
            item.year,
            item.month
          ).toLocaleString(
            "en-US",
            {
              month: "long",
            }
          ),

          recovery,

          carbon: recovery,

          esg,

          overall,
        };

      });

  }, [requests]);


  // ============================================================
  // DOWNLOAD REPORT
  // ============================================================

  const handleDownload = () => {

    const reportText = `
TEXTILE WASTE AI
SUSTAINABILITY REPORT
==============================

Overall Sustainability Score:
${report.overallScore}%

Environmental Performance:
${report.environmentalScore}%

Carbon Efficiency:
${report.carbonEfficiency}%

Waste Recovery:
${report.recoveryRate}%

Resource Utilization:
${report.resourceUtilization}%

ESG Compliance:
${report.esgCompliance}%

Total Waste:
${report.totalWaste.toFixed(2)}

Recovered Waste:
${report.recoveredWaste.toFixed(2)}

Completed Requests:
${report.completedRequests.length}

Generated:
${new Date().toLocaleString()}
`;


    const blob = new Blob(
      [reportText],
      {
        type: "text/plain",
      }
    );


    const url =
      window.URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;

    link.download =
      "sustainability-report.txt";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

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
            collapsed ? "collapsed" : ""
          }`}
        >

          <Navbar />

          <main className="sustainability-reports-container">

            <div className="report-loading-state">

              <FaSpinner className="report-spinner" />

              <h2>
                Loading Sustainability Report
              </h2>

              <p>
                Fetching live sustainability data...
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
            collapsed ? "collapsed" : ""
          }`}
        >

          <Navbar />

          <main className="sustainability-reports-container">

            <div className="report-error-state">

              <div className="report-error-icon">
                !
              </div>

              <h2>
                Unable to load report
              </h2>

              <p>
                {error}
              </p>

              <button
                onClick={fetchReportData}
                className="report-retry-btn"
              >
                Try Again
              </button>

            </div>

          </main>

        </div>

      </div>

    );

  }


  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      <div
        className={`dashboard-content ${
          collapsed ? "collapsed" : ""
        }`}
      >

        <Navbar />


        <main className="sustainability-reports-container">


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="sustainability-reports-header">

            <div className="sustainability-reports-title">

              <span className="sustainability-label">
                SUSTAINABILITY ANALYTICS
              </span>

              <h1>
                Sustainability Reports
              </h1>

              <p>
                Monitor environmental performance,
                waste recovery and sustainability
                progress using live platform data.
              </p>

              <span className="report-live-status">
                <span className="live-dot" />
                Live Data
              </span>

            </div>


            <button
              className="sustainability-download-btn"
              onClick={handleDownload}
            >

              <FaFileDownload />

              Download Report

            </button>

          </section>


          {/* ==================================================
              KPI CARDS
          ================================================== */}

          <section className="sustainability-report-cards">


            {/* ENVIRONMENTAL */}

            <div className="sustainability-report-card">

              <div className="report-card-top">

                <div className="report-icon green">
                  <FaLeaf />
                </div>

                <span className="report-trend positive">
                  <FaArrowUp />
                  Live
                </span>

              </div>

              <div className="report-card-content">

                <span className="report-card-label">
                  ENVIRONMENTAL SCORE
                </span>

                <h2>
                  {report.environmentalScore}
                  <small>%</small>
                </h2>

                <p>
                  Based on waste recovery
                </p>

              </div>

            </div>


            {/* CARBON */}

            <div className="sustainability-report-card">

              <div className="report-card-top">

                <div className="report-icon blue">
                  <FaCloud />
                </div>

                <span className="report-trend positive">
                  Live
                </span>

              </div>

              <div className="report-card-content">

                <span className="report-card-label">
                  CARBON EFFICIENCY
                </span>

                <h2>
                  {report.carbonEfficiency}
                  <small>%</small>
                </h2>

                <p>
                  Derived from recovery performance
                </p>

              </div>

            </div>


            {/* WASTE RECOVERY */}

            <div className="sustainability-report-card">

              <div className="report-card-top">

                <div className="report-icon orange">
                  <FaRecycle />
                </div>

                <span className="report-trend positive">
                  Live
                </span>

              </div>

              <div className="report-card-content">

                <span className="report-card-label">
                  WASTE RECOVERY
                </span>

                <h2>
                  {report.recoveryRate}
                  <small>%</small>
                </h2>

                <p>
                  {report.recoveredWaste.toFixed(2)} units recovered
                </p>

              </div>

            </div>


            {/* OVERALL */}

            <div className="sustainability-report-card">

              <div className="report-card-top">

                <div className="report-icon purple">
                  <FaChartLine />
                </div>

                <span className="report-trend positive">
                  Live
                </span>

              </div>

              <div className="report-card-content">

                <span className="report-card-label">
                  OVERALL SCORE
                </span>

                <h2>
                  {report.overallScore}
                  <small>%</small>
                </h2>

                <p>
                  Overall sustainability indicator
                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              PERFORMANCE
          ================================================== */}

          <section className="sustainability-overview">

            <div className="sustainability-section-header">

              <div>

                <span className="section-label">
                  PERFORMANCE OVERVIEW
                </span>

                <h2>
                  Sustainability Performance
                </h2>

                <p>
                  Current performance calculated
                  from completed waste recovery data.
                </p>

              </div>

              <div className="sustainability-header-icon">
                <FaGlobe />
              </div>

            </div>


            <div className="sustainability-progress-list">


              {/* ENVIRONMENTAL */}

              <div className="sustainability-progress-item">

                <div className="sustainability-progress-top">

                  <span>
                    Environmental Performance
                  </span>

                  <strong>
                    {report.environmentalScore}%
                  </strong>

                </div>

                <div className="sustainability-progress">

                  <span
                    className="sustainability-progress-green"
                    style={{
                      width:
                        `${report.environmentalScore}%`,
                    }}
                  />

                </div>

                <small>
                  Based on completed recovery
                </small>

              </div>


              {/* CARBON */}

              <div className="sustainability-progress-item">

                <div className="sustainability-progress-top">

                  <span>
                    Carbon Efficiency
                  </span>

                  <strong>
                    {report.carbonEfficiency}%
                  </strong>

                </div>

                <div className="sustainability-progress">

                  <span
                    className="sustainability-progress-blue"
                    style={{
                      width:
                        `${report.carbonEfficiency}%`,
                    }}
                  />

                </div>

                <small>
                  Recovery-based sustainability indicator
                </small>

              </div>


              {/* RESOURCE */}

              <div className="sustainability-progress-item">

                <div className="sustainability-progress-top">

                  <span>
                    Resource Utilization
                  </span>

                  <strong>
                    {report.resourceUtilization}%
                  </strong>

                </div>

                <div className="sustainability-progress">

                  <span
                    className="sustainability-progress-orange"
                    style={{
                      width:
                        `${report.resourceUtilization}%`,
                    }}
                  />

                </div>

                <small>
                  Based on recovered waste quantity
                </small>

              </div>


              {/* ESG */}

              <div className="sustainability-progress-item">

                <div className="sustainability-progress-top">

                  <span>
                    ESG Compliance
                  </span>

                  <strong>
                    {report.esgCompliance}%
                  </strong>

                </div>

                <div className="sustainability-progress">

                  <span
                    className="sustainability-progress-purple"
                    style={{
                      width:
                        `${report.esgCompliance}%`,
                    }}
                  />

                </div>

                <small>
                  Operational recovery compliance
                </small>

              </div>

            </div>

          </section>


          {/* ==================================================
              MONTHLY REPORT
          ================================================== */}

          <section className="sustainability-table-section">

            <div className="sustainability-section-header">

              <div>

                <span className="section-label">
                  MONTHLY REPORT
                </span>

                <h2>
                  Sustainability Summary
                </h2>

                <p>
                  Monthly sustainability performance
                  based on completed recovery requests.
                </p>

              </div>

              <div className="sustainability-header-icon">
                <FaChartLine />
              </div>

            </div>


            {monthlyData.length === 0 ? (

              <div className="report-empty-state">

                <FaChartLine />

                <h3>
                  No monthly performance data available.
                </h3>

                <p>
                  Monthly analytics will appear after
                  completed recovery requests contain
                  valid date information.
                </p>

              </div>

            ) : (

              <div className="sustainability-table-wrapper">

                <table className="sustainability-table">

                  <thead>

                    <tr>

                      <th>
                        MONTH
                      </th>

                      <th>
                        CARBON EFFICIENCY
                      </th>

                      <th>
                        WASTE RECOVERY
                      </th>

                      <th>
                        ESG SCORE
                      </th>

                      <th>
                        OVERALL
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {monthlyData.map(
                      (item, index) => (

                        <tr key={index}>

                          <td>
                            {item.monthName}
                            {" "}
                            {item.year}
                          </td>

                          <td>
                            {item.carbon}%
                          </td>

                          <td>
                            {item.recovery}%
                          </td>

                          <td>
                            {item.esg}%
                          </td>

                          <td>

                            <span className="sustainability-score">
                              {item.overall}%
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
              ACHIEVEMENT
          ================================================== */}

          <section className="sustainability-achievements">

            <div className="achievement-icon">
              <FaCheckCircle />
            </div>

            <div className="achievement-content">

              <span>
                KEY ACHIEVEMENT
              </span>

              <h3>
                {report.completedRequests.length > 0
                  ? "Sustainability performance is active"
                  : "Sustainability tracking is ready"}
              </h3>

              <p>
                {report.completedRequests.length > 0
                  ? `${report.completedRequests.length} completed recovery request(s) have contributed ${report.recoveredWaste.toFixed(2)} units of recovered textile waste.`
                  : "Complete waste recovery requests to start generating live sustainability performance analytics."}
              </p>

            </div>

          </section>

        </main>

      </div>

    </div>

  );
}


export default SustainabilityReports;