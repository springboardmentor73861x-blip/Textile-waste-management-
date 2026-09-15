import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/auth";
import RecyclerSidebar from "../components/RecyclerSidebar";
import "../styles/RecyclerDashboard.css";

function RecyclerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/auth/me");

        setProfile(response.data);
      } catch (err) {
        console.error(
          "Recycler Profile Error:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("company_name");
    localStorage.removeItem("company_code");

    navigate("/");
  };

  if (loading) {
    return (
      <div className="recycler-layout">
        <RecyclerSidebar />

        <main className="recycler-main">
          <div className="recycler-loading">
            Loading profile...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="recycler-layout">
      <RecyclerSidebar />

      <main className="recycler-main">

        <header className="recycler-header">
          <div>
            <span className="recycler-eyebrow">
              ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              View your recycler account and company
              information.
            </p>
          </div>
        </header>

        {error ? (
          <div className="recycler-error">
            {error}
          </div>
        ) : (
          <section className="profile-card">

            <div className="profile-left">

              <div className="profile-avatar">
                {(
                  profile?.username ||
                  "R"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h2>
                {profile?.username || "Recycler"}
              </h2>

              <p>
                {profile?.email || "-"}
              </p>

              <span className="profile-role-badge">
                Recycling Facility Operator
              </span>

            </div>

            <div className="profile-divider" />

            <div className="profile-details">

              <div className="profile-detail-row">
                <span>Username</span>
                <strong>
                  {profile?.username || "-"}
                </strong>
              </div>

              <div className="profile-detail-row">
                <span>Email</span>
                <strong>
                  {profile?.email || "-"}
                </strong>
              </div>

              <div className="profile-detail-row">
                <span>Role</span>
                <strong>
                  {profile?.role || "recycler"}
                </strong>
              </div>

              <div className="profile-detail-row">
                <span>Company Name</span>
                <strong>
                  {profile?.company_name || "-"}
                </strong>
              </div>

              <div className="profile-detail-row">
                <span>Company Code</span>
                <strong>
                  {profile?.company_code || "-"}
                </strong>
              </div>

              <div className="profile-detail-row">
                <span>Status</span>
                <span className="active-badge">
                  Active
                </span>
              </div>

              <div className="profile-actions">

                <button
                  type="button"
                  className="profile-back-button"
                  onClick={() =>
                    navigate(
                      "/recycler/dashboard"
                    )
                  }
                >
                  ← Dashboard
                </button>

                <button
                  type="button"
                  className="profile-logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}

export default RecyclerProfile;