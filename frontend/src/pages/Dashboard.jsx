import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";

import PieChartIcon from "@mui/icons-material/PieChart";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RecyclingIcon from "@mui/icons-material/Recycling";
import PsychologyIcon from "@mui/icons-material/Psychology";
import InsightsIcon from "@mui/icons-material/Insights";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import api from "../services/api";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const navigate = useNavigate();

  const chartColors = [
    "#2563eb",
    "#16a34a",
    "#7c3aed",
    "#ea580c",
    "#0891b2",
    "#db2777",
    "#65a30d",
    "#9333ea",
    "#dc2626",
    "#0f766e",
  ];

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        historyResponse,
        userResponse,
        analyticsResponse,
      ] = await Promise.all([
        api.get("/textiles/history", { headers }),
        api.get("/users/me", { headers }),
        api.get("/textiles/analytics", { headers }),
      ]);

      setHistory(historyResponse.data?.data || []);
      setUser(userResponse.data);
      setAnalytics(analyticsResponse.data?.data || null);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    const totalUploads = history.length;

    const predictions = history.filter(
      (item) =>
        item.prediction &&
        String(item.prediction).trim() !== ""
    );

    const totalPredictions = predictions.length;

    const highlyRecyclable = history.filter(
      (item) =>
        item.recyclable &&
        String(item.recyclable).toLowerCase() === "high"
    ).length;

    const confidenceValues = history
      .map((item) => {
        const value = parseFloat(item.confidence);
        return Number.isFinite(value) ? value : null;
      })
      .filter((value) => value !== null);

    const averageConfidence =
      confidenceValues.length > 0
        ? confidenceValues.reduce(
            (sum, value) => sum + value,
            0
          ) / confidenceValues.length
        : 0;

    const fabricCounts = {};

    predictions.forEach((item) => {
      if (!item.prediction) return;

      fabricCounts[item.prediction] =
        (fabricCounts[item.prediction] || 0) + 1;
    });

    let mostFrequentFabric = "No data";
    let mostFrequentCount = 0;

    Object.entries(fabricCounts).forEach(
      ([fabric, count]) => {
        if (count > mostFrequentCount) {
          mostFrequentFabric = fabric;
          mostFrequentCount = count;
        }
      }
    );

    return {
      totalUploads,
      totalPredictions,
      highlyRecyclable,
      averageConfidence,
      mostFrequentFabric,
      mostFrequentCount,
    };
  }, [history]);

  // ==========================================================
  // FABRIC DISTRIBUTION
  // ==========================================================

  const fabricDistribution = useMemo(() => {
    const counts = {};

    history.forEach((item) => {
      if (!item.prediction) return;

      counts[item.prediction] =
        (counts[item.prediction] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [history]);

  // ==========================================================
  // RECENT ANALYSES
  // ==========================================================

  const recentAnalyses = useMemo(() => {
    return [...history]
      .sort(
        (a, b) =>
          new Date(b.uploaded_at) -
          new Date(a.uploaded_at)
      )
      .slice(0, 5);
  }, [history]);

  // ==========================================================
  // PIE CHART
  // ==========================================================

  const pieChartBackground = useMemo(() => {
    if (fabricDistribution.length === 0) {
      return theme.palette.action.hover;
    }

    const total = fabricDistribution.reduce(
      (sum, item) => sum + item.value,
      0
    );

    let currentAngle = 0;

    const segments = fabricDistribution.map(
      (item, index) => {
        const percentage =
          (item.value / total) * 100;

        const start = currentAngle;
        currentAngle += percentage;

        const color =
          chartColors[index % chartColors.length];

        return `${color} ${start}% ${currentAngle}%`;
      }
    );

    return `conic-gradient(${segments.join(", ")})`;
  }, [fabricDistribution, theme]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConfidenceColor = (confidence) => {
    const value = parseFloat(confidence);

    if (!Number.isFinite(value)) return "default";
    if (value >= 80) return "success";
    if (value >= 60) return "warning";

    return "error";
  };

  const getRecycleColor = (value) => {
    if (!value) return "default";

    const recyclable = String(value).toLowerCase();

    if (recyclable === "high") return "success";
    if (recyclable === "medium") return "warning";

    return "error";
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
        <Box sx={{ width: "100%", m: 0, p: 0 }}>
          <Typography variant="h5" fontWeight="bold">
            Loading Dashboard...
          </Typography>
        </Box>
    );
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "none",
          m: 0,
          p: 0,
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ m: 0, p: 0 }}>
            <Typography variant="h4" fontWeight="bold">
              Welcome {user?.full_name || "User"} 👋
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              AI Powered Textile Waste Intelligence Platform
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/upload")}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.4,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Analyze Textile
          </Button>
        </Box>

        {/* STAT CARDS */}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Uploads"
              value={statistics.totalUploads}
              icon={<CloudUploadIcon fontSize="large" />}
              color="linear-gradient(135deg,#2563eb,#1d4ed8)"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="AI Predictions"
              value={statistics.totalPredictions}
              icon={<PsychologyIcon fontSize="large" />}
              color="linear-gradient(135deg,#7c3aed,#5b21b6)"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Highly Recyclable"
              value={statistics.highlyRecyclable}
              icon={<RecyclingIcon fontSize="large" />}
              color="linear-gradient(135deg,#16a34a,#15803d)"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Avg. AI Confidence"
              value={
                statistics.totalPredictions > 0
                  ? `${statistics.averageConfidence.toFixed(1)}%`
                  : "--"
              }
              icon={<InsightsIcon fontSize="large" />}
              color="linear-gradient(135deg,#ea580c,#c2410c)"
            />
          </Grid>
        </Grid>

        {/* SUSTAINABILITY */}

        <Box sx={{ mt: 5, mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Sustainability Overview
          </Typography>

          <Typography color="text.secondary">
            Circular-economy intelligence generated from your textile analysis history.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Avg. Sustainability"
              value={
                analytics?.average_sustainability_score
                  ? `${analytics.average_sustainability_score}%`
                  : "--"
              }
              icon={<InsightsIcon fontSize="large" />}
              color="linear-gradient(135deg,#059669,#047857)"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Avg. Circularity"
              value={
                analytics?.average_circularity_score
                  ? `${analytics.average_circularity_score}%`
                  : "--"
              }
              icon={<RecyclingIcon fontSize="large" />}
              color="linear-gradient(135deg,#0891b2,#0e7490)"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="High Recovery"
              value={analytics?.high_recovery_count ?? "--"}
              icon={<RecyclingIcon fontSize="large" />}
              color="linear-gradient(135deg,#16a34a,#15803d)"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Most Detected"
              value={
                analytics?.most_detected_fabric &&
                analytics.most_detected_fabric !== "None"
                  ? analytics.most_detected_fabric
                  : "--"
              }
              icon={<PsychologyIcon fontSize="large" />}
              color="linear-gradient(135deg,#7c3aed,#5b21b6)"
            />
          </Grid>
        </Grid>

        {/* ENVIRONMENTAL IMPACT */}

        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 4,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Estimated Environmental Impact
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Model-based estimates from textile sustainability factors.
          </Typography>

          <Grid container spacing={3}>
            {[
              [
                "CO₂ Savings",
                `${analytics?.environmental_impact?.estimated_co2_savings_kg ?? 0} kg`,
              ],
              [
                "Water Savings",
                `${analytics?.environmental_impact?.estimated_water_savings_liters ?? 0} L`,
              ],
              [
                "Landfill Diversion",
                `${analytics?.environmental_impact?.estimated_landfill_diversion_kg ?? 0} kg`,
              ],
              [
                "Resource Recovery",
                `${analytics?.environmental_impact?.estimated_resource_recovery_kg ?? 0} kg`,
              ],
            ].map(([label, value]) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography color="text.secondary">
                    {label}
                  </Typography>

                  <Typography variant="h5" fontWeight="bold">
                    {analytics ? value : "--"}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* DISTRIBUTION + AI PERFORMANCE */}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <PieChartIcon color="primary" />

                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Textile Distribution
                  </Typography>

                  <Typography color="text.secondary">
                    Distribution of detected textile types
                  </Typography>
                </Box>
              </Box>

              {fabricDistribution.length === 0 ? (
                <Box
                  sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    Upload textile images to generate distribution analytics.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      width: 250,
                      height: 250,
                      borderRadius: "50%",
                      background: pieChartBackground,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        bgcolor: "background.paper",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="h4" fontWeight="bold">
                        {history.length}
                      </Typography>

                      <Typography color="text.secondary">
                        Analyses
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: 220 }}>
                    {fabricDistribution.map((item, index) => {
                      const total = fabricDistribution.reduce(
                        (sum, fabric) => sum + fabric.value,
                        0
                      );

                      const percentage = (
                        (item.value / total) *
                        100
                      ).toFixed(1);

                      return (
                        <Box
                          key={item.name}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 3,
                            py: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor:
                                  chartColors[
                                    index % chartColors.length
                                  ],
                              }}
                            />

                            <Typography>{item.name}</Typography>
                          </Box>

                          <Typography fontWeight="bold">
                            {percentage}%
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <InsightsIcon color="primary" />

                <Typography variant="h6" fontWeight="bold">
                  AI Performance
                </Typography>
              </Box>

              <Typography color="text.secondary">
                Average Confidence
              </Typography>

              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{ mb: 2 }}
              >
                {statistics.totalPredictions > 0
                  ? `${statistics.averageConfidence.toFixed(1)}%`
                  : "--"}
              </Typography>

              <Box
                sx={{
                  height: 10,
                  borderRadius: 10,
                  bgcolor: "action.hover",
                  overflow: "hidden",
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${Math.min(
                      statistics.averageConfidence,
                      100
                    )}%`,
                    background:
                      "linear-gradient(90deg,#2563eb,#7c3aed)",
                  }}
                />
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "action.hover",
                  mb: 2,
                }}
              >
                <Typography color="text.secondary">
                  Total AI Predictions
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {statistics.totalPredictions}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "action.hover",
                }}
              >
                <Typography color="text.secondary">
                  Highly Recyclable Textiles
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="success.main"
                >
                  {statistics.highlyRecyclable}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* AI INSIGHTS */}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <AutoAwesomeIcon color="primary" />

                <Typography variant="h6" fontWeight="bold">
                  AI Insights
                </Typography>
              </Box>

              <Typography color="text.secondary">
                Most frequently detected textile
              </Typography>

              <Typography
                variant="h2"
                fontWeight="bold"
                color="primary"
                sx={{ mt: 1 }}
              >
                {statistics.mostFrequentFabric}
              </Typography>

              <Typography color="text.secondary">
                {statistics.mostFrequentCount > 0
                  ? `Detected ${statistics.mostFrequentCount} times`
                  : "Upload textile images to generate AI insights."}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography color="text.secondary">
                The platform analyzes uploaded textile images using the
                trained MobileNetV2-based AI classification model.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <ScienceIcon color="primary" />

                <Typography variant="h6" fontWeight="bold">
                  Textile AI Model
                </Typography>
              </Box>

              <Typography color="text.secondary">
                MobileNetV2-based textile classification model trained to
                identify 10 fabric categories.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 3,
                }}
              >
                {[
                  "Corduroy",
                  "Cotton",
                  "Denim",
                  "Fleece",
                  "Leather",
                  "Linen",
                  "Nylon",
                  "Polyester",
                  "Silk",
                  "Velvet",
                ].map((fabric) => (
                  <Chip
                    key={fabric}
                    label={fabric}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* RECENT ANALYSES */}

        <Paper
          elevation={0}
          sx={{
            mt: 4,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <HistoryIcon />

              <Typography variant="h6" fontWeight="bold">
                Recent Analyses
              </Typography>
            </Box>

            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/history")}
              sx={{ textTransform: "none" }}
            >
              View All History
            </Button>
          </Box>

          <Divider />

          {recentAnalyses.length === 0 ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <Typography color="text.secondary">
                No textile analyses yet.
              </Typography>

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate("/upload")}
              >
                Analyze Your First Textile
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Textile</TableCell>
                    <TableCell>Prediction</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Recyclability</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {recentAnalyses.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/history/${item.id}`)
                      }
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Avatar
                            src={
                              item.image_path
                                ? `${api.defaults.baseURL}/${item.image_path.replace(
                                    /\\/g,
                                    "/"
                                  )}`
                                : undefined
                            }
                            variant="rounded"
                          >
                            🧵
                          </Avatar>

                          <Typography>
                            {item.textile_name ||
                              "Unnamed Textile"}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontWeight="bold"
                          color="primary"
                        >
                          {item.prediction || "Pending"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {item.confidence ? (
                          <Chip
                            label={`${parseFloat(
                              item.confidence
                            ).toFixed(1)}%`}
                            color={getConfidenceColor(
                              item.confidence
                            )}
                            size="small"
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        {item.recyclable ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={item.recyclable}
                            color={getRecycleColor(
                              item.recyclable
                            )}
                            size="small"
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        {formatDate(item.uploaded_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* FOOTER */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            mt: 4,
            pb: 2,
          }}
        >
          <CheckCircleIcon color="success" />

          <Typography color="text.secondary">
            AI Classification System Active
          </Typography>
        </Box>
      </Box>
  );
}