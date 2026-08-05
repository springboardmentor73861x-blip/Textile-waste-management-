import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

import {
  FaUpload,
  FaImage
} from "react-icons/fa";

import "../css/WasteUpload.css";

function WasteUpload() {

  const [collapsed, setCollapsed] = useState(false);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  // Upload Image
  const handleImage = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));

  };

  // AI Prediction
  const handlePredict = async () => {

    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    try {

      const data = new FormData();
      data.append("image", image);

      // Future AI API
      // await API.post("/predict", data);

      alert("AI Prediction Completed!");

    } catch (error) {

      console.log(error);
      alert("Prediction Failed");

    }

  };

  // Save Waste
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!image) {
      alert("Please upload an image.");
      return;
    }

    try {

      const data = new FormData();
      data.append("image", image);

      await API.post("/manufacturer/upload", data);

      alert("Waste Uploaded Successfully!");

    } catch (error) {

      console.log(error);
      alert("Upload Failed");

    }

  };

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="upload-container">

          <h1>Upload Textile Waste</h1>

          <p>
            Upload an image and let AI analyze the textile waste.
          </p>

          <form
            className="upload-form"
            onSubmit={handleSubmit}
          >

            {/* Image Upload */}

            <div className="image-upload">

              <label htmlFor="image">

                <FaImage className="upload-icon" />

                <p>Choose Textile Waste Image</p>

              </label>

              <input
                id="image"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImage}
              />

              {preview && (

                <img
                  src={preview}
                  alt="Preview"
                  className="preview-image"
                />

              )}

            </div>

            {/* Buttons */}

            <div className="button-group">

              <button
                type="button"
                className="predict-btn"
                onClick={handlePredict}
              >
                🤖 AI Predict
              </button>

              <button
                type="submit"
                className="upload-btn"
              >
                <FaUpload />
                Save Waste
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

}

export default WasteUpload;