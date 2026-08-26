import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaLock,
  FaUserPlus,
  FaMoon,
  FaSun,
} from "react-icons/fa";

import API from "../services/api";

import "../css/Register.css";


function Register() {

  const navigate = useNavigate();


  // =========================================================
  // STATES
  // =========================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  // =========================================================
  // DARK MODE
  // =========================================================

  const [darkMode, setDarkMode] = useState(() => {

    const savedTheme =
      localStorage.getItem("theme");

    return savedTheme === "dark";

  });


  // =========================================================
  // APPLY THEME
  // =========================================================

  useEffect(() => {

    if (darkMode) {

      document.body.classList.add(
        "dark-theme"
      );

      localStorage.setItem(
        "theme",
        "dark"
      );

    } else {

      document.body.classList.remove(
        "dark-theme"
      );

      localStorage.setItem(
        "theme",
        "light"
      );

    }

  }, [darkMode]);


  // =========================================================
  // TOGGLE THEME
  // =========================================================

  const toggleTheme = () => {

    setDarkMode(
      (current) => !current
    );

  };


  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({

    full_name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",

  });


  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData((current) => ({

      ...current,

      [name]: value,

    }));

  };


  // =========================================================
  // HANDLE REGISTER
  // =========================================================

  const handleRegister = async (event) => {

    event.preventDefault();


    const fullName =
      formData.full_name.trim();

    const email =
      formData.email.trim();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;


    if (
      !fullName ||
      !email ||
      !formData.role ||
      !password ||
      !confirmPassword
    ) {

      alert(
        "Please fill all fields."
      );

      return;

    }


    if (
      password !== confirmPassword
    ) {

      alert(
        "Passwords do not match."
      );

      return;

    }


    // ---------------------------------------------------------
    // PASSWORD BYTE LENGTH
    // ---------------------------------------------------------

    const passwordBytes =
      new TextEncoder()
        .encode(password)
        .length;


    if (passwordBytes > 72) {

      alert(
        "Password cannot be longer than 72 bytes."
      );

      return;

    }


    // ---------------------------------------------------------
    // API
    // ---------------------------------------------------------

    try {

      setLoading(true);


      const response =
        await API.post(
          "/auth/register",
          {
            full_name: fullName,
            email: email,
            password: password,
            role: formData.role,
          }
        );


      alert(
        response.data?.message ||
        "Registration successful."
      );


      setFormData({

        full_name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",

      });


      navigate(
        "/login",
        {
          replace: true,
        }
      );

    }


    catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );


      const backendMessage =
        error.response?.data?.detail;


      alert(
        backendMessage ||
        "Registration failed. Please try again."
      );

    }


    finally {

      setLoading(false);

    }

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="register-page">


      {/* =====================================================
          DARK MODE TOGGLE
      ===================================================== */}

      <button
        type="button"
        className={`theme-toggle ${
          darkMode ? "dark" : ""
        }`}
        onClick={toggleTheme}
        aria-label={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        title={
          darkMode
            ? "Light Mode"
            : "Dark Mode"
        }
      >

        <span className="theme-toggle-icon">

          {darkMode ? (
            <FaSun />
          ) : (
            <FaMoon />
          )}

        </span>

        <span className="theme-toggle-text">

          {darkMode
            ? "Light"
            : "Dark"
          }

        </span>

      </button>


      {/* =====================================================
          REGISTER CARD
      ===================================================== */}

      <div className="register-card">


        {/* HEADER */}

        <div className="register-header">

          <div className="register-icon">

            <FaUserPlus />

          </div>


          <h1>
            Create Account
          </h1>


          <p>
            Join the Textile Waste Intelligence Platform
          </p>

        </div>


        {/* FORM */}

        <form
          className="register-form"
          onSubmit={handleRegister}
        >


          {/* FULL NAME */}

          <div className="register-input-group">

            <label htmlFor="register-full-name">
              Full Name
            </label>


            <div className="register-input-wrapper">

              <FaUser
                className="register-input-icon"
              />


              <input
                id="register-full-name"
                type="text"
                name="full_name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

            </div>

          </div>


          {/* EMAIL */}

          <div className="register-input-group">

            <label htmlFor="register-email">
              Email Address
            </label>


            <div className="register-input-wrapper">

              <FaEnvelope
                className="register-input-icon"
              />


              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

            </div>

          </div>


          {/* ROLE */}

          <div className="register-input-group">

            <label htmlFor="register-role">
              Select Role
            </label>


            <div className="register-input-wrapper">

              <FaBuilding
                className="register-input-icon"
              />


              <select
                id="register-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >

                <option value="">
                  Choose your role
                </option>

                <option value="admin">
                  Admin
                </option>

                <option value="manufacturer">
                  Textile Manufacturer
                </option>

                <option value="recycler">
                  Recycling Facility Operator
                </option>

                <option value="manager">
                  Sustainability Manager
                </option>

              </select>

            </div>

          </div>


          {/* PASSWORD */}

          <div className="register-input-group">

            <label htmlFor="register-password">
              Password
            </label>


            <div className="register-input-wrapper">

              <FaLock
                className="register-input-icon"
              />


              <input
                id="register-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />


              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}

              </button>

            </div>

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="register-input-group">

            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>


            <div className="register-input-wrapper">

              <FaLock
                className="register-input-icon"
              />


              <input
                id="register-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />


              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >

                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}

              </button>

            </div>

          </div>


          {/* REGISTER BUTTON */}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >

            {loading ? (

              <>
                <span className="register-spinner"></span>
                Creating Account...
              </>

            ) : (

              <>
                <FaUserPlus />
                Create Account
              </>

            )}

          </button>

        </form>


        {/* LOGIN LINK */}

        <div className="register-login-link">

          <span>
            Already have an account?
          </span>


          <Link to="/login">
            Sign in
          </Link>

        </div>

      </div>

    </div>

  );

}


export default Register;