import { useState } from "react";
import SustainabilitySidebar from "../components/SustainabilitySidebar";
import API from "../api/auth";
import "../styles/QuickAction.css";

function AnalyzeTextile() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setError("");

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a textile image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await API.post(
        "/upload/",
        formData
      );

      setResult(response.data);
    } catch (err) {
      console.error("Textile Analysis Error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to analyze the textile image."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-action-layout">
      <SustainabilitySidebar />

      <main className="quick-action-content">
        <div className="quick-action-header">
          <span>SUSTAINABILITY ACTION</span>

          <h1>Analyze Textile</h1>

          <p>
            Upload a textile image and analyze its material,
            waste type, recyclability and sustainability potential.
          </p>
        </div>

        <div className="quick-action-card">
          <div className="quick-action-large-icon">
            ♻
          </div>

          <h2>Start Textile Analysis</h2>

          <p>
            Upload a textile image to get AI-powered material
            classification and sustainability insights.
          </p>

          <div style={{ marginTop: "20px" }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {preview && (
            <div style={{ marginTop: "20px" }}>
              <img
                src={preview}
                alt="Selected textile"
                style={{
                  maxWidth: "300px",
                  maxHeight: "300px",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !selectedFile}
            className="quick-action-primary-button"
            style={{ marginTop: "20px" }}
          >
            {loading
              ? "Analyzing..."
              : "Start Analysis →"}
          </button>

          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                borderRadius: "8px",
                color: "#b91c1c",
                background: "#fee2e2",
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: "30px",
                textAlign: "left",
                width: "100%",
              }}
            >
              <h2>Analysis Result</h2>

              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Material:</strong>{" "}
                  {result.material || "-"}
                </p>

                <p>
                  <strong>Waste Type:</strong>{" "}
                  {result.waste_type || "-"}
                </p>

                <p>
                  <strong>Confidence:</strong>{" "}
                  {result.confidence ?? "-"}%
                </p>

                <p>
                  <strong>Recyclable:</strong>{" "}
                  {String(result.recycle)}
                </p>

                <p>
                  <strong>Reusable:</strong>{" "}
                  {String(result.reuse)}
                </p>

                <p>
                  <strong>Repairable:</strong>{" "}
                  {String(result.repair)}
                </p>

                <p>
                  <strong>Sustainability Score:</strong>{" "}
                  {result.score ?? "-"}/100
                </p>

                {result.inference_time_ms != null && (
                  <p>
                    <strong>Inference Time:</strong>{" "}
                    {result.inference_time_ms} ms
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AnalyzeTextile;