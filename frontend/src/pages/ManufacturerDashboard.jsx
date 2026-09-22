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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import InventoryIcon from "@mui/icons-material/Inventory";
import RecyclingIcon from "@mui/icons-material/Recycling";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import api from "../services/api";
import StatCard from "../components/StatCard";

const COLORS = ["#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#db2777"];

const RECOVERY_GOOD = new Set(["Excellent Recovery Potential", "High Recovery Potential"]);

export default function ManufacturerDashboard() {
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
      console.error("Manufacturer dashboard error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      } else {
        setError("Unable to load production waste data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // PRODUCTION WASTE PATTERNS — which fabrics show up most
  // ==========================================================

  const fabricData = useMemo(() => {
    if (!analytics?.fabric_distribution) return [];
    return Object.entries(analytics.fabric_distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [analytics]);

  // ==========================================================
  // RECOVERY OUTCOMES — reusable vs landfill-bound split
  // ==========================================================

  const recoveryOutcome = useMemo(() => {
    if (!analytics?.recovery_distribution) return [];

    let recovered = 0;
    let landfillBound = 0;

    Object.entries(analytics.recovery_distribution).forEach(([category, count]) => {
      if (RECOVERY_GOOD.has(category)) {
        recovered += count;
      } else if (category === "Disposal Recommended" || category === "Limited Recovery Potential") {
        landfillBound += count;
      } else {
        // Moderate etc. — count as partially recovered
        recovered += count * 0.5;
        landfillBound += count * 0.5;
      }
    });

    return [
      { name: "Recovered / Reusable", value: Math.round(recovered) },
      { name: "Landfill-Bound Risk", value: Math.round(landfillBound) },
    ];
  }, [analytics]);

  const totalWaste = history.length;
  const recoveredCount = recoveryOutcome[0]?.value || 0;
  const recoveryRate = totalWaste > 0 ? ((recoveredCount / totalWaste) * 100).toFixed(1) : "0.0";

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress color="warning" />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!analytics) return <Typography>No production data available yet.</Typography>;

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
          <Typography variant="h4" fontWeight="bold">Manufacturer Dashboard</Typography>
          <Typography color="text.secondary">
            Production waste patterns and material recovery outcomes
          </Typography>
        </Box>

        <Chip icon={<PrecisionManufacturingIcon />} label="Production View" color="warning" variant="outlined" />
      </Box>

      {/* KEY STATS */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Waste Logged"
            value={totalWaste}
            icon={<InventoryIcon fontSize="large" />}
            color="linear-gradient(135deg,#2563eb,#1d4ed8)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Most Wasted Material"
            value={analytics.most_detected_fabric || "—"}
            icon={<PrecisionManufacturingIcon fontSize="large" />}
            color="linear-gradient(135deg,#ea580c,#c2410c)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Recovery Rate"
            value={`${recoveryRate}%`}
            icon={<CheckCircleIcon fontSize="large" />}
            color="linear-gradient(135deg,#16a34a,#15803d)"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="High Recyclability"
            value={analytics.high_recyclability_count}
            icon={<RecyclingIcon fontSize="large" />}
            color="linear-gradient(135deg,#7c3aed,#5b21b6)"
          />
        </Grid>
      </Grid>

      {/* PRODUCTION WASTE PATTERNS + RECOVERY OUTCOME */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{ p: 4, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: "100%" }}
          >
            <Typography variant="h6" fontWeight="bold" mb={0.5}>Production Waste by Material</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Which fabric types make up the most of your logged waste.
            </Typography>

            {fabricData.length > 0 ? (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fabricData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Waste Items" fill="#ea580c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">No waste data logged yet.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{ p: 4, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: "100%" }}
          >
            <Typography variant="h6" fontWeight="bold" mb={0.5}>Recovery Outcome</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Share of waste recovered/reusable vs. at risk of landfill.
            </Typography>

            {recoveryOutcome.length > 0 && totalWaste > 0 ? (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recoveryOutcome}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={100}
                      label
                    >
                      {recoveryOutcome.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#16a34a" : "#dc2626"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={45} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">No recovery data available yet.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* RECOMMENDED ACTIONS BREAKDOWN */}
      <Paper
        elevation={0}
        sx={{ mt: 3, mb: 2, p: 4, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}
      >
        <Typography variant="h6" fontWeight="bold" mb={0.5}>Recommended Recovery Actions</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          What the platform recommends doing with your production waste.
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {Object.entries(analytics.recommendation_distribution || {}).map(([action, count]) => (
            <Chip
              key={action}
              label={`${action}: ${count}`}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          ))}
          {Object.keys(analytics.recommendation_distribution || {}).length === 0 && (
            <Typography color="text.secondary">No recommendations yet.</Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}