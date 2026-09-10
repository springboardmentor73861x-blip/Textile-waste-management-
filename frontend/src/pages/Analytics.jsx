import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  Chip,
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

import AssessmentIcon from "@mui/icons-material/Assessment";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecyclingIcon from "@mui/icons-material/Recycling";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloudIcon from "@mui/icons-material/Cloud";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";

import api from "../services/api";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export default function Analytics() {
  const theme = useTheme();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await api.get("/textiles/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnalytics(response.data.data);
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, subtitle }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        minHeight: 170,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "0.2s",

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            p: 1.2,
            borderRadius: 2,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(34,197,94,0.15)"
                : "rgba(34,197,94,0.10)",
            color: "#22c55e",
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress color="success" />
        </Box>

    );
  }

  if (error) {
    return (
      
        <Alert severity="error">{error}</Alert>
      
    );
  }

  if (!analytics) {
    return (
      
        <Typography>No analytics data available.</Typography>
      
    );
  }

  const fabricData = Object.entries(
    analytics.fabric_distribution || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const recyclabilityData = Object.entries(
    analytics.recyclability_distribution || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const recoveryData = Object.entries(
    analytics.recovery_distribution || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const recommendationData = Object.entries(
    analytics.recommendation_distribution || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const environmental =
    analytics.environmental_impact || {};

  return (
    
      <Box sx={{ width: "100%", minWidth: 0 }}>

        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Analytics
            </Typography>

            <Typography color="text.secondary">
              Circular economy insights from your textile analyses
            </Typography>
          </Box>

          <Chip
            icon={<AssessmentIcon />}
            label="Live Analytics"
            color="success"
            variant="outlined"
          />
        </Box>

        {/* MAIN STATISTICS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <StatCard
            title="Total Analyses"
            value={analytics.total_analyses}
            icon={<AssessmentIcon />}
            subtitle="Textiles analyzed"
          />

          <StatCard
            title="Average AI Confidence"
            value={`${analytics.average_confidence}%`}
            icon={<PsychologyIcon />}
            subtitle="Prediction confidence"
          />

          <StatCard
            title="Sustainability Score"
            value={`${analytics.average_sustainability_score}/100`}
            icon={<RecyclingIcon />}
            subtitle="Average score"
          />

          <StatCard
            title="Circularity Score"
            value={`${analytics.average_circularity_score}/100`}
            icon={<AutorenewIcon />}
            subtitle="Average circularity"
          />
        </Box>

        {/* INSIGHTS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <StatCard
            title="Most Detected Fabric"
            value={analytics.most_detected_fabric}
            icon={<InventoryIcon />}
            subtitle="Most common textile"
          />

          <StatCard
            title="High Recovery Potential"
            value={analytics.high_recovery_count}
            icon={<RecyclingIcon />}
            subtitle="Textiles with strong recovery potential"
          />

          <StatCard
            title="High Recyclability"
            value={analytics.high_recyclability_count}
            icon={<AutorenewIcon />}
            subtitle="Highly recyclable textiles"
          />
        </Box>

        {/* ENVIRONMENTAL IMPACT */}
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 2 }}
        >
          Environmental Impact
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <StatCard
            title="CO₂ Savings"
            value={`${environmental.estimated_co2_savings_kg || 0} kg`}
            icon={<CloudIcon />}
            subtitle="Estimated savings"
          />

          <StatCard
            title="Water Savings"
            value={`${environmental.estimated_water_savings_liters || 0} L`}
            icon={<WaterDropIcon />}
            subtitle="Estimated savings"
          />

          <StatCard
            title="Landfill Diversion"
            value={`${environmental.estimated_landfill_diversion_kg || 0} kg`}
            icon={<DeleteIcon />}
            subtitle="Waste diverted"
          />

          <StatCard
            title="Resource Recovery"
            value={`${environmental.estimated_resource_recovery_kg || 0} kg`}
            icon={<RecyclingIcon />}
            subtitle="Materials recovered"
          />
        </Box>

        {/* CHARTS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              xl: "repeat(2, minmax(0, 1fr))",
            },
            gap: 3,
          }}
        >
          {/* FABRIC DISTRIBUTION */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              minWidth: 0,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={3}
            >
              Fabric Distribution
            </Typography>

            {fabricData.length > 0 ? (
              <Box sx={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fabricData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Analyses"
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No fabric data available.
              </Typography>
            )}
          </Paper>

          {/* RECYCLABILITY DISTRIBUTION */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              minWidth: 0,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={3}
            >
              Recyclability Distribution
            </Typography>

            {recyclabilityData.length > 0 ? (
              <Box sx={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recyclabilityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={110}
                      label
                    >
                      {recyclabilityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={45}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No recyclability data available.
              </Typography>
            )}
          </Paper>

          {/* RECOVERY POTENTIAL */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              minWidth: 0,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={3}
            >
              Recovery Potential
            </Typography>

            {recoveryData.length > 0 ? (
              <Box sx={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={recoveryData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Textiles"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No recovery data available.
              </Typography>
            )}
          </Paper>

          {/* RECOMMENDED RECOVERY METHODS */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              minWidth: 0,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={3}
            >
              Recommended Recovery Methods
            </Typography>

            {recommendationData.length > 0 ? (
              <Box sx={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recommendationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={110}
                      label
                    >
                      {recommendationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={55}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No recommendation data available.
              </Typography>
            )}
          </Paper>
        </Box>

        {/* CIRCULAR ECONOMY INSIGHT */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={1}
          >
            Circular Economy Insight
          </Typography>

          <Typography color="text.secondary">
            The most frequently recommended recovery method is{" "}
            <strong>{analytics.most_recommended_action}</strong>.
            Your platform has analyzed{" "}
            <strong>{analytics.total_analyses}</strong>{" "}
            textile items and identified{" "}
            <strong>{analytics.high_recovery_count}</strong>{" "}
            items with high recovery potential.
          </Typography>
        </Paper>

      </Box>
  );
}