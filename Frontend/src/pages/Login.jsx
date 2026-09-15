import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/auth";
import "../styles/Login.css";
export default function Login(){
    const navigate = useNavigate();

const [email, setEmail] = useState("");

const [password, setPassword] = useState("");

const handleLogin = async () => {

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {

    const formData = new URLSearchParams();

    formData.append("username", email);

    formData.append("password", password);

    const response = await API.post(
      "/auth/token",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log(response.data);

    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("email", response.data.email);
    localStorage.setItem("role", response.data.role);
    localStorage.setItem("username", response.data.username);

    alert("Login Successful");

// Role Based Redirect
    // Role Based Redirect
if (response.data.role === "admin") {
  navigate("/admin-dashboard");
} else if (response.data.role === "sustainability_manager") {
  navigate("/sustainability-dashboard");
} else if (response.data.role === "textile_manager") {
  navigate("/textile-manager-dashboard");
} else if (response.data.role === "recycler") {
  navigate("/recycler/dashboard");
}  
  }catch (error) {

    alert(
      error.response?.data?.detail ||
      "Invalid Email or Password"
    );

  }

};

return(

<div className="login-page">

<div className="left">

<h1 className="logo">
  Textile Waste <br />
  Intelligence Platform
</h1>

<p className="tagline">
Smart AI solution for sustainable textile waste management.
</p>

<div className="features">

  <div className="feature">
    <span>🧵</span>
    <div>
      <h4>AI Fabric Classification</h4>
      <p>Detect fabric type using AI.</p>
    </div>
  </div>

  <div className="feature">
    <span>📦</span>
    <div>
      <h4>Inventory Management</h4>
      <p>Manage textile waste records.</p>
    </div>
  </div>

  <div className="feature">
    <span>📤</span>
    <div>
      <h4>Image Upload</h4>
      <p>Upload textile images securely.</p>
    </div>
  </div>

  <div className="feature">
    <span>♻️</span>
    <div>
      <h4>Recycling Recommendation</h4>
      <p>Get AI-powered recycling suggestions.</p>
    </div>
  </div>

  <div className="feature">
    <span>📊</span>
    <div>
      <h4>Sustainability Analytics</h4>
      <p>Track environmental impact.</p>
    </div>
  </div>

  <div className="feature">
    <span>🔒</span>
    <div>
      <h4>Role Based Access</h4>
      <p>Separate Admin and User dashboards.</p>
    </div>
  </div>

</div>

</div>

<div className="right">

<div className="card">

<h2>Welcome Back 👋</h2>

<p className="subtitle">
  Sign in to continue.
</p>

<div className="input-group">
<input
type="email"
placeholder="Email Address"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>
</div>

<div className="input-group">
<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/></div>

<button
className="login-btn"
onClick={handleLogin}
>
Login
</button>

<div className="bottom-text">
Don't have an account?
{" "}
<Link to="/register">
Register
</Link>
</div>

</div>

</div>

</div>

)

}