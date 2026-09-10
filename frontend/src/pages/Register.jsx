import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Divider,
  Grid,
} from "@mui/material";

import RecyclingIcon from "@mui/icons-material/Recycling";
import InsightsIcon from "@mui/icons-material/Insights";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

import api from "../services/api";
import AuthLayout, { authColors } from "../components/AuthLayout";

// ==========================================================
// ROLE OPTIONS
// Admin is intentionally excluded — admins are created
// directly in the DB or promoted by an existing admin.
// ==========================================================

const ROLE_OPTIONS = [
  {
    value: "recycling_operator",
    label: "Recycling Operator",
    description: "Upload and sort incoming textile waste.",
    icon: RecyclingIcon,
  },
  {
    value: "sustainability_manager",
    label: "Sustainability Manager",
    description: "Track circularity and environmental impact.",
    icon: InsightsIcon,
  },
  {
    value: "manufacturer",
    label: "Manufacturer",
    description: "Monitor production waste and recovery.",
    icon: PrecisionManufacturingIcon,
  },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    bgcolor: "#ffffff",
    color: authColors.ink,
  },
  "& .MuiOutlinedInput-input": {
    color: authColors.ink,
  },
  "& .MuiInputLabel-root": {
    color: authColors.thread,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: authColors.rust,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0,0,0,0.18)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: authColors.thread,
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: `${authColors.rust} !important`,
  },
};

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("recycling_operator");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const googleButtonRef = useRef(null);

  // ==========================================================
  // GOOGLE SIGN-UP
  // ==========================================================

  const handleGoogleCredential = async (response) => {
    setError("");

    try {
      const res = await api.post("/auth/google", {
        credential: response.credential,
        role,
      });

      const token = res.data.access_token;

      localStorage.setItem("access_token", token);

      const userResponse = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userRole = userResponse.data.role;

      navigate(userRole === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google sign-up failed. Please try again.");
    }
  };

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      // Clear any previously rendered button before re-rendering,
      // since this effect reruns whenever `role` changes.
      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 380,
        text: "signup_with",
      });
    }
    // Re-render if the selected role changes, so the button's
    // captured closure always has the latest role.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleRegister = async () => {
    setMessage("");
    setError("");

    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
        role,
      });

      setMessage("Account created. Redirecting to sign in…");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail || "Registration failed."
      );
    }
  };

  return (
    <AuthLayout
      headline="Join the circular economy."
      subheading="Every account here is a set of hands helping keep fabric out of landfill. Pick the role that matches your work."
      quote="“Textiles analyzed today become tomorrow's recovered material.”"
    >
      <Typography
        sx={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
          fontSize: "1.9rem",
          color: authColors.ink,
          mb: 0.5,
        }}
      >
        Create your account
      </Typography>

      <Typography sx={{ color: authColors.thread, mb: 3 }}>
        Takes less than a minute.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Full name"
        margin="normal"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        sx={fieldSx}
      />

      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={fieldSx}
      />

      <TextField
        fullWidth
        type="password"
        label="Password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={fieldSx}
      />

      {/* ================================================
          ROLE PICKER
      ================================================ */}

      <Typography
        sx={{
          mt: 3,
          mb: 1.2,
          fontWeight: 600,
          color: authColors.ink,
          fontSize: "0.95rem",
        }}
      >
        Your role
      </Typography>

      <Grid container spacing={1.5}>
        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = role === option.value;

          return (
            <Grid item xs={6} key={option.value}>
              <Box
                onClick={() => setRole(option.value)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  border: "1.5px solid",
                  borderColor: selected
                    ? authColors.moss
                    : "rgba(0,0,0,0.12)",
                  bgcolor: selected
                    ? "rgba(63,108,81,0.08)"
                    : "rgba(0,0,0,0.015)",
                  p: 1.5,
                  height: "100%",
                  transition: "0.15s",
                  "&:hover": {
                    borderColor: authColors.moss,
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: 20,
                    color: selected
                      ? authColors.moss
                      : authColors.thread,
                    mb: 0.5,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: authColors.ink,
                    lineHeight: 1.2,
                  }}
                >
                  {option.label}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: authColors.thread,
                    mt: 0.3,
                    lineHeight: 1.3,
                  }}
                >
                  {option.description}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Button
        fullWidth
        size="large"
        onClick={handleRegister}
        sx={{
          mt: 3.5,
          py: 1.3,
          bgcolor: authColors.denimInk,
          color: "#fff",
          borderRadius: 1.5,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem",
          "&:hover": {
            bgcolor: authColors.denimInkLight,
          },
        }}
      >
        Create account
      </Button>

      <Divider sx={{ my: 3, color: authColors.thread, fontSize: "0.85rem" }}>
        or
      </Divider>

      <Box
        ref={googleButtonRef}
        sx={{ display: "flex", justifyContent: "center" }}
      />

      <Typography sx={{ mt: 4, color: authColors.thread }}>
        Already have an account?{" "}
        <Box
          component="span"
          onClick={() => navigate("/")}
          sx={{
            color: authColors.rust,
            cursor: "pointer",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Sign in
        </Box>
      </Typography>
    </AuthLayout>
  );
}