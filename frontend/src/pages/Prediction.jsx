import React, { useState } from "react";
import { predictTextile } from "../services/api";
import "../css/Prediction.css";

const Prediction = () => {
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        source: "Upload",
        waste_category: "Textile Waste",
        color: "",
        condition: "Used",
        weight: "",
        quantity: "1",
        notes: "",
    });

    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ========================================================
    // FILE CHANGE
    // ========================================================

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            setError("Please select a valid textile image.");
            return;
        }

        setFile(selectedFile);
        setError("");
        setResult(null);

        const imageUrl = URL.createObjectURL(selectedFile);
        setPreview(imageUrl);
    };

    // ========================================================
    // INPUT CHANGE
    // ========================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ========================================================
    // PREDICT
    // ========================================================

    const handlePredict = async (event) => {
        event.preventDefault();

        if (!file) {
            setError("Please upload a textile image.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await predictTextile({
                file,
                source: formData.source,
                waste_category: formData.waste_category,
                color: formData.color,
                condition: formData.condition,
                weight: formData.weight,
                quantity: formData.quantity,
                notes: formData.notes,
            });

            console.log("Prediction response:", response);

            setResult(response);

        } catch (err) {
            console.error("Prediction error:", err);

            const message =
                err.response?.data?.detail ||
                "Prediction failed. Please try again.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // RESET
    // ========================================================

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError("");

        setFormData({
            source: "Upload",
            waste_category: "Textile Waste",
            color: "",
            condition: "Used",
            weight: "",
            quantity: "1",
            notes: "",
        });
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="prediction-page">

            <div className="prediction-header">
                <div>
                    <h1>Textile AI Prediction</h1>

                    <p>
                        Upload a textile image and let the AI
                        identify the fabric type and provide
                        recycling information.
                    </p>
                </div>
            </div>

            <div className="prediction-layout">

                {/* ==================================================
                    LEFT SIDE
                ================================================== */}

                <div className="prediction-card">

                    <h2>Upload Textile</h2>

                    <div className="upload-area">

                        <input
                            type="file"
                            id="textile-image"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <label htmlFor="textile-image">
                            {file
                                ? file.name
                                : "Choose Textile Image"}
                        </label>

                    </div>

                    {preview && (
                        <div className="image-preview">

                            <img
                                src={preview}
                                alt="Textile preview"
                            />

                        </div>
                    )}

                    <form onSubmit={handlePredict}>

                        {/* SOURCE */}

                        <div className="form-group">

                            <label>
                                Source
                            </label>

                            <input
                                type="text"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        {/* WASTE CATEGORY */}

                        <div className="form-group">

                            <label>
                                Waste Category
                            </label>

                            <input
                                type="text"
                                name="waste_category"
                                value={formData.waste_category}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        {/* COLOR */}

                        <div className="form-group">

                            <label>
                                Color
                            </label>

                            <input
                                type="text"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="Example: Blue"
                            />

                        </div>

                        {/* CONDITION */}

                        <div className="form-group">

                            <label>
                                Condition
                            </label>

                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                required
                            >
                                <option value="New">
                                    New
                                </option>

                                <option value="Used">
                                    Used
                                </option>

                                <option value="Damaged">
                                    Damaged
                                </option>

                                <option value="Worn">
                                    Worn
                                </option>
                            </select>

                        </div>

                        {/* WEIGHT */}

                        <div className="form-group">

                            <label>
                                Weight (kg)
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="Example: 1.5"
                            />

                        </div>

                        {/* QUANTITY */}

                        <div className="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                min="1"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                            />

                        </div>

                        {/* NOTES */}

                        <div className="form-group">

                            <label>
                                Notes
                            </label>

                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Additional information..."
                                rows="4"
                            />

                        </div>

                        {error && (
                            <div className="prediction-error">
                                {error}
                            </div>
                        )}

                        <div className="prediction-buttons">

                            <button
                                type="submit"
                                disabled={loading || !file}
                                className="predict-button"
                            >
                                {loading
                                    ? "Analyzing..."
                                    : "Predict Fabric"}
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="reset-button"
                            >
                                Reset
                            </button>

                        </div>

                    </form>

                </div>

                {/* ==================================================
                    RIGHT SIDE
                ================================================== */}

                <div className="prediction-card result-card">

                    <h2>AI Prediction Result</h2>

                    {!result && !loading && (
                        <div className="empty-result">

                            <div className="empty-icon">
                                🤖
                            </div>

                            <h3>
                                Waiting for Image
                            </h3>

                            <p>
                                Upload a textile image and
                                click "Predict Fabric".
                            </p>

                        </div>
                    )}

                    {loading && (
                        <div className="loading-result">

                            <div className="loader"></div>

                            <h3>
                                AI is analyzing the image...
                            </h3>

                            <p>
                                Please wait.
                            </p>

                        </div>
                    )}

                    {result?.prediction && (
                        <div className="result-content">

                            {/* MAIN PREDICTION */}

                            <div className="main-prediction">

                                <span>
                                    Predicted Fabric
                                </span>

                                <h3>
                                    {result.prediction.fabric_type}
                                </h3>

                                <div className="confidence">

                                    <span>
                                        Confidence
                                    </span>

                                    <strong>
                                        {Number(
                                            result.prediction
                                                .confidence_percentage
                                        ).toFixed(2)}
                                        %
                                    </strong>

                                </div>

                            </div>

                            {/* DETAILS */}

                            <div className="result-grid">

                                <div className="result-item">
                                    <span>
                                        Material
                                    </span>

                                    <strong>
                                        {
                                            result.prediction
                                                .material_type
                                        }
                                    </strong>
                                </div>

                                <div className="result-item">
                                    <span>
                                        Composition
                                    </span>

                                    <strong>
                                        {
                                            result.prediction
                                                .composition
                                        }
                                    </strong>
                                </div>

                                <div className="result-item">
                                    <span>
                                        Waste Category
                                    </span>

                                    <strong>
                                        {
                                            result.prediction
                                                .waste_category
                                        }
                                    </strong>
                                </div>

                                <div className="result-item">
                                    <span>
                                        Recyclability
                                    </span>

                                    <strong>
                                        {
                                            result.prediction
                                                .recyclability
                                        }
                                    </strong>
                                </div>

                                <div className="result-item">
                                    <span>
                                        Biodegradability
                                    </span>

                                    <strong>
                                        {
                                            result.prediction
                                                .biodegradability
                                        }
                                    </strong>
                                </div>

                            </div>

                            {/* PROCESSING */}

                            <div className="result-section">

                                <h3>
                                    Recommended Processing
                                </h3>

                                <p>
                                    {
                                        result.prediction
                                            .recommended_processing
                                    }
                                </p>

                            </div>

                            {/* REUSE */}

                            <div className="result-section">

                                <h3>
                                    Potential Reuse
                                </h3>

                                <p>
                                    {
                                        result.prediction
                                            .potential_reuse
                                    }
                                </p>

                            </div>

                            {/* TOP PREDICTIONS */}

                            {result.prediction.top_predictions
                                ?.length > 0 && (

                                <div className="top-predictions">

                                    <h3>
                                        Top Predictions
                                    </h3>

                                    {result.prediction
                                        .top_predictions
                                        .map((item) => (

                                            <div
                                                className="prediction-row"
                                                key={item.index}
                                            >

                                                <span>
                                                    {item.name}
                                                </span>

                                                <div className="prediction-bar">

                                                    <div
                                                        className="prediction-bar-fill"
                                                        style={{
                                                            width: `${item.percentage}%`,
                                                        }}
                                                    ></div>

                                                </div>

                                                <strong>
                                                    {Number(
                                                        item.percentage
                                                    ).toFixed(2)}
                                                    %
                                                </strong>

                                            </div>

                                        ))}

                                </div>
                            )}

                            {/* HISTORY ID */}

                            {result.history_id && (
                                <div className="history-info">

                                    Prediction saved successfully.

                                    <span>
                                        History ID:{" "}
                                        {result.history_id}
                                    </span>

                                </div>
                            )}

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default Prediction;