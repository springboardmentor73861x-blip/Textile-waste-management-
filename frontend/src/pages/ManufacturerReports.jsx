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
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaRecycle,
  FaTimesCircle,
  FaBoxes,
  FaSearch,
  FaSyncAlt,
  FaIndustry,
} from "react-icons/fa";

import "../css/ManufacturerReports.css";


function ManufacturerReports() {

  const [collapsed, setCollapsed] =
    useState(false);

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");


  // ============================================================
  // FETCH REQUESTS
  // ============================================================

  const fetchReports = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await API.get("/waste-requests/");

      console.log(
        "REPORT REQUESTS:",
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
        "REPORT FETCH ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to load reports."
      );

      setRequests([]);

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // LOAD
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


  const getMaterial = (item) => {

    return (
      item?.material ||
      item?.material_type ||
      item?.waste_type ||
      "Unknown"
    );

  };


  const getQuantity = (item) => {

    const value =
      Number(
        item?.quantity ??
        item?.requested_quantity ??
        item?.amount ??
        item?.weight ??
        0
      );

    return Number.isNaN(value)
      ? 0
      : value;

  };


  const getUnit = (item) => {

    return item?.unit || "Kg";

  };


  const getRecycler = (item) => {

    return (
      item?.recycler ||
      item?.recycler_name ||
      item?.recycler_company ||
      "Recycler"
    );

  };


  const getDate = (item) => {

    const value =
      item?.created_at ||
      item?.request_date ||
      item?.requested_at ||
      item?.date;

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ============================================================
  // NORMALIZE
  // ============================================================

  const normalizedRequests =
    useMemo(() => {

      return requests.map(
        (item) => ({

          ...item,

          reportStatus:
            getStatus(item),

          reportMaterial:
            getMaterial(item),

          reportQuantity:
            getQuantity(item),

          reportUnit:
            getUnit(item),

          reportRecycler:
            getRecycler(item),

          reportDate:
            getDate(item),

        })
      );

    }, [requests]);


  // ============================================================
  // STATISTICS
  // ============================================================

  const totalRequests =
    normalizedRequests.length;

  const pendingRequests =
    normalizedRequests.filter(
      (item) =>
        item.reportStatus === "Pending"
    ).length;

  const approvedRequests =
    normalizedRequests.filter(
      (item) =>
        item.reportStatus === "Approved"
    ).length;

  const processingRequests =
    normalizedRequests.filter(
      (item) =>
        item.reportStatus === "Processing"
    ).length;

  const completedRequests =
    normalizedRequests.filter(
      (item) =>
        item.reportStatus === "Completed"
    ).length;

  const rejectedRequests =
    normalizedRequests.filter(
      (item) =>
        item.reportStatus === "Rejected"
    ).length;


  // ============================================================
  // QUANTITY
  // ============================================================

  const totalQuantity =
    normalizedRequests.reduce(
      (sum, item) =>
        sum + item.reportQuantity,
      0
    );

  const completedQuantity =
    normalizedRequests
      .filter(
        (item) =>
          item.reportStatus === "Completed"
      )
      .reduce(
        (sum, item) =>
          sum + item.reportQuantity,
        0
      );


  // ============================================================
  // COMPLETION RATE
  // ============================================================

  const completionRate =
    totalQuantity > 0
      ? Math.round(
          (completedQuantity /
            totalQuantity) *
            100
        )
      : 0;


  // ============================================================
  // STATUS PERCENTAGE
  // ============================================================

  const getPercentage = (value) => {

    if (totalRequests === 0) {
      return 0;
    }

    return Math.round(
      (value / totalRequests) * 100
    );

  };


  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const filteredRequests =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return normalizedRequests.filter(
        (item) => {

          const matchesSearch =

            String(item.id || "")
              .toLowerCase()
              .includes(query)

            ||

            item.reportMaterial
              .toLowerCase()
              .includes(query)

            ||

            item.reportRecycler
              .toLowerCase()
              .includes(query);


          const matchesStatus =
            statusFilter === "All" ||
            item.reportStatus ===
              statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      normalizedRequests,
      search,
      statusFilter,
    ]);


  // ============================================================
  // MATERIAL REPORT
  // ============================================================

  const materialReport =
    useMemo(() => {

      const result = {};

      normalizedRequests.forEach(
        (item) => {

          const material =
            item.reportMaterial;

          if (!result[material]) {

            result[material] = {

              material,

              requests: 0,

              quantity: 0,

              completed: 0,

            };

          }

          result[material].requests += 1;

          result[material].quantity +=
            item.reportQuantity;

          if (
            item.reportStatus ===
            "Completed"
          ) {

            result[material].completed +=
              item.reportQuantity;

          }

        }
      );

      return Object.values(result);

    }, [normalizedRequests]);


  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {

    fetchReports();

  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div
        className={`dashboard-content ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >

        <Navbar />


        <main className="manufacturer-reports-page">


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="reports-header">

            <div className="reports-title-area">

              <div className="reports-title-icon">

                <FaChartBar />

              </div>

              <div>

                <span className="reports-label">

                  MANUFACTURER PORTAL

                </span>

                <h1>
                  Waste Reports
                </h1>

                <p>
                  Monitor waste requests,
                  processing and recycling
                  performance.
                </p>

              </div>

            </div>


            <button
              type="button"
              className="reports-refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >

              <FaSyncAlt />

              {loading
                ? "Loading..."
                : "Refresh"}

            </button>

          </section>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="reports-error">

              {error}

            </div>

          )}


          {/* ==================================================
              STAT CARDS
          ================================================== */}

          <section className="reports-stats">


            <div className="report-card blue">

              <div className="report-card-icon">

                <FaClipboardList />

              </div>

              <div>

                <span>
                  Total Requests
                </span>

                <strong>
                  {totalRequests}
                </strong>

              </div>

            </div>


            <div className="report-card orange">

              <div className="report-card-icon">

                <FaClock />

              </div>

              <div>

                <span>
                  Pending
                </span>

                <strong>
                  {pendingRequests}
                </strong>

              </div>

            </div>


            <div className="report-card green">

              <div className="report-card-icon">

                <FaCheckCircle />

              </div>

              <div>

                <span>
                  Approved
                </span>

                <strong>
                  {approvedRequests}
                </strong>

              </div>

            </div>


            <div className="report-card purple">

              <div className="report-card-icon">

                <FaRecycle />

              </div>

              <div>

                <span>
                  Processing
                </span>

                <strong>
                  {processingRequests}
                </strong>

              </div>

            </div>


            <div className="report-card teal">

              <div className="report-card-icon">

                <FaCheckCircle />

              </div>

              <div>

                <span>
                  Completed
                </span>

                <strong>
                  {completedRequests}
                </strong>

              </div>

            </div>


            <div className="report-card red">

              <div className="report-card-icon">

                <FaTimesCircle />

              </div>

              <div>

                <span>
                  Rejected
                </span>

                <strong>
                  {rejectedRequests}
                </strong>

              </div>

            </div>


          </section>


          {/* ==================================================
              QUANTITY CARDS
          ================================================== */}

          <section className="quantity-cards">


            <div className="quantity-card">

              <div className="quantity-icon">

                <FaBoxes />

              </div>

              <div>

                <span>
                  Total Waste
                </span>

                <strong>
                  {totalQuantity.toLocaleString()} Kg
                </strong>

              </div>

            </div>


            <div className="quantity-card">

              <div className="quantity-icon">

                <FaRecycle />

              </div>

              <div>

                <span>
                  Completed Waste
                </span>

                <strong>
                  {completedQuantity.toLocaleString()} Kg
                </strong>

              </div>

            </div>


            <div className="quantity-card">

              <div className="quantity-icon">

                <FaChartBar />

              </div>

              <div>

                <span>
                  Completion Rate
                </span>

                <strong>
                  {completionRate}%
                </strong>

              </div>

            </div>


          </section>


          {/* ==================================================
              STATUS OVERVIEW
          ================================================== */}

          <section className="reports-panel">

            <div className="reports-panel-header">

              <div>

                <h2>
                  Request Status Overview
                </h2>

                <p>
                  Current status distribution
                  of your waste requests.
                </p>

              </div>

            </div>


            <div className="status-overview">


              {/* Pending */}

              <div className="status-row">

                <div className="status-row-top">

                  <span>
                    Pending
                  </span>

                  <strong>
                    {getPercentage(
                      pendingRequests
                    )}%
                  </strong>

                </div>

                <div className="status-progress">

                  <div
                    className="status-progress-fill pending"
                    style={{
                      width:
                        `${getPercentage(
                          pendingRequests
                        )}%`,
                    }}
                  />

                </div>

              </div>


              {/* Approved */}

              <div className="status-row">

                <div className="status-row-top">

                  <span>
                    Approved
                  </span>

                  <strong>
                    {getPercentage(
                      approvedRequests
                    )}%
                  </strong>

                </div>

                <div className="status-progress">

                  <div
                    className="status-progress-fill approved"
                    style={{
                      width:
                        `${getPercentage(
                          approvedRequests
                        )}%`,
                    }}
                  />

                </div>

              </div>


              {/* Processing */}

              <div className="status-row">

                <div className="status-row-top">

                  <span>
                    Processing
                  </span>

                  <strong>
                    {getPercentage(
                      processingRequests
                    )}%
                  </strong>

                </div>

                <div className="status-progress">

                  <div
                    className="status-progress-fill processing"
                    style={{
                      width:
                        `${getPercentage(
                          processingRequests
                        )}%`,
                    }}
                  />

                </div>

              </div>


              {/* Completed */}

              <div className="status-row">

                <div className="status-row-top">

                  <span>
                    Completed
                  </span>

                  <strong>
                    {getPercentage(
                      completedRequests
                    )}%
                  </strong>

                </div>

                <div className="status-progress">

                  <div
                    className="status-progress-fill completed"
                    style={{
                      width:
                        `${getPercentage(
                          completedRequests
                        )}%`,
                    }}
                  />

                </div>

              </div>


              {/* Rejected */}

              <div className="status-row">

                <div className="status-row-top">

                  <span>
                    Rejected
                  </span>

                  <strong>
                    {getPercentage(
                      rejectedRequests
                    )}%
                  </strong>

                </div>

                <div className="status-progress">

                  <div
                    className="status-progress-fill rejected"
                    style={{
                      width:
                        `${getPercentage(
                          rejectedRequests
                        )}%`,
                    }}
                  />

                </div>

              </div>


            </div>

          </section>


          {/* ==================================================
              MATERIAL REPORT
          ================================================== */}

          <section className="reports-panel">

            <div className="reports-panel-header">

              <div>

                <h2>
                  Material Report
                </h2>

                <p>
                  Waste quantity and completed
                  quantity by material.
                </p>

              </div>

            </div>


            <div className="reports-table-wrapper">

              <table className="reports-table">

                <thead>

                  <tr>

                    <th>
                      Material
                    </th>

                    <th>
                      Requests
                    </th>

                    <th>
                      Total Quantity
                    </th>

                    <th>
                      Completed Quantity
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {materialReport.length === 0 ? (

                    <tr>

                      <td
                        colSpan="4"
                        className="empty-cell"
                      >
                        No material data available.
                      </td>

                    </tr>

                  ) : (

                    materialReport.map(
                      (item) => (

                        <tr
                          key={
                            item.material
                          }
                        >

                          <td>

                            <div className="material-name">

                              <FaBoxes />

                              <strong>
                                {item.material}
                              </strong>

                            </div>

                          </td>

                          <td>
                            {item.requests}
                          </td>

                          <td>
                            {item.quantity.toLocaleString()} Kg
                          </td>

                          <td>
                            {item.completed.toLocaleString()} Kg
                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>


          {/* ==================================================
              DETAILED REPORT
          ================================================== */}

          <section className="reports-panel">

            <div className="reports-panel-header">

              <div>

                <h2>
                  Request Details
                </h2>

                <p>
                  Detailed report of waste
                  requests.
                </p>

              </div>

            </div>


            {/* FILTER */}

            <div className="reports-toolbar">

              <div className="reports-search">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search request, material or recycler..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>


              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Status
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Processing">
                  Processing
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Rejected">
                  Rejected
                </option>

              </select>

            </div>


            {/* TABLE */}

            <div className="reports-table-wrapper">

              {loading ? (

                <div className="reports-empty">

                  <FaSyncAlt />

                  <h3>
                    Loading Reports...
                  </h3>

                </div>

              ) : filteredRequests.length === 0 ? (

                <div className="reports-empty">

                  <FaClipboardList />

                  <h3>
                    No Reports Found
                  </h3>

                  <p>
                    No waste requests match
                    the selected filters.
                  </p>

                </div>

              ) : (

                <table className="reports-table">

                  <thead>

                    <tr>

                      <th>
                        Request ID
                      </th>

                      <th>
                        Recycler
                      </th>

                      <th>
                        Material
                      </th>

                      <th>
                        Quantity
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredRequests.map(
                      (item) => (

                        <tr
                          key={item.id}
                        >

                          <td>

                            <strong>
                              #{item.id}
                            </strong>

                          </td>


                          <td>

                            <div className="recycler-name">

                              <FaRecycle />

                              {item.reportRecycler}

                            </div>

                          </td>


                          <td>

                            {item.reportMaterial}

                          </td>


                          <td>

                            <strong>

                              {item.reportQuantity}{" "}
                              {item.reportUnit}

                            </strong>

                          </td>


                          <td>

                            {item.reportDate}

                          </td>


                          <td>

                            <span
                              className={`report-status ${item.reportStatus
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >

                              {item.reportStatus}

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
              INFORMATION
          ================================================== */}

          <section className="reports-info">

            <div className="reports-info-icon">

              <FaIndustry />

            </div>

            <div>

              <h3>
                Manufacturer Waste Analytics
              </h3>

              <p>

                This report is connected to
                your waste request workflow.
                When requests are approved,
                processed or completed,
                the report automatically
                reflects the latest status.

              </p>

            </div>

          </section>


        </main>

      </div>

    </div>

  );

}


export default ManufacturerReports;