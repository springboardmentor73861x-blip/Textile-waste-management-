import { useEffect, useState } from "react";
import API from "../api/auth";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminUploads.css";

function AdminUploads() {

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.get("/upload/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUploads(response.data);

    } catch (error) {

      console.log("Admin Uploads Error:", error);

    } finally {

      setLoading(false);

    }

  };

  const getImageUrl = (filename) => {
    return `http://localhost:8000/uploads/${filename}`;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <div className="admin-uploads-page">

      <div className="uploads-header">

        <div>
          <h1>Uploaded Textile Images</h1>
          <p>
            View and monitor all textile images uploaded to the platform.
          </p>
        </div>

        <div className="uploads-count">
          Total Uploads: {uploads.length}
        </div>

      </div>


      <div className="uploads-table-container">

        <table className="uploads-table">

          <thead>

            <tr>
              <th>Image</th>
              <th>Filename</th>
              <th>Uploaded By</th>
              <th>Material</th>
              <th>Waste Type</th>
              <th>Confidence</th>
              <th>Recycle</th>
              <th>Reuse</th>
              <th>Repair</th>
              <th>Score</th>
              <th>Date</th>
            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>
                <td colSpan="11" className="table-message">
                  Loading uploads...
                </td>
              </tr>

            ) : uploads.length > 0 ? (

              uploads.map((upload) => (

                <tr key={upload.id}>

                  <td>

                    <img
                      src={getImageUrl(upload.filename)}
                      alt="Textile"
                      className="upload-thumbnail"
                    />

                  </td>

                  <td>{upload.filename}</td>

                  <td>{upload.uploaded_by}</td>

                  <td>{upload.material || "-"}</td>

                  <td>{upload.waste_type || "-"}</td>

                  <td>{upload.confidence || "-"}</td>

                  <td>{upload.recycle || "-"}</td>

                  <td>{upload.reuse || "-"}</td>

                  <td>{upload.repair || "-"}</td>

                  <td>{upload.score ?? "-"}</td>

                  <td>
                    {upload.created_at
                      ? new Date(
                          upload.created_at
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td colSpan="11" className="table-message">
                  No uploaded textile images found.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  </main>
  </div>
  );
}

export default AdminUploads;