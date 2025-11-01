import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CustomerTable, { Customer } from "../../components/CustomerTable";
import CustomerForm from "../../components/CustomerForm";
import MessageDialog from "../../components/MessageDialog";
import { api } from "../../api/client";

const VendorCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/customers");
      setCustomers(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Customer Management
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <CustomerForm onSuccess={fetchCustomers} />
      </Paper>
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomerTable customers={customers} />
      )}
      <MessageDialog />
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VendorCustomersPage;
