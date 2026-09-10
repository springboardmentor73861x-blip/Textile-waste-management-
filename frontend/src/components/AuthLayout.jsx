import { Box, Typography } from "@mui/material";
import RecyclingIcon from "@mui/icons-material/Recycling";

// ==========================================================
// PALETTE
// ==========================================================

export const authColors = {
  denimInk: "#20293A",
  denimInkLight: "#2E3B52",
  canvas: "#F6F3EC",
  ink: "#1B1B18",
  thread: "#7D7364",
  rust: "#A6552B",
  moss: "#3F6C51",
};

// ==========================================================
// WOVEN TEXTURE (pure CSS, no images)
// ==========================================================

const wovenTexture = {
  backgroundImage: `
    repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.035) 0px,
      rgba(255,255,255,0.035) 1px,
      transparent 1px,
      transparent 10px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255,255,255,0.035) 0px,
      rgba(255,255,255,0.035) 1px,
      transparent 1px,
      transparent 10px
    )
  `,
};

// ==========================================================
// AUTH LAYOUT
// ==========================================================

export default function AuthLayout({
  headline,
  subheading,
  quote,
  children,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ================================================
          LEFT — STORY PANEL
      ================================================ */}

      <Box
        sx={{
          flex: { xs: "0 0 auto", md: "0 0 44%" },
          minHeight: { xs: 220, md: "100vh" },
          bgcolor: authColors.denimInk,
          backgroundImage: `linear-gradient(160deg, ${authColors.denimInk} 0%, ${authColors.denimInkLight} 100%)`,
          color: "#F2EFE8",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { xs: 4, md: 7 },
          position: "relative",
          overflow: "hidden",
          ...wovenTexture,
        }}
      >
        {/* Wordmark */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <RecyclingIcon sx={{ color: "#8FBFA0" }} />
          <Typography
            sx={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: "1.15rem",
              letterSpacing: 0.2,
            }}
          >
            TextileAI
          </Typography>
        </Box>

        {/* Headline */}
        <Box sx={{ my: { xs: 3, md: 0 } }}>
          <Typography
            sx={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: { xs: "1.8rem", md: "2.6rem" },
              lineHeight: 1.15,
              maxWidth: 420,
              mb: 2,
            }}
          >
            {headline}
          </Typography>

          <Typography
            sx={{
              color: "rgba(242,239,232,0.72)",
              fontSize: "1rem",
              maxWidth: 380,
              lineHeight: 1.6,
            }}
          >
            {subheading}
          </Typography>
        </Box>

        {/* Quote / stat strip */}
        {quote && (
          <Box
            sx={{
              borderLeft: "2px solid #8FBFA0",
              pl: 2.5,
              py: 0.5,
              display: { xs: "none", md: "block" },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.95rem",
                color: "rgba(242,239,232,0.85)",
                fontStyle: "italic",
              }}
            >
              {quote}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ================================================
          RIGHT — FORM PANEL
      ================================================ */}

      <Box
        sx={{
          flex: 1,
          bgcolor: authColors.canvas,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 5, md: 8 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>{children}</Box>
      </Box>
    </Box>
  );
}