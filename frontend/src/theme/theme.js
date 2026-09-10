import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,

      primary: {
        main: "#2563eb",
      },

      secondary: {
        main: "#14b8a6",
      },

      background: {
        default: mode === "dark" ? "#0f172a" : "#f4f7fb",
        paper: mode === "dark" ? "#1e293b" : "#ffffff",
      },
    },

    typography: {
      fontFamily: "Poppins, sans-serif",

      h4: {
        fontWeight: 700,
      },

      h5: {
        fontWeight: 700,
      },

      h6: {
        fontWeight: 600,
      },
    },

    shape: {
      borderRadius: 16,
    },

    components: {

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow:
              "0px 10px 30px rgba(0,0,0,0.12)",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
    },
  });