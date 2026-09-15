import { useState } from "react";
import SustainabilitySidebar from "../components/SustainabilitySidebar";
import API from "../api/auth";
import "../styles/QuickAction.css";

function GenerateReport() {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);
      setMessage("");
      setError("");

      const response = await API.get(
        "/sustainability/generate-report",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/pdf",
        })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "Sustainability_Report.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("Sustainability PDF generated successfully.");
    } catch (err) {
      console.error("Sustainability report error:", err);
      setError("Unable to generate sustainability report.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="quick-action-layout">
      <SustainabilitySidebar />

      <main className="quick-action-content">
        <div className="quick-action-header">
          <span>SUSTAINABILITY ACTION</span>

          <h1>Generate Report</h1>

          <p>
            Generate and download sustainability and environmental
            performance reports for your company.
          </p>
        </div>

        <div className="quick-action-card">
          <div className="quick-action-large-icon">▤</div>

          <h2>Sustainability Reports</h2>

          <p>
            Generate a PDF report containing your company's
            textile waste and sustainability information.
          </p>

          <button
            type="button"
            onClick={handleGeneratePDF}
            className="quick-action-primary-button"
            disabled={generating}
          >
            {generating
              ? "Generating PDF..."
              : "Generate PDF →"}
          </button>

          {message && (
            <p className="quick-action-success">
              {message}
            </p>
          )}

          {error && (
            <p className="quick-action-error">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default GenerateReport;