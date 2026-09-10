import { useState } from "react";
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  LinearProgress,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RecyclingIcon from "@mui/icons-material/Recycling";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

export default function Upload() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [textileName, setTextileName] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // AI result
  const [analysis, setAnalysis] = useState(null);

  // ======================================================
  // SELECT IMAGE
  // ======================================================

  const selectImage = (selected) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setMessage("❌ Please select a valid image file.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));

    // Clear previous result
    setAnalysis(null);
    setMessage("");
  };

  // ======================================================
  // IMAGE SELECTION
  // ======================================================

  const handleImage = (e) => {
    selectImage(e.target.files[0]);
  };

  // ======================================================
  // DRAG EVENTS
  // ======================================================

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.type === "dragenter" ||
      e.type === "dragover"
    ) {
      setDragActive(true);
    }

    if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // ======================================================
  // DROP IMAGE
  // ======================================================

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {
      selectImage(e.dataTransfer.files[0]);
    }
  };

  // ======================================================
  // UPLOAD + AI ANALYSIS
  // ======================================================

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select an image.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setAnalysis(null);

      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "textile_name",
        textileName
      );
      formData.append(
        "description",
        description
      );

      const token =
        localStorage.getItem("access_token");

      const response = await api.post(
        "/textiles/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "UPLOAD RESPONSE:",
        response.data
      );
      
      if (response.data?.success === false) {
        setAnalysis(null);

        setMessage(
          `⚠️ ${
            response.data?.message ||
            "The image could not be confidently identified as a textile."
          }`
        );

        return;
      }
      const aiResult =
        response.data?.ai_analysis;

      if (aiResult) {
        setAnalysis(aiResult);
      } else {
        setMessage(
          "❌ Upload succeeded, but AI analysis data was not received."
        );
        return;
      }

      setMessage(
        "🎉 Textile uploaded and analyzed successfully!"
      );
    } catch (err) {
      console.error(
        "Upload error:",
        err
      );

      const errorMessage =
        err.response?.data?.detail ||
        "Upload failed. Please try again.";

      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // NEW ANALYSIS
  // ======================================================

  const handleNewAnalysis = () => {
    setFile(null);
    setPreview("");
    setTextileName("");
    setDescription("");
    setMessage("");
    setAnalysis(null);
    setDragActive(false);
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        color: theme.palette.text.primary,
      }}
    >
      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          width: "100%",
          maxWidth: "1100px !important",
          mx: "auto",
          py: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* ==================================================
            MAIN UPLOAD CARD
        ================================================== */}

        <Card
          sx={{
            borderRadius: 5,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor:
              theme.palette.background.paper,

            boxShadow:
              theme.palette.mode === "dark"
                ? "0 15px 35px rgba(0,0,0,.35)"
                : "0 15px 35px rgba(0,0,0,.10)",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
                md: 4,
              },
            }}
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <Typography
              variant="h4"
              fontWeight="bold"
            >
              Upload Textile
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Upload a textile image for AI-powered
              fabric analysis.
            </Typography>

            {/* ==================================================
                MESSAGE
            ================================================== */}

            {message && (
              <Alert
                severity={
                  analysis
                    ? "success"
                    : message.startsWith("❌")
                    ? "error"
                    : "info"
                }
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {message}
              </Alert>
            )}

            {/* ==================================================
                DRAG & DROP AREA
            ================================================== */}

            {!analysis && (
              <Paper
                elevation={0}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                sx={{
                  p: {
                    xs: 3,
                    sm: 5,
                  },

                  width: "100%",
                  boxSizing: "border-box",
                  mt: 2,

                  border: dragActive
                    ? `3px solid ${theme.palette.primary.main}`
                    : `3px dashed ${theme.palette.divider}`,

                  borderRadius: 4,
                  textAlign: "center",
                  cursor: "pointer",

                  bgcolor: dragActive
                    ? theme.palette.mode === "dark"
                      ? "rgba(37,99,235,0.18)"
                      : "#dbeafe"
                    : theme.palette.background.paper,

                  transition: "0.3s",

                  "&:hover": {
                    borderColor:
                      theme.palette.primary.main,

                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(37,99,235,0.12)"
                        : "#eff6ff",
                  },
                }}
              >
                <label
                  htmlFor="upload-image"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <CloudUploadIcon
                    sx={{
                      fontSize: {
                        xs: 60,
                        sm: 80,
                      },
                      color: "#2563eb",
                    }}
                  />

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    mt={2}
                  >
                    {dragActive
                      ? "Drop Image Here"
                      : "Drag & Drop Textile Image"}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    mt={1}
                  >
                    or Click to Browse Files
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={2}
                  >
                    Supports JPG, JPEG & PNG
                  </Typography>
                </label>

                <input
                  id="upload-image"
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                />
              </Paper>
            )}

            {/* ==================================================
                IMAGE PREVIEW
            ================================================== */}

            {preview && (
              <Box
                mt={5}
                sx={{
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={2}
                >
                  Textile Preview
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={preview}
                    alt="Textile Preview"
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      height: "260px",
                      objectFit: "cover",
                      borderRadius: "20px",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 15px 35px rgba(0,0,0,.45)"
                          : "0 15px 35px rgba(0,0,0,.20)",
                    }}
                  />
                </Box>

                <Typography
                  mt={2}
                  color="text.secondary"
                  fontWeight="bold"
                >
                  {file?.name}
                </Typography>
              </Box>
            )}

            {/* ==================================================
                TEXTILE DETAILS
            ================================================== */}

            {!analysis && (
              <>
                <TextField
                  fullWidth
                  label="Textile Name"
                  sx={{ mt: 4 }}
                  value={textileName}
                  onChange={(e) =>
                    setTextileName(e.target.value)
                  }
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  sx={{ mt: 3 }}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />

                {/* ==================================================
                    ANALYZE BUTTON
                ================================================== */}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={
                    !loading && (
                      <AutoAwesomeIcon />
                    )
                  }
                  sx={{
                    mt: 4,
                    py: 1.6,
                    borderRadius: 3,
                    fontWeight: "bold",
                    fontSize: 17,
                  }}
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={24}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />

                      AI Analyzing Textile...
                    </>
                  ) : (
                    "Start AI Analysis"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ======================================================
            AI ANALYSIS RESULT
        ====================================================== */}

        {analysis && (
          <Card
            sx={{
              mt: 4,
              borderRadius: 5,
              overflow: "hidden",

              bgcolor:
                theme.palette.background.paper,

              border: "1px solid",
              borderColor: "divider",

              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 15px 40px rgba(0,0,0,.35)"
                  : "0 15px 40px rgba(37,99,235,.15)",
            }}
          >
            {/* ==================================================
                AI HEADER
            ================================================== */}

            <Box
              sx={{
                p: 3,

                background:
                  "linear-gradient(135deg, #2563eb, #4f46e5)",

                color: "white",
                textAlign: "center",
              }}
            >
              <AutoAwesomeIcon
                sx={{
                  fontSize: 40,
                  mb: 1,
                }}
              />

              <Typography
                variant="h5"
                fontWeight="bold"
              >
                AI Analysis Complete
              </Typography>

              <Typography
                sx={{
                  opacity: 0.9,
                  mt: 0.5,
                }}
              >
                Fabric classification powered by AI
              </Typography>
            </Box>

            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                  md: 4,
                },
              }}
            >
              {/* ==================================================
                  PRIMARY PREDICTION
              ================================================== */}

              <Box
                sx={{
                  textAlign: "center",
                  mb: 4,
                }}
              >
                <Typography
                  color="text.secondary"
                  fontWeight="bold"
                >
                  DETECTED FABRIC
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    mt: 1,
                    color:
                      theme.palette.primary.main,
                    wordBreak: "break-word",
                  }}
                >
                  {analysis.fabric || "Unknown"}
                </Typography>

                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${Number(
                    analysis.confidence || 0
                  ).toFixed(2)}% Confidence`}
                  color="primary"
                  sx={{
                    mt: 2,
                    fontWeight: "bold",
                    fontSize: 15,
                    py: 2.5,
                  }}
                />
              </Box>

              {/* ==================================================
                  CONFIDENCE BAR
              ================================================== */}

              <Typography
                fontWeight="bold"
                mb={1}
              >
                AI Confidence
              </Typography>

              <LinearProgress
                variant="determinate"
                value={Math.min(
                  Number(analysis.confidence || 0),
                  100
                )}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mb: 4,
                }}
              />

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  OTHER PREDICTIONS
              ================================================== */}

              <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
              >
                Other Possible Fabrics
              </Typography>

              <Box>
                {(analysis.top_predictions || [])
                  .slice(1)
                  .map((prediction, index) => (
                    <Box
                      key={`${prediction.fabric}-${index}`}
                      sx={{ mb: 2 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: 2,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          fontWeight="bold"
                        >
                          {index + 2}.{" "}
                          {prediction.fabric}
                        </Typography>

                        <Typography
                          fontWeight="bold"
                          color="primary"
                        >
                          {Number(
                            prediction.confidence || 0
                          ).toFixed(2)}
                          %
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          Number(
                            prediction.confidence || 0
                          ),
                          100
                        )}
                        sx={{
                          height: 7,
                          borderRadius: 5,
                        }}
                      />
                    </Box>
                  ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  FABRIC INFORMATION
              ================================================== */}

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
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,

                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(37,99,235,0.12)"
                        : "#eff6ff",

                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    CATEGORY
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mt={0.5}
                  >
                    {analysis.category ||
                      "Not available"}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,

                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(34,197,94,0.12)"
                        : "#f0fdf4",

                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    RECYCLABILITY
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mt={0.5}
                    color="success.main"
                  >
                    {analysis.recyclability ||
                      "Not available"}
                  </Typography>
                </Paper>
              </Box>

              {/* ==================================================
                  RECOMMENDATION
              ================================================== */}

              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 3,

                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "#f8fafc",

                  border:
                    "1px solid",
                  borderColor:
                    "divider",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <RecyclingIcon
                    color="success"
                  />

                  <Typography
                    variant="h6"
                    fontWeight="bold"
                  >
                    Recycling Recommendation
                  </Typography>
                </Box>

                <Typography
                  lineHeight={1.7}
                  color="text.secondary"
                >
                  {analysis.recommendation ||
                    "No recommendation available."}
                </Typography>
              </Paper>

              {/* ==================================================
                  SUSTAINABILITY INTELLIGENCE
              ================================================== */}

              <Divider sx={{ my: 4 }} />

              <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
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
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,

                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(34,197,94,0.12)"
                        : "#f0fdf4",

                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography color="text.secondary">
                    Sustainability Score
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {analysis.sustainability_score != null
                      ? `${Number(
                          analysis.sustainability_score
                        ).toFixed(2)}%`
                      : "Not available"}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,

                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(14,165,233,0.12)"
                        : "#ecfeff",

                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography color="text.secondary">
                    Circularity Score
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="info.main"
                  >
                    {analysis.circularity_score != null
                      ? `${Number(
                          analysis.circularity_score
                        ).toFixed(2)}%`
                      : "Not available"}
                  </Typography>
                </Paper>
              </Box>

              {/* ==================================================
                  RECOVERY INTELLIGENCE
              ================================================== */}

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },

                  gap: 2,
                  mt: 2,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography color="text.secondary">
                    Recovery Category
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {analysis.recovery_category ||
                      "Not available"}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography color="text.secondary">
                    Primary Action
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {analysis.primary_action ||
                      "Not available"}
                  </Typography>
                </Paper>
              </Box>

              {/* ==================================================
                  ENVIRONMENTAL IMPACT
              ================================================== */}

              <Divider sx={{ my: 4 }} />

              <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
              >
                Estimated Environmental Impact
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
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography color="text.secondary">
                    CO₂ Savings
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {analysis.estimated_co2_savings_kg !=
                    null
                      ? `${Number(
                          analysis.estimated_co2_savings_kg
                        ).toFixed(2)} kg`
                      : "Not available"}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography color="text.secondary">
                    Water Savings
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="info.main"
                  >
                    {analysis.estimated_water_savings_liters !=
                    null
                      ? `${Number(
                          analysis.estimated_water_savings_liters
                        ).toLocaleString()} L`
                      : "Not available"}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography color="text.secondary">
                    Landfill Diversion
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    {analysis.estimated_landfill_diversion_kg !=
                    null
                      ? `${Number(
                          analysis.estimated_landfill_diversion_kg
                        ).toFixed(2)} kg`
                      : "Not available"}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                  }}
                >
                  <Typography color="text.secondary">
                    Resource Recovery
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {analysis.estimated_resource_recovery_kg !=
                    null
                      ? `${Number(
                          analysis.estimated_resource_recovery_kg
                        ).toFixed(2)} kg`
                      : "Not available"}
                  </Typography>
                </Paper>
              </Box>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 4,

                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleNewAnalysis}
                  sx={{
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: "bold",
                  }}
                >
                  Analyze Another Textile
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() =>
                    navigate("/history")
                  }
                  sx={{
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: "bold",
                  }}
                >
                  View History
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}