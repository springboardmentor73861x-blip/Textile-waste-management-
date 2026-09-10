import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import { useTheme } from "@mui/material/styles";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RecyclingIcon from "@mui/icons-material/Recycling";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Theme-aware colors so History follows the application's dark/light mode.
  const pageBg = theme.palette.background.default;
  const paperBg = theme.palette.background.paper;
  const primaryText = theme.palette.text.primary;
  const secondaryText = theme.palette.text.secondary;
  const dividerColor = theme.palette.divider;
  const subtleBg = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc";
  const imageBg = isDark ? "#1e293b" : "#e2e8f0";
  const searchIconColor = isDark ? "#94a3b8" : "#64748b";

  const [textiles, setTextiles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const [selectedTextile, setSelectedTextile] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // ==========================================================
  // PARSE TOP PREDICTIONS
  // ==========================================================

  const parseTopPredictions = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(
        "Could not parse top predictions:",
        error
      );
      return [];
    }
  };

  // ==========================================================
  // FETCH HISTORY
  // ==========================================================

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("access_token");

      const response = await api.get(
        "/textiles/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "HISTORY API RESPONSE:",
        response.data
      );

      console.log(
        "FIRST TEXTILE:",
        response.data.data?.[0]
      );

      setTextiles(
        response.data.data || []
      );
    } catch (error) {
      console.error(
        "History loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this textile analysis?"
    );

    if (!confirmDelete) return;

    try {
      const token =
        localStorage.getItem("access_token");

      await api.delete(
        `/textiles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  // ==========================================================
  // VIEW DETAILS
  // ==========================================================

  const handleViewDetails = (item) => {
    setSelectedTextile(item);
    setDetailsOpen(true);
  };

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories = useMemo(() => {
    const values = textiles
      .map((item) => item.category)
      .filter(
        (value) =>
          value &&
          value !== "Unknown"
      );

    return [
      "All",
      ...new Set(values),
    ];
  }, [textiles]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredTextiles = useMemo(() => {
    return textiles.filter((item) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        item.textile_name
          ?.toLowerCase()
          .includes(searchValue) ||
        item.prediction
          ?.toLowerCase()
          .includes(searchValue) ||
        item.description
          ?.toLowerCase()
          .includes(searchValue) ||
        item.category
          ?.toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        category === "All" ||
        item.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    textiles,
    search,
    category,
  ]);

  // ==========================================================
  // IMAGE URL
  // ==========================================================

  const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    const cleanPath = path
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${api.defaults.baseURL}/${cleanPath}`;
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: pageBg,
        color: primaryText,
      }}
    >

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <Box
        sx={{
          width: "100%",
          minWidth:0,

          minHeight: "100vh",

          paddingBottom: 8,

          boxSizing: "border-box",

          backgroundColor: pageBg,

          color: primaryText,
        }}
      >

        {/* ===================================================
            CENTER CONTENT
            =================================================== */}

        <Box
          sx={{
            width: "100%",
            maxWidth: "1400px",

            margin: "0 auto",
            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },

            boxSizing: "border-box",
          }}
        >

          {/* =================================================
              HEADER
              ================================================= */}

          <Box
            sx={{
              textAlign: {
                xs: "left",
                md: "center",
              },

              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: 36,
                  sm: 48,
                  md: 56,
                },

                fontWeight: 700,

                color: primaryText,

                lineHeight: 1.1,

                mb: 1,
              }}
            >
              Textile Analysis History
            </Typography>

            <Typography
              sx={{
                fontSize: 18,
                color: secondaryText,
              }}
            >
              View and manage all your previous
              AI textile analyses.
            </Typography>
          </Box>

          {/* =================================================
              SEARCH + FILTER
              ================================================= */}

          <Box
            sx={{
              width: "100%",

              backgroundColor: paperBg,

              border:
                `1px solid ${dividerColor}`,

              borderRadius: 5,

              padding: 2,

              display: "flex",

              alignItems: "center",

              gap: 2,

              mb: 5,

              boxSizing: "border-box",

              boxShadow:
                "0 8px 25px rgba(15,23,42,0.05)",

              flexDirection: {
                xs: "column",
                sm: "row",
              },
            }}
          >

            <TextField
              fullWidth
              placeholder="Search textile, fabric or category..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: "#64748b",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: paperBg,
                  color: primaryText,
                },

                "& .MuiOutlinedInput-input":
                  {
                    color: primaryText,
                  },

                "& .MuiOutlinedInput-input::placeholder":
                  {
                    color: "#94a3b8",
                    opacity: 1,
                  },
              }}
            />

            <FormControl
              sx={{
                minWidth: 150,

                width: {
                  xs: "100%",
                  sm: "auto",
                },

                backgroundColor: paperBg,
              }}
            >
              <InputLabel
                sx={{
                  color: secondaryText,
                }}
              >
                Category
              </InputLabel>

              <Select
                value={category}
                label="Category"
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                sx={{
                  borderRadius: 3,

                  color: primaryText,

                  backgroundColor: paperBg,

                  "& .MuiSvgIcon-root": {
                    color: secondaryText,
                  },
                }}
              >
                {categories.map((item) => (
                  <MenuItem
                    key={item}
                    value={item}
                    sx={{
                      color: primaryText,
                      backgroundColor: paperBg,
                      "&:hover": {
                        backgroundColor: isDark ? "#334155" : "#f1f5f9",
                      },
                    }}
                  >
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </Box>

          {/* =================================================
              RESULTS HEADER
              ================================================= */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",

              mb: 3,

              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 500,
                color: primaryText,
              }}
            >
              {filteredTextiles.length}{" "}
              {filteredTextiles.length === 1
                ? "Analysis"
                : "Analyses"}
            </Typography>

            <Button
              variant="contained"
              startIcon={
                <CloudUploadIcon />
              }
              onClick={() =>
                navigate("/upload")
              }
              sx={{
                borderRadius: 3,

                px: 3,
                py: 1.2,

                fontWeight: 700,

                background:
                  "linear-gradient(135deg,#2563eb,#4f46e5)",

                boxShadow:
                  "0 8px 20px rgba(37,99,235,0.25)",

                "&:hover": {
                  background:
                    "linear-gradient(135deg,#1d4ed8,#4338ca)",
                },
              }}
            >
              New Analysis
            </Button>
          </Box>

          {/* =================================================
              LOADING
              ================================================= */}

          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "center",
                py: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {/* =================================================
              EMPTY
              ================================================= */}

          {!loading &&
            filteredTextiles.length ===
              0 && (
              <Box
                sx={{
                  backgroundColor: paperBg,

                  borderRadius: 5,

                  p: 8,

                  textAlign: "center",

                  color: primaryText,
                }}
              >
                <PsychologyIcon
                  sx={{
                    fontSize: 60,
                    color: "#94a3b8",
                    mb: 2,
                  }}
                />

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    color: primaryText,
                  }}
                >
                  No analyses found
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: secondaryText,
                  }}
                >
                  Upload a textile image
                  to start your first
                  analysis.
                </Typography>
              </Box>
            )}

          {/* =================================================
              CARDS
              ================================================= */}

          {!loading &&
            filteredTextiles.length >
              0 && (
              <Grid
                container
                spacing={3}
                justifyContent="center"
              >
                {filteredTextiles.map(
                  (item) => {

                    const topPredictions =
                      parseTopPredictions(
                        item.top_predictions
                      );

                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={6}
                        lg={6}
                        key={item.id}
                      >

                        <Card
                          sx={{
                            height: "100%",

                            borderRadius: 5,

                            overflow:
                              "hidden",

                            backgroundColor: paperBg,

                            color: primaryText,

                            border:
                              "1px solid rgba(148,163,184,0.18)",

                            boxShadow:
                              "0 12px 35px rgba(15,23,42,0.08)",

                            transition:
                              "0.25s",

                            "&:hover": {
                              transform:
                                "translateY(-5px)",

                              boxShadow:
                                "0 20px 45px rgba(15,23,42,0.14)",
                            },
                          }}
                        >

                          {/* IMAGE */}

                          <Box
                            sx={{
                              position:
                                "relative",

                              height: 260,

                              background: imageBg,
                            }}
                          >
                            <img
                              src={getImageUrl(
                                item.image_path
                              )}
                              alt={
                                item.textile_name || item.prediction ||
                                "Textile"
                              }
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "cover",
                                display: "block",
                              }}
                            />

                            <Chip
                              label={`${Number(
                                item.confidence ||
                                  0
                              ).toFixed(
                                2
                              )}% AI Confidence`}
                              sx={{
                                position:
                                  "absolute",

                                top: 16,
                                right: 16,

                                backgroundColor: isDark ? "#0f2d1c" : "#ffffff",

                                color:
                                  "#22c55e",

                                fontWeight: 700,

                                boxShadow:
                                  "0 5px 15px rgba(0,0,0,0.15)",
                              }}
                            />
                          </Box>

                          {/* CONTENT */}

                          <CardContent
                            sx={{
                              p: 3,

                              backgroundColor: paperBg,

                              color: primaryText,
                            }}
                          >

                            <Typography
                              variant="h5"
                              fontWeight="bold"
                              sx={{
                                mb: 1.5,
                                color: primaryText,
                              }}
                            >
                              {item.textile_name ||
                                "Unnamed Textile"}
                            </Typography>

                            {/* PREDICTION */}

                            <Box
                              sx={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap: 1,

                                mb: 2,
                              }}
                            >
                              <PsychologyIcon
                                sx={{
                                  color:
                                    "#7c3aed",
                                }}
                              />

                              <Typography
                                sx={{
                                  color:
                                    "#334155",
                                }}
                              >
                                AI Prediction:{" "}
                                <strong>
                                  {item.prediction ||
                                    "Unknown"}
                                </strong>
                              </Typography>
                            </Box>

                            {/* TAGS */}

                            <Box
                              sx={{
                                display:
                                  "flex",

                                flexWrap:
                                  "wrap",

                                gap: 1,

                                mb: 2,
                              }}
                            >

                              <Chip
                                size="small"
                                label={
                                  item.category ||
                                  "Category unavailable"
                                }
                                sx={{
                                  backgroundColor:
                                    "#eef2ff",

                                  color:
                                    "#4338ca",

                                  fontWeight:
                                    600,
                                }}
                              />

                              <Chip
                                size="small"
                                icon={
                                  <RecyclingIcon />
                                }
                                label={
                                  item.recyclable ||
                                  "Recyclability unavailable"
                                }
                                sx={{
                                  backgroundColor:
                                    item.recyclable
                                      ? "#dcfce7"
                                      : "#f1f5f9",

                                  color:
                                    item.recyclable
                                      ? "#15803d"
                                      : "#475569",

                                  fontWeight:
                                    600,
                                }}
                              />

                            </Box>

                            <Divider
                              sx={{
                                my: 2,
                                borderColor: dividerColor,
                              }}
                            />

                            {/* TOP PREDICTIONS */}

                            {topPredictions.length >
                              0 && (
                              <Box
                                sx={{
                                  mb: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={
                                    700
                                  }
                                  sx={{
                                    mb: 1,
                                    color: secondaryText,
                                  }}
                                >
                                  Top Predictions
                                </Typography>

                                <Box
                                  sx={{
                                    display:
                                      "flex",

                                    gap: 1,

                                    flexWrap:
                                      "wrap",
                                  }}
                                >
                                  {topPredictions
                                    .slice(
                                      0,
                                      3
                                    )
                                    .map(
                                      (
                                        prediction,
                                        index
                                      ) => (
                                        <Chip
                                          key={`${prediction.fabric}-${index}`}
                                          size="small"
                                          label={`${prediction.fabric} ${Number(
                                            prediction.confidence ||
                                              0
                                          ).toFixed(
                                            1
                                          )}%`}
                                          sx={{
                                            backgroundColor:
                                              index ===
                                              0
                                                ? (isDark ? "#312e81" : "#eef2ff")
                                                : subtleBg,

                                            color:
                                              index ===
                                              0
                                                ? (isDark ? "#c7d2fe" : "#4338ca")
                                                : secondaryText,

                                            fontWeight:
                                              600,
                                          }}
                                        />
                                      )
                                    )}
                                </Box>
                              </Box>
                            )}

                            {/* DATE */}

                            <Typography
                              variant="body2"
                              sx={{
                                mb: 2,
                                color: secondaryText,
                              }}
                            >
                              Uploaded:{" "}
                              {item.uploaded_at
                                ? new Date(
                                    item.uploaded_at
                                  ).toLocaleString()
                                : "Unknown"}
                            </Typography>

                            {/* ACTIONS */}

                            <Box
                              sx={{
                                display:
                                  "flex",

                                gap: 1.5,
                              }}
                            >

                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={
                                  <VisibilityIcon />
                                }
                                onClick={() =>
                                  handleViewDetails(
                                    item
                                  )
                                }
                                sx={{
                                  borderRadius: 3,

                                  fontWeight:
                                    600,

                                  color:
                                    "#2563eb",

                                  borderColor:
                                    "#2563eb",
                                }}
                              >
                                View Details
                              </Button>

                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                                sx={{
                                  minWidth:
                                    50,

                                  borderRadius:
                                    3,
                                }}
                              >
                                <DeleteIcon />
                              </Button>

                            </Box>

                          </CardContent>

                        </Card>

                      </Grid>
                    );
                  }
                )}
              </Grid>
            )}
        </Box>
      </Box>

      {/* =====================================================
    DETAILS DIALOG
    ===================================================== */}

