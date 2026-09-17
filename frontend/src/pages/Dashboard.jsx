import "./Dashboard.css";
import { Link } from "react-router-dom";
import Api from "../services/Api";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthContext";

import {
  FaUsers,
  FaRecycle,
  FaRobot,
  FaLeaf,
  FaBoxes,
  FaPlusCircle,
  FaChartLine,
  FaSignOutAlt,
  FaUserCircle,
  FaUpload,
  FaImage,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt
} from "react-icons/fa";


function Dashboard() {

  // ==========================================================
  // DASHBOARD DATA
  // ==========================================================

  const [users, setUsers] = useState([]);
  const [waste, setWaste] = useState([]);

  const { user, logout } = useContext(AuthContext);


  // ==========================================================
  // AI ANALYSIS STATES
  // ==========================================================

  const [selectedImage, setSelectedImage] = useState(null);

  const [preview, setPreview] = useState("");

  const [aiResult, setAiResult] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);

  const [aiError, setAiError] = useState("");


  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  useEffect(() => {

    loadUsers();
    loadWaste();

  }, []);


  // ==========================================================
  // LOAD USERS
  // ==========================================================

  const loadUsers = async () => {

    try {

      const res = await Api.get("/users");

      setUsers(res.data);

    }

    catch (err) {

      console.log(err);

    }

  };


  // ==========================================================
  // LOAD WASTE
  // ==========================================================

  const loadWaste = async () => {

    try {

      const res = await Api.get("/waste");

      setWaste(res.data);

    }

    catch (err) {

      console.log(err);

    }

  };


  // ==========================================================
  // IMAGE SELECTION
  // ==========================================================

  const handleImageChange = (event) => {

    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);

    setAiResult(null);

    setAiError("");

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);

  };


  // ==========================================================
  // AI IMAGE ANALYSIS
  // ==========================================================

  const analyzeImage = async () => {

    if (!selectedImage) {

      setAiError(
        "Please select a textile image first."
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


      const response = await Api.post(
        "/ai/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );


      setAiResult(
        response.data
      );

    }

    catch (error) {

      console.log(
        "AI Analysis Error:",
        error
      );

      setAiError(
        error?.response?.data?.detail ||
        "AI analysis failed. Please try again."
      );

    }

    finally {

      setAiLoading(false);

    }

  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    logout();

    window.location.href = "/";

  };


  // ==========================================================
  // DATE
  // ==========================================================

  const today =
    new Date().toLocaleDateString();


  // ==========================================================
  // DASHBOARD
  // ==========================================================

  return (

    <div className="dashboard">

      <div className="dashboard-overlay">


        {/* ==================================================
            NAVBAR
        ================================================== */}

        <nav className="navbar">

          <div>

            <h2>
              🌿 Textile Waste Intelligence Platform
            </h2>

            <p>
              AI Powered Sustainability Dashboard
            </p>

          </div>


          <div className="nav-right">


            {/* PROFILE */}

            <div className="profile">

              <FaUserCircle size={38} />

              <div>

                <h4>
                  {user?.name}
                </h4>

                <span>
                  {user?.role}
                </span>

              </div>

            </div>


            {/* DATE */}

            <div className="date">

              📅 {today}

            </div>


            {/* LOGOUT */}

            <button
              className="logout"
              onClick={handleLogout}
            >

              <FaSignOutAlt />

              Logout

            </button>

          </div>

        </nav>


        {/* ==================================================
            HERO
        ================================================== */}

        <section className="hero">

          <h1>
            Dashboard Overview
          </h1>

          <p>
            Monitor textile waste collection,
            AI classification and sustainability insights.
          </p>

        </section>


        {/* ==================================================
            STATISTICS
        ================================================== */}

        <section className="stats">


          <div className="stat-card">

            <FaUsers className="stat-icon" />

            <h3>
              Total Users
            </h3>

            <h1>
              {users.length}
            </h1>

          </div>


          <div className="stat-card">

            <FaRecycle className="stat-icon" />

            <h3>
              Waste Records
            </h3>

            <h1>
              {waste.length}
            </h1>

          </div>


          <div className="stat-card">

            <FaLeaf className="stat-icon" />

            <h3>
              Sustainability
            </h3>

            <h1>
              92%
            </h1>

          </div>


          <div className="stat-card">

            <FaRobot className="stat-icon" />

            <h3>
              AI Status
            </h3>

            <h2>
              Ready
            </h2>

          </div>


        </section>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

<section className="quick-actions">

    <h2>
        Quick Actions
    </h2>


    <div className="action-grid">

    <Link to="/register">

        <button>

            <FaPlusCircle />

            Register User

        </button>

    </Link>


    <Link to="/inventory">

        <button>

            <FaBoxes />

            Add Waste

        </button>

    </Link>


    <Link to="/sustainability">

        <button>

            <FaLeaf />

            Sustainability Intelligence

        </button>

    </Link>


    {/* EXECUTIVE ANALYTICS */}

            <Link to="/analytics">

        <button>

            <FaChartLine />

            Executive Analytics

        </button>

        </Link>


        {/* REPORTS */}

        <Link to="/reports">

        <button>

            <FaFileAlt />

            Reports & Insights

        </button>

        </Link>


        </div>

        </section>


        {/* ==================================================
            AI IMAGE ANALYSIS
        ================================================== */}

        <section className="ai-analysis-section">


          <div className="ai-analysis-card">


            {/* AI HEADER */}

            <div className="ai-header">

              <div>

                <h2>

                  <FaRobot />

                  AI Image Analysis

                </h2>

                <p>
                  Upload a textile image for
                  AI-powered material classification.
                </p>

              </div>

              <div className="ai-status-badge">

                <span></span>

                AI Ready

              </div>

            </div>


            {/* AI BODY */}

            <div className="ai-analysis-body">


              {/* IMAGE UPLOAD */}

              <div className="ai-upload-area">


                {preview ? (

                  <div className="image-preview">

                    <img
                      src={preview}
                      alt="Selected textile"
                    />

                  </div>

                ) : (

                  <div className="upload-placeholder">

                    <FaImage />

                    <h3>
                      Upload Textile Image
                    </h3>

                    <p>
                      JPG, JPEG or PNG
                    </p>

                  </div>

                )}


                <label
                  htmlFor="dashboard-image-upload"
                  className="upload-button"
                >

                  <FaUpload />

                  Choose Image

                </label>


                <input
                  id="dashboard-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />


                {selectedImage && (

                  <p className="selected-file">

                    {selectedImage.name}

                  </p>

                )}


                <button
                  className="analyze-button"
                  onClick={analyzeImage}
                  disabled={
                    !selectedImage ||
                    aiLoading
                  }
                >

                  <FaRobot />

                  {aiLoading
                    ? "Analyzing..."
                    : "Analyze Image"
                  }

                </button>


              </div>


              {/* AI RESULT */}

              <div className="ai-result-area">


                {!aiResult && !aiError && (

                  <div className="ai-empty">

                    <FaRobot />

                    <h3>
                      AI Analysis Result
                    </h3>

                    <p>
                      Upload an image and click
                      Analyze Image to see the result.
                    </p>

                  </div>

                )}


                {/* ERROR */}

                {aiError && (

                  <div className="ai-error">

                    <FaTimesCircle />

                    <h3>
                      Analysis Failed
                    </h3>

                    <p>
                      {aiError}
                    </p>

                  </div>

                )}


                {/* NOT TEXTILE */}

                {aiResult?.classification === "NOT_TEXTILE" && (

                  <div className="ai-not-textile">

                    <FaTimesCircle />

                    <h3>
                      Not a Textile Image
                    </h3>

                    <div className="result-confidence">

                      Confidence

                      <strong>
                        {aiResult.confidence}%
                      </strong>

                    </div>


                    <div className="result-confidence">

                      Textile Probability

                      <strong>
                        {aiResult.textile_probability}%
                      </strong>

                    </div>


                    <p>
                      {aiResult.message}
                    </p>

                  </div>

                )}


                {/* TEXTILE */}

                {aiResult?.classification === "TEXTILE" && (

                  <div className="ai-success">

                    <div className="ai-success-title">

                      <FaCheckCircle />

                      <h3>
                        Textile Detected
                      </h3>

                    </div>


                    <div className="result-grid">


                      <div className="result-box">

                        <span>
                          Prediction
                        </span>

                        <strong>
                          {aiResult.prediction}
                        </strong>

                      </div>


                     
                      <div className="result-box">

                        <span>
                          Classification Confidence
                        </span>

                        <strong>
                          {aiResult.confidence}%
                        </strong>

                      </div>


                      


                      <div className="result-box">

                        <span>
                           Test Accuracy
                        </span>

                        <strong>
                          {aiResult.accuracy}%
                        </strong>

                      </div>


                    </div>

                  </div>

                )}


              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            RECENT RECORDS
        ================================================== */}

        <section className="records">


          <div className="records-card">

            <h2>

              <FaChartLine />

              Recent Waste Records

            </h2>


            <table>

              <thead>

                <tr>

                  <th>
                    User
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

                </tr>

              </thead>


              <tbody>

                {waste.length === 0 ? (

                  <tr>

                    <td colSpan="4">

                      No waste records found.

                    </td>

                  </tr>

                ) : (

                  waste
                    .slice(0, 5)
                    .map((item) => (

                      <tr key={item.id}>

                        <td>
                          {item.user_id}
                        </td>

                        <td>
                          {item.fabric_type}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          {item.condition}
                        </td>

                      </tr>

                    ))

                )}

              </tbody>

            </table>

          </div>


          {/* AI INFORMATION CARD */}

          <div className="records-card ai-info-card">

            <h2>

              🤖

              AI Intelligence

            </h2>


            <div className="ai-info-item">

              <span>
                Textile Verification
              </span>

              <strong>
                Active
              </strong>

            </div>


            <div className="ai-info-item">

              <span>
                Task Routing
              </span>

              <strong>
                1 Task
              </strong>

            </div>


            <div className="ai-info-item">

              <span>
                Image Classification
              </span>

              <strong>
                Active
              </strong>

            </div>


            <div className="ai-info-item">

              <span>
                AI Model
              </span>

              <strong>
                EfficientNetB1
              </strong>

            </div>


            <p className="ai-info-description">

              The AI system first verifies whether
              the uploaded image contains textile
              material and then routes it to the
              appropriate classification task.

            </p>

          </div>


        </section>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer>

          © 2026 AI Powered Textile Waste
          Intelligence Platform

        </footer>


      </div>

    </div>

  );

}


export default Dashboard;