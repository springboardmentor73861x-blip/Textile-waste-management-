import { useState } from "react";
import api from "../services/Api";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag
} from "react-icons/fa";

import "./Register.css";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manufacturer");

  const registerUser = async () => {

    if (!name || !email || !password) {

      alert("Please fill all fields");

      return;

    }

    try {

      await api.post("/users", {

        name,

        email,

        password,

        role

      });

      alert("Registration Successful");

      navigate("/");

    }

    catch (error) {

      if (error.response) {

        alert(error.response.data.detail);

      }

      else {

        alert("Server Not Responding");

      }

    }

  };

  return (

    <div className="register-page">

      <div className="register-overlay">

        <div className="register-left">

          <h1>

            Join the Future of
            <br />
            Sustainable Textile Intelligence

          </h1>

          <p>

            Create your account to access the AI Powered
            Textile Waste Intelligence Platform.

          </p>

          <div className="info-box">

            ♻ Track Textile Waste

          </div>

          <div className="info-box">

            🤖 AI Fabric Classification

          </div>

          <div className="info-box">

            📊 Smart Inventory Management

          </div>

          <div className="info-box">

            🌱 Sustainability Analytics

          </div>

        </div>

        <div className="register-card">

          <h2>Create Account</h2>

          <p className="subtitle">

            Register to continue

          </p>

          <div className="input-box">

            <FaUser className="icon"/>

            <input

              type="text"

              placeholder="Full Name"

              value={name}

              onChange={(e)=>setName(e.target.value)}

            />

          </div>

          <div className="input-box">

            <FaEnvelope className="icon"/>

            <input

              type="email"

              placeholder="Email Address"

              value={email}

              onChange={(e)=>setEmail(e.target.value)}

            />

          </div>

          <div className="input-box">

            <FaLock className="icon"/>

            <input

              type="password"

              placeholder="Password"

              value={password}

              onChange={(e)=>setPassword(e.target.value)}

            />

          </div>

          <div className="input-box">

            <FaUserTag className="icon"/>

            <select

              value={role}

              onChange={(e)=>setRole(e.target.value)}

            >

              <option>Admin</option>

              <option>Manufacturer</option>

              <option>Recycling Facility Operator</option>

              <option>Sustainability Manager</option>

            </select>

          </div>

          <button

            className="register-btn"

            onClick={registerUser}

          >

            CREATE ACCOUNT

          </button>

          <div className="login-link">

            Already have an account?

            <Link to="/">

              Login

            </Link>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Register;