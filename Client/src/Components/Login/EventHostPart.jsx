import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  TablePagination
} from "@mui/material"; import { useNavigate } from "react-router-dom";

import {
  Edit as EditIcon,
  Block as DisableIcon,
  CheckCircle as EnableIcon,
  ExitToApp as ExitIcon,
  CloudUpload as CloudUploadIcon
} from "@mui/icons-material";

import { format } from "date-fns";
import { useAuth } from "../Context/AuthContext";

const EventHostPart = ({ userId, showSnackbar }) => {
  const { api } = useAuth();

  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [eventView, setEventView] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);const navigate = useNavigate();
  const [openDisable, setOpenDisable] = useState(false);
  const [openLeave, setOpenLeave] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    date: "",
    location: "",
    category: "",
    description: "",
    maxParticipants: 0
  });
  const [editImage, setEditImage] = useState(null);

  // ---------------- FETCH EVENTS ----------------
  const fetchHostedEvents = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/events/user/${userId}`);
      setEvents(res.data.events || []);
    } catch {
      showSnackbar("Error fetching hosted events", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedEvents = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/joined/${userId}`);
      setJoinedEvents(res.data.joinedEvents || []);
    } catch {
      showSnackbar("Error fetching joined events", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    eventView === 0 ? fetchHostedEvents() : fetchJoinedEvents();
    setPage(0);
  }, [eventView, userId]);

  const list = eventView === 0
    ? events
    : joinedEvents.map(j => j.event).filter(Boolean);

  const isHosted = eventView === 0;
  const paginatedList = list.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ---------------- EDIT EVENT ----------------
  const handleEditOpen = (e) => {
    setSelectedEvent(e);
    setEditData({
      name: e.name || "",
      date: e.date ? format(new Date(e.date), "yyyy-MM-dd") : "",
      location: e.location || "",
      category: e.category?.name || e.category || "",
      description: e.description || "",
      maxParticipants: e.maxParticipants || 0
    });
    setEditImage(null);
    setOpenEdit(true);
  };

  const handleEditSubmit = async () => {
    if (editData.maxParticipants < selectedEvent.currentParticipants) {
      showSnackbar(
        `Max participants cannot be less than current participants (${selectedEvent.currentParticipants})`,
        "error"
      );
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(editData).forEach(([k, v]) => formData.append(k, v));
      if (editImage) formData.append("image", editImage);

      await api.put(`/api/event/${selectedEvent._id}`, formData);
      showSnackbar("Event updated successfully", "success");
      setOpenEdit(false);
      if (eventView === 0) fetchHostedEvents();
    } catch {
      showSnackbar("Error updating event", "error");
    }
  };

  // ---------------- TOGGLE DISABLE ----------------
  const handleToggleDisable = async () => {
    try {
      await api.patch(`/api/event/${selectedEvent._id}/disable`, { disable: !selectedEvent.isDisabled });
      showSnackbar(selectedEvent.isDisabled ? "Event enabled" : "Event disabled", "info");
      setOpenDisable(false);
      if (eventView === 0) fetchHostedEvents();
    } catch (err) {
      const message = err?.response?.data?.message || "Error updating event status";
      showSnackbar(message, "error");
      setOpenDisable(false);
    }
  };

  // ---------------- LEAVE EVENT ----------------
  const handleLeaveEvent = async () => {
    try {
      await api.delete(`/api/forfeit-event`, { data: { userId, eventId: selectedEvent._id } });
      showSnackbar("You left the event", "info");
      fetchJoinedEvents();
    } catch {
      showSnackbar("Error leaving event", "error");
    } finally {
      setOpenLeave(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) return showSnackbar("Image too large (max 10MB)", "error");
    setEditImage(file);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ---------------- RENDER ----------------
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Your Events
      </Typography>

      <Tabs value={eventView} onChange={(_, newValue) => setEventView(newValue)} sx={{ mb: 4 }}>
        <Tab label="Hosted" />
        <Tab label="Participated" />
      </Tabs>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}

      {!loading && paginatedList.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.map((e) => (
                  <TableRow key={e._id} sx={{ opacity: e.isDisabled ? 0.6 : 1 }}>
                    <TableCell>{e?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Chip label={e?.code || "N/A"} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Chip label={e?.category?.name || e?.category || "N/A"} size="small" color="secondary" />
                    </TableCell>
                    <TableCell>{e?.date ? format(new Date(e.date), 'MMM dd, yyyy') : "N/A"}</TableCell>
                    <TableCell sx={{ maxWidth: 120, overflow: 'hidden' }}>{e?.location || "N/A"}</TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 80 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((e?.currentParticipants || 0) / (e?.maxParticipants || 1) * 100, 100)}
                          sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                        />
                        <Typography variant="caption">
                          {e?.currentParticipants || 0} / {e?.maxParticipants || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {e?.image ? (
                        <Avatar src={`http://localhost:8000/${e.image}`} sx={{ width: 32, height: 32 }} />
                      ) : (
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      {e?.isDisabled ? (
                        <Chip size="small" label="Disabled" color="warning" />
                      ) : e?.status ? (
                        <Chip size="small" label={typeof e.status === "string" ? e.status : e.status?.name || "N/A"} color="success" />
                      ) : (
                        <Chip size="small" label="N/A" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      {isHosted ? (
                        <>
                          <IconButton size="small" onClick={() => handleEditOpen(e)} title="Edit">
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color={e?.isDisabled ? "success" : "warning"}
                            onClick={() => { setSelectedEvent(e); setOpenDisable(true); }}
                            title={e?.isDisabled ? "Enable" : "Disable"}
                          >
                            {e?.isDisabled ? <EnableIcon /> : <DisableIcon />}
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => { setSelectedEvent(e); setOpenLeave(true); }}
                          title="Leave"
                        >
                          <ExitIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={list.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      {!loading && paginatedList.length === 0 && (
        <Box textAlign="center" py={6}>
  <Typography variant="h6" color="text.secondary" mb={2}>
    No events found.
  </Typography>
  <Button
    variant="contained"
    color="primary"
    onClick={() => isHosted ? navigate("/eventcreate") : navigate("/eventjoin")}
  >
    {isHosted ? "Create New" : "Join an Event"}
  </Button>





</Box>
      )}

      {/* ---------------- EDIT EVENT DIALOG ---------------- */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth type="date" label="Date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="Location" value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={editData.category} label="Category" onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
                <MenuItem value="Food Donation">Food Donation</MenuItem>
                <MenuItem value="Tree Planting">Tree Planting</MenuItem>
                <MenuItem value="Cleaning">Cleaning</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth multiline rows={3} label="Description" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
            <TextField
              fullWidth
              type="number"
              label="Max Participants"
              value={editData.maxParticipants}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value < selectedEvent?.currentParticipants) {
                  showSnackbar(`Cannot set below current participants (${selectedEvent.currentParticipants})`, "error");
                  return;
                }
                setEditData({ ...editData, maxParticipants: value });
              }}
              InputProps={{ inputProps: { min: selectedEvent?.currentParticipants || 1 } }}
            />
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Upload Image
              <input type="file" hidden accept="image/*" onChange={handleFileInput} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ---------------- DISABLE EVENT DIALOG ---------------- */}
      <Dialog open={openDisable} onClose={() => setOpenDisable(false)}>
        <DialogTitle>{selectedEvent?.isDisabled ? "Enable" : "Disable"} Event</DialogTitle>
       
        <DialogContent>
          <Typography>Confirm {selectedEvent?.isDisabled ? "enable" : "disable"}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDisable(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={selectedEvent?.isDisabled ? "success" : "warning"}
            onClick={handleToggleDisable}
          >
            {selectedEvent?.isDisabled ? "Enable" : "Disable"}
          </Button>
        </DialogActions>
      
      </Dialog>

      {/* ---------------- LEAVE EVENT DIALOG ---------------- */}
      <Dialog open={openLeave} onClose={() => setOpenLeave(false)}>
        <DialogTitle>Leave Event</DialogTitle>
        <DialogContent>
          <Typography>Confirm leave <strong>{selectedEvent?.name || "N/A"}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeave(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleLeaveEvent}>Leave</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventHostPart;