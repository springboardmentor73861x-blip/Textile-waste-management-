import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Result.css";

function Result() {

  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state;

  if (!result) {
    return (
      <div className="result-page">
        <div className="result-card">

          <h1>No Prediction Found</h1>

          <button
            className="back-btn"
            onClick={() => navigate("/upload")}
          >
            Go Back
          </button>

        </div>
      </div>
    );
  }

  return (

    <div className="result-page">

      <div className="result-card">

        <h1>PREDICTION RESULT</h1>

        <img
          src={`http://127.0.0.1:8000/uploads/${result.filename}`}
          alt="Uploaded"
          className="result-image"
        />

        <div className="result-grid">

          {/* Material */}
          <div className="box">
            <h3>Material</h3>
            <p>{result.material}</p>
          </div>

          {/* Waste Type */}
          <div className="box">
            <h3>Waste Type</h3>
            <p>{result.waste_type}</p>
          </div>

          {/* Confidence */}
          <div className="box">
            <h3>Confidence</h3>
            <p>{result.confidence}%</p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>

          </div>

          {/* Sustainability Score */}
          <div className="box score">
            <h3>Sustainability Score</h3>
            <p>{result.score}/100</p>
          </div>

          {/* Bottom Row */}
           <div className="small-box">
  <h3>Recycle</h3>
  <p>{result.recycle}</p>
</div>

<div className="small-box">
  <h3>Reuse</h3>
  <p>{result.reuse}</p>
</div>

<div className="small-box">
  <h3>Repair</h3>
  <p>{result.repair}</p>
</div>

        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/upload")}
        >
          Upload Another Image
        </button>

      </div>

    </div>

  );
}

export default Result;