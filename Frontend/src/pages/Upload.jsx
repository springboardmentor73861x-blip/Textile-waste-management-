
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/auth";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/Upload.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Image Type Validation
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only JPG, JPEG and PNG images are allowed.");
      return;
    }

    // Size Validation (5 MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5 MB.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const uploadImage = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");

      setLoading(true);

      const response = await API.post(
        "/upload/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Image Uploaded Successfully");

      setFile(null);
      setPreview(null);

      navigate("/result", {
        state: response.data,
      });
    } catch (err) {
      console.log(err);
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-upload-layout">

      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Upload Main Content */}
      <main className="admin-upload-main">

        <div className="admin-upload-header">
          <div>
            <h1>Upload Textile Image</h1>
            <p>
              Upload a textile image for AI-powered fabric classification
              and recycling analysis.
            </p>
          </div>
        </div>

        <div className="admin-upload-content">

          <div className="upload-card">

            <div className="upload-card-header">
              <div className="upload-header-icon">
                📤
              </div>

              <div>
                <h2>Upload Textile Image</h2>
                <p>
                  Select an image to start textile analysis.
                </p>
              </div>
            </div>

            <label className="upload-box">

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
              />

              <div className="upload-icon">
                📁
              </div>

              <h3>Choose Textile Image</h3>

              <span>
                JPG, PNG or JPEG
              </span>

              <small>
                Maximum file size: 5 MB
              </small>

            </label>

            {preview && (
              <div className="preview-section">

                <div className="preview-heading">
                  <h3>Image Preview</h3>
                  <span>Selected textile image</span>
                </div>

                <div className="preview-box">

                  <img
                    src={preview}
                    alt="Textile Preview"
                    className="preview-image"
                  />

                  <div className="selected-file">
                    <span>Selected File</span>
                    <strong>{file.name}</strong>
                  </div>

                </div>

              </div>
            )}

            <button
              className="upload-btn"
              onClick={uploadImage}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Image"}
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Upload;
