import { useEffect, useState } from "react";
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
    FaEye,
} from "react-icons/fa";

import "../css/WasteList.css";


function WasteList() {

    // ========================================================
    // SIDEBAR
    // ========================================================

    const [collapsed, setCollapsed] = useState(false);


    // ========================================================
    // WASTE DATA
    // ========================================================

    const [waste, setWaste] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ========================================================
    // SEARCH / FILTER
    // ========================================================

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");


    // ========================================================
    // MODAL
    // ========================================================

    const [showModal, setShowModal] = useState(false);

    const [editingWaste, setEditingWaste] = useState(null);

    const [viewingWaste, setViewingWaste] = useState(null);


    // ========================================================
    // FORM
    // ========================================================

    const [formData, setFormData] = useState({
        waste_type: "",
        quantity: "",
        unit: "Kg",
        location: "",
        status: "Available",

        source: "",
        waste_category: "",
        color: "",
        condition: "",
        weight: "",
        notes: "",
    });


    // ========================================================
    // FETCH WASTE
    // ========================================================

    const fetchWaste = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await API.get("/waste/");

            console.log(
                "WASTE API RESPONSE:",
                response.data
            );

            if (Array.isArray(response.data)) {

                setWaste(response.data);

            } else {

                setWaste([]);

            }

        } catch (error) {

            console.error(
                "WASTE FETCH ERROR:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load waste data."
            );

        } finally {

            setLoading(false);

        }

    };


    // ========================================================
    // LOAD DATA
    // ========================================================

    useEffect(() => {

        fetchWaste();

    }, []);


    // ========================================================
    // INPUT CHANGE
    // ========================================================

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


    // ========================================================
    // RESET FORM
    // ========================================================

    const resetForm = () => {

        setFormData({

            waste_type: "",
            quantity: "",
            unit: "Kg",
            location: "",
            status: "Available",

            source: "",
            waste_category: "",
            color: "",
            condition: "",
            weight: "",
            notes: "",

        });

    };


    // ========================================================
    // OPEN ADD MODAL
    // ========================================================

    const openAddModal = () => {

        setEditingWaste(null);

        resetForm();

        setShowModal(true);

    };


    // ========================================================
    // OPEN EDIT MODAL
    // ========================================================

    const openEditModal = (item) => {

        setEditingWaste(item);

        setFormData({

            waste_type:
                item.waste_type || "",

            quantity:
                item.quantity ?? "",

            unit:
                item.unit || "Kg",

            location:
                item.location || "",

            status:
                item.status || "Available",

            source:
                item.source || "",

            waste_category:
                item.waste_category || "",

            color:
                item.color || "",

            condition:
                item.condition || "",

            weight:
                item.weight ?? "",

            notes:
                item.notes || "",

        });

        setShowModal(true);

    };


    // ========================================================
    // OPEN VIEW MODAL
    // ========================================================

    const openViewModal = (item) => {

        setViewingWaste(item);

    };


    // ========================================================
    // CLOSE VIEW MODAL
    // ========================================================

    const closeViewModal = () => {

        setViewingWaste(null);

    };


    // ========================================================
    // CLOSE ADD / EDIT MODAL
    // ========================================================

    const closeModal = () => {

        setShowModal(false);

        setEditingWaste(null);

        resetForm();

    };


    // ========================================================
    // SAVE WASTE
    // ========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!formData.waste_type.trim()) {

            alert(
                "Please enter waste type."
            );

            return;

        }


        if (
            formData.quantity === "" ||
            Number(formData.quantity) < 0
        ) {

            alert(
                "Please enter a valid quantity."
            );

            return;

        }


        if (!formData.location.trim()) {

            alert(
                "Please enter location."
            );

            return;

        }


        // ----------------------------------------------------
        // PAYLOAD
        // ----------------------------------------------------

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

            source:
                formData.source || null,

            waste_category:
                formData.waste_category || null,

            color:
                formData.color || null,

            condition:
                formData.condition || null,

            weight:
                formData.weight === ""
                    ? null
                    : Number(formData.weight),

            notes:
                formData.notes || null,

        };


        console.log(
            "WASTE PAYLOAD:",
            payload
        );


        try {

            // =================================================
            // UPDATE
            // =================================================

            if (editingWaste) {

                const response =
                    await API.put(

                        `/waste/${editingWaste.id}`,

                        payload

                    );


                console.log(
                    "WASTE UPDATED:",
                    response.data
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                const response =
                    await API.post(

                        "/waste/",

                        payload

                    );


                console.log(
                    "WASTE CREATED:",
                    response.data
                );

            }


            // ------------------------------------------------
            // CLOSE
            // ------------------------------------------------

            closeModal();


            // ------------------------------------------------
            // REFRESH
            // ------------------------------------------------

            await fetchWaste();


        } catch (error) {

            console.error(
                "SAVE WASTE ERROR:",
                error
            );


            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );


            alert(

                error.response?.data?.detail ||

                "Unable to save waste."

            );

        }

    };


    // ========================================================
    // DELETE WASTE
    // ========================================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(

                "Are you sure you want to delete this waste record?"

            );


        if (!confirmed) {

            return;

        }


        try {

            await API.delete(
                `/waste/${id}`
            );


            await fetchWaste();


        } catch (error) {

            console.error(
                "DELETE WASTE ERROR:",
                error
            );


            alert(

                error.response?.data?.detail ||

                "Unable to delete waste."

            );

        }

    };


    // ========================================================
    // FILTER WASTE
    // ========================================================

    const filteredWaste =
        waste.filter((item) => {

            const searchValue =
                search
                    .toLowerCase()
                    .trim();


            const matchesSearch =

                String(item.id || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.waste_type || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.location || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.status || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.source || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.waste_category || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                String(item.fabric_type || "")
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


    // ========================================================
    // STATUS CLASS
    // ========================================================

    const getStatusClass = (status) => {

        return String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    // ========================================================
    // STATISTICS
    // ========================================================

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


    // ========================================================
    // UI
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
                className={
                    `dashboard-content ${
                        collapsed
                            ? "collapsed"
                            : ""
                    }`
                }
            >

                <Navbar />


                <main className="waste-list-page">


                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="waste-list-header">

                        <div className="waste-list-title">

                            <div className="waste-title-icon">

                                <FaRecycle />

                            </div>


                            <div>

                                <h1>
                                    Waste Inventory
                                </h1>

                                <p>
                                    Manage textile waste
                                    inventory and recycling
                                    status.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="add-waste-btn"
                            onClick={openAddModal}
                        >

                            <FaPlus />

                            Add Waste

                        </button>

                    </div>


                    {/* ==================================================
                        STATISTICS
                    ================================================== */}

                    <div className="waste-statistics">


                        <div className="waste-stat-card">

                            <div className="waste-stat-icon">

                                <FaBoxOpen />

                            </div>


                            <div>

                                <span>
                                    Total Waste
                                </span>

                                <strong>
                                    {totalWaste}
                                </strong>

                            </div>

                        </div>


                        <div className="waste-stat-card">

                            <div className="waste-stat-icon">

                                <FaRecycle />

                            </div>


                            <div>

                                <span>
                                    Available
                                </span>

                                <strong>
                                    {availableWaste}
                                </strong>

                            </div>

                        </div>


                        <div className="waste-stat-card">

                            <div className="waste-stat-icon">

                                <FaRecycle />

                            </div>


                            <div>

                                <span>
                                    Processing
                                </span>

                                <strong>
                                    {processingWaste}
                                </strong>

                            </div>

                        </div>


                        <div className="waste-stat-card">

                            <div className="waste-stat-icon">

                                <FaRecycle />

                            </div>


                            <div>

                                <span>
                                    Recycled
                                </span>

                                <strong>
                                    {recycledWaste}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        TOOLBAR
                    ================================================== */}

                    <div className="waste-toolbar">


                        <div className="waste-search">

                            <FaSearch />


                            <input
                                type="text"
                                placeholder="Search waste type, location, fabric..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="waste-filter">

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

                    </div>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="waste-error">

                            {error}

                        </div>

                    )}


                    {/* ==================================================
                        TABLE
                    ================================================== */}

                    <div className="waste-table-card">


                        <div className="waste-table-header">

                            <div>

                                <h2>
                                    Waste List
                                </h2>


                                <p>

                                    {filteredWaste.length}

                                    {" record"}

                                    {filteredWaste.length !== 1
                                        ? "s"
                                        : ""
                                    }

                                </p>

                            </div>


                            <button
                                type="button"
                                className="refresh-waste-btn"
                                onClick={fetchWaste}
                            >

                                Refresh

                            </button>

                        </div>


                        <div className="waste-table-wrapper">

                            <table className="waste-table">


                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Waste Type
                                        </th>

                                        <th>
                                            Fabric
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Unit
                                        </th>

                                        <th>
                                            Location
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="waste-loading"
                                            >

                                                Loading waste data...

                                            </td>

                                        </tr>

                                    ) : filteredWaste.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="waste-empty"
                                            >

                                                <FaBoxOpen />


                                                <h3>
                                                    No waste records found
                                                </h3>


                                                <p>
                                                    Add a waste record
                                                    to get started.
                                                </p>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredWaste.map(
                                            (item) => (

                                                <tr
                                                    key={item.id}
                                                >


                                                    {/* ID */}

                                                    <td>

                                                        <strong>
                                                            #{item.id}
                                                        </strong>

                                                    </td>


                                                    {/* WASTE TYPE */}

                                                    <td>

                                                        <strong>

                                                            {
                                                                item.waste_type
                                                            }

                                                        </strong>

                                                    </td>


                                                    {/* FABRIC */}

                                                    <td>

                                                        {item.fabric_type
                                                            ? item.fabric_type
                                                            : "—"
                                                        }

                                                    </td>


                                                    {/* QUANTITY */}

                                                    <td>

                                                        {
                                                            item.quantity
                                                        }

                                                    </td>


                                                    {/* UNIT */}

                                                    <td>

                                                        {
                                                            item.unit
                                                        }

                                                    </td>


                                                    {/* LOCATION */}

                                                    <td>

                                                        {
                                                            item.location
                                                        }

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={
                                                                `waste-status ${
                                                                    getStatusClass(
                                                                        item.status
                                                                    )
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                item.status
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div
                                                            className="waste-actions"
                                                        >


                                                            {/* VIEW */}

                                                            <button
                                                                type="button"
                                                                className="view-waste-btn"
                                                                title="View"
                                                                onClick={() =>
                                                                    openViewModal(
                                                                        item
                                                                    )
                                                                }
                                                            >

                                                                <FaEye />

                                                            </button>


                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                className="edit-waste-btn"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        item
                                                                    )
                                                                }
                                                            >

                                                                <FaEdit />

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                className="delete-waste-btn"
                                                                title="Delete"
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

                    </div>

                </main>

            </div>


            {/* ==================================================
                ADD / EDIT MODAL
            ================================================== */}

            {showModal && (

                <div
                    className="waste-modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="waste-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* MODAL HEADER */}

                        <div className="waste-modal-header">

                            <div>

                                <h2>

                                    {editingWaste
                                        ? "Edit Waste"
                                        : "Add Waste"
                                    }

                                </h2>


                                <p>
                                    Enter textile waste details.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="waste-modal-close"
                                onClick={closeModal}
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* ==================================================
                            FORM
                        ================================================== */}

                        <form
                            className="waste-form"
                            onSubmit={handleSubmit}
                        >


                            {/* WASTE TYPE */}

                            <div className="waste-form-field">

                                <label>
                                    Waste Type *
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


                            {/* QUANTITY + UNIT */}

                            <div className="waste-form-row">


                                <div className="waste-form-field">

                                    <label>
                                        Quantity *
                                    </label>


                                    <input
                                        type="number"
                                        name="quantity"
                                        min="0"
                                        step="0.01"
                                        value={
                                            formData.quantity
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Example: 250"
                                        required
                                    />

                                </div>


                                <div className="waste-form-field">

                                    <label>
                                        Unit *
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
                                            Kg
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

                                    </select>

                                </div>

                            </div>


                            {/* LOCATION */}

                            <div className="waste-form-field">

                                <label>
                                    Location *
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

                            <div className="waste-form-field">

                                <label>
                                    Status *
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


                            {/* ==================================================
                                TEXTILE INFORMATION
                            ================================================== */}

                            <div className="waste-form-section">

                                <h3>
                                    Textile Information
                                </h3>

                            </div>


                            {/* SOURCE */}

                            <div className="waste-form-field">

                                <label>
                                    Waste Source
                                </label>


                                <select
                                    name="source"
                                    value={
                                        formData.source
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >

                                    <option value="">
                                        Select Source
                                    </option>

                                    <option value="Manufacturing">
                                        Manufacturing
                                    </option>

                                    <option value="Garment Production">
                                        Garment Production
                                    </option>

                                    <option value="Collection Center">
                                        Collection Center
                                    </option>

                                    <option value="Household">
                                        Household
                                    </option>

                                    <option value="Industrial">
                                        Industrial
                                    </option>

                                    <option value="Retail">
                                        Retail
                                    </option>

                                    <option value="Donation Center">
                                        Donation Center
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* WASTE CATEGORY */}

                            <div className="waste-form-field">

                                <label>
                                    Waste Category
                                </label>


                                <select
                                    name="waste_category"
                                    value={
                                        formData.waste_category
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="Pre-consumer Waste">
                                        Pre-consumer Waste
                                    </option>

                                    <option value="Post-consumer Waste">
                                        Post-consumer Waste
                                    </option>

                                    <option value="Production Waste">
                                        Production Waste
                                    </option>

                                    <option value="Cutting Waste">
                                        Cutting Waste
                                    </option>

                                    <option value="Damaged Textile">
                                        Damaged Textile
                                    </option>

                                    <option value="Used Textile">
                                        Used Textile
                                    </option>

                                    <option value="Rejected Textile">
                                        Rejected Textile
                                    </option>

                                    <option value="Scrap Textile">
                                        Scrap Textile
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* COLOR */}

                            <div className="waste-form-field">

                                <label>
                                    Color
                                </label>


                                <input
                                    type="text"
                                    name="color"
                                    value={
                                        formData.color
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: Blue"
                                />

                            </div>


                            {/* CONDITION */}

                            <div className="waste-form-field">

                                <label>
                                    Textile Condition
                                </label>


                                <select
                                    name="condition"
                                    value={
                                        formData.condition
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >

                                    <option value="">
                                        Select Condition
                                    </option>

                                    <option value="New">
                                        New
                                    </option>

                                    <option value="Good">
                                        Good
                                    </option>

                                    <option value="Used">
                                        Used
                                    </option>

                                    <option value="Damaged">
                                        Damaged
                                    </option>

                                    <option value="Heavily Damaged">
                                        Heavily Damaged
                                    </option>

                                    <option value="Unusable">
                                        Unusable
                                    </option>

                                </select>

                            </div>


                            {/* WEIGHT */}

                            <div className="waste-form-field">

                                <label>
                                    Weight (kg)
                                </label>


                                <input
                                    type="number"
                                    name="weight"
                                    min="0"
                                    step="0.01"
                                    value={
                                        formData.weight
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: 10.5"
                                />

                            </div>


                            {/* NOTES */}

                            <div className="waste-form-field">

                                <label>
                                    Additional Notes
                                </label>


                                <textarea
                                    name="notes"
                                    value={
                                        formData.notes
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Additional information..."
                                    rows="4"
                                />

                            </div>


                            {/* ==================================================
                                BUTTONS
                            ================================================== */}

                            <div className="waste-form-actions">


                                <button
                                    type="button"
                                    className="cancel-waste-btn"
                                    onClick={closeModal}
                                >

                                    <FaTimes />

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="save-waste-btn"
                                >

                                    <FaSave />

                                    {editingWaste
                                        ? "Update Waste"
                                        : "Save Waste"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==================================================
                VIEW WASTE MODAL
            ================================================== */}

            {viewingWaste && (

                <div
                    className="waste-modal-overlay"
                    onClick={closeViewModal}
                >

                    <div
                        className="waste-modal waste-view-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* HEADER */}

                        <div className="waste-modal-header">

                            <div>

                                <h2>
                                    Waste Details
                                </h2>

                                <p>
                                    Waste ID #{viewingWaste.id}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="waste-modal-close"
                                onClick={closeViewModal}
                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* DETAILS */}

                        <div className="waste-details">


                            <div className="waste-detail-item">

                                <span>
                                    Waste Type
                                </span>

                                <strong>
                                    {viewingWaste.waste_type || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Quantity
                                </span>

                                <strong>

                                    {viewingWaste.quantity ?? "—"}

                                    {" "}

                                    {viewingWaste.unit || ""}

                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Location
                                </span>

                                <strong>
                                    {viewingWaste.location || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Status
                                </span>

                                <strong>
                                    {viewingWaste.status || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Source
                                </span>

                                <strong>
                                    {viewingWaste.source || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Waste Category
                                </span>

                                <strong>
                                    {viewingWaste.waste_category || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Color
                                </span>

                                <strong>
                                    {viewingWaste.color || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Condition
                                </span>

                                <strong>
                                    {viewingWaste.condition || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Weight
                                </span>

                                <strong>

                                    {viewingWaste.weight ?? "—"}

                                    {" kg"}

                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Material Type
                                </span>

                                <strong>
                                    {viewingWaste.material_type || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Fabric Type
                                </span>

                                <strong>
                                    {viewingWaste.fabric_type || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Composition
                                </span>

                                <strong>
                                    {viewingWaste.composition || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    AI Confidence
                                </span>

                                <strong>

                                    {viewingWaste.confidence != null
                                        ? `${(
                                            Number(
                                                viewingWaste.confidence
                                            ) * 100
                                        ).toFixed(2)}%`
                                        : "—"
                                    }

                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Recyclability
                                </span>

                                <strong>
                                    {viewingWaste.recyclability || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Biodegradability
                                </span>

                                <strong>
                                    {viewingWaste.biodegradability || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Predicted Color
                                </span>

                                <strong>
                                    {viewingWaste.predicted_color || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-item">

                                <span>
                                    Predicted Condition
                                </span>

                                <strong>
                                    {viewingWaste.predicted_condition || "—"}
                                </strong>

                            </div>


                            <div className="waste-detail-full">

                                <span>
                                    Recommended Processing
                                </span>

                                <p>
                                    {
                                        viewingWaste.recommended_processing ||
                                        "—"
                                    }
                                </p>

                            </div>


                            <div className="waste-detail-full">

                                <span>
                                    Potential Reuse
                                </span>

                                <p>
                                    {
                                        viewingWaste.potential_reuse ||
                                        "—"
                                    }
                                </p>

                            </div>


                            <div className="waste-detail-full">

                                <span>
                                    Environmental Impact
                                </span>

                                <p>
                                    {
                                        viewingWaste.environmental_impact ||
                                        "—"
                                    }
                                </p>

                            </div>


                            <div className="waste-detail-full">

                                <span>
                                    Notes
                                </span>

                                <p>
                                    {
                                        viewingWaste.notes ||
                                        "—"
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default WasteList;