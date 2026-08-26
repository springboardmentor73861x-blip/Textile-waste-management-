import {
  useMemo,
  useState,
  useEffect,
} from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  getAllWasteRequests,
  updateWasteRequestStatus,
} from "../services/api";

import {
  FaClipboardList,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaIndustry,
  FaRecycle,
  FaBoxes,
  FaSyncAlt,
} from "react-icons/fa";

import "../css/ManufacturerRequests.css";

function ManufacturerRequests() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [collapsed, setCollapsed] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");

  // ==========================================================
  // GET REQUESTS
  // ==========================================================

  const fetchRequests = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getAllWasteRequests();

      console.log(
        "WASTE REQUESTS FROM API:",
        data
      );

      setRequests(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "FAILED TO LOAD WASTE REQUESTS:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to load waste requests."
      );

      setRequests([]);

    } finally {

      setLoading(false);

    }

  };

  // ==========================================================
  // LOAD WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {

    fetchRequests();

  }, []);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredRequests = useMemo(() => {

    const query =
      search
        .trim()
        .toLowerCase();

    return requests.filter((request) => {

      const matchesSearch =

        String(
          request.id ?? ""
        )
          .toLowerCase()
          .includes(query) ||

        String(
          request.manufacturer ?? ""
        )
          .toLowerCase()
          .includes(query) ||

        String(
          request.recycler ?? ""
        )
          .toLowerCase()
          .includes(query) ||

        String(
          request.material ?? ""
        )
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        request.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

  }, [
    requests,
    search,
    statusFilter,
  ]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalRequests =
    requests.length;

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status === "Pending"
    ).length;

  const approvedRequests =
    requests.filter(
      (request) =>
        request.status === "Approved"
    ).length;

  const processingRequests =
    requests.filter(
      (request) =>
        request.status === "Processing"
    ).length;

  const completedRequests =
    requests.filter(
      (request) =>
        request.status === "Completed"
    ).length;

  // ==========================================================
  // CHANGE STATUS
  // ==========================================================

  const changeRequestStatus = async (
    requestId,
    newStatus
  ) => {

    try {

      setUpdating(true);
      setUpdatingId(requestId);
      setError("");

      console.log(
        "Updating request:",
        requestId,
        newStatus
      );

      // ------------------------------------------------------
      // UPDATE BACKEND
      // ------------------------------------------------------

      const updatedRequest =
        await updateWasteRequestStatus(
          requestId,
          newStatus
        );

      console.log(
        "UPDATED REQUEST:",
        updatedRequest
      );

      // ------------------------------------------------------
      // UPDATE FRONTEND IMMEDIATELY
      // ------------------------------------------------------

      setRequests(
        (currentRequests) =>
          currentRequests.map(
            (request) => {

              if (
                request.id === requestId
              ) {

                return {
                  ...request,
                  status:
                    updatedRequest?.status ||
                    newStatus,
                };

              }

              return request;

            }
          )
      );

      // ------------------------------------------------------
      // REFRESH BACKEND DATA
      // ------------------------------------------------------

      await fetchRequests();

    } catch (err) {

      console.error(
        "STATUS UPDATE ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to update request status."
      );

    } finally {

      setUpdating(false);
      setUpdatingId(null);

    }

  };

  // ==========================================================
  // APPROVE
  // ==========================================================

  const approveRequest = (
    requestId
  ) => {

    changeRequestStatus(
      requestId,
      "Approved"
    );

  };

  // ==========================================================
  // REJECT
  // ==========================================================

  const rejectRequest = (
    requestId
  ) => {

    changeRequestStatus(
      requestId,
      "Rejected"
    );

  };

  // ==========================================================
  // STATUS ICON
  // ==========================================================

  const getStatusIcon = (
    status
  ) => {

    switch (status) {

      case "Approved":

        return (
          <FaCheckCircle />
        );

      case "Processing":

        return (
          <FaSyncAlt />
        );

      case "Completed":

        return (
          <FaCheckCircle />
        );

      case "Rejected":

        return (
          <FaTimesCircle />
        );

      case "Pending":

      default:

        return (
          <FaClock />
        );

    }

  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {

    fetchRequests();

  };

  // ==========================================================
  // RENDER
  // ==========================================================

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
          collapsed ? "collapsed" : ""
        }`}
      >

        <Navbar />

        <main className="manufacturer-requests-page">

          {/* ==================================================
              HERO
          ================================================== */}

          <section className="requests-hero">

            <div className="requests-hero-content">

              <div className="requests-hero-icon">

                <FaClipboardList />

              </div>

              <div>

                <span className="requests-label">
                  MANUFACTURER PORTAL
                </span>

                <h1>
                  Waste Requests
                </h1>

                <p>
                  Manage waste collection
                  and recycling requests
                  from recycling partners.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="requests-refresh-btn"
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

            <div className="request-error">

              {error}

            </div>

          )}

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <section className="request-stats">

            <div className="request-stat-card blue">

              <div className="request-stat-icon">
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

            <div className="request-stat-card orange">

              <div className="request-stat-icon">
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

            <div className="request-stat-card green">

              <div className="request-stat-icon">
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

            <div className="request-stat-card purple">

              <div className="request-stat-icon">
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

            <div className="request-stat-card teal">

              <div className="request-stat-icon">
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

          </section>

          {/* ==================================================
              REQUEST PANEL
          ================================================== */}

          <section className="requests-panel">

            <div className="requests-panel-header">

              <div>

                <h2>

                  <FaClipboardList />

                  Recycling Requests

                </h2>

                <p>
                  Approve or reject requests
                  received from recyclers.
                </p>

              </div>

            </div>

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="requests-filters">

              <div className="request-search">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search manufacturer, recycler, material or request ID..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="request-filter">

                <FaFilter />

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

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="requests-table-wrapper">

              {loading ? (

                <div className="no-requests">

                  <FaSyncAlt />

                  <h3>
                    Loading Requests...
                  </h3>

                  <p>
                    Fetching data from
                    the database.
                  </p>

                </div>

              ) : filteredRequests.length === 0 ? (

                <div className="no-requests">

                  <FaClipboardList />

                  <h3>
                    No Requests Found
                  </h3>

                  <p>
                    Try changing your
                    search or filter.
                  </p>

                </div>

              ) : (

                <table className="requests-table">

                  <thead>

                    <tr>

                      <th>
                        Request ID
                      </th>

                      <th>
                        Manufacturer
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
                        Status
                      </th>

                      <th className="action-column">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredRequests.map(
                      (request) => {

                        const isPending =
                          request.status ===
                          "Pending";

                        const isUpdating =
                          updating &&
                          updatingId ===
                          request.id;

                        return (

                          <tr
                            key={
                              request.id
                            }
                          >

                            {/* REQUEST ID */}

                            <td>

                              <span
                                className="request-id"
                              >

                                #
                                {request.id}

                              </span>

                            </td>

                            {/* MANUFACTURER */}

                            <td>

                              <div className="recycler-info">

                                <div className="recycler-icon">

                                  <FaIndustry />

                                </div>

                                <div>

                                  <strong>

                                    {
                                      request.manufacturer ||
                                      "-"
                                    }

                                  </strong>

                                </div>

                              </div>

                            </td>

                            {/* RECYCLER */}

                            <td>

                              <div className="recycler-info">

                                <div className="recycler-icon recycler-icon-green">

                                  <FaRecycle />

                                </div>

                                <div>

                                  <strong>

                                    {
                                      request.recycler ||
                                      "-"
                                    }

                                  </strong>

                                </div>

                              </div>

                            </td>

                            {/* MATERIAL */}

                            <td>

                              <div className="material-info">

                                <FaBoxes />

                                <span>

                                  {
                                    request.material ||
                                    "-"
                                  }

                                </span>

                              </div>

                            </td>

                            {/* QUANTITY */}

                            <td>

                              <strong className="quantity-value">

                                {
                                  request.quantity ??
                                  0
                                }

                                {" "}

                                {
                                  request.unit ||
                                  "Kg"
                                }

                              </strong>

                            </td>

                            {/* STATUS */}

                            <td>

                              <span
                                className={`request-status ${
                                  String(
                                    request.status ||
                                    "Pending"
                                  ).toLowerCase()
                                }`}
                              >

                                {
                                  getStatusIcon(
                                    request.status
                                  )
                                }

                                {
                                  request.status ||
                                  "Pending"
                                }

                              </span>

                            </td>

                            {/* ACTION */}

                            <td className="request-action-cell">

                              {isPending ? (

                                <div className="request-action-group">

                                  <button
                                    type="button"
                                    className="request-action-btn reject-action"
                                    disabled={
                                      updating
                                    }
                                    onClick={() =>
                                      rejectRequest(
                                        request.id
                                      )
                                    }
                                  >

                                    <FaTimesCircle />

                                    <span>

                                      {isUpdating
                                        ? "Updating..."
                                        : "Reject"}

                                    </span>

                                  </button>

                                  <button
                                    type="button"
                                    className="request-action-btn approve-action"
                                    disabled={
                                      updating
                                    }
                                    onClick={() =>
                                      approveRequest(
                                        request.id
                                      )
                                    }
                                  >

                                    <FaCheckCircle />

                                    <span>

                                      {isUpdating
                                        ? "Updating..."
                                        : "Approve"}

                                    </span>

                                  </button>

                                </div>

                              ) : (

                                <div className="action-completed">

                                  <span>
                                    No Action Required
                                  </span>

                                </div>

                              )}

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
              INFORMATION
          ================================================== */}

          <section className="request-info-card">

            <div className="request-info-icon">

              <FaIndustry />

            </div>

            <div>

              <h3>
                Request Management
              </h3>

              <p>

                Review recycler requests
                carefully before approving
                waste transfers. Approved
                requests can proceed to
                the recycling workflow.

              </p>

            </div>

          </section>

        </main>

      </div>

    </div>

  );

}

export default ManufacturerRequests;