import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../services/api";
import "../css/Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      alert("Please enter Email and Password");
      return;
    }

    try {
      const response = await API.post("/auth/login", loginData);
        console.log("Full Response:", response.data);
console.log("User Object:", response.data.user);
console.log("Role Value:", response.data.user.role);

localStorage.setItem(
  "user",
  JSON.stringify(response.data.user)
);

localStorage.setItem(
  "role",
  response.data.user.role
);

console.log("Saved Role:", localStorage.getItem("role"));
      alert(response.data.message);

      // Save user details
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );
      // Save role
localStorage.setItem(
  "role",
  response.data.user.role
);
      // Get role
      const role = response.data.user.role;

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "manufacturer") {
        navigate("/manufacturer");
      } else if (role === "recycler") {
        navigate("/recycler");
      } else if (role === "manager") {
        navigate("/manager");
      } else {
        alert("Invalid Role");
        navigate("/login");
      }

    } catch (error) {
      alert(error.response?.data?.detail || "Login Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <h1>Textile Waste Intelligence Platform</h1>

        <p className="subtitle">
          Sign in to continue
        </p>

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">

            <label>Password</label>

            <div className="password-wrapper">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleChange}
                required
              />

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>

            </div>

          </div>

          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit">
            Login
          </button>

        </form>

        <div className="register-link">
          Don't have an account?
          <Link to="/register"> Register</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;