import { useContext, useEffect, useState } from "react";

import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import RecyclingIcon from "@mui/icons-material/Recycling";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import { ColorModeContext } from "../theme/ColorModeContext";
import { useAvatar } from "../context/AvatarContext";

import {
  DRAWER_WIDTH,
  NAVBAR_HEIGHT,
} from "./layoutConfig";

import api from "../services/api";


// ==========================================================
// ROLE DISPLAY LABELS
// ==========================================================

const ROLE_LABELS = {
  recycling_operator: "Recycling Operator",
  sustainability_manager: "Sustainability Manager",
  manufacturer: "Manufacturer",
  admin: "Administrator",
};


export default function Navbar() {

  const { toggleColorMode, mode } =
    useContext(ColorModeContext);

  const { avatarUrl, setUserId } = useAvatar();


  // ==========================================================
  // CURRENT USER STATE
  // ==========================================================

  const [currentUser, setCurrentUser] =
    useState(null);


  // ==========================================================
  // NOTIFICATION STATES
  // ==========================================================

  const [anchorEl, setAnchorEl] =
    useState(null);

  const [notifications, setNotifications] =
    useState([]);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);


  const notificationOpen =
    Boolean(anchorEl);


  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  const loadCurrentUser = async () => {

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await api.get(
        "/users/me",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setCurrentUser(
        response.data
      );

      setUserId(response.data.id);

    } catch (error) {

      console.error(
        "Failed to load current user:",
        error
      );

    }

  };


  // ==========================================================
  // GET NOTIFICATIONS
  // ==========================================================

  const loadNotifications = async () => {

    try {

      setLoadingNotifications(true);

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await api.get(
        "/notifications/",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setNotifications(
        response.data?.data || []
      );

    } catch (error) {

      console.error(
        "Notification loading error:",
        error
      );

    } finally {

      setLoadingNotifications(false);

    }

  };


  // ==========================================================
  // LOAD USER + NOTIFICATIONS ON START
  // ==========================================================

  useEffect(() => {

    loadCurrentUser();

    loadNotifications();

  }, []);


  // ==========================================================
  // OPEN NOTIFICATION MENU
  // ==========================================================

  const handleNotificationClick = (
    event
  ) => {

    setAnchorEl(
      event.currentTarget
    );

    loadNotifications();

  };


  // ==========================================================
  // CLOSE MENU
  // ==========================================================

  const handleNotificationClose = () => {

    setAnchorEl(null);

  };


  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  // ==========================================================
  // MARK SINGLE NOTIFICATION AS READ
  // ==========================================================

  const handleMarkAsRead = async (
    notification
  ) => {

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!notification.is_read) {

        await api.put(
          `/notifications/${notification.id}/read`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      }


      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );

    } catch (error) {

      console.error(
        "Mark notification read error:",
        error
      );

    }

  };


  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAllAsRead =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "access_token"
          );

        await api.put(
          "/notifications/mark-all-read",
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,
            is_read: true,
          }))
        );

      } catch (error) {

        console.error(
          "Mark all notifications error:",
          error
        );

      }

    };


  // ==========================================================
  // DELETE NOTIFICATION
  // ==========================================================

  const handleDeleteNotification =
    async (
      event,
      notificationId
    ) => {

      event.stopPropagation();

      try {

        const token =
          localStorage.getItem(
            "access_token"
          );

        await api.delete(
          `/notifications/${notificationId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


        setNotifications((previous) =>
          previous.filter(
            (notification) =>
              notification.id !==
              notificationId
          )
        );

      } catch (error) {

        console.error(
          "Delete notification error:",
          error
        );

      }

    };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    dateString
  ) => {

    if (!dateString) {

      return "Just now";

    }

    const date =
      new Date(dateString);

    return date.toLocaleString();

  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height:
          `${NAVBAR_HEIGHT}px`,

        bgcolor:
          "background.paper",

        color:
          "text.primary",

        borderBottom:
          "1px solid",

        borderColor:
          "divider",

        zIndex: (theme) =>
          theme.zIndex.drawer + 1,
      }}
    >

      <Toolbar
        disableGutters
        sx={{
          minHeight:
            `${NAVBAR_HEIGHT}px !important`,

          height:
            NAVBAR_HEIGHT,

          display:
            "flex",

          width:
            "100%",
        }}
      >

        {/* ==================================================
            LEFT LOGO AREA
        ================================================== */}

        <Box
          sx={{
            width:
              DRAWER_WIDTH,

            height:
              "100%",

            display:
              "flex",

            alignItems:
              "center",

            px: 3,

            boxSizing:
              "border-box",

            borderRight:
              "1px solid",

            borderColor:
              "divider",
          }}
        >

          <Avatar
            sx={{
              bgcolor:
                "#22c55e",

              mr: 1.5,
            }}
          >
            <RecyclingIcon />
          </Avatar>


          <Box>

            <Typography
              fontWeight="bold"
              fontSize={20}
            >
              TextileAI
            </Typography>


            <Typography
              variant="body2"
              color="text.secondary"
            >
              AI Waste Intelligence
            </Typography>

          </Box>

        </Box>


        {/* ==================================================
            RIGHT NAVBAR AREA
        ================================================== */}

        <Box
          sx={{
            flexGrow: 1,

            height:
              "100%",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "flex-end",

            px: 3,

            gap: 2,
          }}
        >

          {/* DARK / LIGHT MODE */}

          <Tooltip
            title={
              mode === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >

            <IconButton
              onClick={
                toggleColorMode
              }
              sx={{
                border:
                  "1px solid",

                borderColor:
                  "divider",

                width: 48,

                height: 48,
              }}
            >

              {mode === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}

            </IconButton>

          </Tooltip>


          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <Tooltip title="Notifications">

            <IconButton
              onClick={
                handleNotificationClick
              }
              sx={{
                border:
                  "1px solid",

                borderColor:
                  "divider",

                width: 48,

                height: 48,
              }}
            >

              <Badge
                badgeContent={
                  unreadCount
                }
                color="error"
                max={99}
              >

                <NotificationsNoneIcon />

              </Badge>

            </IconButton>

          </Tooltip>


          {/* ==================================================
              NOTIFICATION MENU
          ================================================== */}

          <Menu
            anchorEl={anchorEl}

            open={
              notificationOpen
            }

            onClose={
              handleNotificationClose
            }

            PaperProps={{
              sx: {
                width: 380,

                maxWidth:
                  "calc(100vw - 30px)",

                maxHeight: 500,

                borderRadius: 3,

                mt: 1,

                overflow:
                  "hidden",
              },
            }}
          >

            {/* HEADER */}

            <Box
              sx={{
                px: 2.5,

                py: 2,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",
              }}
            >

              <Typography
                variant="h6"
                fontWeight="bold"
              >
                Notifications
              </Typography>


              {unreadCount > 0 && (

                <Button
                  size="small"

                  startIcon={
                    <DoneAllIcon />
                  }

                  onClick={
                    handleMarkAllAsRead
                  }
                >
                  Mark all read
                </Button>

              )}

            </Box>


            <Divider />


            {/* LOADING */}

            {loadingNotifications && (

              <Box
                sx={{
                  py: 5,

                  display:
                    "flex",

                  justifyContent:
                    "center",
                }}
              >

                <CircularProgress
                  size={30}
                />

              </Box>

            )}


            {/* EMPTY STATE */}

            {!loadingNotifications &&
              notifications.length === 0 && (

              <Box
                sx={{
                  py: 5,

                  px: 3,

                  textAlign:
                    "center",
                }}
              >

                <NotificationsNoneIcon
                  sx={{
                    fontSize: 45,

                    color:
                      "text.secondary",

                    mb: 1,
                  }}
                />

                <Typography
                  fontWeight="bold"
                >
                  No Notifications
                </Typography>


                <Typography
                  variant="body2"

                  color="text.secondary"

                  sx={{
                    mt: 0.5,
                  }}
                >
                  You're all caught up!
                </Typography>

              </Box>

            )}


            {/* NOTIFICATION LIST */}

            {!loadingNotifications &&
              notifications.map(
                (notification) => (

                  <MenuItem
                    key={
                      notification.id
                    }

                    onClick={() =>
                      handleMarkAsRead(
                        notification
                      )
                    }

                    sx={{
                      whiteSpace:
                        "normal",

                      py: 1.8,

                      px: 2.5,

                      display:
                        "flex",

                      alignItems:
                        "flex-start",

                      gap: 1.5,

                      bgcolor:
                        notification.is_read
                          ? "transparent"
                          : theme =>
                              theme.palette.mode ===
                              "dark"
                                ? "rgba(37,99,235,.12)"
                                : "#eff6ff",

                      borderBottom:
                        "1px solid",

                      borderColor:
                        "divider",
                    }}
                  >

                    {/* Notification Icon */}

                    <Avatar
                      sx={{
                        width: 40,

                        height: 40,

                        bgcolor:
                          notification.notification_type ===
                          "warning"
                            ? "#f59e0b"
                            : notification.notification_type ===
                              "recycling"
                            ? "#16a34a"
                            : notification.notification_type ===
                              "sustainability"
                            ? "#7c3aed"
                            : "#2563eb",
                      }}
                    >

                      <NotificationsNoneIcon />

                    </Avatar>


                    {/* Notification Content */}

                    <Box
                      sx={{
                        flexGrow: 1,

                        minWidth: 0,
                      }}
                    >

                      <Typography
                        fontWeight={
                          notification.is_read
                            ? 500
                            : 800
                        }

                        sx={{
                          fontSize:
                            "0.95rem",
                        }}
                      >
                        {
                          notification.title
                        }
                      </Typography>


                      <Typography
                        variant="body2"

                        color="text.secondary"

                        sx={{
                          mt: 0.5,

                          whiteSpace:
                            "normal",
                        }}
                      >
                        {
                          notification.message
                        }
                      </Typography>


                      <Typography
                        variant="caption"

                        color="text.secondary"

                        sx={{
                          display:
                            "block",

                          mt: 0.8,
                        }}
                      >
                        {
                          formatDate(
                            notification.created_at
                          )
                        }
                      </Typography>

                    </Box>


                    {/* DELETE */}

                    <IconButton
                      size="small"

                      onClick={(event) =>
                        handleDeleteNotification(
                          event,
                          notification.id
                        )
                      }
                    >

                      <DeleteIcon
                        fontSize="small"
                      />

                    </IconButton>

                  </MenuItem>

                )
              )}

          </Menu>


          {/* ==================================================
              USER
          ================================================== */}

          <Avatar
            src={avatarUrl || undefined}
            sx={{
              bgcolor:
                "#166534",

              width: 48,

              height: 48,
            }}
          >
            {
              !avatarUrl &&
              (currentUser?.full_name
                ?.[0]
                ?.toUpperCase() || "?")
            }
          </Avatar>


          <Box>

            <Typography
              fontWeight="medium"
            >
              {
                currentUser?.full_name ||
                "Loading..."
              }
            </Typography>


            <Typography
              variant="body2"
              color="text.secondary"
            >
              {
                currentUser
                  ? (ROLE_LABELS[currentUser.role] ||
                     currentUser.role)
                  : ""
              }
            </Typography>

          </Box>

        </Box>

      </Toolbar>

    </AppBar>

  );
}