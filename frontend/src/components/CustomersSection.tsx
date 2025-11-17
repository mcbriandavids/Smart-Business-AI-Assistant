import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import CustomerTable from "./CustomerTable";
import CustomerForm from "./CustomerForm";
import { Customer } from "../hooks/useCustomers";

interface CustomersSectionProps {
  customers: Customer[];
  onAddCustomer: (customerData: Omit<Customer, '_id'>) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  onMessageCustomer: (customer: Customer, content: string) => void;
  search: string;
}

export default function CustomersSection({
  customers,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onMessageCustomer,
  search,
}: CustomersSectionProps) {
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    customer?: Customer;
  }>({ open: false });
  const [messageText, setMessageText] = useState<string>("");
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleMessageCustomer = (customer: Customer) => {
    setMessageDialog({ open: true, customer });
    setMessageText("");
  };

  const handleSendMessage = async () => {
    if (!messageDialog.customer || !messageText.trim()) return;
    setMessageLoading(true);
    try {
      await onMessageCustomer(messageDialog.customer, messageText);
      setSnackbar({ open: true, message: "Message sent", severity: "success" });
      setMessageDialog({ open: false });
      setMessageText("");
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Message failed",
        severity: "error",
      });
    } finally {
      setMessageLoading(false);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    if (!search) return true;
    const val = search.toLowerCase();
    return (
      (cust.name || "").toLowerCase().includes(val) ||
      (cust.email || "").toLowerCase().includes(val) ||
      (cust.phone || "").toLowerCase().includes(val)
    );
  });

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 4,
          p: { xs: 1, sm: 3 },
          bgcolor: (theme) => theme.palette.background.paper,
          width: "100%",
          boxShadow: (theme) => theme.shadows[1],
          mt: 2,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" fontWeight={800}>
            All Customers
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCustomer}
            sx={{ fontWeight: 700, boxShadow: 2 }}
          >
            Add Customer
          </Button>
        </Box>
        {customers.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
            No customers found. Click "Add Customer" to create your first
            customer.
          </Typography>
        ) : (
          <CustomerTable
            customers={filteredCustomers}
            onEdit={handleEditCustomer}
            onDelete={onDeleteCustomer}
            onMessage={handleMessageCustomer}
          />
        )}
      </Paper>

      {/* Add/Edit Customer Modal */}
      <Dialog
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCustomer ? "Edit Customer" : "Add Customer"}
        </DialogTitle>
        <DialogContent>
          <CustomerForm
            initialData={editingCustomer || undefined}
            onSuccess={(customerData) => {
              if (editingCustomer) {
                onEditCustomer({ ...editingCustomer, ...customerData });
              } else {
                onAddCustomer(customerData);
              }
              setShowCustomerModal(false);
            }}
            onCancel={() => setShowCustomerModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Message Customer Dialog */}
      <Dialog
        open={messageDialog.open}
        onClose={() => setMessageDialog({ open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Message Customer</DialogTitle>
        <DialogContent>
          <Typography mb={1}>
            To: {messageDialog.customer?.name || ""}
          </Typography>
          <TextField
            multiline
            minRows={2}
            fullWidth
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={messageLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMessageDialog({ open: false })}
            disabled={messageLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={messageLoading || !messageText.trim()}
            variant="contained"
            color="primary"
          >
            {messageLoading ? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}