import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
  alpha,
  InputBase,
  Skeleton,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  CheckCircle as EnableIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const AdminPanel = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(""); // "disable", "enable", "delete"
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("adminToken");

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch Users
  const fetchUsers = async () => {
    if (!token) {
      showSnackbar("Authentication token missing", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersList = res.data || [];
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      showSnackbar("Failed to load users", "error");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search Filter
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Dialog Handlers
  const openDialog = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setActionType("");
    setDialogOpen(false);
  };

  // Toggle User Status
  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const res = await axios.patch(
        `${API_BASE_URL}/api/auth/user/${selectedUser._id}/status`,
        { isActive: !selectedUser.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, isActive: res.data.user.isActive } : u
        )
      );

      closeDialog();
      showSnackbar(
        `User "${selectedUser.username}" has been ${res.data.user.isActive ? "enabled" : "disabled"}.`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to update user status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete User
  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await axios.delete(`${API_BASE_URL}/api/auth/user/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      closeDialog();
      showSnackbar(`User "${selectedUser.username}" deleted permanently.`, "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold">
          User Management
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ ml: 1, flex: 1 }}
            />
          </Paper>

          <Tooltip title="Refresh">
            <IconButton onClick={fetchUsers} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Users Table */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Username</TableCell>
                <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "grey.50", fontWeight: "bold" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={80} height={28} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={90} height={28} /></TableCell>
                    <TableCell align="right"><Skeleton variant="rounded" width={140} height={36} /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      {searchTerm ? "No users found matching your search." : "No users available yet."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    hover
                    sx={{
                      opacity: !user.isActive ? 0.6 : 1,
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {user.username}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || "user"}
                        color={user.role === "admin" ? "secondary" : "primary"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? "Active" : "Disabled"}
                        color={user.isActive ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title={user.isActive ? "Disable User" : "Enable User"}>
                          <IconButton
                            color={user.isActive ? "warning" : "success"}
                            onClick={() => openDialog(user, user.isActive ? "disable" : "enable")}
                          >
                            {user.isActive ? <BlockIcon /> : <EnableIcon />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete User">
                          <IconButton color="error" onClick={() => openDialog(user, "delete")}>
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
          Confirm {actionType === "delete" ? "Delete" : actionType === "enable" ? "Enable" : "Disable"} User
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            <strong>
              {actionType === "disable" ? "disable" : actionType === "enable" ? "enable" : "permanently delete"}
            </strong>{" "}
            the user:
            <br />
            <Typography component="span" fontWeight="bold" color="primary">
              {selectedUser?.username} ({selectedUser?.email})
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
            <Button variant="contained" color="warning" onClick={handleToggleStatus} disabled={actionLoading}>
              Disable
            </Button>
          )}
          {actionType === "enable" && (
            <Button variant="contained" color="success" onClick={handleToggleStatus} disabled={actionLoading}>
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

      {/* Snackbar Notifications */}
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
  );

};
export default AdminPanel;