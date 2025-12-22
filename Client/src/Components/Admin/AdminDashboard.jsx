import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  MonetizationOn as DonationsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import AdminPanel from "./AdminPanel";
import EventManagement from "./EventManagement/EventManagement";
import DonationAdmin from "../Admin/DonationHistory/DonationAdmin";

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: "Dashboard Overview", icon: <DashboardIcon />, view: "dashboard" },
  { text: "User Management", icon: <PeopleIcon />, view: "users" },
  { text: "Event Management", icon: <EventIcon />, view: "events" },
  { text: "Donations", icon: <DonationsIcon />, view: "donations" },
];

const AdminDashboard = () => {
  const [view, setView] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admn");
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* TOP */}
      <Box>
        <Toolbar sx={{ backgroundColor: "primary.main", color: "white" }}>
          <Typography variant="h6" fontWeight="bold">
            Admin Portal
          </Typography>
        </Toolbar>

        <Divider />

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.view} disablePadding>
              <ListItemButton
                selected={view === item.view}
                onClick={() => {
                  setView(item.view);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" },
                    "& .MuiListItemIcon-root": { color: "white" },
                  },
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: view === item.view ? "white" : "inherit",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* LOGOUT BOTTOM */}
      <Box sx={{ mt: "auto" }}>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                mx: 1,
                my: 1,
                borderRadius: 2,
                color: "error.main",
                "&:hover": {
                  backgroundColor: "error.light",
                  color: "white",
                },
                "& .MuiListItemIcon-root": {
                  color: "inherit",
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f7fa" }}>
      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: "white",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight="medium">
            {menuItems.find((item) => item.view === view)?.text ||
              "Admin Dashboard"}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: 0 }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "64px",
        }}
      >
        <Container maxWidth="xl">
          {view === "dashboard" && (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, Admin!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage users, events, and donations efficiently.
              </Typography>
            </Paper>
          )}

          {(view === "users" ||
            view === "events" ||
            view === "donations") && (
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
              {view === "users" && <AdminPanel />}
              {view === "events" && <EventManagement />}
              {view === "donations" && <DonationAdmin />}
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
};


export default AdminDashboard;