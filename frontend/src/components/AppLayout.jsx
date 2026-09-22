import { useState } from "react";
import { Box } from "@mui/material";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import {
  DRAWER_WIDTH,
  NAVBAR_HEIGHT,
} from "./layoutConfig";

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileOpen = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Navbar */}
      <Navbar onMenuClick={handleMobileOpen} />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          position: "relative",

          marginLeft: {
            xs: 0,
            md: `${DRAWER_WIDTH}px`,
          },

          paddingTop: `${NAVBAR_HEIGHT}px`,

          width: {
            xs: "100%",
            md: `calc(100vw - ${DRAWER_WIDTH}px)`,
          },

          minHeight: "100vh",

          boxSizing: "border-box",

          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",

            margin: 0,

            padding: {
              xs: 2,
              sm: 3,
              md: 4,
            },

            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}