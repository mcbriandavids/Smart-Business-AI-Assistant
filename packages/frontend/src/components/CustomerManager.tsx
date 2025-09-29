import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Fab,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import apiClient from "../lib/api";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  preferences?: any;
}

interface CustomerManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function CustomerManager({
  open,
  onClose,
}: CustomerManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Load customers when dialog opens
  useEffect(() => {
    if (open) {
      loadCustomers();
    }
  }, [open]);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await apiClient.getCustomers()) as Customer[];
      setCustomers(data);
    } catch (error) {
      setError("Failed to load customers");
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const customer = (await apiClient.createCustomer(
        newCustomer
      )) as Customer;
      setCustomers((prev) => [...prev, customer]);
      setNewCustomer({ name: "", email: "", phone: "" });
      setAddDialogOpen(false);
      setError(null);
    } catch (error) {
      setError("Failed to add customer");
      console.error("Error adding customer:", error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await apiClient.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      setError("Failed to delete customer");
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Customer Management</Typography>
            <Typography variant="body2" color="text.secondary">
              {customers.length} customers
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Typography>Loading customers...</Typography>
          ) : customers.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No customers yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add your first customer to get started
              </Typography>
            </Box>
          ) : (
            <List>
              {customers.map((customer) => (
                <ListItem key={customer.id} divider>
                  <ListItemText
                    primary={customer.name}
                    secondary={
                      <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" />
                          {customer.email}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon fontSize="small" />
                          {customer.phone}
                        </Box>
                      </Box>
                    }
                  />
                  <Box sx={{ ml: "auto" }}>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCustomer(customer.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          <Fab
            color="primary"
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            onClick={() => setAddDialogOpen(true)}
          >
            <AddIcon />
          </Fab>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Customer Name"
            fullWidth
            variant="outlined"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer((prev) => ({ ...prev, email: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            fullWidth
            variant="outlined"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCustomer} variant="contained">
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
