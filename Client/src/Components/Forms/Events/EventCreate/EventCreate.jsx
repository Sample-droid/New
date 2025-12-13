import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import { jwtDecode } from "jwt-decode";
import UploadIcon from "@mui/icons-material/CloudUpload";
import "./eventcreate.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const initialEventState = {
  name: "",
  code: nanoid(8),
  date: null,
  location: "",
  description: "",
  category: "",
  maxParticipants: "",
};

const EventCreate = () => {
  const [eventData, setEventData] = useState(initialEventState);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, type: "success", text: "" });
  const calendarRef = useRef(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
    } catch (error) {
      console.error("Invalid token", error);
    }
  }, []);

  useEffect(() => {
    if (calendarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  const handleClickOutside = (e) => {
    if (calendarRef.current && !calendarRef.current.contains(e.target)) setCalendarOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const regenerateCode = () => setEventData((prev) => ({ ...prev, code: nanoid(8) }));

  const validateForm = () => {
    const newErrors = {};
    if (!eventData.name) newErrors.name = "Event name is required";
    if (!eventData.code) newErrors.code = "Event code is required";
    if (!eventData.date) newErrors.date = "Event date is required";
    if (!eventData.location) newErrors.location = "Location is required";
    if (!eventData.category) newErrors.category = "Category is required";
    if (!image) newErrors.image = "Event image is required";
    if (!eventData.maxParticipants || eventData.maxParticipants <= 0)
      newErrors.maxParticipants = "Maximum participants must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({ open: true, type: "error", text: "Please fill all required fields." });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(eventData).forEach(([key, value]) => {
        if (key === "date" && value) formData.append(key, value.toISOString());
        else formData.append(key, value);
      });
      formData.append("user", userId);
      formData.append("image", image);

      const res = await axios.post(`${API_BASE_URL}/api/event`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSnackbar({ open: true, type: "success", text: res.data.message || "Event created successfully" });
      setEventData({ ...initialEventState, code: nanoid(8) });
      setImage(null);
      setImagePreview(null);
      setErrors({});
    } catch (err) {
      setSnackbar({
        open: true,
        type: "error",
        text: err.response?.data?.message || "Error creating event. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const heroVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 1 } } };
  const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };

  return (
    <Box className="eventcreate-container">
      <Box className="hero-section" py={10}>
        <Container maxWidth="lg" textAlign="center">
          <motion.div variants={heroVariants} initial="hidden" animate="visible">
            <Typography variant="h3" fontWeight="bold">Create a New Event</Typography>
            <Typography variant="h6" color="text.secondary">Organize impactful events for the community</Typography>
          </motion.div>
        </Container>
      </Box>

      <Box py={8}>
        <Container maxWidth="md">
          <Paper elevation={8} sx={{ p: 5, borderRadius: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>Event Details</Typography>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <TextField fullWidth label="Event Name" name="name" value={eventData.name} onChange={handleChange} margin="normal" error={!!errors.name} helperText={errors.name} />

              <Box display="flex" gap={1} mt={2}>
                <TextField fullWidth label="Event Code" name="code" value={eventData.code} InputProps={{ readOnly: true }} />
                <Button variant="outlined" onClick={regenerateCode}>Regenerate</Button>
              </Box>

              <FormControl fullWidth margin="normal" error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select name="category" value={eventData.category} label="Category" onChange={handleChange}>
                  <MenuItem value="">Select category</MenuItem>
                  <MenuItem value="Food Donation">Food Donation</MenuItem>
                  <MenuItem value="Tree Planting">Tree Planting</MenuItem>
                  <MenuItem value="Cleaning">Cleaning</MenuItem>
                </Select>
              </FormControl>

              <Box ref={calendarRef} mt={2}>
                <TextField
                  fullWidth
                  label="Event Date"
                  value={eventData.date ? format(eventData.date, "yyyy-MM-dd") : ""}
                  onClick={() => setCalendarOpen(true)}
                  InputProps={{ readOnly: true }}
                  error={!!errors.date}
                  helperText={errors.date}
                />
                {calendarOpen && (
                  <DayPicker
                    mode="single"
                    selected={eventData.date}
                    onSelect={(date) => {
                      setEventData((p) => ({ ...p, date }));
                      setCalendarOpen(false);
                    }}
                    disabled={{ before: new Date() }}
                  />
                )}
              </Box>

              <TextField fullWidth label="Location" name="location" value={eventData.location} onChange={handleChange} margin="normal" error={!!errors.location} helperText={errors.location} />
              <TextField fullWidth label="Description" name="description" value={eventData.description} onChange={handleChange} margin="normal" multiline rows={3} />
              <TextField fullWidth type="number" label="Maximum Participants" name="maxParticipants" value={eventData.maxParticipants} onChange={handleChange} margin="normal" error={!!errors.maxParticipants} helperText={errors.maxParticipants} />

              <Box mt={3} p={3} border="2px dashed #ccc" borderRadius={3} textAlign="center" onClick={() => document.getElementById("imageInput").click()} sx={{ cursor: "pointer" }}>
                <input id="imageInput" type="file" accept="image/*" hidden onChange={handleImageChange} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", borderRadius: 8 }} />
                ) : (
                  <>
                    <UploadIcon fontSize="large" />
                    <Typography>Click to upload image</Typography>
                  </>
                )}
                {errors.image && <Typography color="error">{errors.image}</Typography>}
              </Box>

              <Box textAlign="center" mt={4}>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Create Event"}
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Paper>
        </Container>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.type}>{snackbar.text}</Alert>
      </Snackbar>
    </Box>
  );
};



export default EventCreate;