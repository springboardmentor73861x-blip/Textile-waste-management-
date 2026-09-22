import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import {
  DRAWER_WIDTH,
  NAVBAR_HEIGHT,
} from "./layoutConfig";

import { useEffect, useState } from "react";
import api from "../services/api";

import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import RecyclingIcon from "@mui/icons-material/Recycling";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DescriptionIcon from "@mui/icons-material/Description";

import { useTheme } from "@mui/material/styles";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ==========================================================
// ROLE-AWARE DASHBOARD LINK
// ==========================================================

function getDashboardItemForRole(role) {
  switch (role) {
    case "admin":
      return {
        text: "Admin Dashboard",
        icon: <AdminPanelSettingsIcon />,
        path: "/admin-dashboard",
      };

    case "recycling_operator":
      return {
        text: "Dashboard",
        icon: <RecyclingIcon />,
        path: "/recycling-dashboard",
      };

    case "sustainability_manager":
      return {
        text: "Dashboard",
        icon: <AnalyticsIcon />,
        path: "/sustainability-dashboard",
      };

    case "manufacturer":
      return {
        text: "Dashboard",
        icon: <AnalyticsIcon />,
        path: "/manufacturer-dashboard",
      };

    default:
      return {
        text: "Dashboard",
        icon: <DashboardIcon />,
        path: "/dashboard",
      };
  }
}

// ==========================================================
// COMPONENT
// ==========================================================

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [user, setUser] = useState(null);

  const dashboardItem = getDashboardItemForRole(user?.role);

  const menuItems = [
    dashboardItem,
    {
      text: "Upload",
      icon: <CloudUploadIcon />,
      path: "/upload",
    },
    {
      text: "History",
      icon: <HistoryIcon />,
      path: "/history",
    },
    {
      text: "Analytics",
      icon: <AnalyticsIcon />,
      path: "/analytics",
    },
    {
      text: "Reports",
      icon: <DescriptionIcon />,
      path: "/reports",
    },
    {
      text: "Profile",
      icon: <PersonIcon />,
      path: "/profile",
    },
  ];

  // ==========================================================
  // FETCH CURRENT USER
  // ==========================================================

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("access_token");
      navigate("/");
    }
  };

  // ==========================================================
  // SIDEBAR CONTENT
  // ==========================================================

  const drawerContent = (
    <>
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={onMobileClose}
            sx={{
              mx: 2,
              my: 1,
              borderRadius: 2,

              "&.Mui-selected": {
                bgcolor: "#22c55e",
                color: "white",
              },

              "&.Mui-selected:hover": {
                bgcolor: "#16a34a",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography fontWeight="bold">
          {user?.full_name || "User"}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user?.email || ""}
        </Typography>

        <ListItemButton
          onClick={logout}
          sx={{
            mt: 2,
            borderRadius: 2,

            "&:hover": {
              bgcolor: "#ef4444",
              color: "white",
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </>
  );

  return (
    <>
      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          width: DRAWER_WIDTH,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            top: `${NAVBAR_HEIGHT}px`,
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,

            boxSizing: "border-box",

            display: "flex",
            flexDirection: "column",

            background: theme.palette.background.paper,
            color: theme.palette.text.primary,

            borderRight: "1px solid",
            borderColor: "divider",

            overflow: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ======================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,

            top: `${NAVBAR_HEIGHT}px`,
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,

            boxSizing: "border-box",

            display: "flex",
            flexDirection: "column",

            background: theme.palette.background.paper,
            color: theme.palette.text.primary,

            borderRight: "1px solid",
            borderColor: "divider",

            overflow: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}