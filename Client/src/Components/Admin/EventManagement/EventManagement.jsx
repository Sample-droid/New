import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  alpha,
  InputBase,
  Skeleton,
  useTheme,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  VisibilityOff as DisableIcon,
  Visibility as EnableIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import AdminCategoryPanel from "../AdminCategory.jsx";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const EventManagement = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0); // 0 = Events, 1 = Categories

  // Event states
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // "disable", "enable", "delete"
  const [actionLoading, setActionLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch Events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/events`);
      const eventsList = data.events || [];
      setEvents(eventsList);
      setFilteredEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
      setFilteredEvents([]);
      showSnackbar("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabIndex === 0) fetchEvents();
  }, [tabIndex]);

  // Search Filter
  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  // Dialog Handlers
  const openDialog = (event, type) => {
    setSelectedEvent(event);
    setActionType(type);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedEvent(null);
    setActionType("");
    setDialogOpen(false);
  };

  // Actions
  const handleDisableEnable = async (disable) => {
    if (!selectedEvent) return;
    try {
      setActionLoading(true);
      await axios.patch(`${API_BASE_URL}/api/admin/event/${selectedEvent._id}/disable`, { disable });
      await fetchEvents();
      closeDialog();
      showSnackbar(
        `Event "${selectedEvent.name}" has been ${disable ? "disabled" : "enabled"} successfully.`,
        "success"
      );
    } catch (error) {
      console.error("Error updating event:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to update event status",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      setActionLoading(true);
      await axios.delete(`${API_BASE_URL}/api/event/${selectedEvent._id}`);
      await fetchEvents();
      closeDialog();
      showSnackbar(`Event "${selectedEvent.name}" deleted permanently.`, "success");
    } catch (error) {
      console.error("Error deleting event:", error);
      showSnackbar("Failed to delete event", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (event) => {
    const isDisabledByUser = event.isDisabled && event.disabledBy === "user";
    if (event.isDisabled) {
      return isDisabledByUser ? (
        <Chip label="Disabled by User" color="warning" size="small" />
      ) : (
        <Chip label="Admin Disabled" color="error" size="small" />
      );
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={(e, val) => setTabIndex(val)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        <Tab label="Events" />
        <Tab label="Categories" />
      </Tabs>

      {tabIndex === 0 && (
        <Box>
          {/* Event Management Header */}
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
            <Typography variant="h4" fontWeight="bold">
              Event Management
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Paper
                elevation={0}
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: { xs: "100%", sm: 300 },
                  bgcolor: "grey.100",
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}
              >
                <IconButton sx={{ p: "10px" }}>
                  <SearchIcon />
                </IconButton>
                <InputBase
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ ml: 1, flex: 1 }}
                />
              </Paper>

              <Tooltip title="Refresh">
                <IconButton onClick={fetchEvents} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Event Table */}
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Image</TableCell>
                    <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Event Name</TableCell>
                    <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Code</TableCell>
                    <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Created By</TableCell>
                    <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }} align="center">
                      Participants
                    </TableCell>
                    <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
                        <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                        <TableCell><Skeleton variant="text" width={60} /></TableCell>
                        <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                        <TableCell><Skeleton variant="text" width={80} /></TableCell>
                        <TableCell><Skeleton variant="rounded" width={90} height={28} /></TableCell>
                        <TableCell align="center"><Skeleton variant="text" width={60} /></TableCell>
                        <TableCell align="right"><Skeleton variant="rounded" width={140} height={36} /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                          {searchTerm ? "No events found matching your search." : "No events available yet."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow
                        key={event._id}
                        hover
                        sx={{
                          opacity: event.isDisabled ? 0.6 : 1,
                          bgcolor: event.isDisabled ? alpha(theme.palette.warning.main, 0.05) : "inherit",
                          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                        }}
                      >
                        <TableCell>
                          <Avatar
                            src={event.image ? `${API_BASE_URL}/${event.image}` : undefined}
                            alt={event.name}
                            sx={{ width: 48, height: 48, borderRadius: 2 }}
                          >
                            {event.name?.[0]?.toUpperCase()}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {event.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={event.code} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">{event.user?.username || "N/A"}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {event.user?.email || ""}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{getStatusChip(event)}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {event.currentParticipants} / {event.maxParticipants}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip
                              title={
                                event.isDisabled && event.disabledBy === "user"
                                  ? "Cannot enable: Disabled by user"
                                  : event.isDisabled
                                  ? "Enable Event"
                                  : "Disable Event"
                              }
                            >
                              <span>
                                <IconButton
                                  color={event.isDisabled ? "success" : "warning"}
                                  onClick={() => openDialog(event, event.isDisabled ? "enable" : "disable")}
                                  disabled={event.isDisabled && event.disabledBy === "user"}
                                >
                                  {event.isDisabled ? <EnableIcon /> : <DisableIcon />}
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Delete Event">
                              <IconButton color="error" onClick={() => openDialog(event, "delete")}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Confirmation Dialog */}
          <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)} Event
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to{" "}
                <strong>
                  {actionType === "disable" ? "disable" : actionType === "enable" ? "enable" : "permanently delete"}
                </strong>{" "}
                the event:
                <br />
                <Typography component="span" fontWeight="bold" color="primary">
                  "{selectedEvent?.name}"
                </Typography>
                {actionType === "delete" && (
                  <Typography variant="body2" color="error" mt={2}>
                    
                    This action cannot be undone.
                  </Typography>
                )}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog} disabled={actionLoading}>
                Cancel
              </Button>
              {actionType === "disable" && (
                <Button variant="contained" color="warning" onClick={() => handleDisableEnable(true)} disabled={actionLoading}>
                  Disable
                </Button>
              )}
              {actionType === "enable" && (
                <Button variant="contained" color="success" onClick={() => handleDisableEnable(false)} disabled={actionLoading}>
                  Enable
                </Button>
              )}
              {actionType === "delete" && (
                <Button variant="contained" color="error" onClick={handleDelete} disabled={actionLoading}>
                  Delete Permanently
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%", boxShadow: 4 }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <AdminCategoryPanel />
        </Box>
      )}
    </Box>
  );
};

export default EventManagement;