import { useEffect, useState } from "react";
import API from "../api/auth";
import "../styles/AdminDashboard.css";
import AdminSidebar from "../components/AdminSidebar";

function AdminDashboard() {
  const username = localStorage.getItem("username");

  const [dashboardData, setDashboardData] = useState({
    total_users: 0,
    total_inventory: 0,
    total_uploads: 0,
    total_reports: 0,
    recent_activity: [],
  });

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      const response = await API.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData({
        total_users: response.data.total_users ?? 0,
        total_inventory: response.data.total_inventory ?? 0,
        total_uploads: response.data.total_uploads ?? 0,
        total_reports: response.data.total_reports ?? 0,
        recent_activity: Array.isArray(response.data.recent_activity)
          ? response.data.recent_activity
          : [],
      });

    } catch (error) {
      console.error(
        "Admin Dashboard Error:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">

      <AdminSidebar />

      <main className="admin-content">

        {/* =========================
            TOP BAR
        ========================== */}

        <div className="top-bar">

          <div className="dashboard-heading">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {username} 👋</p>
          </div>

          <div className="admin-user">
            👤 {username}
          </div>

        </div>


        {/* =========================
            SYSTEM OVERVIEW
        ========================== */}

        <section className="system-overview">

          <h2>System Overview</h2>

          <div className="dashboard-cards">

            {/* =========================
                TOTAL USERS
            ========================== */}

            <div className="dash-card">

              <div className="card-icon">
                👥
              </div>

              <div className="card-info">

                <h3>Total Users</h3>

                <h2>
                  {loading
                    ? "..."
                    : dashboardData.total_users}
                </h2>

                <p>Registered users</p>

              </div>

            </div>


            {/* =========================
                TOTAL INVENTORY
            ========================== */}

            <div className="dash-card">

              <div className="card-icon">
                📦
              </div>

              <div className="card-info">

                <h3>Total Inventory</h3>

                <h2>
                  {loading
                    ? "..."
                    : dashboardData.total_inventory}
                </h2>

                <p>Inventory records</p>

              </div>

            </div>


            {/* =========================
                TOTAL UPLOADS
            ========================== */}

            <div className="dash-card">

              <div className="card-icon">
                📤
              </div>

              <div className="card-info">

                <h3>Total Uploads</h3>

                <h2>
                  {loading
                    ? "..."
                    : dashboardData.total_uploads}
                </h2>

                <p>Uploaded textiles</p>

              </div>

            </div>


            {/* =========================
                REPORTS GENERATED
            ========================== */}

            <div className="dash-card">

              <div className="card-icon">
                📄
              </div>

              <div className="card-info">

                <h3>Reports Generated</h3>

                <h2>
                  {loading
                    ? "..."
                    : dashboardData.total_reports}
                </h2>

                <p>Generated reports</p>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            RECENT ACTIVITY
        ========================== */}

        <section className="recent-section">

          <div className="recent-header">
            <h2>Recent Activity</h2>
          </div>

          <div className="activity-table">

            <table>

              <thead>

                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>

              </thead>

              <tbody>

                {dashboardData.recent_activity.length > 0 ? (

                  dashboardData.recent_activity.map((activity) => (

                    <tr key={activity.id}>

                      <td>
                        {activity.username}
                      </td>

                      <td>

                        <span
                          className={
                            activity.role === "admin"
                              ? "admin-badge"
                              : "user-badge"
                          }
                        >
                          {activity.role === "admin"
                            ? "Admin"
                            : "User"}
                        </span>

                      </td>

                      <td>
                        {activity.action}
                      </td>

                      <td>
                        {activity.status}
                      </td>

                      <td>
                        {activity.created_at
                          ? new Date(
                              activity.created_at
                            ).toLocaleString()
                          : "-"}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td colSpan="5">
                      No recent activity found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;