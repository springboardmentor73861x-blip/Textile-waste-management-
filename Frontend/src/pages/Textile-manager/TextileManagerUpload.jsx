import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextileManagerSidebar from "../../components/TextileManagerSidebar";
import API from "../../api/auth";
import "../../styles/Textile-manager/TextileManagerUpload.css";

function TextileManagerUpload() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(null);
    setPreview(null);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a textile image first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("file", selectedFile);

      /*
       * Existing backend endpoint:
       * POST /upload/
       *
       * Do NOT set Content-Type manually.
       * Axios/browser will automatically set the
       * correct multipart/form-data boundary.
       */
      const response = await API.post("/upload/", formData);

      console.log("Textile upload result:", response.data);

      /*
       * The existing backend has already:
       * 1. validated the image
       * 2. saved the image
       * 3. preprocessed it
       * 4. generated AI prediction
       * 5. saved Upload record
       * 6. saved Inventory record
       *
       * So we only navigate after successful API response.
       */
      setMessage("Textile uploaded and analyzed successfully.");

      /*
       * Go to AI Predictions page.
       * The saved prediction will be read from the database there.
       */
      setTimeout(() => {
        navigate("/textile-manager/ai-predictions");
      }, 700);
    } catch (error) {
      console.error("Textile upload error:", error);

      if (error.response) {
        if (error.response.status === 401) {
          setMessage("Session expired. Please login again.");
        } else if (error.response.status === 403) {
          setMessage("You are not authorized to upload textile images.");
        } else if (error.response.data?.detail) {
          setMessage(error.response.data.detail);
        } else {
          setMessage("Upload failed. Please try again.");
        }
      } else if (error.request) {
        setMessage(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="textile-manager-upload-layout">

      {/* SIDEBAR */}
      <TextileManagerSidebar />

      {/* MAIN CONTENT */}
      <main className="textile-manager-upload-content">

        {/* HEADER */}
        <header className="textile-manager-upload-header">
          <div>
            <span className="textile-manager-upload-label">
              TEXTILE INTELLIGENCE
            </span>

            <h1>Upload Textile</h1>

            <p>
              Upload a textile waste image for material
              classification and AI-powered analysis.
            </p>
          </div>
        </header>

        {/* PIPELINE */}
        <section className="textile-manager-upload-pipeline">

          <div className="textile-manager-pipeline-step active">
            <span>1</span>

            <div>
              <strong>Upload Textile</strong>
              <small>Select textile image</small>
            </div>
          </div>

          <div className="textile-manager-pipeline-line" />

          <div className="textile-manager-pipeline-step">
            <span>2</span>

            <div>
              <strong>Material Classification</strong>
              <small>Identify material</small>
            </div>
          </div>

          <div className="textile-manager-pipeline-line" />

          <div className="textile-manager-pipeline-step">
            <span>3</span>

            <div>
              <strong>AI Prediction</strong>
              <small>Generate prediction</small>
            </div>
          </div>

          <div className="textile-manager-pipeline-line" />

          <div className="textile-manager-pipeline-step">
            <span>4</span>

            <div>
              <strong>Recommendation</strong>
              <small>Recycle / Reuse</small>
            </div>
          </div>

        </section>

        {/* UPLOAD CARD */}
        <section className="textile-manager-upload-card">

          <div className="textile-manager-upload-card-header">

            <div>
              <span>TEXTILE IMAGE</span>

              <h2>Upload Textile Image</h2>

              <p>
                Select a clear image of the textile waste
                you want to analyze.
              </p>
            </div>

            <div className="textile-manager-upload-card-icon">
              ⇧
            </div>

          </div>

          {/* UPLOAD AREA */}
          {!selectedFile ? (
            <label className="textile-manager-upload-area">

              <div className="textile-manager-upload-icon">
                ⇧
              </div>

              <h3>
                Upload Textile Image
              </h3>

              <p>
                Click to select a textile image
              </p>

              <span>
                PNG, JPG or JPEG
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                hidden
              />

            </label>
          ) : (
            <div className="textile-manager-preview-area">

              <div className="textile-manager-preview-wrapper">

                <img
                  src={preview}
                  alt="Selected textile"
                  className="textile-manager-image-preview"
                />

              </div>

              <div className="textile-manager-preview-info">

                <div>
                  <strong>
                    {selectedFile.name}
                  </strong>

                  <span>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <button
                  type="button"
                  className="textile-manager-remove-button"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  Remove
                </button>

              </div>

            </div>
          )}

        </section>

        {/* ACTION */}
        <section className="textile-manager-upload-action">

          <div>
            <strong>
              Ready to analyze?
            </strong>

            <p>
              Upload the image to continue with material
              classification and AI prediction.
            </p>
          </div>

          <div className="textile-manager-upload-actions">

            <button
              type="button"
              className="textile-manager-cancel-button"
              onClick={handleRemove}
              disabled={!selectedFile || uploading}
            >
              Clear
            </button>

            <button
              type="button"
              className="textile-manager-upload-button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading
                ? "Uploading & Analyzing..."
                : "Upload & Continue →"}
            </button>

          </div>

        </section>

        {/* MESSAGE */}
        {message && (
          <div
            className={`textile-manager-upload-message ${
              message.includes("successfully")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>
        )}

        {/* PROCESS INFO */}
        <section className="textile-manager-upload-info">

          <div className="textile-manager-upload-info-icon">
            ✦
          </div>

          <div>
            <h3>
              What happens after upload?
            </h3>

            <p>
              The textile image moves through material
              classification, AI prediction and sustainability
              recommendation. The prediction result will also
              provide an option to download the generated report.
            </p>
          </div>

        </section>

        {/* FOOTER */}
        <footer className="textile-manager-upload-footer">
          Textile Waste Intelligence Platform • Textile Upload
        </footer>

      </main>
    </div>
  );
}

export default TextileManagerUpload;