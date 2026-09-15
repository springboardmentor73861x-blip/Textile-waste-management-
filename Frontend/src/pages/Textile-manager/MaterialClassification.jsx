import { useState } from "react";
import TextileManagerSidebar from "../../components/TextileManagerSidebar";
import API from "../../api/auth";
import "../../styles/Textile-manager/MaterialClassification.css";

function MaterialClassification() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setClassification(null);
    setError("");

    // Remove previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClassify = async () => {
    if (!selectedFile) {
      setError("Please select a textile image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setClassification(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await API.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      console.log("Material Classification Response:", data);

      /*
       * Backend UploadResponse may return different field names
       * depending on the existing upload schema.
       *
       * We safely read the available values without changing
       * the existing UI.
       */

      const material =
        data.material ||
        data.fabric_type ||
        data.predicted_material ||
        data.prediction ||
        "Unknown";

      const confidenceValue =
        data.confidence ??
        data.prediction_confidence ??
        data.confidence_score ??
        0;

      const confidence = Number(confidenceValue);

      const category =
        data.category ||
        data.material_category ||
        data.fabric_category ||
        "Not Available";

      const quality =
        data.quality ||
        data.condition ||
        "Not Available";

      const recyclable =
        data.recyclable ||
        data.recycle ||
        data.recyclability ||
        "Not Available";

      const reusePotential =
        data.reusePotential ||
        data.reuse_potential ||
        data.reuse ||
        "Not Available";

      setClassification({
        material,
        confidence: Number.isFinite(confidence)
          ? confidence
          : 0,
        category,
        quality,
        recyclable,
        reusePotential,
      });
    } catch (err) {
      console.error(
        "Material Classification Error:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to classify the textile image. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyAnother = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setClassification(null);
    setError("");
  };

  return (
    <div className="tm-classification-layout">

      <TextileManagerSidebar />

      <main className="tm-classification-content">

        {/* =========================
            HEADER
        ========================= */}

        <header className="tm-classification-header">

          <div>
            <span className="tm-classification-label">
              TEXTILE INTELLIGENCE
            </span>

            <h1>
              Material Classification
            </h1>

            <p>
              Identify textile material types using
              AI-powered image classification.
            </p>
          </div>

        </header>


        {/* =========================
            CLASSIFICATION CARD
        ========================= */}

        <section className="tm-classification-card">

          <div className="tm-classification-card-header">

            <div>
              <h2>
                Classify Textile Material
              </h2>

              <p>
                Upload a textile image to identify its
                material type and characteristics.
              </p>
            </div>

          </div>


          {/* =========================
              UPLOAD AREA
          ========================= */}

          <div className="tm-classification-upload">

            <div className="tm-upload-icon">
              ◈
            </div>


            <h3>
              {selectedFile
                ? selectedFile.name
                : "Upload Textile Image"}
            </h3>


            <p>
              PNG, JPG or JPEG images are supported
            </p>


            <label className="tm-select-file">

              {selectedFile
                ? "Change Image"
                : "Select Image"}

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                hidden
              />

            </label>


            {/* =========================
                IMAGE PREVIEW
            ========================= */}

            {previewUrl && (
              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={previewUrl}
                  alt="Selected textile"
                  style={{
                    width: "140px",
                    height: "140px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "1px solid #e7e1ef",
                  }}
                />
              </div>
            )}


            {/* =========================
                CLASSIFY BUTTON
            ========================= */}

            {selectedFile && (

              <button
                type="button"
                className="tm-classify-button"
                onClick={handleClassify}
                disabled={loading}
              >

                {loading
                  ? "Classifying..."
                  : "Classify Material"}

              </button>

            )}


            {/* =========================
                ERROR
            ========================= */}

            {error && (
              <p
                style={{
                  marginTop: "14px",
                  color: "#dc2626",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {error}
              </p>
            )}

          </div>

        </section>


        {/* =========================
            RESULT
        ========================= */}

        {classification && (

          <section className="tm-classification-result">

            <div className="tm-result-header">

              <div>

                <span>
                  AI CLASSIFICATION RESULT
                </span>

                <h2>
                  Material Identified
                </h2>

              </div>


              <div className="tm-confidence">

                {classification.confidence}%

                <small>
                  Confidence
                </small>

              </div>

            </div>


            {/* =========================
                RESULT GRID
            ========================= */}

            <div className="tm-result-grid">

              <div className="tm-result-item">

                <span>
                  Material Type
                </span>

                <strong>
                  {classification.material}
                </strong>

              </div>


              <div className="tm-result-item">

                <span>
                  Material Category
                </span>

                <strong>
                  {classification.category}
                </strong>

              </div>


              <div className="tm-result-item">

                <span>
                  Quality
                </span>

                <strong>
                  {classification.quality}
                </strong>

              </div>


              <div className="tm-result-item">

                <span>
                  Recyclable
                </span>

                <strong className="tm-positive">
                  {classification.recyclable}
                </strong>

              </div>


              <div className="tm-result-item">

                <span>
                  Reuse Potential
                </span>

                <strong className="tm-positive">
                  {classification.reusePotential}
                </strong>

              </div>

            </div>


            {/* =========================
                ACTION
            ========================= */}

            <div className="tm-result-actions">

              <button
                type="button"
                className="tm-secondary-button"
                onClick={handleClassifyAnother}
              >
                Classify Another
              </button>

            </div>

          </section>

        )}


        {/* =========================
            INFORMATION
        ========================= */}

        <section className="tm-classification-info">

          <div>

            <span className="tm-info-icon">
              ✦
            </span>

            <div>

              <h3>
                AI Material Analysis
              </h3>

              <p>
                The classification result can be used
                by the Textile Manager for AI prediction,
                recycling, reuse and sustainability
                recommendations.
              </p>

            </div>

          </div>

        </section>


        {/* =========================
            FOOTER
        ========================= */}

        <footer className="tm-classification-footer">

          Textile Waste Intelligence Platform •
          Material Classification

        </footer>

      </main>

    </div>
  );
}

export default MaterialClassification;