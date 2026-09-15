import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/auth";
import AdminSidebar from "../components/AdminSidebar";

import "../styles/AdminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await API.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile({
        username: response.data.username || "",
        email: response.data.email || "",
        role: response.data.role || "admin",
      });

    } catch (error) {
      console.error("Admin Profile Error:", error);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      setError("Unable to load profile information.");

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("username");

    navigate("/");
  };

  return (
    <div className="admin-layout">

      <AdminSidebar />

      <main className="admin-content">

        <div className="profile-page">

          <div className="profile-header">
            <div>
              <h1>Administrator Profile</h1>
              <p>
                Manage your administrator account information
              </p>
            </div>
          </div>

          <div className="profile-card">

            <div className="profile-card-header">

              <div className="large-profile-avatar">
                {profile.username
                  ? profile.username.charAt(0).toUpperCase()
                  : "A"}
              </div>

              <div className="profile-heading">

                <h2>
                  {loading
                    ? "Loading..."
                    : profile.username || "Administrator"}
                </h2>

                <span className="admin-role-badge">
                  Administrator
                </span>

              </div>

            </div>

            {error && (
              <div className="profile-error">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="profile-details-grid">

                <div className="profile-field">
                  <label>Username</label>
                  <div className="profile-value">
                    {profile.username}
                  </div>
                </div>

                <div className="profile-field">
                  <label>Email</label>
                  <div className="profile-value">
                    {profile.email}
                  </div>
                </div>

                <div className="profile-field">
                  <label>Role</label>
                  <div className="profile-value">
                    {profile.role}
                  </div>
                </div>

                <div className="profile-field">
                  <label>Password</label>

                  <div className="profile-value password-value">
                    <span>••••••••••••</span>
                    <small>Protected</small>
                  </div>

                </div>

              </div>
            )}

            {!loading && !error && (
              <div className="profile-actions">

                <button
                  className="logout-profile-btn"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>

              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminProfile;