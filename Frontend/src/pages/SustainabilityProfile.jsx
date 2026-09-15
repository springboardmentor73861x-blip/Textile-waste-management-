import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SustainabilitySidebar from "../components/SustainabilitySidebar";
import API from "../api/auth";
import "../styles/SustainabilityProfile.css";

function SustainabilityProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "Sustainability Manager",
    email: "",
    role: "Sustainability Manager",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        /*
         * Use the existing authenticated user endpoint.
         * If your auth API exposes /auth/me, this loads the
         * currently logged-in Sustainability Manager.
         */

        const response = await API.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data || {};

        setProfile({
          username:
            user.username ||
            user.name ||
            "Sustainability Manager",

          email: user.email || "",

          role:
            user.role ||
            "Sustainability Manager",
        });
      } catch (err) {
        console.error(
          "Sustainability Profile Error:",
          err.response?.data || err
        );

        /*
         * Keep the page usable even if the profile endpoint
         * is unavailable.
         */

        setProfile((previous) => ({
          ...previous,
          role: "Sustainability Manager",
        }));

        setError(
          err.response?.data?.detail ||
            "Unable to load profile information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="sustainability-profile-layout">

      <SustainabilitySidebar />

      <main className="sustainability-profile-content">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="sustainability-profile-header">

          <div>
            <span className="sustainability-profile-label">
              Account
            </span>

            <h1>
              Sustainability Manager Profile
            </h1>

            <p>
              View your account information and sustainability
              management role.
            </p>
          </div>

          <button
            type="button"
            className="sustainability-profile-back"
            onClick={() => navigate("/sustainability-dashboard")}
          >
            ← Dashboard
          </button>

        </header>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="sustainability-profile-error">
            {error}
          </div>
        )}


        {/* =====================================================
            PROFILE CARD
        ===================================================== */}

        <section className="sustainability-profile-card">

          <div className="sustainability-profile-card-header">

            <div className="sustainability-profile-avatar">
              S
            </div>

            <div>

              <h2>
                {loading
                  ? "Loading..."
                  : profile.username}
              </h2>

              <p>
                Sustainability Manager
              </p>

            </div>

          </div>


          {/* ===================================================
              INFORMATION
          =================================================== */}

          <div className="sustainability-profile-information">

            <div className="sustainability-profile-field">

              <span>
                Full Name
              </span>

              <strong>
                {loading
                  ? "Loading..."
                  : profile.username}
              </strong>

            </div>


            <div className="sustainability-profile-field">

              <span>
                Email Address
              </span>

              <strong>
                {loading
                  ? "Loading..."
                  : profile.email || "Not available"}
              </strong>

            </div>


            <div className="sustainability-profile-field">

              <span>
                Role
              </span>

              <strong>
                Sustainability Manager
              </strong>

            </div>


            <div className="sustainability-profile-field">

              <span>
                Department
              </span>

              <strong>
                Sustainability Management
              </strong>

            </div>


            <div className="sustainability-profile-field">

              <span>
                Platform Access
              </span>

              <strong className="access-active">
                Active
              </strong>

            </div>


            <div className="sustainability-profile-field">

              <span>
                Account Type
              </span>

              <strong>
                Manager
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================================
            RESPONSIBILITIES
        ===================================================== */}

        <section className="sustainability-profile-section">

          <div className="sustainability-profile-section-heading">

            <span>
              ROLE INFORMATION
            </span>

            <h2>
              Sustainability Manager Responsibilities
            </h2>

            <p>
              Your platform role focuses on monitoring textile
              waste and sustainability performance.
            </p>

          </div>


          <div className="sustainability-responsibilities-grid">

            <div className="sustainability-responsibility-card">

              <div className="sustainability-responsibility-icon">
                ♻
              </div>

              <h3>
                Waste Monitoring
              </h3>

              <p>
                Monitor textile waste generation and
                sustainability performance.
              </p>

            </div>


            <div className="sustainability-responsibility-card">

              <div className="sustainability-responsibility-icon">
                ◈
              </div>

              <h3>
                Environmental Analysis
              </h3>

              <p>
                Review environmental impact and
                sustainability indicators.
              </p>

            </div>


            <div className="sustainability-responsibility-card">

              <div className="sustainability-responsibility-icon">
                ▤
              </div>

              <h3>
                Sustainability Reports
              </h3>

              <p>
                Review reports and sustainability-related
                platform insights.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            SECURITY
        ===================================================== */}

        <section className="sustainability-profile-section">

          <div className="sustainability-profile-section-heading">

            <span>
              ACCOUNT SECURITY
            </span>

            <h2>
              Account Settings
            </h2>

            <p>
              Manage your account security through the
              authentication system.
            </p>

          </div>


          <div className="sustainability-security-card">

            <div>

              <strong>
                Password & Authentication
              </strong>

              <p>
                Your account is protected using JWT-based
                authentication.
              </p>

            </div>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
            >
              Manage Password
            </button>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="sustainability-profile-footer">
          Textile Waste Intelligence Platform • Sustainability Management
        </footer>

      </main>

    </div>
  );
}

export default SustainabilityProfile;