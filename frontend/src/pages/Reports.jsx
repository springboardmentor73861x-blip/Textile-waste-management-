import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Checkbox,
  Chip,
  Divider,
  Grid,
  Typography,
  Alert,
} from "@mui/material";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RecyclingIcon from "@mui/icons-material/Recycling";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import api from "../services/api";


export default function Reports() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [history, setHistory] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(true);

  const [exporting, setExporting] = useState(false);


  // ==========================================================
  // LOAD TEXTILE HISTORY
  // ==========================================================

  useEffect(() => {

    loadHistory();

  }, []);


  const loadHistory = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await api.get(
        "/textiles/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(
        response.data?.data || []
      );

    } catch (error) {

      console.error(
        "Reports loading error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // SELECT / DESELECT TEXTILE
  // ==========================================================

  const toggleSelection = (id) => {

    setSelectedIds((previous) => {

      if (previous.includes(id)) {

        return previous.filter(
          (item) => item !== id
        );

      }

      return [
        ...previous,
        id,
      ];

    });

  };


  // ==========================================================
  // SELECT ALL
  // ==========================================================

  const selectAll = () => {

    if (
      selectedIds.length === history.length
    ) {

      setSelectedIds([]);

    } else {

      setSelectedIds(
        history.map((item) => item.id)
      );

    }

  };


  // ==========================================================
  // GET SELECTED DATA
  // ==========================================================

  const getReportData = () => {

    if (selectedIds.length === 0) {

      return history;

    }

    return history.filter(
      (item) =>
        selectedIds.includes(item.id)
    );

  };


  // ==========================================================
  // PDF EXPORT
  // ==========================================================

  const exportPDF = () => {

    const reportData = getReportData();

    if (reportData.length === 0) {

      alert(
        "No textile data available to export."
      );

      return;

    }

    try {

      setExporting(true);

      const doc = new jsPDF();

      doc.setFontSize(20);

      doc.text(
        "Textile Waste Intelligence Report",
        14,
        20
      );

      doc.setFontSize(11);

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        30
      );

      doc.text(
        `Total Textile Records: ${reportData.length}`,
        14,
        38
      );


      // ======================================================
      // COMPLETE ANALYSIS TABLE
      // ======================================================

      autoTable(doc, {

        startY: 46,

        head: [[

          "Textile",

          "Fabric",

          "Confidence",

          "Recyclability",

          "Sustainability",

          "Circularity",

          "Primary Action",

          "CO2 Savings",

        ]],

        body: reportData.map(
          (item) => [

            item.textile_name ||
              `Textile #${item.id}`,

            item.prediction ||
              "Unknown",

            item.confidence
              ? `${Number(item.confidence).toFixed(1)}%`
              : "--",

            item.recyclable ||
              "--",

            item.sustainability_score
              ?? "--",

            item.circularity_score
              ?? "--",

            item.primary_action ||
              "--",

            item.estimated_co2_savings_kg
              ? `${item.estimated_co2_savings_kg} kg`
              : "--",

          ]
        ),

        styles: {

          fontSize: 8,

          cellPadding: 2,

        },

        headStyles: {

          fillColor: [
            34,
            197,
            94,
          ],

        },

      });


      // ======================================================
      // SUMMARY
      // ======================================================

      const averageSustainability =
        reportData
          .map(
            (item) =>
              Number(
                item.sustainability_score
              )
          )
          .filter(
            (value) =>
              !Number.isNaN(value)
          );

      const averageCircularity =
        reportData
          .map(
            (item) =>
              Number(
                item.circularity_score
              )
          )
          .filter(
            (value) =>
              !Number.isNaN(value)
          );

      const totalCO2 =
        reportData.reduce(
          (sum, item) =>
            sum +
            (
              Number(
                item.estimated_co2_savings_kg
              ) || 0
            ),
          0
        );

      const totalWater =
        reportData.reduce(
          (sum, item) =>
            sum +
            (
              Number(
                item.estimated_water_savings_liters
              ) || 0
            ),
          0
        );

      const totalLandfill =
        reportData.reduce(
          (sum, item) =>
            sum +
            (
              Number(
                item.estimated_landfill_diversion_kg
              ) || 0
            ),
          0
        );

      const totalResourceRecovery =
        reportData.reduce(
          (sum, item) =>
            sum +
            (
              Number(
                item.estimated_resource_recovery_kg
              ) || 0
            ),
          0
        );

      const finalY =
        doc.lastAutoTable.finalY + 15;

      doc.setFontSize(14);

      doc.text(
        "Report Summary",
        14,
        finalY
      );

      doc.setFontSize(10);

      doc.text(
        `Average Sustainability Score: ${
          averageSustainability.length
            ? (
                averageSustainability.reduce(
                  (a, b) => a + b,
                  0
                ) /
                averageSustainability.length
              ).toFixed(2)
            : "--"
        }`,
        14,
        finalY + 10
      );

      doc.text(
        `Average Circularity Score: ${
          averageCircularity.length
            ? (
                averageCircularity.reduce(
                  (a, b) => a + b,
                  0
                ) /
                averageCircularity.length
              ).toFixed(2)
            : "--"
        }`,
        14,
        finalY + 18
      );

      doc.text(
        `Estimated Total CO2 Savings: ${totalCO2.toFixed(2)} kg`,
        14,
        finalY + 26
      );

      doc.text(
        `Estimated Total Water Savings: ${totalWater.toFixed(2)} L`,
        14,
        finalY + 34
      );

      doc.text(
        `Estimated Total Landfill Diversion: ${totalLandfill.toFixed(2)} kg`,
        14,
        finalY + 42
      );

      doc.text(
        `Estimated Total Resource Recovery: ${totalResourceRecovery.toFixed(2)} kg`,
        14,
        finalY + 50
      );

      doc.save(
        `textile-report-${Date.now()}.pdf`
      );

    } catch (error) {

      console.error(
        "PDF export error:",
        error
      );

      alert(
        "Unable to generate PDF report."
      );

    } finally {

      setExporting(false);

    }

  };


  // ==========================================================
  // EXCEL EXPORT
  // ==========================================================

  const exportExcel = () => {

    const reportData = getReportData();

    if (reportData.length === 0) {

      alert(
        "No textile data available to export."
      );

      return;

    }

    try {

      setExporting(true);

      const excelData =
        reportData.map(
          (item) => ({

            "Textile ID":
              item.id,

            "Textile Name":
              item.textile_name ||
              `Textile #${item.id}`,

            "Description":
              item.description ||
              "--",

            "Predicted Fabric":
              item.prediction ||
              "--",

            "Confidence (%)":
              item.confidence ||
              "--",

            "Category":
              item.category ||
              "--",

            "Recyclability":
              item.recyclable ||
              "--",

            "Sustainability Score":
              item.sustainability_score ??
              "--",

            "Circularity Score":
              item.circularity_score ??
              "--",

            "Recovery Category":
              item.recovery_category ||
              "--",

            "Primary Recycling Action":
              item.primary_action ||
              "--",

            "Alternative Action":
              item.alternative_action ||
              "--",

            "CO2 Savings (kg)":
              item.estimated_co2_savings_kg ??
              "--",

            "Water Savings (liters)":
              item.estimated_water_savings_liters ??
              "--",

            "Landfill Diversion (kg)":
              item.estimated_landfill_diversion_kg ??
              "--",

            "Resource Recovery (kg)":
              item.estimated_resource_recovery_kg ??
              "--",

            "Environmental Benefit Score":
              item.environmental_benefit_score ??
              "--",

            "Environmental Benefit":
              item.environmental_benefit ||
              "--",

            "Uploaded At":
              item.uploaded_at ||
              "--",

          })
        );


      const worksheet =
        XLSX.utils.json_to_sheet(
          excelData
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Textile Report"
      );


      // ======================================================
      // COLUMN WIDTHS
      // ======================================================

      worksheet["!cols"] = [

        { wch: 12 },

        { wch: 22 },

        { wch: 30 },

        { wch: 18 },

        { wch: 15 },

        { wch: 20 },

        { wch: 18 },

        { wch: 20 },

        { wch: 20 },

        { wch: 18 },

        { wch: 28 },

        { wch: 28 },

        { wch: 18 },

        { wch: 22 },

        { wch: 22 },

        { wch: 22 },

        { wch: 25 },

        { wch: 25 },

        { wch: 25 },

      ];


      XLSX.writeFile(
        workbook,
        `textile-report-${Date.now()}.xlsx`
      );

    } catch (error) {

      console.error(
        "Excel export error:",
        error
      );

      alert(
        "Unable to generate Excel report."
      );

    } finally {

      setExporting(false);

    }

  };


  // ==========================================================
  // CALCULATE SUMMARY DATA
  // ==========================================================

  const totalUploads =
    history.length;

  const recyclableCount =
    history.filter((item) => {

      const value =
        String(
          item.recyclable || ""
        ).toLowerCase();

      return (
        value.includes("high") ||
        value === "yes" ||
        value === "true"
      );

    }).length;


  const averageSustainability =
    history.length > 0

      ? history
          .map(
            (item) =>
              Number(
                item.sustainability_score
              )
          )
          .filter(
            (value) =>
              !Number.isNaN(value)
          )

      : [];


  const sustainabilityScore =
    averageSustainability.length > 0

      ? (
          averageSustainability.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          averageSustainability.length
        ).toFixed(1)

      : "--";


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <Box
        sx={{

          minHeight: "100vh",

          display: "flex",

          justifyContent: "center",

          alignItems: "center",

        }}
      >

        <CircularProgress />

      </Box>

    );

  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <Box
      sx={{

        width: "100%",

      }}
    >

      {/* PAGE HEADER */}

      <Box
        sx={{

          mb: 4,

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

        }}
      >

        <Box>

          <Typography
            variant="h4"
            fontWeight={800}
          >

            Reports & Export

          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >

            Generate and export complete textile
            sustainability intelligence reports.

          </Typography>

        </Box>


        <Box
          sx={{

            display: "flex",

            gap: 1.5,

            flexWrap: "wrap",

          }}
        >

          <Button
            variant="contained"
            color="error"
            startIcon={
              <PictureAsPdfIcon />
            }
            onClick={exportPDF}
            disabled={exporting}
          >

            Export PDF

          </Button>


          <Button
            variant="contained"
            color="success"
            startIcon={
              <TableChartIcon />
            }
            onClick={exportExcel}
            disabled={exporting}
          >

            Export Excel

          </Button>

        </Box>

      </Box>


      {/* INFO ALERT */}

      <Alert
        severity="info"
        sx={{ mb: 3 }}
      >

        Select specific textile records to export,
        or export without selecting anything to
        generate a complete report.

      </Alert>


      {/* SUMMARY CARDS */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 4 }}
      >

        <Grid item xs={12} md={4}>

          <ReportStatCard
            icon={<CloudUploadIcon />}
            title="Total Textiles"
            value={totalUploads}
            subtitle="Available for reporting"
          />

        </Grid>


        <Grid item xs={12} md={4}>

          <ReportStatCard
            icon={<RecyclingIcon />}
            title="Highly Recyclable"
            value={recyclableCount}
            subtitle="High recovery potential"
          />

        </Grid>


        <Grid item xs={12} md={4}>

          <ReportStatCard
            icon={<AssessmentIcon />}
            title="Avg Sustainability"
            value={
              sustainabilityScore !== "--"
                ? `${sustainabilityScore}%`
                : "--"
            }
            subtitle="Average sustainability score"
          />

        </Grid>

      </Grid>


      {/* REPORT TABLE */}

      <Card
        sx={{

          borderRadius: 4,

          overflow: "hidden",

        }}
      >

        <Box
          sx={{

            p: 3,

            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            flexWrap: "wrap",

            gap: 2,

          }}
        >

          <Box>

            <Typography
              variant="h6"
              fontWeight={800}
            >

              Textile Analysis Records

            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >

              {selectedIds.length > 0
                ? `${selectedIds.length} record(s) selected`
                : "No records selected — export will include all records"}

            </Typography>

          </Box>


          {history.length > 0 && (

            <Button
              variant="outlined"
              onClick={selectAll}
            >

              {selectedIds.length === history.length
                ? "Deselect All"
                : "Select All"}

            </Button>

          )}

        </Box>


        <Divider />


        {history.length === 0 ? (

          <Box
            sx={{

              p: 6,

              textAlign: "center",

            }}
          >

            <AssessmentIcon
              sx={{

                fontSize: 60,

                color: "text.secondary",

                mb: 2,

              }}
            />

            <Typography
              variant="h6"
              fontWeight={700}
            >

              No Textile Records Available

            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >

              Upload and analyze textile images
              to generate reports.

            </Typography>

          </Box>

        ) : (

          <Box>

            {history.map((item) => {

              const selected =
                selectedIds.includes(item.id);

              return (

                <Box
                  key={item.id}
                  sx={{

                    display: "flex",

                    alignItems: {

                      xs: "flex-start",

                      sm: "center",

                    },

                    gap: 1.5,

                    p: 2.5,

                    borderBottom:
                      "1px solid",

                    borderColor:
                      "divider",

                    bgcolor:
                      selected
                        ? "action.selected"
                        : "transparent",

                    transition:
                      "0.2s",

                    "&:hover": {

                      bgcolor:
                        "action.hover",

                    },

                  }}
                >

                  <Checkbox
                    checked={selected}
                    onChange={() =>
                      toggleSelection(item.id)
                    }
                  />


                  <Box
                    sx={{

                      flexGrow: 1,

                      minWidth: 0,

                    }}
                  >

                    <Typography
                      fontWeight={700}
                    >

                      {item.textile_name ||
                        `Textile #${item.id}`}

                    </Typography>


                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{

                        mt: 0.5,

                      }}
                    >

                      {item.prediction ||
                        "Unknown Fabric"}

                      {" • "}

                      {item.category ||
                        "Unknown Category"}

                      {" • "}

                      Confidence:

                      {" "}

                      {item.confidence
                        ? `${Number(
                            item.confidence
                          ).toFixed(1)}%`
                        : "--"}

                    </Typography>


                    <Box
                      sx={{

                        display: "flex",

                        gap: 1,

                        mt: 1,

                        flexWrap: "wrap",

                      }}
                    >

                      <Chip
                        size="small"
                        label={
                          `Sustainability: ${
                            item.sustainability_score ??
                            "--"
                          }`
                        }
                        color="success"
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label={
                          `Circularity: ${
                            item.circularity_score ??
                            "--"
                          }`
                        }
                        color="primary"
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label={
                          item.primary_action ||
                          "No Action"
                        }
                        variant="outlined"
                      />

                    </Box>

                  </Box>


                  <CheckCircleIcon
                    sx={{

                      color: selected
                        ? "success.main"
                        : "transparent",

                    }}
                  />

                </Box>

              );

            })}

          </Box>

        )}

      </Card>


      {/* EXPORT LOADING */}

      {exporting && (

        <Box
          sx={{

            position: "fixed",

            inset: 0,

            bgcolor:
              "rgba(0,0,0,.25)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            zIndex: 9999,

          }}
        >

          <Card
            sx={{

              p: 4,

              borderRadius: 3,

              display: "flex",

              alignItems: "center",

              gap: 2,

            }}
          >

            <CircularProgress />

            <Typography
              fontWeight={600}
            >

              Generating your report...

            </Typography>

          </Card>

        </Box>

      )}

    </Box>

  );

}


/* ==========================================================
   REPORT STAT CARD
========================================================== */

function ReportStatCard({
  icon,
  title,
  value,
  subtitle,
}) {

  return (

    <Card
      sx={{

        p: 3,

        borderRadius: 4,

        height: "100%",

        display: "flex",

        alignItems: "center",

        gap: 2,

      }}
    >

      <Box
        sx={{

          width: 55,

          height: 55,

          borderRadius: "50%",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          bgcolor:
            "success.light",

          color:
            "success.dark",

        }}
      >

        {icon}

      </Box>


      <Box>

        <Typography
          color="text.secondary"
          fontWeight={600}
        >

          {title}

        </Typography>


        <Typography
          variant="h4"
          fontWeight={800}
        >

          {value}

        </Typography>


        <Typography
          variant="body2"
          color="text.secondary"
        >

          {subtitle}

        </Typography>

      </Box>

    </Card>

  );

}