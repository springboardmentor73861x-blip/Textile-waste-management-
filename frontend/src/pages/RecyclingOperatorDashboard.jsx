import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Avatar,
  Button,
  Divider,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RecyclingIcon from "@mui/icons-material/Recycling";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import api from "../services/api";
import StatCard from "../components/StatCard";

export default function RecyclingOperatorDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState(0); // 0 = Pending queue, 1 = Processed
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await api.get("/textiles/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data?.data || []);
    } catch (error) {
      console.error("Recycling dashboard loading error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  const pendingItems = useMemo(
    () => history.filter((item) => (item.processing_status || "pending") === "pending"),
    [history]
  );

  const processedItems = useMemo(
    () => history.filter((item) => item.processing_status === "processed"),
    [history]
  );

  const recyclableCount = useMemo(
    () =>
      history.filter((item) => String(item.recyclable || "").toLowerCase() === "high").length,
    [history]
  );

  const handleMarkProcessed = async (id) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("access_token");

      await api.put(
        `/textiles/${id}/status`,
        { processing_status: "processed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, processing_status: "processed" } : item
        )
      );

      setSnackbar({ open: true, message: "Marked as processed.", severity: "success" });
    } catch (error) {
      console.error("Status update error:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Failed to update status.",
        severity: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRecycleColor = (value) => {
    if (!value) return "default";
    const v = String(value).toLowerCase();
    if (v === "high") return "success";
    if (v === "medium") return "warning";
    return "error";
  };

  const activeList = tab === 0 ? pendingItems : processedItems;

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>

      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">Recycling Operator Dashboard</Typography>
          <Typography color="text.secondary">
            Review incoming textile waste and mark items as processed
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/upload")}
          sx={{ borderRadius: 3, px: 3, py: 1.4, fontWeight: "bold", textTransform: "none" }}
        >
          Upload Textile
        </Button>
      </Box>

      {/* STATS */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Uploads"
            value={history.length}
            icon={<CloudUploadIcon fontSize="large" />}
            color="linear-gradient(135deg,#2563eb,#1d4ed8)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pending Processing"
            value={pendingItems.length}
            icon={<PendingActionsIcon fontSize="large" />}
            color="linear-gradient(135deg,#ea580c,#c2410c)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Processed"
            value={processedItems.length}
            icon={<CheckCircleIcon fontSize="large" />}
            color="linear-gradient(135deg,#16a34a,#15803d)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Highly Recyclable"
            value={recyclableCount}
            icon={<RecyclingIcon fontSize="large" />}
            color="linear-gradient(135deg,#7c3aed,#5b21b6)"
          />
        </Grid>
      </Grid>

      {/* QUEUE */}
      <Paper
        elevation={0}
        sx={{ mt: 4, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}
      >
        <Box sx={{ px: 3, pt: 3 }}>
          <Typography variant="h6" fontWeight="bold">Processing Queue</Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            Items you've uploaded, grouped by processing status
          </Typography>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 3 }}
        >
          <Tab label={`Pending (${pendingItems.length})`} />
          <Tab label={`Processed (${processedItems.length})`} />
        </Tabs>

        <Divider />

        {activeList.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="text.secondary">
              {tab === 0
                ? "No items pending processing. Great work!"
                : "No items marked as processed yet."}
            </Typography>
          </Box>
        ) : (
          <Box>
            {activeList.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  p: 2.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Avatar
                  src={
                    item.image_path
                      ? `${api.defaults.baseURL}/${item.image_path.replace(/\\/g, "/")}`
                      : undefined
                  }
                  variant="rounded"
                  sx={{ width: 56, height: 56 }}
                >
                  🧵
                </Avatar>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography fontWeight={700}>
                    {item.textile_name || `Textile #${item.id}`}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mt: 0.8, flexWrap: "wrap" }}>
                    <Chip size="small" label={item.prediction || "Unknown fabric"} variant="outlined" />
                    <Chip
                      size="small"
                      label={item.recyclable || "—"}
                      color={getRecycleColor(item.recyclable)}
                    />
                    <Chip size="small" label={item.primary_action || "No action"} variant="outlined" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                    Uploaded {formatDate(item.uploaded_at)}
                  </Typography>
                </Box>

                {tab === 0 ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={
                      updatingId === item.id ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                    disabled={updatingId === item.id}
                    onClick={() => handleMarkProcessed(item.id)}
                    sx={{ borderRadius: 2.5, whiteSpace: "nowrap", textTransform: "none" }}
                  >
                    Mark as Processed
                  </Button>
                ) : (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Processed"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}