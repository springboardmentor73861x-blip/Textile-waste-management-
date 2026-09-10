import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
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
import { useTheme } from "@mui/material/styles";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DescriptionIcon from "@mui/icons-material/Description";

const navbarHeight = 64;
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Upload", icon: <CloudUploadIcon />, path: "/upload" },
    { text: "History", icon: <HistoryIcon />, path: "/history" },
    { text: "Analytics", icon: <AnalyticsIcon />, path: "/analytics" },
    { text: "Reports", icon: <DescriptionIcon />, path: "/reports"},
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  ];

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("access_token");
        navigate("/");
    }    
  };
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

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink:0,
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

      <List sx={{ mt: 2}}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              mx: 2,
              my: 1,
              borderRadius: 2,
              "&.Mui-selected": {
                bgcolor: "#22c55e",
                color: "white",
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

      <Box sx={{ p: 2 ,borderTop:"1px solid",borderColor:"divider",}}>
        <Typography fontWeight="bold">
          {user?.full_name || "User"}
        </Typography>

        <Typography variant="body2" color="text.secondary">
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
    </Drawer>
  );
}