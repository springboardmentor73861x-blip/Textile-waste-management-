import { useEffect, useState, useRef } from "react";

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecyclingIcon from "@mui/icons-material/Recycling";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import Co2Icon from "@mui/icons-material/Co2";

import { useTheme } from "@mui/material/styles";

import api from "../services/api";
import { useAvatar } from "../context/AvatarContext";

// ==========================================================
// ROLE LABELS
// ==========================================================

const ROLE_LABELS = {
  recycling_operator: "Recycling Operator",
  sustainability_manager: "Sustainability Manager",
  manufacturer: "Manufacturer",
  admin: "Administrator",
};

const ROLE_COLORS = {
  recycling_operator: "#2563eb",
  sustainability_manager: "#16a34a",
  manufacturer: "#ea580c",
  admin: "#7c3aed",
};

export default function Profile() {
  const theme = useTheme();
  const avatarInputRef = useRef(null);

  // ==========================================================
  // STATE
  // ==========================================================

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const { avatarUrl, setAvatar, setUserId } = useAvatar();

  // Password dialog
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Profile feedback
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // ==========================================================
  // LOAD PROFILE + HISTORY
  // ==========================================================

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data;
      setUser(userData);
      setFullName(userData?.full_name || "");
      setUserId(userData.id);
    } catch (error) {
      console.error("Profile loading error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    }
  };

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get("/textiles/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data?.data || []);
    } catch (error) {
      console.error("History loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalUploads = history.length;

  const predictions = history.filter(
    (item) => item.prediction || item.category
  ).length;

  const recyclableCount = history.filter((item) => {
    const value = String(item.recyclable || "").toLowerCase();
    return value === "high" || value.includes("high");
  }).length;

  const confidenceValues = history
    .map((item) => Number(item.confidence))
    .filter((v) => !Number.isNaN(v) && v > 0);

  const averageConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((s, v) => s + v, 0) / confidenceValues.length
      : 0;

  const sustainabilityValues = history
    .map((item) => Number(item.sustainability_score))
    .filter((v) => !Number.isNaN(v) && v > 0);

  const avgSustainability =
    sustainabilityValues.length > 0
      ? (sustainabilityValues.reduce((s, v) => s + v, 0) /
          sustainabilityValues.length).toFixed(1)
      : null;

  const totalCO2 = history
    .reduce((s, item) => s + (Number(item.estimated_co2_savings_kg) || 0), 0)
    .toFixed(2);

  // ==========================================================
  // AVATAR UPLOAD (stored locally in browser)
  // ==========================================================

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);

    // Allow re-selecting the same file later
    e.target.value = "";
  };

  const handleAvatarRemove = () => {
    setAvatar(null);
  };

  // ==========================================================
  // EDIT / SAVE PROFILE NAME
  // ==========================================================

  const handleEdit = () => {
    setFullName(user?.full_name || "");
    setSaveError("");
    setSaveSuccess("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFullName(user?.full_name || "");
    setEditing(false);
    setSaveError("");
  };

  const handleSave = async () => {
    setSaveError("");
    setSaveSuccess("");
    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");
      const response = await api.put(
        "/users/me",
        { full_name: fullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      setFullName(response.data?.full_name || fullName);
      setEditing(false);
      setSaveSuccess("Profile updated successfully.");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (error) {
      setSaveError(
        error.response?.data?.detail || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  const handlePasswordSubmit = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("access_token");
      await api.put(
        "/users/me/password",
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordOpen(false);
        setPasswordSuccess("");
      }, 1800);
    } catch (err) {
      setPasswordError(
        err.response?.data?.detail || "Password change failed."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==========================================================
  // HELPERS
  // ==========================================================

  const initial =
    user?.full_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "Unknown";
  const roleColor = ROLE_COLORS[user?.role] || "#64748b";
  const isGoogleAccount = user?.is_google_account === true;

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", pb: 6 }}>

      {/* ====================================================
          PROFILE HERO CARD
      ==================================================== */}

      <Card
        sx={{
          borderRadius: 5,
          overflow: "visible",
          boxShadow: "0 15px 45px rgba(15,23,42,0.10)",
          mb: 3,
          position: "relative",
        }}
      >
        {/* Gradient banner */}
        <Box
          sx={{
            height: { xs: 130, md: 155 },
            borderRadius: "20px 20px 0 0",
            background: "linear-gradient(110deg,#2563eb 0%,#4f46e5 50%,#7c3aed 100%)",
          }}
        />

        <Box sx={{ position: "relative", px: { xs: 3, md: 5 }, pb: 4, pt: 0 }}>

          {/* Avatar with camera overlay */}
          <Box
            sx={{
              position: "absolute",
              top: { xs: -46, md: -58 },
              left: { xs: 28, md: 48 },
            }}
          >
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={avatarUrl || undefined}
                sx={{
                  width: { xs: 92, md: 112 },
                  height: { xs: 92, md: 112 },
                  fontSize: { xs: 36, md: 46 },
                  fontWeight: 700,
                  bgcolor: "#2563eb",
                  border: "5px solid white",
                  boxShadow: "0 8px 25px rgba(0,0,0,.18)",
                }}
              >
                {!avatarUrl && initial}
              </Avatar>

              {/* Camera button */}
              <Box
                onClick={() => avatarInputRef.current?.click()}
                sx={{
                  position: "absolute",
                  bottom: 2,
                  right: avatarUrl ? 34 : 2,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  bgcolor: "#1e293b",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "right 0.15s",
                  "&:hover": { bgcolor: "#334155" },
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 15, color: "#fff" }} />
              </Box>

              {/* Remove photo button — only shown when a photo is set */}
              {avatarUrl && (
                <Box
                  onClick={handleAvatarRemove}
                  sx={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    bgcolor: "#dc2626",
                    border: "2px solid white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#b91c1c" },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 15, color: "#fff" }} />
                </Box>
              )}

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </Box>
          </Box>

          {/* Name / email / role / actions */}
          <Box
            sx={{
              pt: { xs: 7, md: 8 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              gap: 2,
            }}
          >
            <Box>
              {editing ? (
                <TextField
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1, minWidth: 220 }}
                  autoFocus
                />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {user?.full_name || "—"}
                </Typography>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <EmailIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography color="text.secondary">{user?.email}</Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, mt: 1.2, flexWrap: "wrap" }}>
                <Chip
                  label={roleLabel}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: `${roleColor}18`,
                    color: roleColor,
                    border: `1px solid ${roleColor}40`,
                  }}
                />
                <Chip
                  label="Active Account"
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: "#dcfce7", color: "#15803d" }}
                />
                {isGoogleAccount && (
                  <Chip label="Google Account" size="small" color="info" variant="outlined" />
                )}
              </Box>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {editing ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                    sx={{ borderRadius: 2.5 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ borderRadius: 2.5 }}
                  >
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{ borderRadius: 2.5 }}
                  >
                    Edit Name
                  </Button>
                  {!isGoogleAccount && (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<LockIcon />}
                      onClick={() => {
                        setPasswordError("");
                        setPasswordSuccess("");
                        setPasswordOpen(true);
                      }}
                      sx={{ borderRadius: 2.5 }}
                    >
                      Change Password
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* Feedback alerts */}
          {saveSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>{saveSuccess}</Alert>
          )}
          {saveError && (
            <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>
          )}
        </Box>
      </Card>

      {/* ====================================================
          STAT CARDS
      ==================================================== */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CloudUploadIcon sx={{ fontSize: 26 }} />}
            iconBg="#dbeafe" iconColor="#2563eb"
            title="Total Uploads" value={totalUploads}
            subtitle="All time"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PsychologyIcon sx={{ fontSize: 26 }} />}
            iconBg="#ede9fe" iconColor="#7c3aed"
            title="AI Predictions" value={predictions}
            subtitle="Fabric classifications"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<RecyclingIcon sx={{ fontSize: 26 }} />}
            iconBg="#dcfce7" iconColor="#16a34a"
            title="Highly Recyclable" value={recyclableCount}
            subtitle="High potential"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Co2Icon sx={{ fontSize: 26 }} />}
            iconBg="#fef3c7" iconColor="#d97706"
            title="CO₂ Savings" value={`${totalCO2} kg`}
            subtitle="Estimated total"
          />
        </Grid>
      </Grid>

      {/* ====================================================
          ACCOUNT INFO + SUMMARY
      ==================================================== */}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, boxShadow: "0 10px 30px rgba(15,23,42,.07)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#dbeafe", color: "#2563eb" }}>
                <PersonIcon />
              </Box>
              <Typography variant="h6" fontWeight={800}>Account Information</Typography>
            </Box>

            <TextField
              fullWidth label="Full Name"
              value={fullName}
              disabled={!editing}
              onChange={(e) => setFullName(e.target.value)}
              sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
            />

            <TextField
              fullWidth label="Email Address"
              value={user?.email || ""}
              disabled
              sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
            />

            <TextField
              fullWidth label="Role"
              value={roleLabel}
              disabled
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              InputProps={{
                endAdornment: (
                  <Chip
                    label={roleLabel}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: `${roleColor}18`, color: roleColor, mr: 1 }}
                  />
                ),
              }}
            />

            {isGoogleAccount && (
              <Alert severity="info" sx={{ mt: 2 }}>
                This account is linked with Google. Password change is not available.
              </Alert>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, height: "100%", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(15,23,42,.07)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#ede9fe", color: "#7c3aed" }}>
                <BarChartIcon />
              </Box>
              <Typography variant="h6" fontWeight={800}>Account Summary</Typography>
            </Box>

            <SummaryRow label="Role" value={<Chip label={roleLabel} size="small" sx={{ fontWeight: 700, bgcolor: `${roleColor}18`, color: roleColor }} />} />
            <SummaryRow label="Account Status" value={<Chip label="Active" size="small" sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 700 }} />} />
            <SummaryRow label="Total Uploads" value={totalUploads} />
            <SummaryRow label="AI Predictions" value={predictions} />
            <SummaryRow label="Highly Recyclable" value={recyclableCount} />
            <SummaryRow
              label="Avg. AI Confidence"
              value={confidenceValues.length > 0 ? `${averageConfidence.toFixed(1)}%` : "--"}
            />
            <SummaryRow
              label="Avg. Sustainability"
              value={avgSustainability ? `${avgSustainability}/100` : "--"}
              last
            />
          </Card>
        </Grid>
      </Grid>

      {/* ====================================================
          CHANGE PASSWORD DIALOG
      ==================================================== */}

      <Dialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Change Password</DialogTitle>

        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>
          )}

          <TextField
            fullWidth label="Current Password"
            type="password"
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <TextField
            fullWidth label="New Password"
            type="password"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <TextField
            fullWidth label="Confirm New Password"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setPasswordOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordSubmit}
            disabled={passwordLoading}
            startIcon={passwordLoading ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
            sx={{ borderRadius: 2 }}
          >
            {passwordLoading ? "Saving…" : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}


// ==========================================================
// STAT CARD
// ==========================================================

function StatCard({ icon, iconBg, iconColor, title, value, subtitle }) {
  return (
    <Card
      sx={{
        p: 2.5, borderRadius: 4, height: "100%", boxSizing: "border-box",
        display: "flex", alignItems: "center", gap: 2,
        boxShadow: "0 8px 25px rgba(15,23,42,.07)",
        transition: "transform .2s, box-shadow .2s",
        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 14px 30px rgba(15,23,42,.12)" },
      }}
    >
      <Box sx={{ minWidth: 52, width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: iconBg, color: iconColor }}>
        {icon}
      </Box>
      <Box>
        <Typography fontWeight={600} color="text.secondary" sx={{ fontSize: ".9rem" }}>{title}</Typography>
        <Typography sx={{ fontSize: "1.8rem", lineHeight: 1.1, fontWeight: 800, color: iconColor, mt: 0.3 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{subtitle}</Typography>
      </Box>
    </Card>
  );
}


// ==========================================================
// SUMMARY ROW
// ==========================================================

function SummaryRow({ label, value, last = false }) {
  return (
    <Box
      sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        py: 1.4,
        borderBottom: last ? "none" : "1px solid rgba(0,0,0,.07)",
      }}
    >
      <Typography color="text.secondary" fontSize=".9rem">{label}</Typography>
      <Box sx={{ fontWeight: 700, textAlign: "right" }}>
        {typeof value === "string" || typeof value === "number" ? (
          <Typography fontWeight={700}>{value}</Typography>
        ) : value}
      </Box>
    </Box>
  );
}