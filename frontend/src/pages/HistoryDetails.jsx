import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Paper,
  Stack,
  useTheme,
  Chip,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecyclingIcon from "@mui/icons-material/Recycling";
import CategoryIcon from "@mui/icons-material/Category";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import Co2Icon from "@mui/icons-material/Co2";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import FactoryIcon from "@mui/icons-material/Factory";
import RecyclingOutlinedIcon from "@mui/icons-material/RecyclingOutlined";

export default function HistoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // THEME COLORS
  // =====================================================

  const colors = {
    pageBackground: isDark
      ? "linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e293b 100%)"
      : "linear-gradient(135deg, #f5f7fb 0%, #eef2f7 100%)",

    cardBackground: isDark ? "#1e293b" : "#ffffff",

    secondaryCardBackground: isDark ? "#273449" : "#ffffff",

    predictionBackground: isDark ? "#263449" : "#f8fafc",

    border: isDark ? "#475569" : "#e2e8f0",

    primaryText: isDark ? "#f8fafc" : "#111827",

    secondaryText: isDark ? "#cbd5e1" : "#64748b",

    mutedText: isDark ? "#94a3b8" : "#64748b",

    primaryPredictionBackground: isDark
      ? "linear-gradient(135deg, #252b4a, #302d52)"
      : "linear-gradient(135deg, #eef2ff, #f5f3ff)",

    recommendationBackground: isDark ? "#12352b" : "#ecfdf5",

    recommendationText: isDark ? "#d1fae5" : "#166534",

    iconMuted: isDark ? "#94a3b8" : "#64748b",
  };

  // =====================================================
  // FETCH HISTORY
  // =====================================================

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await api.get("/textiles/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const history = response.data.data || [];

      const found = history.find(
        (textile) => String(textile.id) === String(id)
      );

      console.log("History Details Record:", found);

      setItem(found || null);
    } catch (error) {
      console.error("Failed to load textile details:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // IMAGE
  // =====================================================

  const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    return `http://127.0.0.1:8000/${path}`;
  };

  // =====================================================
  // TOP PREDICTIONS
  // =====================================================

  const parseTopPredictions = (value) => {
    if (!value) return [];

    try {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "string") {
        return JSON.parse(value);
      }

      return [];
    } catch (error) {
      console.error("Failed to parse top predictions:", error);
      return [];
    }
  };

  // =====================================================
  // NUMBER HELPER
  // =====================================================

  const numberValue = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("access_token");

      await api.delete(`/textiles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/history");
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
        <Box
            sx={{
              width: "100p%",
              minHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: colors.pageBackground,
            }}
          >
            <CircularProgress />
            </Box>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!item) {
    return (
          <Box
            sx={{
              width: "100%",
              minHeight: "100vh",
              p: {
                xs: 2,
                md: 4,
              },
              background: colors.pageBackground,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/history")}
              sx={{
                mb: 4,
                textTransform: "none",
                color: colors.primaryText,
              }}
            >
              Back to History
            </Button>

            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 5,
                backgroundColor: colors.cardBackground,
                color: colors.primaryText,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Analysis not found
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: colors.secondaryText,
                }}
              >
                This textile analysis may have been deleted.
              </Typography>
            </Paper>
          </Box>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const confidence = numberValue(item.confidence);

  const topPredictions = parseTopPredictions(item.top_predictions);

  const sustainabilityScore = numberValue(
    item.sustainability_score
  );

  const circularityScore = numberValue(
    item.circularity_score
  );

  const environmentalBenefitScore = numberValue(
    item.environmental_benefit_score
  );

  const co2Savings = numberValue(
    item.estimated_co2_savings_kg
  );

  const waterSavings = numberValue(
    item.estimated_water_savings_liters
  );

  const landfillDiversion = numberValue(
    item.estimated_landfill_diversion_kg
  );

  const resourceRecovery = numberValue(
    item.estimated_resource_recovery_kg
  );

  // =====================================================
  // SCORE COLOR
  // =====================================================

  const getScoreColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#2563eb";
    if (score >= 40) return "#f59e0b";
    return "#dc2626";
  };

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        minHeight: "100vh",
        px: {
          xs: 2,
          md: 4,
        },
        py: 3,
        boxSizing: "border-box",
        background: colors.pageBackground,
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          minWidth:0,
          maxWidth: "100",
          margin: 0,
        }}
      >
            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/history")}
              sx={{
                mb: 3,
                textTransform: "none",
                fontWeight: "bold",
                color: colors.primaryText,
              }}
            >
              Back to History
            </Button>

            {/* =================================================
                HEADER
            ================================================= */}

            <Box mb={4}>
              <Typography
                variant="h3"
                fontWeight="800"
                sx={{
                  color: colors.primaryText,
                }}
              >
                Textile Analysis
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: colors.secondaryText,
                }}
              >
                Detailed AI analysis, sustainability and
                circular-economy results.
              </Typography>
            </Box>

            {/* =================================================
                MAIN CARD
            ================================================= */}

            <Card
              elevation={0}
              sx={{
                 width: "100%",
                 maxWidth: "100%",
                 boxSizing: "border-box",
                borderRadius: 5,
                overflow: "hidden",
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.cardBackground,
                color: colors.primaryText,
              }}
            >
              <Grid container>
                {/* =================================================
                    IMAGE
                ================================================= */}

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      height: {
                        xs: 350,
                        md: "100%",
                      },
                      minHeight: 500,
                    }}
                  >
                    <img
                      src={getImageUrl(item.image_path)}
                      alt={
                        item.textile_name ||
                        item.prediction
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>
                </Grid>

                {/* =================================================
                    INFORMATION
                ================================================= */}

                <Grid item xs={12} md={6}>
                  <CardContent
                    sx={{
                      p: {
                        xs: 3,
                        md: 5,
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="800"
                      mb={1}
                      sx={{
                        color: colors.primaryText,
                      }}
                    >
                      {item.textile_name ||
                        item.prediction ||
                        "Textile Analysis"}
                    </Typography>

                    <Typography
                      mb={4}
                      sx={{
                        color: colors.secondaryText,
                      }}
                    >
                      AI-generated textile classification
                      and circular-economy analysis.
                    </Typography>

                    {/* =================================================
                        PRIMARY PREDICTION
                    ================================================= */}

                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        background:
                          colors.primaryPredictionBackground,
                        mb: 3,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={1}
                      >
                        <PsychologyIcon
                          sx={{
                            color: "#7c3aed",
                          }}
                        />

                        <Typography
                          fontWeight="bold"
                          sx={{
                            color: colors.primaryText,
                          }}
                        >
                          AI Prediction
                        </Typography>
                      </Stack>

                      <Typography
                        variant="h3"
                        fontWeight="800"
                        sx={{
                          color: isDark
                            ? "#c4b5fd"
                            : "#4f46e5",
                        }}
                      >
                        {item.prediction || "Unknown"}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          fontWeight: "bold",
                          color:
                            confidence >= 80
                              ? "#16a34a"
                              : confidence >= 60
                              ? "#2563eb"
                              : "#ea580c",
                        }}
                      >
                        {confidence.toFixed(2)}% confidence
                      </Typography>
                    </Paper>

                    {/* =================================================
                        BASIC DETAILS
                    ================================================= */}

                    <Grid container spacing={2}>
                      {/* CATEGORY */}

                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: `1px solid ${colors.border}`,
                            backgroundColor:
                              colors.secondaryCardBackground,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <CategoryIcon color="primary" />

                            <Typography
                              fontSize={13}
                              sx={{
                                color:
                                  colors.secondaryText,
                              }}
                            >
                              Category
                            </Typography>
                          </Stack>

                          <Typography
                            fontWeight="bold"
                            sx={{
                              mt: 1,
                              color:
                                colors.primaryText,
                            }}
                          >
                            {item.category ||
                              "Not available"}
                          </Typography>
                        </Paper>
                      </Grid>

                      {/* RECYCLABILITY */}

                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: `1px solid ${colors.border}`,
                            backgroundColor:
                              colors.secondaryCardBackground,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <RecyclingIcon
                              sx={{
                                color: "#16a34a",
                              }}
                            />

                            <Typography
                              fontSize={13}
                              sx={{
                                color:
                                  colors.secondaryText,
                              }}
                            >
                              Recyclability
                            </Typography>
                          </Stack>

                          <Typography
                            fontWeight="bold"
                            sx={{
                              mt: 1,
                              color: "#16a34a",
                            }}
                          >
                            {item.recyclable ||
                              item.recyclability ||
                              "Not available"}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* DATE */}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 3,
                      }}
                    >
                      <CalendarTodayIcon
                        sx={{
                          fontSize: 17,
                          color: colors.iconMuted,
                        }}
                      />

                      <Typography
                        fontSize={13}
                        sx={{
                          color: colors.secondaryText,
                        }}
                      >
                        {item.uploaded_at
                          ? new Date(
                              item.uploaded_at
                            ).toLocaleString()
                          : "Date unavailable"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>

            {/* ==========================================================
                TOP PREDICTIONS + RECOMMENDATION
            ========================================================== */}

            <Grid
              container
              spacing={3}
              sx={{
                mt: 1,
              }}
            >
              {/* TOP PREDICTIONS */}

              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 5,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.cardBackground,
                    color: colors.primaryText,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="800"
                    mb={3}
                  >
                    Top 3 AI Predictions
                  </Typography>

                  {topPredictions.length > 0 ? (
                    topPredictions
                      .slice(0, 3)
                      .map((prediction, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            p: 2,
                            mb: 1,
                            borderRadius: 3,
                            backgroundColor:
                              colors.predictionBackground,
                            border: `1px solid ${
                              isDark
                                ? "#334155"
                                : "transparent"
                            }`,
                          }}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <Typography
                              fontWeight="bold"
                              sx={{
                                color: isDark
                                  ? "#60a5fa"
                                  : theme.palette
                                      .primary.main,
                              }}
                            >
                              #{index + 1}
                            </Typography>

                            <Typography
                              fontWeight="bold"
                              sx={{
                                color:
                                  colors.primaryText,
                              }}
                            >
                              {prediction.fabric}
                            </Typography>
                          </Box>

                          <Typography
                            fontWeight="bold"
                            sx={{
                              color:
                                colors.primaryText,
                            }}
                          >
                            {prediction.confidence}%
                          </Typography>
                        </Box>
                      ))
                  ) : (
                    <Typography
                      sx={{
                        color:
                          colors.secondaryText,
                      }}
                    >
                      Top prediction data is not
                      available for this record.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* RECOMMENDATION */}

              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 5,
                    border: `1px solid ${colors.border}`,
                    backgroundColor:
                      colors.cardBackground,
                    height: "100%",
                    color: colors.primaryText,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="800"
                    mb={2}
                  >
                    AI Recommendation
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor:
                        colors.recommendationBackground,
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        color: "#16a34a",
                      }}
                    />

                    <Typography
                      sx={{
                        color:
                          colors.recommendationText,
                        lineHeight: 1.7,
                      }}
                    >
                      {item.recommendation ||
                        "No recommendation available."}
                    </Typography>
                  </Box>

                  <Divider
                    sx={{
                      my: 3,
                      borderColor: colors.border,
                    }}
                  />

                  <Typography
                    variant="h6"
                    fontWeight="800"
                    mb={1}
                  >
                    Description
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        colors.secondaryText,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.description ||
                      "No description provided."}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* ==========================================================
                MILESTONE 3
                SUSTAINABILITY INTELLIGENCE
            ========================================================== */}

            <Box sx={{ mt: 5 }}>
              <Typography
                variant="h4"
                fontWeight="800"
                sx={{
                  color: colors.primaryText,
                }}
              >
                Sustainability Intelligence
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  mb: 3,
                  color: colors.secondaryText,
                }}
              >
                Circular-economy assessment generated
                from the textile analysis.
              </Typography>

              <Grid container spacing={3}>
                {/* SUSTAINABILITY SCORE */}

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <TrendingUpIcon
                        sx={{
                          color: "#10b981",
                        }}
                      />

                      <Typography
                        fontWeight="bold"
                        sx={{
                          color:
                            colors.secondaryText,
                        }}
                      >
                        Sustainability Score
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h3"
                      fontWeight="800"
                      sx={{
                        mt: 2,
                        color: getScoreColor(
                          sustainabilityScore
                        ),
                      }}
                    >
                      {sustainabilityScore.toFixed(2)}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          colors.secondaryText,
                      }}
                    >
                      out of 100
                    </Typography>
                  </Paper>
                </Grid>

                {/* CIRCULARITY SCORE */}

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <RecyclingOutlinedIcon
                        sx={{
                          color: "#0891b2",
                        }}
                      />

                      <Typography
                        fontWeight="bold"
                        sx={{
                          color:
                            colors.secondaryText,
                        }}
                      >
                        Circularity Score
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h3"
                      fontWeight="800"
                      sx={{
                        mt: 2,
                        color: getScoreColor(
                          circularityScore
                        ),
                      }}
                    >
                      {circularityScore.toFixed(2)}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          colors.secondaryText,
                      }}
                    >
                      out of 100
                    </Typography>
                  </Paper>
                </Grid>

                {/* RECOVERY CATEGORY */}

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <RecyclingIcon
                        sx={{
                          color: "#16a34a",
                        }}
                      />

                      <Typography
                        fontWeight="bold"
                        sx={{
                          color:
                            colors.secondaryText,
                        }}
                      >
                        Recovery Potential
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h6"
                      fontWeight="800"
                      sx={{
                        mt: 2,
                        color: "#16a34a",
                      }}
                    >
                      {item.recovery_category ||
                        "Not available"}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* ==========================================================
                RECYCLING RECOMMENDATION
            ========================================================== */}

            <Box sx={{ mt: 5 }}>
              <Typography
                variant="h4"
                fontWeight="800"
                sx={{
                  color: colors.primaryText,
                }}
              >
                Recycling Recommendation
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  mb: 3,
                  color: colors.secondaryText,
                }}
              >
                Recommended circular-economy actions
                for this textile.
              </Typography>

              <Grid container spacing={3}>
                {/* PRIMARY ACTION */}

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                    }}
                  >
                    <Typography
                      fontSize={14}
                      sx={{
                        color:
                          colors.secondaryText,
                      }}
                    >
                      Primary Action
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight="800"
                      sx={{
                        mt: 1,
                        color: "#16a34a",
                      }}
                    >
                      {item.primary_action ||
                        "Not available"}
                    </Typography>
                  </Paper>
                </Grid>

                {/* ALTERNATIVE ACTION */}

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                    }}
                  >
                    <Typography
                      fontSize={14}
                      sx={{
                        color:
                          colors.secondaryText,
                      }}
                    >
                      Alternative Action
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight="800"
                      sx={{
                        mt: 1,
                        color: "#2563eb",
                      }}
                    >
                      {item.alternative_action ||
                        "Not available"}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* ==========================================================
                ENVIRONMENTAL IMPACT
            ========================================================== */}

            <Box sx={{ mt: 5 }}>
              <Typography
                variant="h4"
                fontWeight="800"
                sx={{
                  color: colors.primaryText,
                }}
              >
                Estimated Environmental Impact
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  mb: 3,
                  color: colors.secondaryText,
                }}
              >
                Model-based estimates associated with
                recovering this textile.
              </Typography>

              <Grid container spacing={3}>
                {/* CO2 */}

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                      height: "100%",
                    }}
                  >
                    <Co2Icon
                      sx={{
                        color: "#16a34a",
                        fontSize: 38,
                      }}
                    />

                    <Typography
                      sx={{
                        mt: 2,
                        color:
                          colors.secondaryText,
                      }}
                    >
                      CO₂ Savings
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight="800"
                      sx={{
                        mt: 1,
                        color:
                          colors.primaryText,
                      }}
                    >
                      {co2Savings.toFixed(2)} kg
                    </Typography>
                  </Paper>
                </Grid>

                {/* WATER */}

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                      height: "100%",
                    }}
                  >
                    <WaterDropIcon
                      sx={{
                        color: "#0284c7",
                        fontSize: 38,
                      }}
                    />

                    <Typography
                      sx={{
                        mt: 2,
                        color:
                          colors.secondaryText,
                      }}
                    >
                      Water Savings
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight="800"
                      sx={{
                        mt: 1,
                        color:
                          colors.primaryText,
                      }}
                    >
                      {waterSavings.toFixed(0)} L
                    </Typography>
                  </Paper>
                </Grid>

                {/* LANDFILL */}

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                      height: "100%",
                    }}
                  >
                    <FactoryIcon
                      sx={{
                        color: "#f59e0b",
                        fontSize: 38,
                      }}
                    />

                    <Typography
                      sx={{
                        mt: 2,
                        color:
                          colors.secondaryText,
                      }}
                    >
                      Landfill Diversion
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight="800"
                      sx={{
                        mt: 1,
                        color:
                          colors.primaryText,
                      }}
                    >
                      {landfillDiversion.toFixed(2)} kg
                    </Typography>
                  </Paper>
                </Grid>

                {/* RESOURCE RECOVERY */}

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: `1px solid ${colors.border}`,
                      backgroundColor:
                        colors.cardBackground,
                      height: "100%",
                    }}
                  >
                    <EnergySavingsLeafIcon
                      sx={{
                        color: "#10b981",
                        fontSize: 38,
                      }}
                    />

                    <Typography
                      sx={{
                        mt: 2,
                        color:
                          colors.secondaryText,
                      }}
                    >
                      Resource Recovery
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight="800"
                      sx={{
                        mt: 1,
                        color:
                          colors.primaryText,
                      }}
                    >
                      {resourceRecovery.toFixed(2)} kg
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* ENVIRONMENTAL BENEFIT */}

              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 4,
                  borderRadius: 5,
                  border: `1px solid ${colors.border}`,
                  backgroundColor:
                    colors.cardBackground,
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      sx={{
                        color:
                          colors.primaryText,
                      }}
                    >
                      Environmental Benefit
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        color:
                          colors.secondaryText,
                      }}
                    >
                      Overall estimated environmental
                      benefit of textile recovery.
                    </Typography>
                  </Box>

                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      fontWeight="800"
                      sx={{
                        color: getScoreColor(
                          environmentalBenefitScore
                        ),
                      }}
                    >
                      {environmentalBenefitScore.toFixed(
                        2
                      )}
                    </Typography>

                    <Typography
                      fontSize={13}
                      sx={{
                        color:
                          colors.secondaryText,
                      }}
                    >
                      Benefit Score
                    </Typography>
                  </Box>

                  <Chip
                    label={
                      item.environmental_benefit ||
                      "Not available"
                    }
                    sx={{
                      fontWeight: "bold",
                      color: "#166534",
                      backgroundColor: "#dcfce7",
                    }}
                  />
                </Stack>
              </Paper>

              <Typography
                sx={{
                  mt: 2,
                  fontSize: 13,
                  color: colors.mutedText,
                  fontStyle: "italic",
                }}
              >
                These environmental values are
                model-based estimates and should not be
                interpreted as direct physical measurements.
              </Typography>
            </Box>

            {/* ==========================================================
                DELETE
            ========================================================== */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 5,
              }}
            >
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  borderColor: isDark
                    ? "#f87171"
                    : undefined,
                }}
              >
                Delete Analysis
              </Button>
            </Box>
          </Box>
        </Box>
  );
}