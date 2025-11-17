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

  // State for editing
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  // Handler for edit
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };
  // Handler for delete
  const handleDelete = async (customer: Customer) => {
    if (!customer._id) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/customers/${customer._id}`);
      setSuccess("Customer deleted");
      fetchCustomers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };
  // Handler for cancel edit
  const handleCancelEdit = () => {
    setEditingCustomer(null);
  };
  // Handler for save edit
  const handleSaveEdit = async () => {
    setEditingCustomer(null);
    fetchCustomers();
    setSuccess("Customer updated");
  };
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Customer Management
      </Typography>
      {editingCustomer && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <CustomerForm
            initialData={editingCustomer}
            onSuccess={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        </Paper>
      )}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomerTable
          customers={customers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
