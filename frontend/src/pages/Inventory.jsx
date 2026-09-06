import { useState, useEffect } from "react";
import api from "../services/Api";
import "./Inventory.css";

function Inventory() {

    const [userId, setUserId] = useState("");
    const [fabricType, setFabricType] = useState("");
    const [quantity, setQuantity] = useState("");
    const [condition, setCondition] = useState("");
    const [collectionDate, setCollectionDate] = useState("");

    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const [wasteList, setWasteList] = useState([]);
    const [batchId, setBatchId] = useState("");
    const [source, setSource] = useState("");
    const [color, setColor] = useState("");
    const [editingId, setEditingId] = useState(null);

    // =====================================================
    // AI STATES
    // =====================================================

    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");

    // =====================================================
    // FETCH WASTE
    // =====================================================

    const fetchWaste = async () => {

        try {

            const response = await api.get("/waste");

            setWasteList(response.data);

        } catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        fetchWaste();

    }, []);

    // =====================================================
    // IMAGE SELECTION
    // =====================================================

    const handleImage = (e) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }

        setSelectedImage(file);

        setPreview(
            URL.createObjectURL(file)
        );

        // Clear previous result
        setAiResult(null);

        setAiError("");

    };

    // =====================================================
    // AI IMAGE ANALYSIS
    // =====================================================

    const analyzeImage = async () => {

        if (!selectedImage) {

            alert(
                "Please upload an image first."
            );

            return;
        }

        setAiLoading(true);

        setAiResult(null);

        setAiError("");

        try {

            const formData = new FormData();

            formData.append(
                "file",
                selectedImage
            );

            const response = await api.post(
                "/ai/predict",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            console.log(
                "AI Response:",
                response.data
            );

            setAiResult(
                response.data
            );

        } catch (err) {

            console.error(
                "AI prediction error:",
                err
            );

            setAiError(
                err.response?.data?.detail ||
                "AI image analysis failed."
            );

        } finally {

            setAiLoading(false);

        }

    };

    // =====================================================
    // SAVE WASTE
    // =====================================================

    const saveWaste = async () => {

        try {

            await api.post(
                "/waste",
                {

                    user_id:
                        Number(userId),

                    batch_id:
                        batchId,

                    fabric_type:
                        fabricType,

                    source,

                    quantity,

                    color,

                    condition,

                    collection_date:
                        collectionDate

                }
            );

            alert(
                "Waste Record Saved Successfully!"
            );

            fetchWaste();

            setUserId("");
            setFabricType("");
            setQuantity("");
            setCondition("");
            setCollectionDate("");
            setBatchId("");
            setSource("");
            setColor("");

        } catch (err) {

            alert(
                "Failed to save waste record."
            );

            console.log(err);

        }

    };
    // =====================================================
    // EDIT WASTE
    // =====================================================

        const editWaste = (item) => {

            setEditingId(item.id);

            setUserId(
                item.user_id ?? ""
            );

            setBatchId(
                item.batch_id ?? ""
            );

            setSource(
                item.source ?? ""
            );

            setColor(
                item.color ?? ""
            );

            setFabricType(
                item.fabric_type ?? ""
            );

            setQuantity(
                item.quantity ?? ""
            );

            setCondition(
                item.condition ?? ""
            );

            setCollectionDate(
                item.collection_date
                    ? String(item.collection_date).slice(0, 10)
                    : ""
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        };
        // =====================================================
// UPDATE WASTE
// =====================================================

const updateWaste = async () => {

    if (!editingId) {
        return;
    }

    try {

        await api.put(
            `/waste/${editingId}`,
            {
                user_id: Number(userId),

                batch_id: batchId,

                fabric_type: fabricType,

                source: source,

                quantity: quantity,

                color: color,

                condition: condition,

                collection_date: collectionDate
            }
        );

        alert(
            "Waste Record Updated Successfully!"
        );

        await fetchWaste();

        // Clear edit mode
        setEditingId(null);

        // Clear form
        setUserId("");
        setFabricType("");
        setQuantity("");
        setCondition("");
        setCollectionDate("");
        setBatchId("");
        setSource("");
        setColor("");

    } catch (err) {

        console.error(
            "Update waste error:",
            err
        );

        alert(
            err.response?.data?.detail ||
            "Failed to update waste record."
        );
    }
};
// =====================================================
// CANCEL EDIT
// =====================================================

const cancelEdit = () => {

    setEditingId(null);

    setUserId("");
    setFabricType("");
    setQuantity("");
    setCondition("");
    setCollectionDate("");
    setBatchId("");
    setSource("");
    setColor("");
};

    // =====================================================
    // FRONTEND
    // =====================================================

    return (

        <div className="inventory-page">

            <div className="inventory-overlay">

                <div className="inventory-card">

                    <h1>
                        ♻ Textile Waste Inventory
                    </h1>

                    <p>
                        Add and Analyze Textile Waste
                    </p>

                    {/* USER ID */}

                    <input
                        type="number"
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) =>
                            setUserId(
                                e.target.value
                            )
                        }
                    />

                    {/* BATCH */}

                    <input
                        type="text"
                        placeholder="Batch ID"
                        value={batchId}
                        onChange={(e) =>
                            setBatchId(
                                e.target.value
                            )
                        }
                    />

                    {/* SOURCE */}

                    <input
                        type="text"
                        placeholder="Source"
                        value={source}
                        onChange={(e) =>
                            setSource(
                                e.target.value
                            )
                        }
                    />

                    {/* COLOR */}

                    <input
                        type="text"
                        placeholder="Color"
                        value={color}
                        onChange={(e) =>
                            setColor(
                                e.target.value
                            )
                        }
                    />

                    {/* FABRIC */}

                    <input
                        type="text"
                        placeholder="Fabric Type"
                        value={fabricType}
                        onChange={(e) =>
                            setFabricType(
                                e.target.value
                            )
                        }
                    />

                    {/* QUANTITY */}

                    <input
                        type="text"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(
                                e.target.value
                            )
                        }
                    />

                    {/* CONDITION */}

                    <select
                        value={condition}
                        onChange={(e) =>
                            setCondition(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            Select Condition
                        </option>

                        <option>
                            Reusable
                        </option>

                        <option>
                            Good
                        </option>

                        <option>
                            Damaged
                        </option>

                        <option>
                            Recyclable
                        </option>

                    </select>

                    {/* DATE */}

                    <input
                        type="date"
                        value={collectionDate}
                        onChange={(e) =>
                            setCollectionDate(
                                e.target.value
                            )
                        }
                    />

                    {/* IMAGE */}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                    />

                    {/* PREVIEW */}

                    {preview && (

                        <img
                            src={preview}
                            alt="Preview"
                            className="preview-image"
                        />

                    )}

                    

                    {/* SAVE */}

                  {editingId ? (

                    <div className="edit-buttons">

                        <button
                            type="button"
                            className="update-button"
                            onClick={updateWaste}
                        >
                            Update Waste Record
                        </button>

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={cancelEdit}
                        >
                            Cancel Edit
                        </button>

                    </div>

                    ) : (

                    <button
                        type="button"
                        onClick={saveWaste}
                    >
                        Save Waste Record
                    </button>

                    )}

                    {/* INVENTORY */}

                    <h2
                        style={{
                            marginTop: "30px"
                        }}
                    >
                        Inventory Records
                    </h2>

                    <div className="table-container">

                        <table className="inventory-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        User ID
                                    </th>

                                    <th>
                                        Batch
                                    </th>

                                    <th>
                                        Source
                                    </th>

                                    <th>
                                        Color
                                    </th>

                                    <th>
                                        Fabric
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Condition
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {wasteList.length > 0 ? (

                                    wasteList.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        item.id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.user_id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.batch_id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.source
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.color
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.fabric_type
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.quantity
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.condition
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.collection_date
                                                    }
                                                </td>
                                                <td>

                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() => editWaste(item)}
                                                >
                                                    ✏️ Edit
                                                </button>

                                            </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    <tr>

                                        <td colSpan="10">

                                            No records found.

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Inventory;