<Dialog
  open={detailsOpen}
  onClose={() => setDetailsOpen(false)}
  fullWidth
  maxWidth="md"
  PaperProps={{
    sx: {
      backgroundColor: paperBg,
      color: primaryText,
      borderRadius: 4,
      boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
      overflow: "hidden",
    },
  }}
>
  {selectedTextile && (
    <>
      {/* =================================================
          DIALOG HEADER
          ================================================= */}

      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
          backgroundColor: paperBg,
          color: primaryText,
          borderBottom: `1px solid ${dividerColor}`,
        }}
      >
        Textile Analysis Details

        <Button
          onClick={() => setDetailsOpen(false)}
          sx={{
            minWidth: 40,
            color: secondaryText,
            "&:hover": {
              backgroundColor: isDark
                ? "#334155"
                : "#f1f5f9",
            },
          }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      {/* =================================================
          DIALOG CONTENT
          ================================================= */}

      <DialogContent
        dividers
        sx={{
          backgroundColor: paperBg,
          color: primaryText,

          maxHeight: "72vh",
          overflowY: "auto",

          "&::-webkit-scrollbar": {
            width: 8,
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: isDark
              ? "#475569"
              : "#cbd5e1",
            borderRadius: 4,
          },
        }}
      >

        {/* =================================================
            IMAGE
            ================================================= */}

        <Box
          sx={{
            width: "100%",
            height: 260,
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            backgroundColor: imageBg,
          }}
        >
          <img
            src={getImageUrl(
              selectedTextile.image_path
            )}
            alt={
              selectedTextile.textile_name ||
              "Textile"
            }
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>

        {/* =================================================
            TITLE
            ================================================= */}

        <Typography
          variant="h5"
          fontWeight="bold"
          mb={3}
          sx={{
            color: primaryText,
          }}
        >
          {selectedTextile.textile_name ||
            "Unnamed Textile"}
        </Typography>

        {/* =================================================
            AI ANALYSIS
            ================================================= */}

        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            mb: 2,
            color: primaryText,
          }}
        >
          AI Analysis
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >

          {/* Prediction */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              AI Prediction
            </Typography>

            <Typography
              fontWeight="bold"
              sx={{ color: primaryText }}
            >
              {selectedTextile.prediction ||
                "Unknown"}
            </Typography>
          </Box>

          {/* Confidence */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              AI Confidence
            </Typography>

            <Typography
              fontWeight="bold"
              sx={{ color: primaryText }}
            >
              {Number(
                selectedTextile.confidence || 0
              ).toFixed(2)}
              %
            </Typography>
          </Box>

          {/* Category */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              Category
            </Typography>

            <Typography
              fontWeight="bold"
              sx={{ color: primaryText }}
            >
              {selectedTextile.category ||
                "Not available"}
            </Typography>
          </Box>

          {/* Recyclability */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              Recyclability
            </Typography>

            <Typography
              fontWeight="bold"
              sx={{
                color:
                  selectedTextile.recyclable
                    ? "#16a34a"
                    : secondaryText,
              }}
            >
              {selectedTextile.recyclable ||
                "Not available"}
            </Typography>
          </Box>
        </Box>

        {/* =================================================
            RECOMMENDATION
            ================================================= */}

        <Box
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 3,
            backgroundColor: subtleBg,
            border: `1px solid ${dividerColor}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: secondaryText,
              mb: 0.5,
            }}
          >
            AI Recommendation
          </Typography>

          <Typography
            sx={{
              color: primaryText,
            }}
          >
            {selectedTextile.recommendation ||
              "No recommendation available."}
          </Typography>
        </Box>

        <Divider
          sx={{
            my: 4,
            borderColor: dividerColor,
          }}
        />

        {/* =================================================
            TOP 3 PREDICTIONS
            ================================================= */}

        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            mb: 2,
            color: primaryText,
          }}
        >
          Top 3 AI Predictions
        </Typography>

        {parseTopPredictions(
          selectedTextile.top_predictions
        ).length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {parseTopPredictions(
              selectedTextile.top_predictions
            )
              .slice(0, 3)
              .map((prediction, index) => (
                <Box
                  key={`${prediction.fabric}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor:
                      index === 0
                        ? isDark
                          ? "#1e3a5f"
                          : "#eff6ff"
                        : subtleBg,
                    border:
                      `1px solid ${dividerColor}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ minWidth: 30 }}
                    >
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : "🥉"}
                    </Typography>

                    <Typography
                      fontWeight={600}
                      sx={{
                        color: primaryText,
                      }}
                    >
                      {prediction.fabric ||
                        "Unknown"}
                    </Typography>
                  </Box>

                  <Typography
                    fontWeight="bold"
                    sx={{
                      color:
                        index === 0
                          ? "#2563eb"
                          : secondaryText,
                    }}
                  >
                    {Number(
                      prediction.confidence || 0
                    ).toFixed(2)}
                    %
                  </Typography>
                </Box>
              ))}
          </Box>
        ) : (
          <Typography
            sx={{
              color: secondaryText,
            }}
          >
            Top predictions are not available.
          </Typography>
        )}

        <Divider
          sx={{
            my: 4,
            borderColor: dividerColor,
          }}
        />

        {/* =================================================
            MILESTONE 3
            SUSTAINABILITY INTELLIGENCE
            ================================================= */}

        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            mb: 2,
            color: primaryText,
          }}
        >
          Sustainability Intelligence
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >

          {/* Sustainability Score */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              background:
                isDark
                  ? "linear-gradient(135deg,#064e3b,#047857)"
                  : "linear-gradient(135deg,#d1fae5,#a7f3d0)",
              border:
                "1px solid rgba(16,185,129,0.35)",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: isDark
                  ? "#a7f3d0"
                  : "#047857",
              }}
            >
              Sustainability Score
            </Typography>

            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: isDark
                  ? "#ffffff"
                  : "#047857",
              }}
            >
              {selectedTextile.sustainability_score !=
              null
                ? `${Number(
                    selectedTextile.sustainability_score
                  ).toFixed(2)}%`
                : "Not available"}
            </Typography>
          </Box>

          {/* Circularity Score */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              background:
                isDark
                  ? "linear-gradient(135deg,#164e63,#0891b2)"
                  : "linear-gradient(135deg,#cffafe,#a5f3fc)",
              border:
                "1px solid rgba(6,182,212,0.35)",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: isDark
                  ? "#a5f3fc"
                  : "#0e7490",
              }}
            >
              Circularity Score
            </Typography>

            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: isDark
                  ? "#ffffff"
                  : "#0e7490",
              }}
            >
              {selectedTextile.circularity_score !=
              null
                ? `${Number(
                    selectedTextile.circularity_score
                  ).toFixed(2)}%`
                : "Not available"}
            </Typography>
          </Box>
        </Box>

        {/* Recovery Category */}
        <Box
          sx={{
            mt: 2,
            p: 2.5,
            borderRadius: 3,
            backgroundColor: subtleBg,
            border: `1px solid ${dividerColor}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: secondaryText }}
          >
            Recovery Category
          </Typography>

          <Typography
            fontWeight="bold"
            sx={{
              color: "#22c55e",
              fontSize: 18,
            }}
          >
            {selectedTextile.recovery_category ||
              "Not available"}
          </Typography>
        </Box>

        <Divider
          sx={{
            my: 4,
            borderColor: dividerColor,
          }}
        />

        {/* =================================================
            MILESTONE 3
            RECOMMENDATION INTELLIGENCE
            ================================================= */}

        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            mb: 2,
            color: primaryText,
          }}
        >
          Recommendation Intelligence
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >

          {/* Primary Action */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border:
                "1px solid rgba(34,197,94,0.35)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              Primary Action
            </Typography>

            <Typography
              fontWeight="bold"
              sx={{
                color: "#22c55e",
                fontSize: 18,
              }}
            >
              {selectedTextile.primary_action ||
                "Not available"}
            </Typography>
          </Box>

          {/* Alternative Action */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border:
                "1px solid rgba(37,99,235,0.35)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              Alternative Action
            </Typography>

            <Typography
              fontWeight="bold"
              sx={{
                color: "#2563eb",
                fontSize: 18,
              }}
            >
              {selectedTextile.alternative_action ||
                "Not available"}
            </Typography>
          </Box>
        </Box>

        <Divider
          sx={{
            my: 4,
            borderColor: dividerColor,
          }}
        />

        {/* =================================================
            MILESTONE 3
            ENVIRONMENTAL IMPACT
            ================================================= */}

        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            mb: 1,
            color: primaryText,
          }}
        >
          Estimated Environmental Impact
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: secondaryText,
            mb: 3,
          }}
        >
          Model-based estimates associated with
          recovering this textile.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >

          {/* CO2 */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border:
                "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              CO₂ Savings
            </Typography>

            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#22c55e" }}
            >
              {selectedTextile.estimated_co2_savings_kg !=
              null
                ? `${Number(
                    selectedTextile.estimated_co2_savings_kg
                  ).toFixed(2)} kg`
                : "Not available"}
            </Typography>
          </Box>

          {/* Water */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border:
                "1px solid rgba(14,165,233,0.3)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              Water Savings
            </Typography>

            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#0ea5e9" }}
            >
              {selectedTextile.estimated_water_savings_liters !=
              null
                ? `${Number(
                    selectedTextile.estimated_water_savings_liters
                  ).toLocaleString()} L`
                : "Not available"}
            </Typography>
          </Box>

          {/* Landfill */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border:
                "1px solid rgba(245,158,11,0.3)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              Landfill Diversion
            </Typography>

            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#f59e0b" }}
            >
              {selectedTextile.estimated_landfill_diversion_kg !=
              null
                ? `${Number(
                    selectedTextile.estimated_landfill_diversion_kg
                  ).toFixed(2)} kg`
                : "Not available"}
            </Typography>
          </Box>

          {/* Resource Recovery */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: subtleBg,
              border:
                "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: secondaryText }}
            >
              Resource Recovery
            </Typography>

            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#10b981" }}
            >
              {selectedTextile.estimated_resource_recovery_kg !=
              null
                ? `${Number(
                    selectedTextile.estimated_resource_recovery_kg
                  ).toFixed(2)} kg`
                : "Not available"}
            </Typography>
          </Box>
        </Box>

        {/* Environmental Benefit */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            background:
              isDark
                ? "linear-gradient(135deg,#064e3b,#065f46)"
                : "linear-gradient(135deg,#ecfdf5,#d1fae5)",
            border:
              "1px solid rgba(16,185,129,0.35)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: isDark
                ? "#a7f3d0"
                : "#047857",
              mb: 0.5,
            }}
          >
            Environmental Benefit Score
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                color: isDark
                  ? "#ffffff"
                  : "#047857",
              }}
            >
              {selectedTextile.environmental_benefit_score !=
              null
                ? Number(
                    selectedTextile.environmental_benefit_score
                  ).toFixed(2)
                : "—"}
            </Typography>

            <Chip
              label={
                selectedTextile.environmental_benefit ||
                "Not available"
              }
              sx={{
                backgroundColor:
                  isDark
                    ? "#dcfce7"
                    : "#dcfce7",
                color: "#166534",
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        <Divider
          sx={{
            my: 4,
            borderColor: dividerColor,
          }}
        />

        {/* =================================================
            DESCRIPTION
            ================================================= */}

        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              color: secondaryText,
              mb: 0.5,
            }}
          >
            Description
          </Typography>

          <Typography
            sx={{
              color: primaryText,
            }}
          >
            {selectedTextile.description ||
              "No description provided."}
          </Typography>
        </Box>

        {/* =================================================
            UPLOADED DATE
            ================================================= */}

        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              color: secondaryText,
            }}
          >
            Uploaded
          </Typography>

          <Typography
            sx={{
              color: primaryText,
            }}
          >
            {selectedTextile.uploaded_at
              ? new Date(
                  selectedTextile.uploaded_at
                ).toLocaleString()
              : "Unknown"}
          </Typography>
        </Box>

      </DialogContent>

      {/* =================================================
          DIALOG FOOTER
          ================================================= */}

      <DialogActions
        sx={{
          backgroundColor: paperBg,
          borderTop:
            `1px solid ${dividerColor}`,
          p: 2,
        }}
      >
        <Button
          onClick={() => setDetailsOpen(false)}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            background:
              "linear-gradient(135deg,#2563eb,#4f46e5)",

            "&:hover": {
              background:
                "linear-gradient(135deg,#1d4ed8,#4338ca)",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </>
  )}
</Dialog>
    </Box>
  );
}