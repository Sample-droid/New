// Client\src\Components\Admin\AdminDashboard.jsx
import React, { useState } from "react";
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
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";

import AdminPanel from "./AdminPanel";
import EventManagement from "./EventManagement/EventManagement";

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: "primary.main", color: "white" }}>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
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
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f7fa" }}>
      {/* App Bar */}
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
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" fontWeight="medium">
            {menuItems.find((item) => item.view === view)?.text ||
              "Admin Dashboard"}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent Desktop Drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              backgroundColor: "#ffffff",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

          {(view === "users" || view === "events" || view === "donations") && (
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
              {view === "users" && <AdminPanel />}
              {view === "events" && <EventManagement />}
              {view === "donations" && (
                <Box p={4} textAlign="center">
                  <DonationsIcon
                    sx={{ fontSize: 80, color: "grey.400", mb: 2 }}
                  />
                  <Typography variant="h5" color="text.secondary">
                    Donation Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mt={2}>
                    This feature is under development and coming soon.
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;