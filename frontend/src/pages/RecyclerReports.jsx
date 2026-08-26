import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import API from "../services/api";

import {
  FaChartBar,
  FaRecycle,
  FaWeightHanging,
  FaLeaf,
  FaIndustry,
  FaArrowUp,
  FaArrowDown,
  FaSyncAlt,
  FaClipboardList,
} from "react-icons/fa";

import "../css/RecyclerReports.css";


function RecyclerReports() {

  const [collapsed, setCollapsed] =
    useState(false);

  const [period, setPeriod] =
    useState("Monthly");

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ============================================================
  // FETCH BACKEND DATA
  // ============================================================

  const fetchReports = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await API.get("/waste-requests/");

      console.log(
        "RECYCLER REPORT BACKEND DATA:",
        response.data
      );

      let data = response.data;

      if (!Array.isArray(data)) {

        data =
          data?.items ||
          data?.data ||
          data?.requests ||
          [];

      }

      setRequests(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "RECYCLER REPORT ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to load recycler reports."
      );

      setRequests([]);

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    fetchReports();

  }, []);


  // ============================================================
  // HELPERS
  // ============================================================

  const getStatus = (item) => {

    const value =
      item?.status ||
      item?.request_status ||
      "Pending";

    const status =
      String(value)
        .trim()
        .toLowerCase();

    if (status === "approved") {
      return "Approved";
    }

    if (
      status === "processing" ||
      status === "in progress"
    ) {
      return "Processing";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    return "Pending";

  };


  const getQuantity = (item) => {

    const quantity = Number(
      item?.quantity ??
      item?.requested_quantity ??
      item?.amount ??
      item?.weight ??
      0
    );

    if (
      Number.isNaN(quantity) ||
      quantity < 0
    ) {

      return 0;

    }

    return quantity;

  };


  const getUnit = (item) => {

    return (
      item?.unit ||
      "Kg"
    );

  };


  const getMaterial = (item) => {

    return (
      item?.material ||
      item?.material_type ||
      item?.waste_type ||
      item?.waste_category ||
      "Unknown"
    );

  };


  const getManufacturer = (item) => {

    return (
      item?.manufacturer ||
      item?.manufacturer_name ||
      item?.manufacturer_company ||
      "Manufacturer"
    );

  };


  const getDateValue = (item) => {

    return (
      item?.created_at ||
      item?.request_date ||
      item?.requested_at ||
      item?.date ||
      null
    );

  };


  const getDate = (item) => {

    const value =
      getDateValue(item);

    if (!value) {

      return null;

    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return null;

    }

    return date;

  };


  // ============================================================
  // NORMALIZE BACKEND DATA
  // ============================================================

  const normalizedRequests =
    useMemo(() => {

      return requests.map(
        (item) => {

          return {

            ...item,

            reportId:
              item?.id,

            reportStatus:
              getStatus(item),

            reportQuantity:
              getQuantity(item),

            reportUnit:
              getUnit(item),

            reportMaterial:
              getMaterial(item),

            reportManufacturer:
              getManufacturer(item),

            reportDate:
              getDate(item),

          };

        }
      );

    }, [requests]);


  // ============================================================
  // VALID REQUESTS RECEIVED BY RECYCLER
  //
  // Pending / Rejected are NOT counted as received waste.
  //
  // Approved + Processing + Completed = received workflow
  // ============================================================

  const receivedRequests =
    useMemo(() => {

      return normalizedRequests.filter(
        (item) => {

          return (
            item.reportStatus ===
              "Approved" ||

            item.reportStatus ===
              "Processing" ||

            item.reportStatus ===
              "Completed"
          );

        }
      );

    }, [normalizedRequests]);


  // ============================================================
  // PROCESSING REQUESTS
  // ============================================================

  const processingRequests =
    useMemo(() => {

      return normalizedRequests.filter(
        (item) => {

          return (
            item.reportStatus ===
              "Processing" ||

            item.reportStatus ===
              "Completed"
          );

        }
      );

    }, [normalizedRequests]);


  // ============================================================
  // COMPLETED REQUESTS
  // ============================================================

  const completedRequests =
    useMemo(() => {

      return normalizedRequests.filter(
        (item) =>
          item.reportStatus ===
          "Completed"
      );

    }, [normalizedRequests]);


  // ============================================================
  // WASTE RECEIVED
  // ============================================================

  const totalReceived =
    receivedRequests.reduce(
      (sum, item) => {

        return (
          sum +
          Number(
            item.reportQuantity || 0
          )
        );

      },
      0
    );


  // ============================================================
  // WASTE PROCESSED
  //
  // Processing + Completed
  // ============================================================

  const totalProcessed =
    processingRequests.reduce(
      (sum, item) => {

        return (
          sum +
          Number(
            item.reportQuantity || 0
          )
        );

      },
      0
    );


  // ============================================================
  // MATERIAL RECOVERED
  //
  // Completed quantity is treated as recovered quantity
  // ============================================================

  const totalRecovered =
    completedRequests.reduce(
      (sum, item) => {

        return (
          sum +
          Number(
            item.reportQuantity || 0
          )
        );

      },
      0
    );


  // ============================================================
  // RECOVERY RATE
  // ============================================================

  const recoveryRate =
    totalReceived > 0
      ? Math.round(
          (
            totalRecovered /
            totalReceived
          ) * 100
        )
      : 0;


  // ============================================================
  // PROCESSING RATE
  // ============================================================

  const processingRate =
    totalReceived > 0
      ? Math.round(
          (
            totalProcessed /
            totalReceived
          ) * 100
        )
      : 0;


  // ============================================================
  // COMPLETED COUNT
  // ============================================================

  const completedCount =
    completedRequests.length;


  // ============================================================
  // PROCESSING COUNT
  // ============================================================

  const processingCount =
    normalizedRequests.filter(
      (item) =>
        item.reportStatus ===
        "Processing"
    ).length;


  // ============================================================
  // PERIOD FILTER
  // ============================================================

  const periodRequests =
    useMemo(() => {

      const now =
        new Date();

      return receivedRequests.filter(
        (item) => {

          if (!item.reportDate) {

            return true;

          }

          const date =
            item.reportDate;

          if (period === "Weekly") {

            const sevenDaysAgo =
              new Date(now);

            sevenDaysAgo.setDate(
              now.getDate() - 7
            );

            return (
              date >=
              sevenDaysAgo
            );

          }


          if (period === "Monthly") {

            return (
              date.getMonth() ===
                now.getMonth() &&

              date.getFullYear() ===
                now.getFullYear()
            );

          }


          if (period === "Quarterly") {

            const currentQuarter =
              Math.floor(
                now.getMonth() / 3
              );

            const itemQuarter =
              Math.floor(
                date.getMonth() / 3
              );

            return (
              itemQuarter ===
                currentQuarter &&

              date.getFullYear() ===
                now.getFullYear()
            );

          }


          if (period === "Yearly") {

            return (
              date.getFullYear() ===
              now.getFullYear()
            );

          }


          return true;

        }
      );

    }, [
      receivedRequests,
      period,
    ]);


  // ============================================================
  // PERIOD QUANTITIES
  // ============================================================

  const periodReceived =
    periodRequests.reduce(
      (sum, item) =>
        sum +
        Number(
          item.reportQuantity || 0
        ),
      0
    );


  const periodProcessed =
    periodRequests
      .filter(
        (item) =>
          item.reportStatus ===
            "Processing" ||
          item.reportStatus ===
            "Completed"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.reportQuantity || 0
          ),
        0
      );


  const periodRecovered =
    periodRequests
      .filter(
        (item) =>
          item.reportStatus ===
          "Completed"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.reportQuantity || 0
          ),
        0
      );


  const periodRecoveryRate =
    periodReceived > 0
      ? Math.round(
          (
            periodRecovered /
            periodReceived
          ) * 100
        )
      : 0;


  const periodProcessingRate =
    periodReceived > 0
      ? Math.round(
          (
            periodProcessed /
            periodReceived
          ) * 100
        )
      : 0;


  // ============================================================
  // REPORT HISTORY
  // ============================================================

  const reports =
    useMemo(() => {

      const grouped = {};

      normalizedRequests.forEach(
        (item) => {

          if (!item.reportDate) {

            return;

          }

          if (
            item.reportStatus ===
              "Pending" ||
            item.reportStatus ===
              "Rejected"
          ) {

            return;

          }

          const date =
            item.reportDate;

          const key =
            `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;

          if (!grouped[key]) {

            grouped[key] = {

              id:
                `REP-${String(
                  Object.keys(
                    grouped
                  ).length + 1
                ).padStart(3, "0")}`,

              date,

              received: 0,

              processed: 0,

              recovered: 0,

              requests: 0,

            };

          }


          const quantity =
            Number(
              item.reportQuantity || 0
            );


          grouped[key].received +=
            quantity;

          grouped[key].requests += 1;


          if (
            item.reportStatus ===
              "Processing" ||

            item.reportStatus ===
              "Completed"
          ) {

            grouped[key].processed +=
              quantity;

          }


          if (
            item.reportStatus ===
            "Completed"
          ) {

            grouped[key].recovered +=
              quantity;

          }

        }
      );


      return Object.values(grouped)
        .sort(
          (a, b) =>
            b.date - a.date
        )
        .map(
          (item) => {

            const rate =
              item.received > 0
                ? Math.round(
                    (
                      item.recovered /
                      item.received
                    ) * 100
                  )
                : 0;


            let status =
              "Average";

            if (rate >= 85) {

              status =
                "Excellent";

            } else if (rate >= 70) {

              status =
                "Good";

            }


            return {

              ...item,

              month:
                item.date.toLocaleDateString(
                  "en-IN",
                  {
                    month: "long",
                    year: "numeric",
                  }
                ),

              recoveryRate:
                rate,

              status,

            };

          }
        );

    }, [
      normalizedRequests,
    ]);


  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh =
    () => {

      fetchReports();

    };


  // ============================================================
  // NUMBER FORMAT
  // ============================================================

  const formatKg = (value) => {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    );

  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="dashboard">


      {/* SIDEBAR */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      {/* CONTENT */}

      <div
        className={`dashboard-content ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >

        <Navbar />


        <main className="recycler-reports-container">


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="reports-header">

            <div>

              <span className="reports-label">
                RECYCLING ANALYTICS
              </span>

              <h1>
                Recycler Reports
              </h1>

              <p>
                Real-time recycling performance
                calculated from backend waste requests.
              </p>

            </div>


            <div className="reports-header-actions">

              <select
                value={period}
                onChange={(e) =>
                  setPeriod(
                    e.target.value
                  )
                }
              >

                <option value="Weekly">
                  Weekly
                </option>

                <option value="Monthly">
                  Monthly
                </option>

                <option value="Quarterly">
                  Quarterly
                </option>

                <option value="Yearly">
                  Yearly
                </option>

              </select>


              <button
                className="download-btn"
                onClick={
                  handleRefresh
                }
                disabled={loading}
              >

                <FaSyncAlt />

                {loading
                  ? "Loading..."
                  : "Refresh"}

              </button>

            </div>

          </section>


          {/* ERROR */}

          {error && (

            <div
              style={{
                margin:
                  "20px 0",
                padding:
                  "15px",
                borderRadius:
                  "10px",
                background:
                  "#fff1f1",
                color:
                  "#c62828",
              }}
            >

              {error}

            </div>

          )}


          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <section className="report-cards">


            {/* RECEIVED */}

            <div className="report-card">

              <div className="report-card-top">

                <div className="report-icon blue">

                  <FaRecycle />

                </div>

                <span className="growth positive">

                  <FaArrowUp />

                  {receivedRequests.length}

                </span>

              </div>


              <span className="report-card-label">

                Waste Received

              </span>


              <h2>

                {formatKg(
                  totalReceived
                )}

                <small>
                  {" "}Kg
                </small>

              </h2>


              <p>
                Approved, processing and
                completed waste
              </p>

            </div>



            {/* PROCESSED */}

            <div className="report-card">

              <div className="report-card-top">

                <div className="report-icon purple">

                  <FaIndustry />

                </div>

                <span className="growth positive">

                  <FaArrowUp />

                  {processingCount}

                </span>

              </div>


              <span className="report-card-label">

                Waste Processed

              </span>


              <h2>

                {formatKg(
                  totalProcessed
                )}

                <small>
                  {" "}Kg
                </small>

              </h2>


              <p>
                Processing + completed waste
              </p>

            </div>



            {/* RECOVERED */}

            <div className="report-card">

              <div className="report-card-top">

                <div className="report-icon green">

                  <FaWeightHanging />

                </div>

                <span className="growth positive">

                  <FaArrowUp />

                  {completedCount}

                </span>

              </div>


              <span className="report-card-label">

                Material Recovered

              </span>


              <h2>

                {formatKg(
                  totalRecovered
                )}

                <small>
                  {" "}Kg
                </small>

              </h2>


              <p>
                Completed waste quantity
              </p>

            </div>



            {/* RECOVERY RATE */}

            <div className="report-card">

              <div className="report-card-top">

                <div className="report-icon orange">

                  <FaLeaf />

                </div>

                <span className="growth positive">

                  <FaArrowUp />

                  {completedCount}

                </span>

              </div>


              <span className="report-card-label">

                Recovery Rate

              </span>


              <h2>

                {recoveryRate}

                <small>
                  %
                </small>

              </h2>


              <p>
                Completed / received waste
              </p>

            </div>


          </section>


          {/* ==================================================
              PERFORMANCE
          ================================================== */}

          <section className="performance-section">

            <div className="section-title">

              <div>

                <span>
                  PERFORMANCE OVERVIEW
                </span>

                <h2>
                  Recycling Performance
                </h2>

                <p>
                  Calculated from actual backend
                  waste quantities.
                </p>

              </div>


              <div className="performance-period">

                {period}

              </div>

            </div>


            <div className="performance-grid">


              {/* RECEIVED */}

              <div className="performance-item">

                <div className="performance-item-header">

                  <span>
                    Waste Received
                  </span>

                  <strong>
                    {formatKg(
                      periodReceived
                    )} Kg
                  </strong>

                </div>


                <div className="progress-track">

                  <div
                    className="progress blue-progress"
                    style={{
                      width:
                        `${Math.min(
                          periodReceived >
                            0
                            ? 100
                            : 0,
                          100
                        )}%`,
                    }}
                  />

                </div>


                <small>
                  {periodRequests.length} active/processed requests
                </small>

              </div>



              {/* PROCESSING */}

              <div className="performance-item">

                <div className="performance-item-header">

                  <span>
                    Processing
                  </span>

                  <strong>
                    {formatKg(
                      periodProcessed
                    )} Kg
                  </strong>

                </div>


                <div className="progress-track">

                  <div
                    className="progress purple-progress"
                    style={{
                      width:
                        `${periodProcessingRate}%`,
                    }}
                  />

                </div>


                <small>
                  {periodProcessingRate}% of received waste
                </small>

              </div>



              {/* RECOVERY */}

              <div className="performance-item">

                <div className="performance-item-header">

                  <span>
                    Recovery
                  </span>

                  <strong>
                    {formatKg(
                      periodRecovered
                    )} Kg
                  </strong>

                </div>


                <div className="progress-track">

                  <div
                    className="progress green-progress"
                    style={{
                      width:
                        `${periodRecoveryRate}%`,
                    }}
                  />

                </div>


                <small>
                  {periodRecoveryRate}% recovery efficiency
                </small>

              </div>


            </div>

          </section>


          {/* ==================================================
              REPORT HISTORY
          ================================================== */}

          <section className="reports-table-section">

            <div className="table-heading">

              <div>

                <span>
                  REPORT HISTORY
                </span>

                <h2>
                  Recycling Reports
                </h2>

              </div>

            </div>


            <div className="reports-table-wrapper">

              {loading ? (

                <div className="reports-empty">

                  <FaSyncAlt />

                  <h3>
                    Loading Reports...
                  </h3>

                </div>

              ) : reports.length === 0 ? (

                <div className="reports-empty">

                  <FaClipboardList />

                  <h3>
                    No Reports Available
                  </h3>

                  <p>
                    Backend waste request data
                    is not available yet.
                  </p>

                </div>

              ) : (

                <table className="reports-table">

                  <thead>

                    <tr>

                      <th>
                        Report ID
                      </th>

                      <th>
                        Period
                      </th>

                      <th>
                        Requests
                      </th>

                      <th>
                        Received
                      </th>

                      <th>
                        Processed
                      </th>

                      <th>
                        Recovered
                      </th>

                      <th>
                        Recovery Rate
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {reports.map(
                      (report) => (

                        <tr
                          key={
                            report.id
                          }
                        >

                          <td>

                            <strong className="report-id">

                              {report.id}

                            </strong>

                          </td>


                          <td>

                            {report.month}

                          </td>


                          <td>

                            {report.requests}

                          </td>


                          <td>

                            {formatKg(
                              report.received
                            )} Kg

                          </td>


                          <td>

                            {formatKg(
                              report.processed
                            )} Kg

                          </td>


                          <td>

                            <strong className="recovered-value">

                              {formatKg(
                                report.recovered
                              )} Kg

                            </strong>

                          </td>


                          <td>

                            <strong className="rate-value">

                              {report.recoveryRate}%

                            </strong>

                          </td>


                          <td>

                            <span
                              className={`report-status ${
                                report.status
                                  .toLowerCase()
                              }`}
                            >

                              {report.status}

                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              )}

            </div>

          </section>


          {/* ==================================================
              DATA EXPLANATION
          ================================================== */}

          <section className="report-insights">


            <div className="insight-card green-insight">

              <div className="insight-icon">

                <FaLeaf />

              </div>


              <div>

                <span>
                  MATERIAL RECOVERY
                </span>

                <h2>
                  {formatKg(
                    totalRecovered
                  )} Kg
                </h2>

                <p>
                  Total quantity from completed
                  recycling requests.
                </p>

              </div>

            </div>



            <div className="insight-card blue-insight">

              <div className="insight-icon">

                <FaRecycle />

              </div>


              <div>

                <span>
                  PROCESSING
                </span>

                <h2>
                  {formatKg(
                    totalProcessed
                  )} Kg
                </h2>

                <p>
                  Quantity currently processing
                  or already completed.
                </p>

              </div>

            </div>



            <div className="insight-card orange-insight">

              <div className="insight-icon">

                <FaArrowDown />

              </div>


              <div>

                <span>
                  RECOVERY EFFICIENCY
                </span>

                <h2>
                  {recoveryRate}%
                </h2>

                <p>
                  Completed quantity compared
                  with received quantity.
                </p>

              </div>

            </div>


          </section>


        </main>

      </div>

    </div>

  );

}


export default RecyclerReports;