import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
    FaRecycle,
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash,
    FaTimes,
    FaSave,
    FaBoxOpen,
    FaSyncAlt,
    FaIndustry,
    FaCogs,
} from "react-icons/fa";

import "../css/ProductionWaste.css";


function ProductionWaste() {

    // ============================================================
    // SIDEBAR
    // ============================================================

    const [collapsed, setCollapsed] = useState(false);


    // ============================================================
    // DATA
    // ============================================================

    const [waste, setWaste] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ============================================================
    // SEARCH / FILTER
    // ============================================================

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");


    // ============================================================
    // MODAL
    // ============================================================

    const [showModal, setShowModal] = useState(false);

    const [editingWaste, setEditingWaste] = useState(null);

    const [saving, setSaving] = useState(false);


    // ============================================================
    // FORM
    // ============================================================

    const [formData, setFormData] = useState({
        waste_type: "",
        quantity: "",
        unit: "Kg",
        location: "",
        status: "Available",
    });


    // ============================================================
    // FETCH WASTE
    // ============================================================

    const fetchWaste = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await API.get("/waste/");

            console.log(
                "PRODUCTION WASTE RESPONSE:",
                response.data
            );

            if (Array.isArray(response.data)) {

                setWaste(response.data);

            } else {

                setWaste([]);

            }

        } catch (err) {

            console.error(
                "PRODUCTION WASTE FETCH ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load production waste."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        fetchWaste();

    }, []);


    // ============================================================
    // INPUT CHANGE
    // ============================================================

    const handleInputChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    // ============================================================
    // OPEN ADD MODAL
    // ============================================================

    const openAddModal = () => {

        setEditingWaste(null);

        setFormData({
            waste_type: "",
            quantity: "",
            unit: "Kg",
            location: "",
            status: "Available",
        });

        setError("");

        setShowModal(true);

    };


    // ============================================================
    // OPEN EDIT MODAL
    // ============================================================

    const openEditModal = (item) => {

        setEditingWaste(item);

        setFormData({
            waste_type: item.waste_type || "",
            quantity: item.quantity ?? "",
            unit: item.unit || "Kg",
            location: item.location || "",
            status: item.status || "Available",
        });

        setError("");

        setShowModal(true);

    };


    // ============================================================
    // CLOSE MODAL
    // ============================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingWaste(null);

        setFormData({
            waste_type: "",
            quantity: "",
            unit: "Kg",
            location: "",
            status: "Available",
        });

    };


    // ============================================================
    // SAVE WASTE
    // ============================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!formData.waste_type.trim()) {

            alert("Please enter waste type.");

            return;

        }


        if (
            formData.quantity === "" ||
            Number(formData.quantity) <= 0
        ) {

            alert("Please enter a quantity greater than 0.");

            return;

        }


        if (!formData.location.trim()) {

            alert("Please enter location.");

            return;

        }


        const payload = {

            waste_type:
                formData.waste_type.trim(),

            quantity:
                Number(formData.quantity),

            unit:
                formData.unit,

            location:
                formData.location.trim(),

            status:
                formData.status,

        };


        try {

            setSaving(true);

            setError("");


            // ====================================================
            // UPDATE
            // ====================================================

            if (editingWaste) {

                const response = await API.put(

                    `/waste/${editingWaste.id}`,

                    payload

                );

                console.log(
                    "WASTE UPDATED:",
                    response.data
                );

            }


            // ====================================================
            // CREATE
            // ====================================================

            else {

                const response = await API.post(

                    "/waste/",

                    payload

                );

                console.log(
                    "WASTE CREATED:",
                    response.data
                );

            }


            closeModal();

            await fetchWaste();


        } catch (err) {

            console.error(
                "SAVE PRODUCTION WASTE ERROR:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to save production waste."
            );

        } finally {

            setSaving(false);

        }

    };


    // ============================================================
    // DELETE WASTE
    // ============================================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this waste record?"
        );


        if (!confirmed) {
            return;
        }


        try {

            setError("");

            await API.delete(
                `/waste/${id}`
            );

            await fetchWaste();

        } catch (err) {

            console.error(
                "DELETE WASTE ERROR:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to delete waste."
            );

        }

    };


    // ============================================================
    // FILTERED WASTE
    // ============================================================

    const filteredWaste = useMemo(() => {

        const searchValue =
            search.toLowerCase().trim();


        return waste.filter((item) => {

            const matchesSearch =

                String(item.id || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.waste_type || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.material_type || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.fabric_type || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.location || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.source || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.status || "")
                    .toLowerCase()
                    .includes(searchValue);


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
        waste,
        search,
        statusFilter,
    ]);


    // ============================================================
    // STATISTICS
    // ============================================================

    const totalWaste =
        waste.length;


    const availableWaste =
        waste.filter(
            (item) =>
                String(item.status || "")
                    .toLowerCase() ===
                "available"
        ).length;


    const processingWaste =
        waste.filter(
            (item) =>
                String(item.status || "")
                    .toLowerCase() ===
                "processing"
        ).length;


    const recycledWaste =
        waste.filter(
            (item) =>
                String(item.status || "")
                    .toLowerCase() ===
                "recycled"
        ).length;


    // ============================================================
    // STATUS CLASS
    // ============================================================

    const getStatusClass = (status) => {

        return String(status || "unknown")
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    // ============================================================
    // FORMAT VALUE
    // ============================================================

    const formatValue = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "—";

        }

        return value;

    };


    // ============================================================
    // UI
    // ============================================================

    return (

        <div className="production-page-layout">


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
                    `production-content ${
                        collapsed
                            ? "collapsed"
                            : ""
                    }`
                }
            >

                <Navbar />


                <main className="production-waste-page">


                    {/* ==================================================
                        PAGE HEADER
                    ================================================== */}

                    <section className="production-header">

                        <div className="production-title-section">

                            <div className="production-title-icon">

                                <FaIndustry />

                            </div>


                            <div>

                                <h1>
                                    Production Waste
                                </h1>

                                <p>
                                    Manage and monitor textile waste
                                    generated during production.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="production-add-button"
                            onClick={openAddModal}
                        >

                            <FaPlus />

                            <span>
                                Add Waste
                            </span>

                        </button>

                    </section>


                    {/* ==================================================
                        STATISTICS
                    ================================================== */}

                    <section className="production-statistics">


                        {/* TOTAL */}

                        <div className="production-stat-card">

                            <div className="production-stat-icon total">

                                <FaBoxOpen />

                            </div>

                            <div className="production-stat-content">

                                <span>
                                    Total Waste
                                </span>

                                <strong>
                                    {totalWaste}
                                </strong>

                                <small>
                                    Total records
                                </small>

                            </div>

                        </div>


                        {/* AVAILABLE */}

                        <div className="production-stat-card">

                            <div className="production-stat-icon available">

                                <FaRecycle />

                            </div>

                            <div className="production-stat-content">

                                <span>
                                    Available
                                </span>

                                <strong>
                                    {availableWaste}
                                </strong>

                                <small>
                                    Ready for use
                                </small>

                            </div>

                        </div>


                        {/* PROCESSING */}

                        <div className="production-stat-card">

                            <div className="production-stat-icon processing">

                                <FaCogs />

                            </div>

                            <div className="production-stat-content">

                                <span>
                                    Processing
                                </span>

                                <strong>
                                    {processingWaste}
                                </strong>

                                <small>
                                    Currently processing
                                </small>

                            </div>

                        </div>


                        {/* RECYCLED */}

                        <div className="production-stat-card">

                            <div className="production-stat-icon recycled">

                                <FaRecycle />

                            </div>

                            <div className="production-stat-content">

                                <span>
                                    Recycled
                                </span>

                                <strong>
                                    {recycledWaste}
                                </strong>

                                <small>
                                    Successfully recycled
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="production-error">

                            {error}

                        </div>

                    )}


                    {/* ==================================================
                        TOOLBAR
                    ================================================== */}

                    <section className="production-toolbar">


                        {/* SEARCH */}

                        <div className="production-search">

                            <FaSearch />

                            <input
                                type="text"
                                placeholder="Search material, location, source or status..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                            {search && (

                                <button
                                    type="button"
                                    className="clear-search"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    title="Clear search"
                                >

                                    <FaTimes />

                                </button>

                            )}

                        </div>


                        {/* STATUS */}

                        <div className="production-filter">

                            <label>
                                Status
                            </label>

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
                        TABLE CARD
                    ================================================== */}

                    <section className="production-table-card">


                        {/* TABLE HEADER */}

                        <div className="production-table-heading">

                            <div>

                                <h2>
                                    Production Waste Records
                                </h2>

                                <p>
                                    {filteredWaste.length}{" "}
                                    record
                                    {filteredWaste.length !== 1
                                        ? "s"
                                        : ""
                                    }{" "}
                                    found
                                </p>

                            </div>


                            <button
                                type="button"
                                className="production-refresh-button"
                                onClick={fetchWaste}
                                disabled={loading}
                            >

                                <FaSyncAlt
                                    className={
                                        loading
                                            ? "refresh-spinning"
                                            : ""
                                    }
                                />

                                Refresh

                            </button>

                        </div>


                        {/* TABLE */}

                        <div className="production-table-wrapper">

                            <table className="production-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Material
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Source
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Location
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {/* LOADING */}

                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="production-loading"
                                            >

                                                <div className="loading-content">

                                                    <div className="loading-spinner"></div>

                                                    <span>
                                                        Loading production waste...
                                                    </span>

                                                </div>

                                            </td>

                                        </tr>

                                    )


                                    /* EMPTY */

                                    : filteredWaste.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="production-empty"
                                            >

                                                <FaBoxOpen />

                                                <h3>
                                                    No waste records found
                                                </h3>

                                                <p>
                                                    {search ||
                                                    statusFilter !== "All"
                                                        ? "Try changing your search or filter."
                                                        : "Add a production waste record to get started."
                                                    }
                                                </p>


                                                {!search &&
                                                statusFilter === "All" && (

                                                    <button
                                                        type="button"
                                                        onClick={openAddModal}
                                                        className="empty-add-button"
                                                    >

                                                        <FaPlus />

                                                        Add Waste

                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    )


                                    /* DATA */

                                    : (

                                        filteredWaste.map(
                                            (item) => (

                                                <tr
                                                    key={item.id}
                                                >


                                                    {/* ID */}

                                                    <td>

                                                        <span className="production-id">

                                                            #
                                                            {item.id}

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

                                                                    {formatValue(
                                                                        item.waste_type
                                                                    )}

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

                                                            {formatValue(
                                                                item.waste_category
                                                            )}

                                                        </span>

                                                    </td>


                                                    {/* QUANTITY */}

                                                    <td>

                                                        <div className="quantity-cell">

                                                            <strong>
                                                                {
                                                                    item.quantity
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    item.unit
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* SOURCE */}

                                                    <td>

                                                        <span className="source-text">

                                                            {formatValue(
                                                                item.source
                                                            )}

                                                        </span>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={
                                                                `production-status ${
                                                                    getStatusClass(
                                                                        item.status
                                                                    )
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                formatValue(
                                                                    item.status
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* LOCATION */}

                                                    <td>

                                                        <div className="location-cell">

                                                            {formatValue(
                                                                item.location
                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div className="production-actions">


                                                            <button
                                                                type="button"
                                                                className="production-edit-button"
                                                                title="Edit waste"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        item
                                                                    )
                                                                }
                                                            >

                                                                <FaEdit />

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="production-delete-button"
                                                                title="Delete waste"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id
                                                                    )
                                                                }
                                                            >

                                                                <FaTrash />

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


            {/* ==================================================
                ADD / EDIT MODAL
            ================================================== */}

            {showModal && (

                <div
                    className="production-modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="production-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* MODAL HEADER */}

                        <div className="production-modal-header">

                            <div className="production-modal-title">

                                <div className="production-modal-icon">

                                    {editingWaste
                                        ? <FaEdit />
                                        : <FaPlus />
                                    }

                                </div>

                                <div>

                                    <h2>

                                        {editingWaste
                                            ? "Edit Waste Record"
                                            : "Add Production Waste"
                                        }

                                    </h2>

                                    <p>
                                        Enter the waste material details below.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="production-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="production-form"
                            onSubmit={handleSubmit}
                        >


                            {/* WASTE TYPE */}

                            <div className="production-form-field full">

                                <label>
                                    Waste Type
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="waste_type"
                                    value={
                                        formData.waste_type
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: Cotton Fabric"
                                    required
                                />

                            </div>


                            {/* QUANTITY */}

                            <div className="production-form-grid">


                                <div className="production-form-field">

                                    <label>
                                        Quantity
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        min="0.01"
                                        step="0.01"
                                        value={
                                            formData.quantity
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Example: 150"
                                        required
                                    />

                                </div>


                                {/* UNIT */}

                                <div className="production-form-field">

                                    <label>
                                        Unit
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="unit"
                                        value={
                                            formData.unit
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    >

                                        <option value="Kg">
                                            Kilogram (Kg)
                                        </option>

                                        <option value="Ton">
                                            Ton
                                        </option>

                                        <option value="Gram">
                                            Gram
                                        </option>

                                        <option value="Pieces">
                                            Pieces
                                        </option>

                                        <option value="items">
                                            Items
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* LOCATION */}

                            <div className="production-form-field full">

                                <label>
                                    Location
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        formData.location
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: Chennai Warehouse"
                                    required
                                />

                            </div>


                            {/* STATUS */}

                            <div className="production-form-field full">

                                <label>
                                    Status
                                    <span>*</span>
                                </label>

                                <select
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >

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


                            {/* FORM ACTIONS */}

                            <div className="production-form-actions">

                                <button
                                    type="button"
                                    className="production-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >

                                    <FaTimes />

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="production-save-button"
                                    disabled={saving}
                                >

                                    {saving ? (

                                        <>
                                            <span className="button-spinner"></span>
                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            <FaSave />

                                            {editingWaste
                                                ? "Update Waste"
                                                : "Save Waste"
                                            }
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default ProductionWaste;