import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  getAllWaste,
  getAllWasteRequests,
} from "../services/api";

import {
  FaRecycle,
  FaBoxes,
  FaIndustry,
  FaRobot,
  FaFileAlt,
  FaClipboardList,
  FaArrowRight,
  FaEye,
  FaChartLine,
  FaWarehouse,
  FaCheckCircle,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import "../css/RecyclerDashboard.css";


function RecyclerDashboard() {

  const navigate = useNavigate();

  const [collapsed, setCollapsed] =
    useState(false);

  // ============================================================
  // BACKEND DATA
  // ============================================================

  const [wasteData, setWasteData] =
    useState([]);

  const [requestData, setRequestData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);


  // ============================================================
  // GET LOGGED-IN USER
  // ============================================================

  const getLoggedInUser = () => {

    try {

      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);

    } catch (err) {

      console.error(
        "FAILED TO READ USER:",
        err
      );

      return null;

    }

  };


  // ============================================================
  // NORMALIZE API RESPONSE
  // ============================================================

  const normalizeArray = (response) => {

    if (Array.isArray(response)) {
      return response;
    }

    if (
      response &&
      Array.isArray(response.items)
    ) {
      return response.items;
    }

    if (
      response &&
      Array.isArray(response.data)
    ) {
      return response.data;
    }

    if (
      response &&
      Array.isArray(response.results)
    ) {
      return response.results;
    }

    return [];

  };


  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  const getErrorMessage = (err) => {

    const detail =
      err?.response?.data?.detail;

    if (Array.isArray(detail)) {

      return detail
        .map(
          (item) =>
            item?.msg ||
            "Validation error"
        )
        .join(", ");

    }

    return (
      detail ||
      err?.message ||
      "Unable to load Recycler Dashboard data."
    );

  };


  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  const loadDashboardData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        wasteResponse,
        requestResponse,
      ] = await Promise.all([

        getAllWaste(),

        getAllWasteRequests(),

      ]);


      const wastes =
        normalizeArray(
          wasteResponse
        );

      const requests =
        normalizeArray(
          requestResponse
        );


      console.log(
        "RECYCLER DASHBOARD - WASTE:",
        wastes
      );

      console.log(
        "RECYCLER DASHBOARD - REQUESTS:",
        requests
      );


      setWasteData(wastes);

      setRequestData(requests);

      setLastUpdated(
        new Date()
      );


    } catch (err) {

      console.error(
        "RECYCLER DASHBOARD API ERROR:",
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadDashboardData();

  }, []);


  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {

    loadDashboardData();

  };


  // ============================================================
  // NAVIGATION
  // ============================================================

  const goToAvailableWaste = () => {

    navigate(
      "/available-waste"
    );

  };


  const goToProcessing = () => {

    navigate(
      "/processing"
    );

  };


  const goToRecovery = () => {

    navigate(
      "/recovery"
    );

  };


  const goToRequests = () => {

    navigate(
      "/recycler-requests"
    );

  };


  const goToReports = () => {

    navigate(
      "/recycler-reports"
    );

  };


  // ============================================================
  // SAFE NUMBER
  // ============================================================

  const toNumber = (value) => {

    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : 0;

  };


  // ============================================================
  // FORMAT KG
  // ============================================================

  const formatKg = (value) => {

    const number =
      toNumber(value);

    return number.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );

  };


  // ============================================================
  // STATUS NORMALIZER
  // ============================================================

  const getStatus = (item) => {

    return String(
      item?.status ||
      ""
    )
      .trim()
      .toLowerCase();

  };


  // ============================================================
  // MATERIAL NAME
  // ============================================================

  const getMaterial = (item) => {

    return (
      item?.fabric_type ||
      item?.material_type ||
      item?.waste_type ||
      item?.material ||
      item?.waste_category ||
      "Textile Waste"
    );

  };


  // ============================================================
  // MANUFACTURER NAME
  // ============================================================

  const getManufacturer = (item) => {

    return (
      item?.manufacturer_name ||
      item?.manufacturer ||
      item?.source ||
      item?.production_unit ||
      item?.location ||
      "Manufacturer"
    );

  };


  // ============================================================
  // QUANTITY
  // ============================================================

  const getQuantity = (item) => {

    return toNumber(
      item?.quantity
    );

  };


  // ============================================================
  // UNIT
  // ============================================================

  const getUnit = (item) => {

    return (
      item?.unit ||
      "Kg"
    );

  };


  // ============================================================
  // AVAILABLE WASTE
  // ============================================================

  const availableWaste =
    useMemo(() => {

      return wasteData.filter(
        (item) =>
          getStatus(item) ===
          "available"
      );

    }, [wasteData]);


  // ============================================================
  // PROCESSING WASTE
  // ============================================================

  const processingWaste =
    useMemo(() => {

      const processingStatuses = [
        "processing",
        "in progress",
        "in_progress",
        "approved",
        "accepted",
      ];

      return wasteData.filter(
        (item) =>
          processingStatuses.includes(
            getStatus(item)
          )
      );

    }, [wasteData]);


  // ============================================================
  // RECOVERED / COMPLETED WASTE
  // ============================================================

  const recoveredWaste =
    useMemo(() => {

      const recoveredStatuses = [
        "recovered",
        "completed",
        "recycled",
      ];

      return wasteData.filter(
        (item) =>
          recoveredStatuses.includes(
            getStatus(item)
          )
      );

    }, [wasteData]);


  // ============================================================
  // AVAILABLE KG
  // ============================================================

  const availableKg =
    useMemo(() => {

      return availableWaste.reduce(
        (total, item) =>
          total +
          getQuantity(item),
        0
      );

    }, [availableWaste]);


  // ============================================================
  // PROCESSING KG
  // ============================================================

  const processingKg =
    useMemo(() => {

      return processingWaste.reduce(
        (total, item) =>
          total +
          getQuantity(item),
        0
      );

    }, [processingWaste]);


  // ============================================================
  // RECOVERED KG
  // ============================================================

  const recoveredKg =
    useMemo(() => {

      return recoveredWaste.reduce(
        (total, item) =>
          total +
          getQuantity(item),
        0
      );

    }, [recoveredWaste]);


  // ============================================================
  // TOTAL WASTE KG
  // ============================================================

  const totalWasteKg =
    useMemo(() => {

      return wasteData.reduce(
        (total, item) =>
          total +
          getQuantity(item),
        0
      );

    }, [wasteData]);


  // ============================================================
  // RECYCLING RATE
  // ============================================================

  const recyclingRate =
    useMemo(() => {

      if (
        totalWasteKg <= 0
      ) {

        return 0;

      }

      return Math.min(
        100,
        (
          recoveredKg /
          totalWasteKg
        ) * 100
      );

    }, [
      recoveredKg,
      totalWasteKg,
    ]);


  // ============================================================
  // CURRENT USER
  // ============================================================

  const currentUser =
    useMemo(
      () =>
        getLoggedInUser(),
      []
    );


  // ============================================================
  // CURRENT RECYCLER REQUESTS
  // ============================================================

  const recyclerRequests =
    useMemo(() => {

      if (
        !currentUser
      ) {

        return requestData;

      }


      const recyclerName =
        String(
          currentUser?.full_name ||
          currentUser?.name ||
          currentUser?.email ||
          ""
        )
          .trim()
          .toLowerCase();


      if (!recyclerName) {

        return requestData;

      }


      const filtered =
        requestData.filter(
          (request) => {

            const requestRecycler =
              String(
                request?.recycler ||
                request?.recycler_name ||
                request?.recyclerName ||
                ""
              )
                .trim()
                .toLowerCase();

            return (
              !requestRecycler ||
              requestRecycler ===
              recyclerName
            );

          }
        );


      return filtered.length > 0
        ? filtered
        : requestData;

    }, [
      requestData,
      currentUser,
    ]);


  // ============================================================
  // ACTIVE REQUESTS
  // ============================================================

  const activeRequests =
    useMemo(() => {

      const inactiveStatuses = [
        "completed",
        "rejected",
        "cancelled",
        "canceled",
      ];

      return recyclerRequests.filter(
        (request) =>
          !inactiveStatuses.includes(
            getStatus(request)
          )
      );

    }, [recyclerRequests]);


  // ============================================================
  // WASTE RECEIVED
  // ============================================================

  const receivedKg =
    useMemo(() => {

      const receivedStatuses = [
        "approved",
        "accepted",
        "processing",
        "completed",
        "recovered",
        "recycled",
      ];


      return recyclerRequests
        .filter(
          (request) =>
            receivedStatuses.includes(
              getStatus(request)
            )
        )
        .reduce(
          (total, request) =>
            total +
            getQuantity(request),
          0
        );

    }, [recyclerRequests]);


  // ============================================================
  // RECENT WASTE
  // ============================================================

  const recentWaste =
    useMemo(() => {

      return [
        ...wasteData,
      ]
        .sort(
          (a, b) =>
            Number(b?.id || 0) -
            Number(a?.id || 0)
        )
        .slice(0, 5);

    }, [wasteData]);


  // ============================================================
  // AI ACCURACY
  //
  // If backend has an AI accuracy field, use it.
  // Otherwise show N/A instead of fake 96%.
  // ============================================================

  const aiAccuracy =
    useMemo(() => {

      const possibleValues = [
        ...wasteData,
        ...requestData,
      ];

      const item =
        possibleValues.find(
          (entry) =>
            entry?.ai_accuracy !==
              undefined ||
            entry?.aiAccuracy !==
              undefined
        );


      if (!item) {

        return null;

      }


      return toNumber(
        item?.ai_accuracy ??
        item?.aiAccuracy
      );

    }, [
      wasteData,
      requestData,
    ]);


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
          MAIN CONTENT
      ====================================================== */}

      <div
        className={`dashboard-content ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >

        <Navbar />


        <main className="recycler-dashboard">

          {/* ==================================================
              HERO
          ================================================== */}

          <section className="recycler-hero">

            <div className="recycler-hero-content">

              <div className="recycler-hero-icon">

                <FaRecycle />

              </div>


              <div>

                <span className="recycler-hero-label">

                  RECYCLER PORTAL

                </span>


                <h1>

                  Recycler Dashboard

                </h1>


                <p>

                  Monitor available textile waste,
                  recycling operations, recovery
                  performance and AI-powered insights.

                </p>

              </div>

            </div>


            <div className="recycler-hero-actions">

              <button
                type="button"
                className="recycler-refresh-btn"
                onClick={handleRefresh}
                disabled={loading}
              >

                <FaSyncAlt
                  className={
                    loading
                      ? "refresh-spinning"
                      : ""
                  }
                />

                {loading
                  ? "Refreshing..."
                  : "Refresh"}

              </button>


              <div className="recycler-system-status">

                <span className="recycler-status-dot"></span>

                System Active

              </div>

            </div>

          </section>


          {/* ==================================================
              LAST UPDATED
          ================================================== */}

          {lastUpdated && (

            <div className="recycler-last-updated">

              Last updated:

              {" "}

              {lastUpdated.toLocaleTimeString()}

            </div>

          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="recycler-dashboard-error">

              <FaExclamationCircle />

              <span>

                {error}

              </span>

              <button
                type="button"
                onClick={handleRefresh}
              >

                Retry

              </button>

            </div>

          )}


          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (

            <div className="recycler-dashboard-loading">

              <FaRecycle className="loading-spin" />

              <span>

                Loading dashboard data from backend...

              </span>

            </div>

          )}


          {/* ==================================================
              STATISTICS
          ================================================== */}

          <section className="recycler-stats-grid">


            {/* AVAILABLE */}

            <div className="recycler-stat-card blue">

              <div className="recycler-stat-top">

                <div className="recycler-stat-icon">

                  <FaRecycle />

                </div>


                <span className="recycler-stat-trend">

                  Live

                </span>

              </div>


              <div className="recycler-stat-content">

                <p>

                  Available Waste

                </p>


                <h2>

                  {formatKg(
                    availableKg
                  )}

                  {" "}

                  <small>

                    Kg

                  </small>

                </h2>

                <span className="recycler-stat-count">

                  {availableWaste.length}
                  {" "}
                  batches

                </span>

              </div>

            </div>


            {/* PROCESSING */}

            <div className="recycler-stat-card purple">

              <div className="recycler-stat-top">

                <div className="recycler-stat-icon">

                  <FaIndustry />

                </div>


                <span className="recycler-stat-trend">

                  Live

                </span>

              </div>


              <div className="recycler-stat-content">

                <p>

                  Processing

                </p>


                <h2>

                  {formatKg(
                    processingKg
                  )}

                  {" "}

                  <small>

                    Kg

                  </small>

                </h2>


                <span className="recycler-stat-count">

                  {processingWaste.length}
                  {" "}
                  batches

                </span>

              </div>

            </div>


            {/* RECOVERED */}

            <div className="recycler-stat-card green">

              <div className="recycler-stat-top">

                <div className="recycler-stat-icon">

                  <FaWarehouse />

                </div>


                <span className="recycler-stat-trend">

                  Live

                </span>

              </div>


              <div className="recycler-stat-content">

                <p>

                  Recovered Material

                </p>


                <h2>

                  {formatKg(
                    recoveredKg
                  )}

                  {" "}

                  <small>

                    Kg

                  </small>

                </h2>


                <span className="recycler-stat-count">

                  {recoveredWaste.length}
                  {" "}
                  batches

                </span>

              </div>

            </div>


            {/* RECYCLING RATE */}

            <div className="recycler-stat-card teal">

              <div className="recycler-stat-top">

                <div className="recycler-stat-icon">

                  <FaChartLine />

                </div>


                <span className="recycler-stat-trend">

                  Calculated

                </span>

              </div>


              <div className="recycler-stat-content">

                <p>

                  Recycling Rate

                </p>


                <h2>

                  {recyclingRate.toFixed(1)}

                  <small>

                    %

                  </small>

                </h2>


                <span className="recycler-stat-count">

                  From backend data

                </span>

              </div>

            </div>


            {/* AI ACCURACY */}

            <div className="recycler-stat-card orange">

              <div className="recycler-stat-top">

                <div className="recycler-stat-icon">

                  <FaRobot />

                </div>


                <span className="recycler-stat-trend">

                  AI

                </span>

              </div>


              <div className="recycler-stat-content">

                <p>

                  AI Accuracy

                </p>


                <h2>

                  {aiAccuracy === null
                    ? "N/A"
                    : `${aiAccuracy.toFixed(1)}`}

                  {aiAccuracy !== null && (

                    <small>

                      %

                    </small>

                  )}

                </h2>


                <span className="recycler-stat-count">

                  {aiAccuracy === null
                    ? "No AI metric in API"
                    : "Backend value"}

                </span>

              </div>

            </div>


            {/* REQUESTS */}

            <div className="recycler-stat-card red">

              <div className="recycler-stat-top">

                <div className="recycler-stat-icon">

                  <FaClipboardList />

                </div>


                <span className="recycler-stat-trend">

                  Live

                </span>

              </div>


              <div className="recycler-stat-content">

                <p>

                  Active Requests

                </p>


                <h2>

                  {activeRequests.length}

                </h2>


                <span className="recycler-stat-count">

                  Pending / active

                </span>

              </div>

            </div>


          </section>


          {/* ==================================================
              AVAILABLE WASTE ACTION
          ================================================== */}

          <section className="recycler-action-panel">

            <div className="recycler-action-left">

              <div className="recycler-action-icon">

                <FaRecycle />

              </div>


              <div>

                <span className="recycler-section-label">

                  WASTE MANAGEMENT

                </span>


                <h2>

                  Find Available Textile Waste

                </h2>


                <p>

                  Browse textile waste from manufacturers
                  and submit recycling requests.

                </p>

              </div>

            </div>


            <button
              type="button"
              className="recycler-primary-btn"
              onClick={
                goToAvailableWaste
              }
            >

              <FaRecycle />

              Browse Waste

              <FaArrowRight />

            </button>

          </section>


          {/* ==================================================
              ANALYTICS HEADER
          ================================================== */}

          <section className="recycler-section-heading">

            <div>

              <span className="recycler-section-label">

                OPERATIONS

              </span>


              <h2>

                Recycling Performance

              </h2>


              <p>

                Monitor your recycling and recovery
                operations using live backend data.

              </p>

            </div>


            <div className="recycler-heading-icon">

              <FaChartLine />

            </div>

          </section>


          {/* ==================================================
              PERFORMANCE
          ================================================== */}

          <section className="recycler-performance-grid">


            <div className="recycler-performance-card">

              <div className="recycler-performance-icon blue">

                <FaRecycle />

              </div>


              <div>

                <span>

                  Waste Received

                </span>


                <strong>

                  {formatKg(
                    receivedKg
                  )} Kg

                </strong>


                <small>

                  From recycling requests

                </small>

              </div>

            </div>


            <div className="recycler-performance-card">

              <div className="recycler-performance-icon purple">

                <FaIndustry />

              </div>


              <div>

                <span>

                  Currently Processing

                </span>


                <strong>

                  {formatKg(
                    processingKg
                  )} Kg

                </strong>


                <small>

                  {processingWaste.length}
                  {" "}
                  active batches

                </small>

              </div>

            </div>


            <div className="recycler-performance-card">

              <div className="recycler-performance-icon green">

                <FaWarehouse />

              </div>


              <div>

                <span>

                  Material Recovered

                </span>


                <strong>

                  {formatKg(
                    recoveredKg
                  )} Kg

                </strong>


                <small>

                  {recyclingRate.toFixed(1)}%
                  {" "}
                  recovery ratio

                </small>

              </div>

            </div>


          </section>


          {/* ==================================================
              RECENT WASTE
          ================================================== */}

          <section className="recycler-recent-section">


            <div className="recycler-section-header">

              <div>

                <span className="recycler-section-label">

                  ACTIVITY

                </span>


                <h2>

                  Recent Waste

                </h2>

              </div>


              <button
                type="button"
                className="recycler-view-all"
                onClick={
                  goToAvailableWaste
                }
              >

                <FaEye />

                View All

              </button>

            </div>


            <div className="recycler-table-container">

              {recentWaste.length === 0 ? (

                <div className="recycler-empty-state">

                  <FaBoxes />

                  <h3>

                    No Waste Data

                  </h3>

                  <p>

                    No waste records are available
                    from the backend.

                  </p>

                </div>

              ) : (

                <table className="recycler-table">

                  <thead>

                    <tr>

                      <th>

                        ID

                      </th>


                      <th>

                        Material

                      </th>


                      <th>

                        Quantity

                      </th>


                      <th>

                        Manufacturer

                      </th>


                      <th>

                        Status

                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {recentWaste.map(
                      (item) => {

                        const status =
                          getStatus(item);

                        const material =
                          getMaterial(item);

                        const manufacturer =
                          getManufacturer(item);

                        const quantity =
                          getQuantity(item);

                        const unit =
                          getUnit(item);


                        return (

                          <tr
                            key={
                              item.id
                            }
                          >

                            <td>

                              <span className="recycler-table-id">

                                #

                                {String(
                                  item.id ||
                                  "-"
                                ).padStart(
                                  3,
                                  "0"
                                )}

                              </span>

                            </td>


                            <td>

                              <div className="recycler-material">

                                <div className="recycler-material-icon">

                                  <FaBoxes />

                                </div>


                                <strong>

                                  {material}

                                </strong>

                              </div>

                            </td>


                            <td>

                              <strong>

                                {formatKg(
                                  quantity
                                )}

                                {" "}

                                {unit}

                              </strong>

                            </td>


                            <td>

                              {manufacturer}

                            </td>


                            <td>

                              <span
                                className={`recycler-waste-status ${
                                  status
                                    .replace(
                                      /\s+/g,
                                      "-"
                                    )
                                }`}
                              >

                                <span></span>

                                {item?.status ||
                                  "Unknown"}

                              </span>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              )}

            </div>

          </section>


          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <section className="recycler-quick-actions">


            <div className="recycler-section-header">

              <div>

                <span className="recycler-section-label">

                  SHORTCUTS

                </span>


                <h2>

                  Quick Actions

                </h2>

              </div>

            </div>


            <div className="recycler-action-buttons">


              {/* AVAILABLE WASTE */}

              <button
                type="button"
                className="recycler-action-btn"
                onClick={
                  goToAvailableWaste
                }
              >

                <span className="recycler-action-btn-icon blue">

                  <FaRecycle />

                </span>


                <span>

                  <strong>

                    Available Waste

                  </strong>


                  <small>

                    Browse manufacturer waste

                  </small>

                </span>


                <FaArrowRight className="recycler-action-arrow" />

              </button>


              {/* PROCESSING */}

              <button
                type="button"
                className="recycler-action-btn"
                onClick={
                  goToProcessing
                }
              >

                <span className="recycler-action-btn-icon purple">

                  <FaIndustry />

                </span>


                <span>

                  <strong>

                    Processing

                  </strong>


                  <small>

                    Manage active batches

                  </small>

                </span>


                <FaArrowRight className="recycler-action-arrow" />

              </button>


              {/* RECOVERY */}

              <button
                type="button"
                className="recycler-action-btn"
                onClick={
                  goToRecovery
                }
              >

                <span className="recycler-action-btn-icon green">

                  <FaWarehouse />

                </span>


                <span>

                  <strong>

                    Recovery

                  </strong>


                  <small>

                    View recovered materials

                  </small>

                </span>


                <FaArrowRight className="recycler-action-arrow" />

              </button>


              {/* REQUESTS */}

              <button
                type="button"
                className="recycler-action-btn"
                onClick={
                  goToRequests
                }
              >

                <span className="recycler-action-btn-icon orange">

                  <FaClipboardList />

                </span>


                <span>

                  <strong>

                    Recycling Requests

                  </strong>


                  <small>

                    Manage incoming requests

                  </small>

                </span>


                <FaArrowRight className="recycler-action-arrow" />

              </button>


              {/* REPORTS */}

              <button
                type="button"
                className="recycler-action-btn"
                onClick={
                  goToReports
                }
              >

                <span className="recycler-action-btn-icon red">

                  <FaFileAlt />

                </span>


                <span>

                  <strong>

                    Reports

                  </strong>


                  <small>

                    View recycling reports

                  </small>

                </span>


                <FaArrowRight className="recycler-action-arrow" />

              </button>


            </div>

          </section>


          {/* ==================================================
              SYSTEM NOTE
          ================================================== */}

          <div className="recycler-dashboard-note">

            <FaCheckCircle />

            <span>

              Recycler dashboard is connected to the
              FastAPI backend. Waste, processing,
              recovery and request statistics are
              calculated from live database records.

            </span>

          </div>


        </main>

      </div>

    </div>

  );

}


export default RecyclerDashboard;