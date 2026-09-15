import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/auth";
import "../styles/Dashboard.css";

function Dashboard() {

  const [user, setUser] = useState({});
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchInventory();
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

    } catch (err) {
      console.log(err);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/inventory/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInventoryCount(response.data.length);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard">

      <aside className="sidebar">

        <h2>🧵 Textile Waste</h2>

        <ul>

          <li className="active">
            <Link to="/dashboard">🏠 Dashboard</Link>
          </li>

          <li>
            <Link to="/upload">📤 Upload Image</Link>
          </li>

          <li>
            <Link to="/inventory">📦 View Inventory</Link>
          </li>

          <li>♻️ Recycling Results</li>

          <li>📊 My Analytics</li>

          <li>
            <Link to="/profile">👤 My Profile</Link>
          </li>

        </ul>

      </aside>

      <main className="content">

        <h1>Welcome Back, {user.username} 👋</h1>

        <p className="welcome-text">
          Manage your textile waste efficiently from one place.
        </p>

        <div className="cards">

          <div className="card">
            <h3>📤 Images Uploaded</h3>
            <p>0</p>
          </div>

          <div className="card">
            <h3>📦 Inventory Items</h3>
            <p>{inventoryCount}</p>
          </div>

          <div className="card">
            <h3>♻️ Recyclable Items</h3>
            <p>0</p>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;