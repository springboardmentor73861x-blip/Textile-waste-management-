import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import API from "../services/api";

import "../css/AdminProcessing.css";


function AdminProcessing() {

  const [collapsed, setCollapsed] = useState(false);

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [processingId, setProcessingId] = useState(null);


  // ============================================================
  // FETCH REQUESTS
  // ============================================================

  const fetchRequests = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await API.get(
        "/waste-requests/"
      );

      console.log(
        "ADMIN PROCESSING REQUESTS:",
        response.data
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "FETCH PROCESSING ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        error.message ||
        "Failed to load processing requests."
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {

    fetchRequests();

  }, []);


  // ============================================================
  // NORMALIZE STATUS
  // ============================================================

  const getStatus = (item) => {

    const status = String(
      item?.status || "Pending"
    )
      .trim()
      .toLowerCase();


    if (
      status === "approved" ||
      status === "accepted"
    ) {
      return "Approved";
    }


    if (
      status === "processing" ||
      status === "in progress"
    ) {
      return "Processing";
    }


    if (
      status === "completed" ||
      status === "complete"
    ) {
      return "Completed";
    }


    if (status === "rejected") {
      return "Rejected";
    }


    return "Pending";

  };


 // ============================================================
// PROGRESS
// ============================================================

const getProgress = (item) => {

  if (
    item.progress !== undefined &&
    item.progress !== null
  ) {

    return Number(item.progress);

  }

  const status =
    getStatus(item).toLowerCase();

  if (status === "completed") {

    return 100;

  }

  if (
    status === "processing" ||
    status === "in progress"
  ) {

    return 50;

  }

  return 0;

};
 // ============================================================
// START PROCESSING
// ============================================================

const startProcessing = async (item) => {

  try {

    setProcessingId(item.id);

    setError("");

    setMessage("");

    await API.patch(
      `/waste-requests/${item.id}/processing`,
      {
        machine: "Recycling Machine",
        progress: 0,
      }
    );

    setMessage(
      `Processing started for request #${item.id}.`
    );

    await fetchRequests();

  } catch (error) {

    console.error(
      "Start processing error:",
      error
    );

    setError(
      error.response?.data?.detail ||
      "Failed to start processing."
    );

  } finally {

    setProcessingId(null);

  }

};

 // ============================================================
// COMPLETE PROCESSING
// ============================================================

const completeProcessing = async (item) => {

  try {

    setProcessingId(item.id);

    setError("");

    setMessage("");

    await API.patch(
      `/waste-requests/${item.id}/processing`,
      {
        machine:
          item.machine ||
          "Recycling Machine",

        progress: 100,
      }
    );

    setMessage(
      `Processing completed for request #${item.id}.`
    );

    await fetchRequests();

  } catch (error) {

    console.error(
      "Complete processing error:",
      error
    );

    setError(
      error.response?.data?.detail ||
      "Failed to complete processing."
    );

  } finally {

    setProcessingId(null);

  }

};

  // ============================================================
  // REFRESH
  // ============================================================

  const refreshData = async () => {

    setMessage("");

    setError("");

    await fetchRequests();

  };


  // ============================================================
  // FILTER
  // ============================================================

  const filteredRequests =
    requests.filter((item) => {

      const status =
        getStatus(item);


      const material =
        item.material ||
        item.material_type ||
        item.waste_type ||
        "";


      const manufacturer =
        item.manufacturer ||
        item.manufacturer_name ||
        "";


      const recycler =
        item.recycler ||
        item.recycler_name ||
        "";


      const machine =
        item.machine ||
        "";


      const searchText = `
        ${item.id}
        ${material}
        ${manufacturer}
        ${recycler}
        ${machine}
        ${status}
      `
        .toLowerCase();


      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );


      const matchesStatus =
        statusFilter === "All" ||
        status.toLowerCase() ===
          statusFilter.toLowerCase();


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  // ============================================================
  // COUNTS
  // ============================================================

  const totalCount =
    requests.length;


  const approvedCount =
    requests.filter(
      (item) =>
        getStatus(item) === "Approved"
    ).length;


  const processingCount =
    requests.filter(
      (item) =>
        getStatus(item) === "Processing"
    ).length;


  const completedCount =
    requests.filter(
      (item) =>
        getStatus(item) === "Completed"
    ).length;


  // ============================================================
  // UI
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
          collapsed ? "collapsed" : ""
        }`}
      >

        <Navbar />


        <div className="admin-processing-container">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="admin-processing-header">

            <div>

              <h1>
                Processing Management
              </h1>

              <p>
                Admin controls and monitors textile waste processing.
              </p>

            </div>

          </div>


          {/* ==================================================
              TOOLBAR
          ================================================== */}

          <div className="processing-toolbar">


            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="processing-search"
            />


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="processing-filter"
            >

              <option value="All">
                All Status
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

              <option value="Pending">
                Pending
              </option>

            </select>


            <button
              type="button"
              className="refresh-btn"
              onClick={refreshData}
            >
              Refresh
            </button>

          </div>


          {/* ==================================================
              COUNTS
          ================================================== */}

          <div className="processing-stats">

            <div>
              <strong>
                Total
              </strong>

              <span>
                {totalCount}
              </span>
            </div>


            <div>
              <strong>
                Approved
              </strong>

              <span>
                {approvedCount}
              </span>
            </div>


            <div>
              <strong>
                Processing
              </strong>

              <span>
                {processingCount}
              </span>
            </div>


            <div>
              <strong>
                Completed
              </strong>

              <span>
                {completedCount}
              </span>
            </div>

          </div>


          {/* ==================================================
              SUCCESS
          ================================================== */}

          {message && (

            <div className="success-message">

              {message}

            </div>

          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="error-message">

              {error}

            </div>

          )}


          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="admin-processing-table-container">

            <table className="admin-processing-table">


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
                    Recycler
                  </th>

                  <th>
                    Machine
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Progress
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>


                {loading ? (

                  <tr>

                    <td
                      colSpan="9"
                      className="empty-cell"
                    >

                      Loading processing requests...

                    </td>

                  </tr>

                ) : filteredRequests.length === 0 ? (

                  <tr>

                    <td
                      colSpan="9"
                      className="empty-cell"
                    >

                      No processing requests found.

                    </td>

                  </tr>

                ) : (

                  filteredRequests.map(
                    (item) => {


                      const status =
                        getStatus(item);


                      const progress =
                        getProgress(item);


                      const material =
                        item.material ||
                        item.material_type ||
                        item.waste_type ||
                        "N/A";


                      const quantity =
                        item.quantity ?? 0;


                      const unit =
                        item.unit ||
                        "items";


                      const manufacturer =
                        item.manufacturer ||
                        item.manufacturer_name ||
                        "N/A";


                      const recycler =
                        item.recycler ||
                        item.recycler_name ||
                        "N/A";


                      const machine =
                        item.machine ||
                        "Not Assigned";


                      return (

                        <tr
                          key={item.id}
                        >


                          {/* ID */}

                          <td>

                            <strong>
                              #{item.id}
                            </strong>

                          </td>


                          {/* MATERIAL */}

                          <td>

                            <strong>
                              {material}
                            </strong>

                          </td>


                          {/* QUANTITY */}

                          <td>

                            {quantity} {unit}

                          </td>


                          {/* MANUFACTURER */}

                          <td>

                            {manufacturer}

                          </td>


                          {/* RECYCLER */}

                          <td>

                            {recycler}

                          </td>


                          {/* MACHINE */}

                          <td>

                            {machine}

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`status-badge ${
                                status
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )
                              }`}
                            >

                              {status}

                            </span>

                          </td>


                          {/* PROGRESS */}

                          <td>

                            <div className="progress-wrapper">

                              <div className="progress-bar">

                                <div
                                  className="progress-fill"
                                  style={{
                                    width:
                                      `${progress}%`,
                                  }}
                                />

                              </div>


                              <span>
                                {progress}%
                              </span>

                            </div>

                          </td>


                          {/* ACTION */}

                          <td>


                            {/* APPROVED */}

                            {status ===
                              "Approved" && (

                              <button
                                type="button"
                                className="start-btn"
                                disabled={
                                  processingId ===
                                  item.id
                                }
                                onClick={() =>
                                  startProcessing(
                                    item
                                  )
                                }
                              >

                                {processingId ===
                                item.id
                                  ? "Starting..."
                                  : "Start Processing"}

                              </button>

                            )}


                            {/* PROCESSING */}

                            {status ===
                              "Processing" && (

                              <button
                                type="button"
                                className="complete-btn"
                                disabled={
                                  processingId ===
                                  item.id
                                }
                                onClick={() =>
                                  completeProcessing(
                                    item
                                  )
                                }
                              >

                                {processingId ===
                                item.id
                                  ? "Completing..."
                                  : "Complete Processing"}

                              </button>

                            )}


                            {/* COMPLETED */}

                            {status ===
                              "Completed" && (

                              <span
                                className="completed-text"
                              >

                                ✓ Completed

                              </span>

                            )}


                            {/* PENDING */}

                            {status ===
                              "Pending" && (

                              <span
                                className="waiting-text"
                              >

                                Waiting for approval

                              </span>

                            )}

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}


export default AdminProcessing;