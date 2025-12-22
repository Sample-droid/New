import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Switch,
  CircularProgress,
} from "@mui/material";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const AdminCategoryPanel = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/categories`);
    setCategories(res.data.categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async () => {
    if (!newCategory.trim()) return;
    setLoading(true);
    await axios.post(`${API_BASE_URL}/api/admin/category`, { name: newCategory });
    setNewCategory("");
    fetchCategories();
    setLoading(false);
  };

  const toggleCategory = async (id, isActive) => {
    await axios.patch(`${API_BASE_URL}/api/admin/category/${id}/disable`, {
      disable: isActive,
    });
    fetchCategories();
  };

  const updateCategoryName = async (id, name) => {
    await axios.put(`${API_BASE_URL}/api/admin/category/${id}`, { name });
    fetchCategories();
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>Category Management</Typography>

      <Box display="flex" gap={2} mb={4}>
        <TextField label="New Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        <Button variant="contained" onClick={createCategory} disabled={loading}>
          {loading ? <CircularProgress size={22} /> : "Add"}
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Active</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell>
                  <TextField
                    variant="standard"
                    defaultValue={cat.name}
                    onBlur={(e) => updateCategoryName(cat._id, e.target.value)}
                  />
                </TableCell>
                <TableCell>{cat.isActive ? "Active" : "Disabled"}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={cat.isActive}
                    onChange={() => toggleCategory(cat._id, cat.isActive)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};



export default AdminCategoryPanel;