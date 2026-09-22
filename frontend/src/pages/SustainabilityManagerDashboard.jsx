import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import EcoIcon from "@mui/icons-material/Nature";
import CloudIcon from "@mui/icons-material/Cloud";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import DeleteIcon from "@mui/icons-material/Delete";
import RecyclingIcon from "@mui/icons-material/Recycling";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";

import api from "../services/api";
import StatCard from "../components/StatCard";

// ==========================================================
// SUSTAINABILITY GRADE
// Simple A-F letter grade derived from average circularity
// score, for an ESG-report feel.
// ==========================================================

function getGrade(score) {
  if (score >= 85) return { letter: "A", color: "#059669" };
  if (score >= 70) return { letter: "B", color: "#16a34a" };
  if (score >= 55) return { letter: "C", color: "#d97706" };
  if (score >= 40) return { letter: "D", color: "#ea580c" };
  return { letter: "F", color: "#dc2626" };
}

export default function SustainabilityManagerDashboard() {
  const theme = useTheme();

  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [historyRes, analyticsRes] = await Promise.all([
        api.get("/textiles/history", { headers }),
        api.get("/textiles/analytics", { headers }),
      ]);

      setHistory(historyRes.data?.data || []);
      setAnalytics(analyticsRes.data?.data || null);
    } catch (err) {
      console.error("Sustainability dashboard error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      } else {
        setError("Unable to load sustainability data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // TREND DATA — sustainability score across uploads over time
  // ==========================================================

  const trendData = useMemo(() => {
    const sorted = [...history]
      .filter((item) => item.sustainability_score != null)
      .sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));

    return sorted.map((item, index) => ({
      label: `#${index + 1}`,
      date: item.uploaded_at
        ? new Date(item.uploaded_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })
        : `#${index + 1}`,
      sustainability: Number(item.sustainability_score) || 0,
      circularity: Number(item.circularity_score) || 0,
    }));
  }, [history]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!analytics) return <Typography>No sustainability data available yet.</Typography>;

  const environmental = analytics.environmental_impact || {};
  const grade = getGrade(analytics.average_circularity_score || 0);

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
          <Typography variant="h4" fontWeight="bold">Sustainability Manager Dashboard</Typography>
          <Typography color="text.secondary">
            Environmental performance and circularity trends over time
          </Typography>
        </Box>

        <Chip icon={<EcoIcon />} label="ESG View" color="success" variant="outlined" />
      </Box>

      {/* SUSTAINABILITY GRADE + KEY STATS */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${grade.color}18`,
                color: grade.color,
                fontWeight: 800,
                fontSize: "1.8rem",
                flexShrink: 0,
              }}
            >
              {grade.letter}
            </Box>
            <Box>
              <Typography color="text.secondary" fontSize="0.85rem">Sustainability Grade</Typography>
              <Typography fontWeight={700}>Based on avg. circularity</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg. Sustainability"
            value={`${analytics.average_sustainability_score}%`}
            icon={<AssessmentIcon fontSize="large" />}
            color="linear-gradient(135deg,#059669,#047857)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg. Circularity"
            value={`${analytics.average_circularity_score}%`}
            icon={<RecyclingIcon fontSize="large" />}
            color="linear-gradient(135deg,#0891b2,#0e7490)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="High Recovery Items"
            value={analytics.high_recovery_count}
            icon={<TrendingUpIcon fontSize="large" />}
            color="linear-gradient(135deg,#7c3aed,#5b21b6)"
          />
        </Grid>
      </Grid>

      {/* ENVIRONMENTAL IMPACT — ESG STYLE */}
      <Paper
        elevation={0}
        sx={{ mt: 4, p: 4, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}
      >
        <Typography variant="h6" fontWeight="bold">Environmental Impact Report</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Cumulative estimated environmental benefit from all analyzed textiles.
        </Typography>

        <Grid container spacing={3}>
          {[
            ["Carbon Reduction", `${environmental.estimated_co2_savings_kg ?? 0} kg CO\u2082`, <CloudIcon key="c" />],
            ["Water Conservation", `${environmental.estimated_water_savings_liters ?? 0} L`, <WaterDropIcon key="w" />],
            ["Landfill Diversion", `${environmental.estimated_landfill_diversion_kg ?? 0} kg`, <DeleteIcon key="l" />],
            ["Resource Recovery", `${environmental.estimated_resource_recovery_kg ?? 0} kg`, <RecyclingIcon key="r" />],
          ].map(([label, value, icon]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "action.hover" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, color: "success.main" }}>
                  {icon}
                  <Typography color="text.secondary" fontSize="0.85rem">{label}</Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">{value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* TREND OVER TIME */}
      <Paper
        elevation={0}
        sx={{ mt: 4, mb: 2, p: 4, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}
      >
        <Typography variant="h6" fontWeight="bold" mb={0.5}>Sustainability Trend</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sustainability and circularity scores across your upload history, in chronological order.
        </Typography>

        {trendData.length < 2 ? (
          <Typography color="text.secondary">
            Not enough data yet to show a trend \u2014 upload a few more textiles to see this chart populate.
          </Typography>
        ) : (
          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sustainability"
                  name="Sustainability Score"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="circularity"
                  name="Circularity Score"
                  stroke="#0891b2"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
}