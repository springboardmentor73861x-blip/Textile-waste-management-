import React, { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Tooltip,
} from "recharts";

import {
  FaLeaf,
  FaTint,
  FaBolt,
  FaGlobe,
  FaChartLine,
  FaCheckCircle,
  FaFileDownload,
} from "react-icons/fa";

import jsPDF from "jspdf";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import API from "../services/api";
import sustainabilityService from "../services/sustainabilityService";

import "../css/SustainabilityDashboard.css";


const SustainabilityDashboard = () => {

  // ============================================================
  // SIDEBAR
  // ============================================================

  const [collapsed, setCollapsed] = useState(false);


  // ============================================================
  // COMPLETED RECOVERY DATA
  // ============================================================

  const [completedWaste, setCompletedWaste] = useState([]);

  const [selectedWaste, setSelectedWaste] = useState(null);


  // ============================================================
  // ANALYSIS
  // ============================================================

  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // ============================================================
  // LOAD COMPLETED RECOVERY BATCHES
  // ============================================================

  const loadCompletedWaste = async () => {
    try {

      setError("");

      const response = await API.get(
        "/waste-requests/"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const completed = data.filter(
        (item) =>
          String(item.status || "")
            .trim()
            .toLowerCase() === "completed"
      );

      console.log(
        "Completed Recovery Waste:",
        completed
      );

      setCompletedWaste(completed);

    } catch (error) {

      console.error(
        "Loading recovery failed:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load recovered materials."
      );
    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadCompletedWaste();
  }, []);


  // ============================================================
  // SELECT RECOVERY BATCH
  // ============================================================

  const handleWasteSelection = (event) => {

    const selectedId = event.target.value;

    const selected = completedWaste.find(
      (item) =>
        String(item.id) === String(selectedId)
    );

    setSelectedWaste(
      selected || null
    );

    // Clear previous result
    setResults(null);

    setError("");
  };


  // ============================================================
  // ANALYZE SUSTAINABILITY
  // ============================================================

  const handleAnalyze = async () => {

    if (!selectedWaste) {

      setError(
        "Please select a completed recovery batch."
      );

      return;
    }

    try {

      setLoading(true);

      setError("");

      setResults(null);


      // --------------------------------------------------------
      // REQUEST DATA
      // --------------------------------------------------------

      const requestData = {

        fabric_type:
          selectedWaste.material,

        quantity:
          Number(selectedWaste.quantity),

        source:
          "Recovered Textile Waste",

        condition:
          "Processed",
      };


      console.log(
        "Sustainability Request:",
        requestData
      );


      // --------------------------------------------------------
      // API REQUEST
      // --------------------------------------------------------

      const response =
        await sustainabilityService.analyzeSustainability(
          requestData
        );


      console.log(
        "Sustainability Result:",
        response
      );


      setResults(response);

    } catch (error) {

      console.error(
        "Analysis failed:",
        error
      );

      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to analyze sustainability."
      );

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // SAFE VALUE
  // ============================================================

  const getValue = (
    object,
    keys,
    fallback = "N/A"
  ) => {

    if (
      !object ||
      typeof object !== "object"
    ) {
      return fallback;
    }

    for (const key of keys) {

      if (
        object[key] !== undefined &&
        object[key] !== null &&
        object[key] !== ""
      ) {

        return object[key];

      }
    }

    return fallback;
  };


  // ============================================================
  // FORMAT VALUE
  // ============================================================

  const formatValue = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return "N/A";
    }

    if (
      typeof value === "number"
    ) {

      return Number.isInteger(value)
        ? value
        : value.toFixed(2);
    }

    return String(value);
  };


  // ============================================================
  // RESPONSE OBJECTS
  // ============================================================

  const sustainability = getValue(
    results,
    [
      "sustainability",
    ],
    {}
  );


  const environmentalImpact = getValue(
    results,
    [
      "environmental_impact",
      "environmentalImpact",
      "environmental",
      "impact",
    ],
    {}
  );


  const recommendation = getValue(
    results,
    [
      "recycling_recommendation",
      "recyclingRecommendation",
      "recommendation",
    ],
    {}
  );


  const circularEconomy = getValue(
    results,
    [
      "circular_economy",
      "circularEconomy",
    ],
    {}
  );


  // ============================================================
  // SUSTAINABILITY VALUES
  // ============================================================

  const sustainabilityScore = getValue(
    sustainability,
    [
      "sustainability_score",
      "sustainabilityScore",
      "score",
    ],
    0
  );


  const sustainabilityLevel = getValue(
    sustainability,
    [
      "sustainability_level",
      "sustainabilityLevel",
      "level",
    ],
    "N/A"
  );


  const recyclability = getValue(
    sustainability,
    [
      "recyclability_score",
      "recyclabilityScore",
      "recyclability",
    ],
    0
  );


  // ============================================================
  // RECOMMENDATION VALUES
  // ============================================================

  const recyclingMethod = getValue(
    recommendation,
    [
      "recommended_recycling_method",
      "recommendedRecyclingMethod",
      "method",
    ],
    "N/A"
  );


  const recommendationPriority = getValue(
    recommendation,
    [
      "recycling_priority",
      "priority",
    ],
    "N/A"
  );


  // ============================================================
  // ENVIRONMENTAL VALUES
  // ============================================================

  const co2Saved = getValue(
    environmentalImpact,
    [
      "co2_saved",
      "co2Saved",
    ],
    0
  );


  const waterSaved = getValue(
    environmentalImpact,
    [
      "water_saved",
      "waterSaved",
    ],
    0
  );


  const energySaved = getValue(
    environmentalImpact,
    [
      "energy_saved",
      "energySaved",
    ],
    0
  );


  const environmentalScore = getValue(
    environmentalImpact,
    [
      "environmental_score",
      "environmentalScore",
    ],
    0
  );


  // ============================================================
  // CIRCULAR ECONOMY VALUES
  // ============================================================

  const recoveryPotential = getValue(
    circularEconomy,
    [
      "recovery_potential",
      "recoveryPotential",
      "recovery_rate",
    ],
    0
  );


  const reusePotential = getValue(
    circularEconomy,
    [
      "reuse_potential",
      "reusePotential",
    ],
    0
  );


  // ============================================================
  // NUMBER HELPER
  // ============================================================

  const toNumber = (value) => {

    const num = Number(value);

    return Number.isFinite(num)
      ? num
      : 0;
  };


  // ============================================================
  // CLAMP SCORE
  // ============================================================

  const clampScore = (value) => {

    return Math.min(
      Math.max(
        toNumber(value),
        0
      ),
      100
    );
  };


  // ============================================================
  // CHART DATA
  // ============================================================

  const scoreChartData = [
    {
      name: "Sustainability",
      value: clampScore(
        sustainabilityScore
      ),
    },
  ];


  const circularChartData = [
    {
      name: "Recyclability",
      value: clampScore(
        recyclability
      ),
    },

    {
      name: "Recovery",
      value: clampScore(
        recoveryPotential
      ),
    },

    {
      name: "Reuse",
      value: clampScore(
        reusePotential
      ),
    },
  ];


  // ============================================================
  // GENERATE PDF
  // ============================================================

  const generatePDF = () => {

    if (
      !selectedWaste ||
      !results
    ) {

      setError(
        "Please analyze a recovery batch before generating the report."
      );

      return;
    }


    try {

      const doc = new jsPDF();


      // ========================================================
      // HEADER
      // ========================================================

      doc.setFontSize(21);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Textile Waste AI",
        20,
        20
      );


      doc.setFontSize(16);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        "Sustainability Report",
        20,
        32
      );


      // ========================================================
      // REPORT LINE
      // ========================================================

      doc.setDrawColor(
        25,
        118,
        210
      );

      doc.line(
        20,
        40,
        190,
        40
      );


      // ========================================================
      // BATCH INFORMATION
      // ========================================================

      doc.setFontSize(14);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Recovery Batch Information",
        20,
        55
      );


      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Batch ID : RW-${selectedWaste.id}`,
        20,
        68
      );


      doc.text(
        `Material : ${formatValue(
          selectedWaste.material
        )}`,
        20,
        80
      );


      doc.text(
        `Quantity : ${formatValue(
          selectedWaste.quantity
        )} ${selectedWaste.unit || "Kg"}`,
        20,
        92
      );


      doc.text(
        `Status : ${formatValue(
          selectedWaste.status
        )}`,
        20,
        104
      );


      // ========================================================
      // SUSTAINABILITY PERFORMANCE
      // ========================================================

      doc.setFontSize(14);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Sustainability Performance",
        20,
        125
      );


      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Sustainability Score : ${formatValue(
          sustainabilityScore
        )}%`,
        20,
        138
      );


      doc.text(
        `Sustainability Level : ${formatValue(
          sustainabilityLevel
        )}`,
        20,
        150
      );


      doc.text(
        `Environmental Score : ${formatValue(
          environmentalScore
        )}%`,
        20,
        162
      );


      doc.text(
        `Recyclability : ${formatValue(
          recyclability
        )}%`,
        20,
        174
      );


      // ========================================================
      // ENVIRONMENTAL IMPACT
      // ========================================================

      doc.setFontSize(14);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Environmental Impact",
        20,
        195
      );


      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `CO2 Saved : ${formatValue(
          co2Saved
        )} Kg`,
        20,
        208
      );


      doc.text(
        `Water Saved : ${formatValue(
          waterSaved
        )} L`,
        20,
        220
      );


      doc.text(
        `Energy Saved : ${formatValue(
          energySaved
        )} MJ`,
        20,
        232
      );


      // ========================================================
      // PAGE 2
      // ========================================================

      doc.addPage();


      doc.setFontSize(16);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Circular Economy & Recycling",
        20,
        25
      );


      // ========================================================
      // RECYCLING
      // ========================================================

      doc.setFontSize(14);

      doc.text(
        "Recycling Recommendation",
        20,
        45
      );


      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Recommended Method : ${formatValue(
          recyclingMethod
        )}`,
        20,
        58
      );


      doc.text(
        `Priority : ${formatValue(
          recommendationPriority
        )}`,
        20,
        70
      );


      // ========================================================
      // CIRCULAR ECONOMY
      // ========================================================

      doc.setFontSize(14);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Circular Economy Analytics",
        20,
        92
      );


      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Recyclability : ${formatValue(
          recyclability
        )}%`,
        20,
        106
      );


      doc.text(
        `Recovery Potential : ${formatValue(
          recoveryPotential
        )}%`,
        20,
        118
      );


      doc.text(
        `Reuse Potential : ${formatValue(
          reusePotential
        )}%`,
        20,
        130
      );


      // ========================================================
      // REPORT SUMMARY
      // ========================================================

      doc.setFontSize(14);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Report Summary",
        20,
        155
      );


      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );

      const summaryText =
        `The selected recovered ${formatValue(
          selectedWaste.material
        )} textile batch has been analyzed using the Textile Waste AI sustainability intelligence engine.`;

      const wrappedSummary =
        doc.splitTextToSize(
          summaryText,
          165
        );

      doc.text(
        wrappedSummary,
        20,
        168
      );


      // ========================================================
      // FOOTER
      // ========================================================

      doc.setFontSize(9);

      doc.setTextColor(
        100,
        100,
        100
      );

      doc.text(
        "Generated using AI Sustainability Intelligence",
        20,
        270
      );


      doc.text(
        `Recovery Batch: RW-${selectedWaste.id}`,
        20,
        280
      );


      // ========================================================
      // SAVE
      // ========================================================

      doc.save(
        `Sustainability_RW-${selectedWaste.id}.pdf`
      );

    } catch (error) {

      console.error(
        "PDF generation failed:",
        error
      );

      setError(
        "Unable to generate the sustainability PDF report."
      );
    }
  };


  // ============================================================
  // UI
  // ============================================================

  return (

    <div
      className={
        collapsed
          ? "sustainability-layout sidebar-collapsed"
          : "sustainability-layout"
      }
    >

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="sustainability-main">

        <Navbar />


        <main className="sustainability-content">


          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="sustainability-header">

            <div>

              <span className="page-eyebrow">
                SUSTAINABILITY INTELLIGENCE
              </span>

              <h1>
                Sustainability Dashboard
              </h1>

              <p>
                Analyze completed recovered textile
                waste for environmental impact.
              </p>

            </div>

          </header>


          {/* ==================================================
              RECOVERY SELECTOR
          ================================================== */}

          <section className="sustainability-card">

            <div className="section-title">

              <div>

                <span className="section-eyebrow">
                  RECOVERY DATA
                </span>

                <h2>
                  Completed Recovery Batches
                </h2>

                <p>
                  Only 100% processed waste is analyzed.
                </p>

              </div>

            </div>


            <div className="form-group">

              <label>
                Select Completed Waste
              </label>


              <select
                value={
                  selectedWaste?.id || ""
                }
                onChange={
                  handleWasteSelection
                }
              >

                <option value="">
                  Select Batch
                </option>


                {completedWaste.map(
                  (item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >

                      RW-{item.id} -{" "}
                      {item.material} -{" "}
                      {item.quantity}{" "}
                      {item.unit || "Kg"}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* =================================================
                SELECTED BATCH
            ================================================= */}

            {selectedWaste && (

              <div className="selected-recovery">

                <div className="selected-recovery-header">

                  <div>

                    <span>
                      SELECTED RECOVERY
                    </span>

                    <h3>
                      RW-{selectedWaste.id}
                    </h3>

                  </div>

                  <div className="recovery-status">
                    {selectedWaste.status}
                  </div>

                </div>


                <div className="selected-recovery-grid">

                  <div>
                    <small>
                      Material
                    </small>

                    <strong>
                      {selectedWaste.material}
                    </strong>
                  </div>


                  <div>
                    <small>
                      Quantity
                    </small>

                    <strong>
                      {selectedWaste.quantity}{" "}
                      {selectedWaste.unit || "Kg"}
                    </strong>
                  </div>


                  <div>
                    <small>
                      Status
                    </small>

                    <strong>
                      Processed
                    </strong>
                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                ANALYZE BUTTON
            ================================================= */}

            <button
              type="button"
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={
                loading ||
                !selectedWaste
              }
            >

              {loading
                ? "Analyzing..."
                : "Analyze Sustainability →"}

            </button>

          </section>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="error-message">
              {error}
            </div>

          )}


          {/* ==================================================
              RESULTS
          ================================================== */}

          {results && !loading && (

            <>


              {/* =================================================
                  RESULT CARDS
              ================================================= */}

              <section className="results-grid">


                {/* SCORE */}

                <div className="result-card">

                  <div className="result-icon">
                    <FaLeaf />
                  </div>

                  <span>
                    Sustainability Score
                  </span>

                  <strong>
                    {formatValue(
                      sustainabilityScore
                    )}%
                  </strong>

                  <small>
                    {formatValue(
                      sustainabilityLevel
                    )}
                  </small>

                </div>


                {/* RECYCLING */}

                <div className="result-card">

                  <div className="result-icon">
                    <FaCheckCircle />
                  </div>

                  <span>
                    Recycling Method
                  </span>

                  <strong>
                    {formatValue(
                      recyclingMethod
                    )}
                  </strong>

                  <small>
                    Recommended process
                  </small>

                </div>


                {/* PRIORITY */}

                <div className="result-card">

                  <div className="result-icon">
                    <FaChartLine />
                  </div>

                  <span>
                    Priority
                  </span>

                  <strong>
                    {formatValue(
                      recommendationPriority
                    )}
                  </strong>

                  <small>
                    Action priority
                  </small>

                </div>

              </section>


              {/* =================================================
                  ENVIRONMENTAL IMPACT
              ================================================= */}

              <section className="dashboard-section">

                <div className="dashboard-section-heading">

                  <div>

                    <span className="section-eyebrow">
                      ENVIRONMENTAL PERFORMANCE
                    </span>

                    <h2>
                      Environmental Impact
                    </h2>

                  </div>

                </div>


                <div className="impact-grid">


                  {/* CO2 */}

                  <div className="impact-card">

                    <div className="impact-icon co2-icon">
                      <FaGlobe />
                    </div>

                    <span>
                      CO₂ Saved
                    </span>

                    <strong>
                      {formatValue(
                        co2Saved
                      )}
                    </strong>

                    <small>
                      Kilograms
                    </small>

                  </div>


                  {/* WATER */}

                  <div className="impact-card">

                    <div className="impact-icon water-icon">
                      <FaTint />
                    </div>

                    <span>
                      Water Saved
                    </span>

                    <strong>
                      {formatValue(
                        waterSaved
                      )}
                    </strong>

                    <small>
                      Litres
                    </small>

                  </div>


                  {/* ENERGY */}

                  <div className="impact-card">

                    <div className="impact-icon energy-icon">
                      <FaBolt />
                    </div>

                    <span>
                      Energy Saved
                    </span>

                    <strong>
                      {formatValue(
                        energySaved
                      )}
                    </strong>

                    <small>
                      MJ
                    </small>

                  </div>


                  {/* ENVIRONMENT SCORE */}

                  <div className="impact-card">

                    <div className="impact-icon score-impact-icon">
                      <FaChartLine />
                    </div>

                    <span>
                      Environmental Score
                    </span>

                    <strong>
                      {formatValue(
                        environmentalScore
                      )}%
                    </strong>

                    <small>
                      Performance rating
                    </small>

                  </div>

                </div>

              </section>


              {/* =================================================
                  ANALYTICS
              ================================================= */}

              <section className="analytics-section">


                {/* =================================================
                    CIRCULAR ECONOMY
                ================================================= */}

                <div className="analytics-card">

                  <div className="analytics-card-header">

                    <div>

                      <span className="analytics-eyebrow">
                        CIRCULAR ECONOMY
                      </span>

                      <h2>
                        Circular Economy Analytics
                      </h2>

                      <p>
                        Material recovery and reuse potential
                      </p>

                    </div>


                    <div className="analytics-header-icon">
                      ♻
                    </div>

                  </div>


                  <div className="circular-chart-wrapper">

                    <ResponsiveContainer
                      width="100%"
                      height={250}
                    >

                      <RadialBarChart
                        data={
                          circularChartData
                        }
                        innerRadius="25%"
                        outerRadius="85%"
                        startAngle={90}
                        endAngle={-270}
                        barSize={14}
                      >

                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          tick={false}
                        />

                        <RadialBar
                          dataKey="value"
                          background
                          cornerRadius={8}
                        />

                        <Tooltip
                          formatter={(value) => [
                            `${formatValue(
                              value
                            )}%`,
                            "Score",
                          ]}
                        />

                      </RadialBarChart>

                    </ResponsiveContainer>

                  </div>


                  {/* Circular Metrics */}

                  <div className="circular-metrics">


                    <div className="circular-metric">

                      <span className="metric-dot recyclability-dot"></span>

                      <div>

                        <span>
                          Recyclability
                        </span>

                        <strong>
                          {formatValue(
                            recyclability
                          )}%
                        </strong>

                      </div>

                    </div>


                    <div className="circular-metric">

                      <span className="metric-dot recovery-dot"></span>

                      <div>

                        <span>
                          Recovery
                        </span>

                        <strong>
                          {formatValue(
                            recoveryPotential
                          )}%
                        </strong>

                      </div>

                    </div>


                    <div className="circular-metric">

                      <span className="metric-dot reuse-dot"></span>

                      <div>

                        <span>
                          Reuse
                        </span>

                        <strong>
                          {formatValue(
                            reusePotential
                          )}%
                        </strong>

                      </div>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    OVERALL SCORE
                ================================================= */}

                <div className="analytics-card score-card">

                  <div className="analytics-card-header">

                    <div>

                      <span className="analytics-eyebrow">
                        PERFORMANCE SCORE
                      </span>

                      <h2>
                        Overall Sustainability
                      </h2>

                      <p>
                        Environmental sustainability performance
                      </p>

                    </div>


                    <div className="analytics-header-icon score-icon">
                      ★
                    </div>

                  </div>


                  <div className="score-chart-wrapper">

                    <ResponsiveContainer
                      width="100%"
                      height={250}
                    >

                      <RadialBarChart
                        data={
                          scoreChartData
                        }
                        innerRadius="65%"
                        outerRadius="88%"
                        startAngle={90}
                        endAngle={-270}
                        barSize={18}
                      >

                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          tick={false}
                        />

                        <RadialBar
                          dataKey="value"
                          background
                          cornerRadius={12}
                        />

                      </RadialBarChart>

                    </ResponsiveContainer>


                    {/* CENTER SCORE */}

                    <div className="score-center">

                      <strong>
                        {formatValue(
                          sustainabilityScore
                        )}
                      </strong>

                      <span>
                        / 100
                      </span>

                      <small>
                        Sustainability Score
                      </small>

                    </div>

                  </div>


                  {/* SCORE STATUS */}

                  <div className="score-status">

                    <div className="score-status-icon">
                      <FaCheckCircle />
                    </div>

                    <div>

                      <span>
                        Current Performance
                      </span>

                      <strong>
                        {formatValue(
                          sustainabilityLevel
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              </section>


              {/* =================================================
                  PDF REPORT ACTION
              ================================================= */}

              <section className="report-action-section">

                <div className="report-action-card">


                  <div className="report-action-content">

                    <div className="report-icon">
                      <FaFileDownload />
                    </div>


                    <div>

                      <span className="report-eyebrow">
                        BATCH REPORT
                      </span>

                      <h3>
                        Sustainability Report Ready
                      </h3>

                      <p>
                        Generate a detailed report
                        for the selected recovery batch.
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    className="generate-pdf-btn"
                    onClick={generatePDF}
                  >

                    <FaFileDownload />

                    <span>
                      Generate PDF Report
                    </span>

                  </button>

                </div>

              </section>


            </>

          )}

        </main>

      </div>

    </div>
  );
};


export default SustainabilityDashboard;