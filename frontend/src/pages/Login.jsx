import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FaEye,
    FaEyeSlash,
    FaMoon,
    FaSun,
} from "react-icons/fa";

import API from "../services/api";

import "../css/Login.css";


// ============================================================
// GET LOGIN ROLE
// ============================================================

function getLoginRole(user) {

    return String(user?.role || "")
        .trim()
        .toLowerCase();

}


// ============================================================
// PASSWORD BYTE LENGTH
// ============================================================

function getUtf8ByteLength(value) {

    return new TextEncoder().encode(value).length;

}


// ============================================================
// LOGIN COMPONENT
// ============================================================

function Login() {

    const navigate = useNavigate();


    // ========================================================
    // STATES
    // ========================================================

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [darkMode, setDarkMode] =
        useState(() => {

            return (
                localStorage.getItem("darkMode") ===
                "true"
            );

        });


    const [loginData, setLoginData] = useState({

        email: "",
        password: "",

    });


    // ========================================================
    // DARK MODE
    // ========================================================

    useEffect(() => {

        if (darkMode) {

            document.body.classList.add(
                "dark-theme"
            );

            localStorage.setItem(
                "darkMode",
                "true"
            );

        } else {

            document.body.classList.remove(
                "dark-theme"
            );

            localStorage.setItem(
                "darkMode",
                "false"
            );

        }


        return () => {

            document.body.classList.remove(
                "dark-theme"
            );

        };

    }, [darkMode]);


    // ========================================================
    // HANDLE INPUT CHANGE
    // ========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setLoginData((current) => ({

            ...current,

            [name]: value,

        }));

    };


    // ========================================================
    // CLEAR OLD LOGIN DATA
    // ========================================================

    const clearLoginStorage = () => {

        localStorage.removeItem("user");

        localStorage.removeItem("user_id");

        localStorage.removeItem("full_name");

        localStorage.removeItem("email");

        localStorage.removeItem("role");

        localStorage.removeItem("access_token");

    };


    // ========================================================
    // HANDLE LOGIN
    // ========================================================

    const handleLogin = async (event) => {

        event.preventDefault();


        // ====================================================
        // BASIC VALIDATION
        // ====================================================

        const email =
            loginData.email.trim();

        const password =
            loginData.password;


        if (!email || !password) {

            alert(
                "Please enter Email and Password."
            );

            return;

        }


        // ====================================================
        // PASSWORD BYTE VALIDATION
        // ====================================================

        const passwordBytes =
            getUtf8ByteLength(password);


        if (passwordBytes > 72) {

            alert(
                "Password cannot be longer than 72 bytes."
            );

            return;

        }


        // ====================================================
        // LOGIN
        // ====================================================

        try {

            setLoading(true);


            console.log(
                "=========================================="
            );

            console.log(
                "ATTEMPTING LOGIN"
            );

            console.log(
                "EMAIL:",
                email
            );

            console.log(
                "=========================================="
            );


            // ==================================================
            // LOGIN API
            // ==================================================

            const response =
                await API.post(
                    "/auth/login",
                    {
                        email: email,
                        password: password,
                    }
                );


            console.log(
                "=========================================="
            );

            console.log(
                "LOGIN RESPONSE"
            );

            console.log(
                response.data
            );

            console.log(
                "=========================================="
            );


            // ==================================================
            // GET USER
            // ==================================================

            const user =
                response.data?.user;


            // ==================================================
            // VALIDATE USER
            // ==================================================

            if (!user) {

                throw new Error(
                    "Login succeeded but the server did not return a user."
                );

            }


            // ==================================================
            // GET ROLE
            // ==================================================

            const role =
                getLoginRole(user);


            if (!role) {

                throw new Error(
                    "Login succeeded but the server did not return a valid role."
                );

            }


            // ==================================================
            // GET USER ID
            // ==================================================

            const userId =
                user?.id;


            if (
                userId === undefined ||
                userId === null
            ) {

                throw new Error(
                    "Login succeeded but the server did not return a valid user ID."
                );

            }


            // ==================================================
            // GET FULL NAME
            // ==================================================

            const fullName =
                String(
                    user?.full_name ||
                    user?.name ||
                    ""
                ).trim();


            if (!fullName) {

                throw new Error(
                    "Login succeeded but the server did not return the user's full name."
                );

            }


            // ==================================================
            // GET EMAIL
            // ==================================================

            const userEmail =
                String(
                    user?.email ||
                    email
                ).trim();


            // ==================================================
            // ACCESS TOKEN
            // ==================================================

            const accessToken =
                response.data?.access_token;


            // ==================================================
            // SAVE COMPLETE USER OBJECT
            // ==================================================

            const loggedInUser = {

                ...user,

                id: userId,

                full_name: fullName,

                email: userEmail,

                role: role,

            };


            localStorage.setItem(
                "user",
                JSON.stringify(
                    loggedInUser
                )
            );


            // ==================================================
            // SAVE USER ID
            // ==================================================

            localStorage.setItem(
                "user_id",
                String(userId)
            );


            // ==================================================
            // SAVE FULL NAME
            // ==================================================

            localStorage.setItem(
                "full_name",
                fullName
            );


            // ==================================================
            // SAVE EMAIL
            // ==================================================

            localStorage.setItem(
                "email",
                userEmail
            );


            // ==================================================
            // SAVE ROLE
            // ==================================================

            localStorage.setItem(
                "role",
                role
            );


            // ==================================================
            // SAVE ACCESS TOKEN
            // ==================================================

            if (accessToken) {

                localStorage.setItem(
                    "access_token",
                    accessToken
                );

            }


            // ==================================================
            // DEBUG LOGIN STORAGE
            // ==================================================

            console.log(
                "=========================================="
            );

            console.log(
                "LOGIN SUCCESSFUL"
            );

            console.log(
                "USER ID:",
                userId
            );

            console.log(
                "FULL NAME:",
                fullName
            );

            console.log(
                "EMAIL:",
                userEmail
            );

            console.log(
                "ROLE:",
                role
            );

            console.log(
                "ACCESS TOKEN:",
                accessToken
                    ? "Saved"
                    : "Not returned"
            );

            console.log(
                "USER OBJECT:",
                loggedInUser
            );

            console.log(
                "LOCAL STORAGE USER:",
                localStorage.getItem("user")
            );

            console.log(
                "LOCAL STORAGE USER ID:",
                localStorage.getItem("user_id")
            );

            console.log(
                "LOCAL STORAGE FULL NAME:",
                localStorage.getItem("full_name")
            );

            console.log(
                "=========================================="
            );


            // ==================================================
            // ROLE DASHBOARDS
            // ==================================================

            const dashboardByRole = {

                admin:
                    "/admin",

                manufacturer:
                    "/manufacturer",

                recycler:
                    "/recycler",

                manager:
                    "/manager",

            };


            const destination =
                dashboardByRole[role];


            // ==================================================
            // INVALID ROLE
            // ==================================================

            if (!destination) {

                clearLoginStorage();


                alert(
                    `Unsupported role: ${role}`
                );


                return;

            }


            // ==================================================
            // NAVIGATE
            // ==================================================

            navigate(
                destination,
                {
                    replace: true,
                }
            );

        }


        catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "LOGIN ERROR"
            );

            console.error(
                "=========================================="
            );

            console.error(
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "BACKEND RESPONSE:",
                error.response?.data
            );

            console.error(
                "=========================================="
            );


            const backendMessage =
                error.response?.data?.detail;


            // ==================================================
            // 72 BYTE ERROR
            // ==================================================

            if (
                typeof backendMessage === "string" &&
                backendMessage
                    .toLowerCase()
                    .includes("72 bytes")
            ) {

                alert(
                    "Password cannot be longer than 72 bytes."
                );

            }


            // ==================================================
            // 422
            // ==================================================

            else if (
                error.response?.status === 422
            ) {

                const detail =
                    error.response?.data?.detail;


                if (
                    Array.isArray(detail)
                ) {

                    alert(

                        detail
                            .map(
                                (item) =>
                                    item?.msg ||
                                    "Invalid input"
                            )
                            .join(", ")

                    );

                } else {

                    alert(
                        detail ||
                        "Invalid login information."
                    );

                }

            }


            // ==================================================
            // 401
            // ==================================================

            else if (
                error.response?.status === 401
            ) {

                alert(
                    backendMessage ||
                    "Invalid email or password."
                );

            }


            // ==================================================
            // 403
            // ==================================================

            else if (
                error.response?.status === 403
            ) {

                alert(
                    backendMessage ||
                    "You do not have permission to login."
                );

            }


            // ==================================================
            // 404
            // ==================================================

            else if (
                error.response?.status === 404
            ) {

                alert(
                    backendMessage ||
                    "Login API not found. Please check the backend."
                );

            }


            // ==================================================
            // 500
            // ==================================================

            else if (
                error.response?.status === 500
            ) {

                alert(
                    backendMessage ||
                    "Server error during login. Please try again."
                );

            }


            // ==================================================
            // NETWORK ERROR
            // ==================================================

            else if (
                error.code === "ERR_NETWORK"
            ) {

                alert(
                    "Cannot connect to backend. Please make sure FastAPI server is running."
                );

            }


            // ==================================================
            // OTHER ERROR
            // ==================================================

            else {

                alert(
                    backendMessage ||
                    error.message ||
                    "Login failed. Please check your email and password."
                );

            }

        }


        finally {

            setLoading(false);

        }

    };


    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="login-page">


            {/* ==================================================
                DARK MODE TOGGLE
            ================================================== */}

            <button
                type="button"
                className="login-theme-toggle"
                onClick={() =>
                    setDarkMode(
                        (current) => !current
                    )
                }
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

                <span
                    className={
                        darkMode
                            ? "theme-icon active"
                            : "theme-icon"
                    }
                >

                    <FaMoon />

                </span>


                <span
                    className={
                        !darkMode
                            ? "theme-icon active"
                            : "theme-icon"
                    }
                >

                    <FaSun />

                </span>

            </button>


            {/* ==================================================
                LOGIN CARD
            ================================================== */}

            <div className="login-card">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="login-header">

                    <h1>

                        Textile Waste
                        <br />
                        Intelligence Platform

                    </h1>


                    <p className="subtitle">

                        Sign in to continue

                    </p>

                </div>


                {/* ==================================================
                    LOGIN FORM
                ================================================== */}

                <form
                    onSubmit={handleLogin}
                    className="login-form"
                >


                    {/* ==================================================
                        EMAIL
                    ================================================== */}

                    <div className="input-group">

                        <label htmlFor="login-email">

                            Email Address

                        </label>


                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={loginData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* ==================================================
                        PASSWORD
                    ================================================== */}

                    <div className="input-group">

                        <label htmlFor="login-password">

                            Password

                        </label>


                        <div className="password-wrapper">

                            <input
                                id="login-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />


                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() =>
                                    setShowPassword(
                                        (current) =>
                                            !current
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


                    {/* ==================================================
                        FORGOT PASSWORD
                    ================================================== */}

                    <div className="forgot-password">

                        <button
                            type="button"
                            className="forgot-link"
                        >

                            Forgot Password?

                        </button>

                    </div>


                    {/* ==================================================
                        LOGIN BUTTON
                    ================================================== */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : "Login"
                        }

                    </button>

                </form>


                {/* ==================================================
                    REGISTER
                ================================================== */}

                <div className="register-link">

                    Don't have an account?

                    <Link to="/register">

                        {" "}Register

                    </Link>

                </div>

            </div>

        </div>

    );

}


export default Login;