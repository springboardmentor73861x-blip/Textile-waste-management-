import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
    FaClipboardList,
    FaSearch,
    FaEye,
    FaCheck,
    FaTimes,
    FaClock,
    FaRecycle,
    FaIndustry,
    FaSpinner,
} from "react-icons/fa";

import {
    getAllWasteRequests,
    updateWasteRequestStatus,
} from "../services/api";

import "../css/WasteRequests.css";


function WasteRequests() {

    // ========================================================
    // SIDEBAR
    // ========================================================

    const [collapsed, setCollapsed] = useState(false);


    // ========================================================
    // REQUEST DATA
    // ========================================================

    const [requests, setRequests] = useState([]);


    // ========================================================
    // UI STATE
    // ========================================================

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [updatingStatus, setUpdatingStatus] =
        useState(false);


    // ========================================================
    // LOAD REQUESTS
    // ========================================================

    const loadRequests = async () => {

        try {

            setLoading(true);

            setError("");

            const data =
                await getAllWasteRequests();

            console.log(
                "WASTE REQUESTS:",
                data
            );

            setRequests(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load waste requests:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Failed to load waste requests."
            );

        } finally {

            setLoading(false);

        }

    };


    // ========================================================
    // LOAD ON PAGE OPEN
    // ========================================================

    useEffect(() => {

        loadRequests();

    }, []);


    // ========================================================
    // SEARCH + FILTER
    // ========================================================

    const filteredRequests =
        requests.filter((request) => {

            const searchValue =
                search
                    .toLowerCase()
                    .trim();


            const manufacturer =
                String(
                    request.manufacturer ||
                    ""
                ).toLowerCase();


            const recycler =
                String(
                    request.recycler ||
                    ""
                ).toLowerCase();


            const material =
                String(
                    request.material ||
                    ""
                ).toLowerCase();


            const id =
                String(
                    request.id ||
                    ""
                );


            const matchesSearch =
                manufacturer.includes(
                    searchValue
                ) ||

                recycler.includes(
                    searchValue
                ) ||

                material.includes(
                    searchValue
                ) ||

                id.includes(
                    searchValue
                );


            const matchesStatus =
                statusFilter === "All" ||
                String(
                    request.status ||
                    ""
                ).toLowerCase() ===
                    statusFilter.toLowerCase();


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    // ========================================================
    // OPEN REQUEST
    // ========================================================

    const openRequest = (request) => {

        setSelectedRequest(request);

    };


    // ========================================================
    // CLOSE REQUEST
    // ========================================================

    const closeRequest = () => {

        if (!updatingStatus) {

            setSelectedRequest(null);

        }

    };


    // ========================================================
    // UPDATE STATUS
    // ========================================================

    const updateStatus = async (
        requestId,
        newStatus
    ) => {

        try {

            setUpdatingStatus(true);

            setError("");


            const updatedRequest =
                await updateWasteRequestStatus(
                    requestId,
                    newStatus
                );


            console.log(
                "UPDATED REQUEST:",
                updatedRequest
            );


            // ------------------------------------------------
            // Update table
            // ------------------------------------------------

            setRequests(
                (currentRequests) =>

                    currentRequests.map(
                        (request) =>

                            Number(request.id) ===
                            Number(requestId)

                                ? {
                                    ...request,

                                    status:
                                        updatedRequest?.status ||
                                        newStatus,
                                }

                                : request
                    )
            );


            // ------------------------------------------------
            // Update modal
            // ------------------------------------------------

            setSelectedRequest(
                (currentRequest) => {

                    if (
                        !currentRequest ||
                        Number(
                            currentRequest.id
                        ) !==
                        Number(requestId)
                    ) {

                        return currentRequest;

                    }


                    return {

                        ...currentRequest,

                        status:
                            updatedRequest?.status ||
                            newStatus,

                    };

                }
            );


        } catch (err) {

            console.error(
                "Failed to update request status:",
                err
            );


            setError(
                err.response?.data?.detail ||
                "Failed to update request status."
            );


        } finally {

            setUpdatingStatus(false);

        }

    };


    // ========================================================
    // STATUS CLASS
    // ========================================================

    const getStatusClass = (
        status
    ) => {

        return String(
            status || ""
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );

    };


    // ========================================================
    // STATISTICS
    // ========================================================

    const totalRequests =
        requests.length;


    const pendingRequests =
        requests.filter(
            (request) =>
                String(
                    request.status ||
                    ""
                ).toLowerCase() ===
                "pending"
        ).length;


    const approvedRequests =
        requests.filter(
            (request) =>
                String(
                    request.status ||
                    ""
                ).toLowerCase() ===
                "approved"
        ).length;


    const completedRequests =
        requests.filter(
            (request) =>
                String(
                    request.status ||
                    ""
                ).toLowerCase() ===
                "completed"
        ).length;


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="dashboard">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />


            {/* ==================================================
                CONTENT
            ================================================== */}

            <div
                className={`dashboard-content ${
                    collapsed
                        ? "collapsed"
                        : ""
                }`}
            >

                <Navbar />


                <main className="waste-requests-page">


                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="requests-header">

                        <div className="requests-header-left">

                            <div className="requests-title-icon">

                                <FaClipboardList />

                            </div>


                            <div>

                                <h1>
                                    Waste Requests
                                </h1>


                                <p>
                                    Manage textile waste collection
                                    and recycling requests.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="request-error">

                            <FaTimes />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* ==================================================
                        STATISTICS
                    ================================================== */}

                    <div className="request-statistics">


                        {/* TOTAL */}

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


                        {/* PENDING */}

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


                        {/* APPROVED */}

                        <div className="request-stat-card green">

                            <div className="request-stat-icon">

                                <FaCheck />

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


                        {/* COMPLETED */}

                        <div className="request-stat-card purple">

                            <div className="request-stat-icon">

                                <FaRecycle />

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

                    </div>


                    {/* ==================================================
                        TOOLBAR
                    ================================================== */}

                    <div className="requests-toolbar">


                        {/* SEARCH */}

                        <div className="request-search">

                            <FaSearch />


                            <input
                                type="text"
                                placeholder="Search manufacturer, recycler or material..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* FILTER */}

                        <div className="request-filter">

                            <label htmlFor="status-filter">

                                Status

                            </label>


                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
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


                    {/* ==================================================
                        TABLE CARD
                    ================================================== */}

                    <div className="requests-table-card">


                        {/* TABLE HEADER */}

                        <div className="requests-table-header">

                            <div>

                                <h2>
                                    Request List
                                </h2>


                                <p>

                                    {filteredRequests.length}

                                    {" "}

                                    request
                                    {filteredRequests.length !== 1
                                        ? "s"
                                        : ""
                                    }

                                    {" "}found

                                </p>

                            </div>

                        </div>


                        {/* ==================================================
                            TABLE
                        ================================================== */}

                        <div className="requests-table-wrapper">

                            <table className="requests-table">


                                {/* TABLE HEAD */}

                                <thead>

                                    <tr>

                                        <th>
                                            ID
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


                                {/* TABLE BODY */}

                                <tbody>


                                    {/* LOADING */}

                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="no-requests"
                                            >

                                                <FaSpinner
                                                    className="loading-spinner"
                                                />


                                                <h3>
                                                    Loading requests...
                                                </h3>


                                                <p>
                                                    Please wait.
                                                </p>

                                            </td>

                                        </tr>

                                    ) : filteredRequests.length === 0 ? (

                                        /* NO DATA */

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="no-requests"
                                            >

                                                <FaClipboardList />


                                                <h3>
                                                    No requests found
                                                </h3>


                                                <p>

                                                    {requests.length === 0
                                                        ? "There are no waste requests yet."
                                                        : "Try changing your search or status filter."
                                                    }

                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        /* DATA */

                                        filteredRequests.map(
                                            (request) => (

                                                <tr
                                                    key={
                                                        request.id
                                                    }
                                                >


                                                    {/* ID */}

                                                    <td>

                                                        <span className="request-id">

                                                            #
                                                            {
                                                                request.id
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* MANUFACTURER */}

                                                    <td>

                                                        <div className="company-cell">

                                                            <div className="company-icon manufacturer">

                                                                <FaIndustry />

                                                            </div>


                                                            <span>

                                                                {
                                                                    request.manufacturer ||
                                                                    "—"
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* RECYCLER */}

                                                    <td>

                                                        <div className="company-cell">

                                                            <div className="company-icon recycler">

                                                                <FaRecycle />

                                                            </div>


                                                            <span>

                                                                {
                                                                    request.recycler ||
                                                                    "—"
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* MATERIAL */}

                                                    <td>

                                                        <strong>

                                                            {
                                                                request.material ||
                                                                "—"
                                                            }

                                                        </strong>

                                                    </td>


                                                    {/* QUANTITY */}

                                                    <td>

                                                        <span className="quantity">

                                                            {
                                                                request.quantity ??
                                                                0
                                                            }

                                                            {" "}

                                                            {
                                                                request.unit ||
                                                                "Kg"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* DATE */}

                                                    <td>

                                                        {
                                                            request.requestDate ||
                                                            request.request_date ||
                                                            request.created_at
                                                                ? new Date(
                                                                    request.requestDate ||
                                                                    request.request_date ||
                                                                    request.created_at
                                                                ).toLocaleDateString(
                                                                    "en-IN",
                                                                    {
                                                                        day:
                                                                            "2-digit",
                                                                        month:
                                                                            "short",
                                                                        year:
                                                                            "numeric",
                                                                    }
                                                                )
                                                                : "—"
                                                        }

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`request-status ${getStatusClass(
                                                                request.status
                                                            )}`}
                                                        >

                                                            {
                                                                request.status ||
                                                                "Pending"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="view-request-btn"
                                                            onClick={() =>
                                                                openRequest(
                                                                    request
                                                                )
                                                            }
                                                            title="Open request"
                                                        >

                                                            <FaEye />

                                                            Open

                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </main>

            </div>


            {/* ==================================================
                REQUEST DETAILS MODAL
            ================================================== */}

            {selectedRequest && (

                <div
                    className="request-modal-overlay"
                    onClick={closeRequest}
                >


                    <div
                        className="request-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* ==================================================
                            MODAL HEADER
                        ================================================== */}

                        <div className="request-modal-header">

                            <div>

                                <h2>

                                    Waste Request #

                                    {
                                        selectedRequest.id
                                    }

                                </h2>


                                <p>
                                    Request details
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={closeRequest}
                                disabled={
                                    updatingStatus
                                }
                                aria-label="Close request"
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* ==================================================
                            REQUEST DETAILS
                        ================================================== */}

                        <div className="request-details">


                            {/* REQUEST ID */}

                            <div className="detail-item">

                                <span>
                                    Request ID
                                </span>


                                <strong>

                                    #
                                    {
                                        selectedRequest.id
                                    }

                                </strong>

                            </div>


                            {/* MANUFACTURER */}

                            <div className="detail-item">

                                <span>
                                    Manufacturer
                                </span>


                                <strong>

                                    {
                                        selectedRequest.manufacturer ||
                                        "—"
                                    }

                                </strong>

                            </div>


                            {/* RECYCLER */}

                            <div className="detail-item">

                                <span>
                                    Recycler
                                </span>


                                <strong>

                                    {
                                        selectedRequest.recycler ||
                                        "—"
                                    }

                                </strong>

                            </div>


                            {/* MATERIAL */}

                            <div className="detail-item">

                                <span>
                                    Material
                                </span>


                                <strong>

                                    {
                                        selectedRequest.material ||
                                        "—"
                                    }

                                </strong>

                            </div>


                            {/* QUANTITY */}

                            <div className="detail-item">

                                <span>
                                    Quantity
                                </span>


                                <strong>

                                    {
                                        selectedRequest.quantity ??
                                        0
                                    }

                                    {" "}

                                    {
                                        selectedRequest.unit ||
                                        "Kg"
                                    }

                                </strong>

                            </div>


                            {/* DATE */}

                            <div className="detail-item">

                                <span>
                                    Request Date
                                </span>


                                <strong>

                                    {
                                        selectedRequest.requestDate ||
                                        selectedRequest.request_date ||
                                        selectedRequest.created_at
                                            ? new Date(
                                                selectedRequest.requestDate ||
                                                selectedRequest.request_date ||
                                                selectedRequest.created_at
                                            ).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day:
                                                        "2-digit",
                                                    month:
                                                        "short",
                                                    year:
                                                        "numeric",
                                                }
                                            )
                                            : "—"
                                    }

                                </strong>

                            </div>


                            {/* STATUS */}

                            <div className="detail-item">

                                <span>
                                    Current Status
                                </span>


                                <strong>

                                    <span
                                        className={`request-status ${getStatusClass(
                                            selectedRequest.status
                                        )}`}
                                    >

                                        {
                                            selectedRequest.status ||
                                            "Pending"
                                        }

                                    </span>

                                </strong>

                            </div>


                            {/* NOTES */}

                            {selectedRequest.notes && (

                                <div className="detail-item">

                                    <span>
                                        Notes
                                    </span>


                                    <strong>
                                        {
                                            selectedRequest.notes
                                        }
                                    </strong>

                                </div>

                            )}

                        </div>


                        {/* ==================================================
                            MODAL ACTIONS
                        ================================================== */}

                        <div className="request-modal-actions">


                            {/* ==================================================
                                PENDING
                            ================================================== */}

                            {
                                String(
                                    selectedRequest.status ||
                                    ""
                                ).toLowerCase() ===
                                "pending" && (

                                    <>

                                        <button
                                            type="button"
                                            className="approve-btn"
                                            disabled={
                                                updatingStatus
                                            }
                                            onClick={() =>
                                                updateStatus(
                                                    selectedRequest.id,
                                                    "Approved"
                                                )
                                            }
                                        >

                                            {
                                                updatingStatus
                                                    ? <FaSpinner className="loading-spinner" />
                                                    : <FaCheck />
                                            }

                                            {
                                                updatingStatus
                                                    ? "Updating..."
                                                    : "Approve Request"
                                            }

                                        </button>


                                        <button
                                            type="button"
                                            className="reject-btn"
                                            disabled={
                                                updatingStatus
                                            }
                                            onClick={() =>
                                                updateStatus(
                                                    selectedRequest.id,
                                                    "Rejected"
                                                )
                                            }
                                        >

                                            <FaTimes />

                                            Reject Request

                                        </button>

                                    </>

                                )
                            }


                            {/* ==================================================
                                APPROVED
                            ================================================== */}

                            {
                                String(
                                    selectedRequest.status ||
                                    ""
                                ).toLowerCase() ===
                                "approved" && (

                                    <button
                                        type="button"
                                        className="processing-btn"
                                        disabled={
                                            updatingStatus
                                        }
                                        onClick={() =>
                                            updateStatus(
                                                selectedRequest.id,
                                                "Processing"
                                            )
                                        }
                                    >

                                        {
                                            updatingStatus
                                                ? <FaSpinner className="loading-spinner" />
                                                : <FaRecycle />
                                        }

                                        {
                                            updatingStatus
                                                ? "Updating..."
                                                : "Start Processing"
                                        }

                                    </button>

                                )
                            }


                            {/* ==================================================
                                PROCESSING
                            ================================================== */}

                            {
                                String(
                                    selectedRequest.status ||
                                    ""
                                ).toLowerCase() ===
                                "processing" && (

                                    <button
                                        type="button"
                                        className="complete-btn"
                                        disabled={
                                            updatingStatus
                                        }
                                        onClick={() =>
                                            updateStatus(
                                                selectedRequest.id,
                                                "Completed"
                                            )
                                        }
                                    >

                                        {
                                            updatingStatus
                                                ? <FaSpinner className="loading-spinner" />
                                                : <FaCheck />
                                        }

                                        {
                                            updatingStatus
                                                ? "Updating..."
                                                : "Mark Completed"
                                        }

                                    </button>

                                )
                            }


                            {/* ==================================================
                                COMPLETED / REJECTED
                            ================================================== */}

                            {
                                (
                                    String(
                                        selectedRequest.status ||
                                        ""
                                    ).toLowerCase() ===
                                    "completed"
                                    ||
                                    String(
                                        selectedRequest.status ||
                                        ""
                                    ).toLowerCase() ===
                                    "rejected"
                                ) && (

                                    <button
                                        type="button"
                                        className="close-modal-btn"
                                        onClick={
                                            closeRequest
                                        }
                                    >

                                        Close

                                    </button>

                                )
                            }

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default WasteRequests;