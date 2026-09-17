import { useState, useContext } from "react";
import api from "../services/Api";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginUser = async () => {

        try {

            const response = await api.post("/login", {

                email,

                password

            });

            login(

                {

                    name: response.data.name,

                    role: response.data.role,

                    email

                },

                response.data.access_token

            );

            alert("Login Successful");

            navigate("/dashboard");

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

        <div className="login-page">

            <div className="dark-overlay">

                <div className="hero">

                    <div className="hero-left">

                        <h1>

                            AI Textile Waste
                            <br />
                            Intelligence Platform

                        </h1>

                        <p>

                            Smart Textile Recycling powered by Artificial Intelligence,
                            FastAPI and PostgreSQL.

                        </p>

                        <div className="features">

                            <div className="feature">
                                ♻ Smart Waste Tracking
                            </div>

                            <div className="feature">
                                🤖 AI Fabric Classification
                            </div>

                            <div className="feature">
                                🌱 Sustainability Analytics
                            </div>

                            <div className="feature">
                                📊 Real Time Dashboard
                            </div>

                        </div>

                    </div>

                    <div className="login-container">

                        <h2>Welcome Back</h2>

                        <p className="subtitle">

                            Sign in to continue

                        </p>

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

                        <button

                            className="login-btn"

                            onClick={loginUser}

                        >

                            LOGIN

                        </button>

                        <div className="register">

                            New User?

                            <Link to="/register">

                                Register Here

                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Login;