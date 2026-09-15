import { useEffect, useState } from "react";
import API from "../api/auth";
import "../styles/Profile.css";

function Profile() {

  const [user, setUser] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);

    } catch (error) {
      console.log(error);
    }

  };

  return (

    <div className="profile-page">

      <div className="profile-card">

        <div className="profile-header">

          <div className="avatar">
            👤
          </div>

          <h2>{user.username}</h2>

          <p>{user.email}</p>

        </div>

        <div className="profile-details">

          <div className="detail-box">
            <span>Username</span>
            <h4>{user.username}</h4>
          </div>

          <div className="detail-box">
            <span>Email</span>
            <h4>{user.email}</h4>
          </div>

          <div className="detail-box">
            <span>Role</span>
            <h4>{user.role}</h4>
          </div>

          <div className="detail-box">
            <span>Status</span>
            <h4 className="active">Active</h4>
          </div>

        </div>

        <div className="profile-buttons">

          <button className="edit-btn">
            Edit Profile
          </button>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("email");
              window.location.href = "/";
            }}
          >
            Logout
          </button>

        </div>

      </div>

    </div>

  );

}

export default Profile;