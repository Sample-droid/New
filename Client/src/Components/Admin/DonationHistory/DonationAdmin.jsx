import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";
import axios from "axios";

const DonationAdmin = () => {
  const baseurl = import.meta.env.VITE_API_BASE_URL;

  // 🔐 ADMIN TOKEN
  const token = localStorage.getItem("adminToken");

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDonations = async (pageNumber = 1) => {
    if (!token) {
      setError("Admin not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${baseurl}/api/donations/admin?status=succeeded&page=${pageNumber}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDonations(res.data.donations);
      setPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to load donation history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations(1);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Successful Donations
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : donations.length === 0 ? (
        <Typography>No successful donations found.</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Amount ($)</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation._id}>
                    <TableCell>
                      {new Date(donation.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell>{donation.email}</TableCell>

                    <TableCell>
                      {(donation.amount / 100).toFixed(2)}
                    </TableCell>

                    <TableCell>{donation.message || "-"}</TableCell>

                    <TableCell>
                      <Chip label="Succeeded" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Button
              disabled={page <= 1}
              onClick={() => fetchDonations(page - 1)}
            >
              Previous
            </Button>

            <Typography>
              Page {page} of {totalPages}
            </Typography>

            <Button
              disabled={page >= totalPages}
              onClick={() => fetchDonations(page + 1)}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DonationAdmin;