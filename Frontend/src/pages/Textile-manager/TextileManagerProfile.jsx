import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextileManagerSidebar from "../../components/TextileManagerSidebar";
import "../../styles/Textile-manager/TextileManagerProfile.css";

function TextileManagerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: localStorage.getItem("username") || "Textile Manager",
    email: localStorage.getItem("email") || "textilemanager@example.com",
    role: "Textile Manager",
    department: "Textile Operations",
    phone: "+91 98765 43210",
  });

  const [editing, setEditing] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem("username", profile.name);
    localStorage.setItem("email", profile.email);

    setEditing(false);
  };

  return (
    <div className="tm-profile-layout">

      <TextileManagerSidebar />

      <main className="tm-profile-content">

        {/* HEADER */}
        <header className="tm-profile-header">

          <div>
            <span className="tm-profile-label">
              TEXTILE INTELLIGENCE
            </span>

            <h1>Textile Manager Profile</h1>

            <p>
              Manage your Textile Manager account information and
              professional details.
            </p>
          </div>

        </header>


        {/* PROFILE CARD */}
        <section className="tm-profile-card">

          <div className="tm-profile-card-top">

            <div className="tm-profile-avatar-large">
              TM
            </div>

            <div className="tm-profile-heading">

              <h2>{profile.name}</h2>

              <p>{profile.email}</p>

              <span>
                Textile Manager
              </span>

            </div>

            <button
              type="button"
              className="tm-edit-button"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>

          </div>


          {/* INFORMATION */}
          <div className="tm-profile-information">

            <div className="tm-profile-section-title">
              <h3>Personal Information</h3>

              <p>
                Your account and professional information.
              </p>
            </div>


            <div className="tm-profile-grid">

              {/* NAME */}
              <div className="tm-profile-field">

                <label>Full Name</label>

                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="tm-profile-value">
                    {profile.name}
                  </div>
                )}

              </div>


              {/* EMAIL */}
              <div className="tm-profile-field">

                <label>Email Address</label>

                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="tm-profile-value">
                    {profile.email}
                  </div>
                )}

              </div>


              {/* ROLE */}
              <div className="tm-profile-field">

                <label>Role</label>

                <div className="tm-profile-value tm-readonly">
                  {profile.role}
                </div>

              </div>


              {/* DEPARTMENT */}
              <div className="tm-profile-field">

                <label>Department</label>

                {editing ? (
                  <input
                    type="text"
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="tm-profile-value">
                    {profile.department}
                  </div>
                )}

              </div>


              {/* PHONE */}
              <div className="tm-profile-field">

                <label>Phone Number</label>

                {editing ? (
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="tm-profile-value">
                    {profile.phone}
                  </div>
                )}

              </div>


              {/* STATUS */}
              <div className="tm-profile-field">

                <label>Account Status</label>

                <div className="tm-profile-status">
                  <span className="tm-status-dot"></span>
                  Active
                </div>

              </div>

            </div>


            {/* SAVE */}
            {editing && (
              <div className="tm-profile-actions">

                <button
                  type="button"
                  className="tm-save-button"
                  onClick={handleSave}
                >
                  Save Changes
                </button>

              </div>
            )}

          </div>

        </section>


        {/* ROLE INFORMATION */}
        <section className="tm-role-card">

          <div className="tm-role-icon">
            TM
          </div>

          <div>
            <h3>Textile Manager Access</h3>

            <p>
              Your account is configured for Textile Manager
              operations. You can upload textile images, classify
              materials, view AI predictions and download prediction
              reports.
            </p>
          </div>

        </section>


        {/* SECURITY */}
        <section className="tm-security-card">

          <div>
            <span className="tm-profile-label">
              ACCOUNT SECURITY
            </span>

            <h2>Security & Password</h2>

            <p>
              Keep your account credentials secure and up to date.
            </p>
          </div>

          <button
            type="button"
            className="tm-password-button"
            onClick={() => alert("Password change functionality will be connected to the backend.")}
          >
            Change Password
          </button>

        </section>


        {/* BACK */}
        <div className="tm-profile-back">

          <button
            type="button"
            onClick={() => navigate("/textile-manager-dashboard")}
          >
            ← Back to Textile Manager Dashboard
          </button>

        </div>


        <footer className="tm-profile-footer">
          Textile Waste Intelligence Platform • Textile Manager Profile
        </footer>

      </main>

    </div>
  );
}

export default TextileManagerProfile;