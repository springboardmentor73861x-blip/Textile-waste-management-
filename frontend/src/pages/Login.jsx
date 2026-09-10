import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Divider,
} from "@mui/material";

import api from "../services/api";
import AuthLayout, { authColors } from "../components/AuthLayout";

// ==========================================================
// SHARED FIELD STYLE — quiet underline, not boxed corporate
// ==========================================================

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  // ==========================================================
  // GOOGLE SIGN-IN
  // ==========================================================

  const redirectByRole = async (token) => {
    const userResponse = await api.get("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const role = userResponse.data.role;

    navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
  };

  const handleGoogleCredential = async (response) => {
    setError("");

    try {
      const res = await api.post("/auth/google", {
        credential: response.credential,
      });

      const token = res.data.access_token;

      localStorage.setItem("access_token", token);

      await redirectByRole(token);
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    }
  };

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 380,
        text: "continue_with",
      });
    }
  }, []);

  const handleLogin = async () => {
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const token = response.data.access_token;

      localStorage.setItem("access_token", token);

      await redirectByRole(token);
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    <AuthLayout
      headline="Give textiles a second life."
      subheading="Every fabric tells a story before it becomes waste. Sign in to keep tracking it."
      quote="“9 items analyzed this week across the platform.”"
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
        Welcome back
      </Typography>

      <Typography sx={{ color: authColors.thread, mb: 4 }}>
        Sign in to continue to your dashboard.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={fieldSx}
      />

      <Button
        fullWidth
        size="large"
        onClick={handleLogin}
        sx={{
          mt: 3,
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
        Sign in
      </Button>

      <Divider sx={{ my: 3, color: authColors.thread, fontSize: "0.85rem" }}>
        or
      </Divider>

      <Box
        ref={googleButtonRef}
        sx={{ display: "flex", justifyContent: "center" }}
      />

      <Typography sx={{ mt: 4, color: authColors.thread }}>
        New to TextileAI?{" "}
        <Box
          component="span"
          onClick={() => navigate("/register")}
          sx={{
            color: authColors.rust,
            cursor: "pointer",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Create an account
        </Box>
      </Typography>
    </AuthLayout>
  );
}