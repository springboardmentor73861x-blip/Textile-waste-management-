import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/auth";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    companyName: "",
    companyCode: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!formData.role) {
      alert("Please select a role");
      return;
    }

    if (formData.role === "admin" && !formData.companyName.trim()) {
      alert("Please enter your company name");
      return;
    }

    if (formData.role !== "admin" && !formData.companyCode.trim()) {
      alert("Please enter the Company Code");
      return;
    }

    try {
      const response = await API.post("/auth/register", {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        company_name:
          formData.role === "admin"
            ? formData.companyName
            : null,
        company_code:
          formData.role !== "admin"
            ? formData.companyCode.trim().toUpperCase()
            : null,
      });

      if (formData.role === "admin") {
        alert(
          `Registration Successful!\n\nYour Company Code is:\n${response.data.company_code}\n\nPlease save this code and share it with your team members.`
        );
      } else {
        alert("Registration Successful!");
      }

      navigate("/");
    } catch (error) {
      console.log("Registration Error:", error.response);

      alert(
        error.response?.data?.detail ||
          JSON.stringify(error.response?.data) ||
          "Registration Failed"
      );
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <h1>
          Textile Waste Intelligence Platform
        </h1>

        <p className="subtitle">
          Create your account
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="form-group">
            <label>Register As</label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select your role
              </option>

              <option value="admin">
                Administrator
              </option>

              <option value="recycler">
                Recycler
              </option>

              <option value="sustainability_manager">
                Sustainability Manager
              </option>

              <option value="textile_manager">
                Textile Manager
              </option>
            </select>
          </div>

          {/* Company Name — Administrator only */}
          {formData.role === "admin" && (
            <div className="form-group">
              <label>Company Name</label>

              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
              />
            </div>
          )}

          {/* Company Code — Team members */}
          {formData.role !== "" &&
            formData.role !== "admin" && (
              <div className="form-group">
                <label>Company Code</label>

                <input
                  type="text"
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleChange}
                  placeholder="Enter Company Code"
                  required
                />

                <small>
                  Enter the Company Code provided by your Administrator.
                </small>
              </div>
            )}

          <button
            type="submit"
            className="register-btn"
          >
            Register
          </button>

        </form>

        <div className="login-link">
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Register;