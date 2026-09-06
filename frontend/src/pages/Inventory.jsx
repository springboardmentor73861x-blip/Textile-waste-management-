import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
    FaBoxOpen,
    FaRecycle,
    FaSearch,
    FaFilter,
    FaEye,
    FaTrash,
    FaTimes,
    FaMapMarkerAlt,
    FaIndustry,
    FaWeightHanging,
    FaPalette,
    FaLayerGroup,
    FaCheckCircle,
    FaClock,
    FaBan,
} from "react-icons/fa";

import "../css/Inventory.css";


function Inventory() {

    // ============================================================
    // SIDEBAR
    // ============================================================

    const [collapsed, setCollapsed] = useState(false);


    // ============================================================
    // DATA
    // ============================================================

    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ============================================================
    // SEARCH / FILTER
    // ============================================================

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");


    // ============================================================
    // DETAILS MODAL
    // ============================================================

    const [selectedWaste, setSelectedWaste] = useState(null);


    // ============================================================
    // DELETE
    // ============================================================

    const [deletingId, setDeletingId] = useState(null);


    // ============================================================
    // FETCH INVENTORY
    // ============================================================

    const fetchInventory = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await API.get("/waste/");

            console.log(
                "INVENTORY API RESPONSE:",
                response.data
            );

            if (Array.isArray(response.data)) {

                setInventory(response.data);

            } else {

                setInventory([]);

            }

        } catch (error) {

            console.error(
                "INVENTORY FETCH ERROR:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load inventory data."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        fetchInventory();

    }, []);


    // ============================================================
    // HELPER
    // ============================================================

    const displayValue = (value, fallback = "Not specified") => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return fallback;

        }

        return value;

    };


    // ============================================================
    // STATUS CLASS
    // ============================================================

    const getStatusClass = (status) => {

        return String(status || "unknown")
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    // ============================================================
    // STATUS ICON
    // ============================================================

    const getStatusIcon = (status) => {

        const normalized =
            String(status || "")
                .toLowerCase();

        if (normalized === "available") {

            return <FaCheckCircle />;

        }

        if (
            normalized === "processing" ||
            normalized === "processed"
        ) {

            return <FaClock />;

        }

        if (normalized === "recycled") {

            return <FaRecycle />;

        }

        if (normalized === "disposed") {

            return <FaBan />;

        }

        return <FaBoxOpen />;

    };


    // ============================================================
    // FILTER INVENTORY
    // ============================================================

    const filteredInventory = useMemo(() => {

        const searchValue =
            search
                .toLowerCase()
                .trim();


        return inventory.filter((item) => {

            const searchableText = [

                item.id,

                item.waste_type,

                item.material_type,

                item.fabric_type,

                item.waste_category,

                item.source,

                item.status,

                item.location,

                item.color,

                item.condition,

            ]
                .filter(
                    (value) =>
                        value !== null &&
                        value !== undefined
                )
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                searchableText.includes(
                    searchValue
                );


            const matchesStatus =
                statusFilter === "All" ||
                String(item.status || "")
                    .toLowerCase() ===
                    statusFilter.toLowerCase();


            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }, [
        inventory,
        search,
        statusFilter,
    ]);


    // ============================================================
    // STATISTICS
    // ============================================================

    const totalWaste =
        inventory.length;


    const availableWaste =
        inventory.filter(
            (item) =>
                String(item.status || "")
                    .toLowerCase() ===
                "available"
        ).length;


    const processingWaste =
        inventory.filter(
            (item) =>
                String(item.status || "")
                    .toLowerCase() ===
                "processing"
        ).length;


    const recycledWaste =
        inventory.filter(
            (item) =>
                String(item.status || "")
                    .toLowerCase() ===
                "recycled"
        ).length;


    // ============================================================
    // DELETE WASTE
    // ============================================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this waste record?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setDeletingId(id);


            await API.delete(
                `/waste/${id}`
            );


            setInventory(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !== id
                    )
            );


            if (
                selectedWaste?.id === id
            ) {

                setSelectedWaste(null);

            }

        } catch (error) {

            console.error(
                "DELETE INVENTORY ERROR:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Unable to delete waste record."
            );

        } finally {

            setDeletingId(null);

        }

    };


    // ============================================================
    // VIEW DETAILS
    // ============================================================

    const openDetails = (item) => {

        setSelectedWaste(item);

    };


    // ============================================================
    // CLOSE DETAILS
    // ============================================================

    const closeDetails = () => {

        setSelectedWaste(null);

    };


    // ============================================================
    // RENDER
    // ============================================================

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
                className={
                    `dashboard-content ${
                        collapsed
                            ? "collapsed"
                            : ""
                    }`
                }
            >

                <Navbar />


                <main className="inventory-page">


                    {/* ==================================================
                        PAGE HEADER
                    ================================================== */}

                    <section className="inventory-header">

                        <div className="inventory-title">

                            <div className="inventory-title-icon">

                                <FaBoxOpen />

                            </div>


                            <div>

                                <h1>
                                    Waste Inventory
                                </h1>

                                <p>
                                    Manage and monitor uploaded
                                    textile waste materials.
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        STATISTICS
                    ================================================== */}

                    <section className="inventory-statistics">


                        {/* TOTAL */}

                        <div className="inventory-stat-card">

                            <div className="inventory-stat-icon total">

                                <FaBoxOpen />

                            </div>

                            <div className="inventory-stat-content">

                                <span>
                                    Total Waste
                                </span>

                                <strong>
                                    {totalWaste}
                                </strong>

                            </div>

                        </div>


                        {/* AVAILABLE */}

                        <div className="inventory-stat-card">

                            <div className="inventory-stat-icon available">

                                <FaCheckCircle />

                            </div>

                            <div className="inventory-stat-content">

                                <span>
                                    Available
                                </span>

                                <strong>
                                    {availableWaste}
                                </strong>

                            </div>

                        </div>


                        {/* PROCESSING */}

                        <div className="inventory-stat-card">

                            <div className="inventory-stat-icon processing">

                                <FaClock />

                            </div>

                            <div className="inventory-stat-content">

                                <span>
                                    Processing
                                </span>

                                <strong>
                                    {processingWaste}
                                </strong>

                            </div>

                        </div>


                        {/* RECYCLED */}

                        <div className="inventory-stat-card">

                            <div className="inventory-stat-icon recycled">

                                <FaRecycle />

                            </div>

                            <div className="inventory-stat-content">

                                <span>
                                    Recycled
                                </span>

                                <strong>
                                    {recycledWaste}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        TOOLBAR
                    ================================================== */}

                    <section className="inventory-toolbar">


                        {/* SEARCH */}

                        <div className="inventory-search">

                            <FaSearch />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search material, category, source, location..."
                            />

                        </div>


                        {/* STATUS FILTER */}

                        <div className="inventory-filter">

                            <FaFilter />

                            <select
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

                                <option value="Available">
                                    Available
                                </option>

                                <option value="Processing">
                                    Processing
                                </option>

                                <option value="Recycled">
                                    Recycled
                                </option>

                                <option value="Disposed">
                                    Disposed
                                </option>

                            </select>

                        </div>

                    </section>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="inventory-error">

                            {error}

                        </div>

                    )}


                    {/* ==================================================
                        INVENTORY CARD
                    ================================================== */}

                    <section className="inventory-card">


                        {/* CARD HEADER */}

                        <div className="inventory-card-header">

                            <div>

                                <h2>
                                    My Inventory
                                </h2>

                                <p>
                                    {filteredInventory.length}{" "}
                                    record
                                    {filteredInventory.length !== 1
                                        ? "s"
                                        : ""
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                className="inventory-refresh-btn"
                                onClick={fetchInventory}
                                disabled={loading}
                            >

                                {loading
                                    ? "Loading..."
                                    : "Refresh"
                                }

                            </button>

                        </div>


                        {/* ==================================================
                            TABLE
                        ================================================== */}

                        <div className="inventory-table-wrapper">

                            <table className="inventory-table">


                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            MATERIAL
                                        </th>

                                        <th>
                                            CATEGORY
                                        </th>

                                        <th>
                                            QUANTITY
                                        </th>

                                        <th>
                                            SOURCE
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                        <th>
                                            LOCATION
                                        </th>

                                        <th>
                                            ACTION
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {/* LOADING */}

                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="inventory-loading"
                                            >

                                                <div className="inventory-spinner">
                                                </div>

                                                <span>
                                                    Loading inventory...
                                                </span>

                                            </td>

                                        </tr>

                                    ) : filteredInventory.length === 0 ? (

                                        /* EMPTY */

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="no-inventory"
                                            >

                                                <FaBoxOpen />

                                                <h3>
                                                    No inventory records found
                                                </h3>

                                                <p>
                                                    Upload or add waste
                                                    records to see them here.
                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        /* DATA */

                                        filteredInventory.map(
                                            (item) => (

                                                <tr
                                                    key={item.id}
                                                >


                                                    {/* ID */}

                                                    <td>

                                                        <span className="inventory-id">
                                                            #{item.id}
                                                        </span>

                                                    </td>


                                                    {/* MATERIAL */}

                                                    <td>

                                                        <div className="material-cell">

                                                            <div className="material-icon">

                                                                <FaRecycle />

                                                            </div>

                                                            <div>

                                                                <strong>

                                                                    {
                                                                        displayValue(
                                                                            item.waste_type
                                                                        )
                                                                    }

                                                                </strong>


                                                                {item.material_type && (

                                                                    <span>

                                                                        {
                                                                            item.material_type
                                                                        }

                                                                    </span>

                                                                )}

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* CATEGORY */}

                                                    <td>

                                                        <span className="category-badge">

                                                            {
                                                                displayValue(
                                                                    item.waste_category
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* QUANTITY */}

                                                    <td>

                                                        <div className="quantity-cell">

                                                            <strong>

                                                                {
                                                                    displayValue(
                                                                        item.quantity,
                                                                        "0"
                                                                    )
                                                                }

                                                            </strong>

                                                            <span>

                                                                {
                                                                    displayValue(
                                                                        item.unit,
                                                                        ""
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* SOURCE */}

                                                    <td>

                                                        <div className="source-cell">

                                                            <FaIndustry />

                                                            <span>

                                                                {
                                                                    displayValue(
                                                                        item.source,
                                                                        "—"
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={
                                                                `status ${
                                                                    getStatusClass(
                                                                        item.status
                                                                    )
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                getStatusIcon(
                                                                    item.status
                                                                )
                                                            }

                                                            {
                                                                displayValue(
                                                                    item.status
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* LOCATION */}

                                                    <td>

                                                        <div className="location-cell">

                                                            <FaMapMarkerAlt />

                                                            <span>

                                                                {
                                                                    displayValue(
                                                                        item.location,
                                                                        "—"
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <div className="inventory-actions">


                                                            <button
                                                                type="button"
                                                                className="view-btn"
                                                                title="View details"
                                                                onClick={() =>
                                                                    openDetails(
                                                                        item
                                                                    )
                                                                }
                                                            >

                                                                <FaEye />

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="delete-btn"
                                                                title="Delete"
                                                                disabled={
                                                                    deletingId ===
                                                                    item.id
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id
                                                                    )
                                                                }
                                                            >

                                                                {deletingId ===
                                                                item.id ? (

                                                                    <span className="button-spinner">
                                                                    </span>

                                                                ) : (

                                                                    <FaTrash />

                                                                )}

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>

                </main>

            </div>


            {/* ============================================================
                DETAILS MODAL
            ============================================================ */}

            {selectedWaste && (

                <div
                    className="inventory-modal-overlay"
                    onClick={closeDetails}
                >

                    <div
                        className="inventory-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* MODAL HEADER */}

                        <div className="inventory-modal-header">

                            <div>

                                <span>
                                    Waste Record #{selectedWaste.id}
                                </span>

                                <h2>
                                    {
                                        displayValue(
                                            selectedWaste.waste_type
                                        )
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={closeDetails}
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <div className="inventory-details-grid">


                            <div className="detail-item">

                                <FaLayerGroup />

                                <div>

                                    <span>
                                        Material Type
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.material_type
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-item">

                                <FaRecycle />

                                <div>

                                    <span>
                                        Fabric Type
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.fabric_type
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-item">

                                <FaLayerGroup />

                                <div>

                                    <span>
                                        Waste Category
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.waste_category
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-item">

                                <FaWeightHanging />

                                <div>

                                    <span>
                                        Weight
                                    </span>

                                    <strong>

                                        {
                                            displayValue(
                                                selectedWaste.weight,
                                                "—"
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>


                            <div className="detail-item">

                                <FaPalette />

                                <div>

                                    <span>
                                        Color
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.color
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-item">

                                <FaCheckCircle />

                                <div>

                                    <span>
                                        Condition
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.condition
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-item">

                                <FaIndustry />

                                <div>

                                    <span>
                                        Source
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.source
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="detail-item">

                                <FaMapMarkerAlt />

                                <div>

                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.location
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                        </div>


                        {/* AI INFORMATION */}

                        <div className="inventory-ai-section">

                            <h3>
                                AI Analysis
                            </h3>


                            <div className="ai-grid">


                                <div>

                                    <span>
                                        Confidence
                                    </span>

                                    <strong>

                                        {
                                            selectedWaste.confidence !==
                                            null &&
                                            selectedWaste.confidence !==
                                            undefined

                                                ? `${(
                                                    Number(
                                                        selectedWaste.confidence
                                                    ) * 100
                                                ).toFixed(1)}%`

                                                : "Not available"
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Composition
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.composition
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Recyclability
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.recyclability
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Biodegradability
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.biodegradability
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Recommended Processing
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.recommended_processing
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Potential Reuse
                                    </span>

                                    <strong>
                                        {
                                            displayValue(
                                                selectedWaste.potential_reuse
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* NOTES */}

                        {selectedWaste.notes && (

                            <div className="inventory-notes">

                                <span>
                                    Notes
                                </span>

                                <p>
                                    {
                                        selectedWaste.notes
                                    }
                                </p>

                            </div>

                        )}


                    </div>

                </div>

            )}

        </div>

    );

}


export default Inventory;