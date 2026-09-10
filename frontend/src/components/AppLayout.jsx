import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import {
  DRAWER_WIDTH,
  NAVBAR_HEIGHT,
} from "./layoutConfig";

export default function AppLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          position: "relative",

          marginLeft: `${DRAWER_WIDTH}px`,
          paddingTop: `${NAVBAR_HEIGHT}px`,

          width: `calc(100vw - ${DRAWER_WIDTH}px)`,

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