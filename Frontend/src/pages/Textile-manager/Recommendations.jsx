import { useEffect, useState } from "react";
import TextileManagerSidebar from "../../components/TextileManagerSidebar";
import API from "../../api/auth";
import "../../styles/Textile-manager/Recommendations.css";

function Recommendations() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({
    activeRecommendations: 0,
    recycling: 0,
    reuse: 0,
    wasteReduction: 0,
    expectedImpact: "Low",
  });

  const [insight, setInsight] = useState({
    title: "No AI recommendations yet",
    description:
      "Upload and analyze a textile image to generate AI-based sustainability recommendations.",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "All",
    "Recycling",
    "Reuse",
    "Waste Reduction",
  ];

  // =========================================================
  // FETCH REAL BACKEND RECOMMENDATIONS
  // =========================================================

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/recommendations/");

      const data = response.data;

      console.log(
        "Recommendations Backend Response:",
        data
      );

      setRecommendations(
        Array.isArray(data.recommendations)
          ? data.recommendations
          : []
      );

      setSummary(
        data.summary || {
          activeRecommendations: 0,
          recycling: 0,
          reuse: 0,
          wasteReduction: 0,
          expectedImpact: "Low",
        }
      );

      setInsight(
        data.insight || {
          title: "No AI recommendations yet",
          description:
            "Upload and analyze a textile image to generate AI-based sustainability recommendations.",
        }
      );
    } catch (err) {
      console.error(
        "Recommendations Error:",
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
          "Unable to load recommendations from the backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredRecommendations =
    selectedCategory === "All"
      ? recommendations
      : recommendations.filter(
          (item) =>
            item.category === selectedCategory
        );

  // =========================================================
  // ACTION
  // =========================================================

  const handleAction = (recommendation) => {
    alert(
      `${recommendation.action} selected for ${recommendation.material}.`
    );
  };

  return (
    <div className="tm-recommendations-layout">

      {/* SIDEBAR */}
      <TextileManagerSidebar />

      {/* MAIN CONTENT */}
      <main className="tm-recommendations-content">

        {/* HEADER */}
        <header className="tm-recommendations-header">

          <div>
            <span className="tm-recommendations-label">
              TEXTILE INTELLIGENCE
            </span>

            <h1>Sustainability Recommendations</h1>

            <p>
              AI-based recommendations for recycling, reuse and
              textile waste reduction.
            </p>
          </div>

          <div className="tm-recommendations-summary">

            <div className="tm-summary-number">
              {summary.activeRecommendations}
            </div>

            <div>
              <span>
                Active Recommendations
              </span>

              <strong>
                Based on AI analysis
              </strong>
            </div>

          </div>

        </header>


        {/* OVERVIEW CARDS */}
        <section className="tm-recommendation-overview">

          <div className="tm-overview-card">

            <div className="tm-overview-icon">
              ♻
            </div>

            <div>
              <span>
                Recycling
              </span>

              <strong>
                {summary.recycling}
              </strong>

              <small>
                Recommended actions
              </small>
            </div>

          </div>


          <div className="tm-overview-card">

            <div className="tm-overview-icon">
              ↻
            </div>

            <div>
              <span>
                Reuse
              </span>

              <strong>
                {summary.reuse}
              </strong>

              <small>
                Recommended actions
              </small>
            </div>

          </div>


          <div className="tm-overview-card">

            <div className="tm-overview-icon">
              ↓
            </div>

            <div>
              <span>
                Waste Reduction
              </span>

              <strong>
                {summary.wasteReduction}
              </strong>

              <small>
                Recommended action
              </small>
            </div>

          </div>


          <div className="tm-overview-card">

            <div className="tm-overview-icon">
              ★
            </div>

            <div>
              <span>
                Expected Impact
              </span>

              <strong>
                {summary.expectedImpact}
              </strong>

              <small>
                Overall sustainability impact
              </small>
            </div>

          </div>

        </section>


        {/* AI INSIGHT */}
        <section className="tm-ai-insight">

          <div className="tm-ai-insight-icon">
            ✦
          </div>

          <div>

            <span>
              AI SUSTAINABILITY INSIGHT
            </span>

            <h2>
              {insight.title}
            </h2>

            <p>
              {insight.description}
            </p>

          </div>

        </section>


        {/* ERROR */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#fff0f0",
              color: "#c0392b",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}


        {/* RECOMMENDATION SECTION */}
        <section className="tm-recommendation-section">

          <div className="tm-recommendation-section-header">

            <div>

              <h2>
                Recommended Actions
              </h2>

              <p>
                Suggested actions based on textile classification
                and sustainability analysis.
              </p>

            </div>


            <div className="tm-category-filter">

              {categories.map((category) => (

                <button
                  key={category}
                  type="button"
                  className={
                    selectedCategory === category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                >
                  {category}
                </button>

              ))}

            </div>

          </div>


          {/* LOADING */}
          {loading && (
            <div
              style={{
                padding: "40px 22px",
                textAlign: "center",
                color: "#81788e",
                fontSize: "13px",
              }}
            >
              Loading AI recommendations...
            </div>
          )}


          {/* RECOMMENDATION LIST */}
          {!loading && (
            <div className="tm-recommendation-list">

              {filteredRecommendations.length === 0 ? (

                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "45px 20px",
                    textAlign: "center",
                    color: "#81788e",
                    fontSize: "13px",
                  }}
                >
                  No recommendations available yet.
                  Upload and analyze a textile image first.
                </div>

              ) : (

                filteredRecommendations.map(
                  (recommendation) => (

                    <article
                      key={recommendation.id}
                      className="tm-recommendation-card"
                    >

                      {/* CARD TOP */}
                      <div className="tm-recommendation-card-top">

                        <div className="tm-recommendation-material">

                          <div className="tm-material-icon">
                            {(
                              recommendation.material ||
                              "?"
                            ).charAt(0)}
                          </div>

                          <div>

                            <span>
                              {recommendation.material}
                            </span>

                            <strong>
                              {recommendation.category}
                            </strong>

                          </div>

                        </div>


                        <span
                          className={`tm-priority ${
                            recommendation.priority?.toLowerCase() ===
                            "high"
                              ? "high"
                              : "medium"
                          }`}
                        >
                          {recommendation.priority} Priority
                        </span>

                      </div>


                      {/* BODY */}
                      <div className="tm-recommendation-body">

                        <h3>
                          {recommendation.title}
                        </h3>

                        <p>
                          {recommendation.description}
                        </p>

                      </div>


                      {/* DETAILS */}
                      <div className="tm-recommendation-details">

                        <div>

                          <span>
                            Recommended Action
                          </span>

                          <strong>
                            {recommendation.action}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Expected Impact
                          </span>

                          <strong className="tm-impact">
                            {recommendation.impact}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Status
                          </span>

                          <strong className="tm-status">
                            {recommendation.status}
                          </strong>

                        </div>

                      </div>


                      {/* ACTION */}
                      <div className="tm-recommendation-actions">

                        <button
                          type="button"
                          className="tm-action-button"
                          onClick={() =>
                            handleAction(recommendation)
                          }
                        >
                          {recommendation.action}

                          <span>
                            →
                          </span>

                        </button>

                      </div>

                    </article>

                  )
                )

              )}

            </div>
          )}

        </section>


        {/* FOOTER */}
        <footer className="tm-recommendations-footer">
          Textile Waste Intelligence Platform • AI Sustainability
          Recommendations
        </footer>

      </main>

    </div>
  );
}

export default Recommendations;