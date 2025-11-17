import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";

// Custom hooks
import { useAuth } from "../hooks/useAuth";
import { useBusiness } from "../hooks/useBusiness";
import { useCustomers, Customer } from "../hooks/useCustomers";
import { useBroadcast } from "../hooks/useBroadcast";

// Components
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardTopbar from "../components/DashboardTopbar";
import BroadcastSection from "../components/BroadcastSection";
import BusinessContentSection from "../components/BusinessContentSection";
import CustomersSection from "../components/CustomersSection";
import CreateBusinessForm from "../components/CreateBusinessForm";
import BroadcastDeliveryList from "../components/BroadcastDeliveryList";

// cSpell:disable LGA Topbar

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Custom hooks
  const { me, loading: authLoading, error: authError, refetch: refetchAuth } = useAuth();
  const {
    businessContent,
    setBusinessContent,
    saving: businessSaving,
    error: businessError,
    fetchBusinessContent,
    saveBusinessContent,
  } = useBusiness();
  const {
    customers,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    sendMessage,
  } = useCustomers();
  const {
    broadcastMsg,
    setBroadcastMsg,
    broadcasting,
    broadcastSuccess,
    sendBroadcast,
  } = useBroadcast();

  // Debug logging
  useEffect(() => {
    setTimeout(() => {
      import("../utils/auth").then(({ getToken }) => {
        // eslint-disable-next-line no-console
        console.log("[Dashboard] User:", me);
        // eslint-disable-next-line no-console
        console.log("[Dashboard] Token:", getToken && getToken());
      });
    }, 1000);
  }, [me]);

  // Show business creation modal if vendor/owner and no business exists
  useEffect(() => {
    if (
      (me?.data?.user?.role === "vendor" || me?.data?.user?.role === "owner") &&
      (!businessContent || businessContent.trim() === "") &&
      (businessError === "No business found" || businessError === "Business not found")
    ) {
      setShowBusinessModal(true);
    } else {
      setShowBusinessModal(false);
    }
  }, [me, businessContent, businessError]);

  // Fetch business and customers when user is loaded
  useEffect(() => {
    if (me?.data?.user?.role === "owner" || me?.data?.user?.role === "vendor") {
      fetchBusinessContent();
      fetchCustomers();
    }
  }, [me, fetchBusinessContent, fetchCustomers]);

  // Event listener for dashboard errors
  useEffect(() => {
    const handler = (e: any) => {
      setSnackbar({ open: true, message: e.detail, severity: "error" });
    };
    window.addEventListener("dashboard-error", handler);
    return () => window.removeEventListener("dashboard-error", handler);
  }, []);

  // Handlers
  const handleAddCustomer = useCallback(async (customerData: Omit<Customer, '_id'>) => {
    try {
      await addCustomer(customerData);
      setSnackbar({ open: true, message: "Customer added", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to add customer",
        severity: "error",
      });
    }
  }, [addCustomer]);

  const handleEditCustomer = useCallback(async (customer: Customer) => {
    try {
      await updateCustomer(customer._id!, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
      });
      setSnackbar({ open: true, message: "Customer updated", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to update customer",
        severity: "error",
      });
    }
  }, [updateCustomer]);

  const handleDeleteCustomer = useCallback(async (customer: Customer) => {
    if (!window.confirm(`Delete customer ${customer.name || ""}?`)) return;
    try {
      await deleteCustomer(customer._id!);
      setSnackbar({ open: true, message: "Customer deleted", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  }, [deleteCustomer]);

  const handleMessageCustomer = useCallback(async (customer: Customer, content: string) => {
    try {
      await sendMessage(customer._id!, content);
      setSnackbar({ open: true, message: "Message sent", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Message failed",
        severity: "error",
      });
    }
  }, [sendMessage]);

  const handleSaveBusinessContent = useCallback(async () => {
    try {
      await saveBusinessContent(businessContent);
      setSnackbar({ open: true, message: "Business content saved", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to save content",
        severity: "error",
      });
    }
  }, [businessContent, saveBusinessContent]);

  const handleBusinessCreated = useCallback(() => {
    setShowBusinessModal(false);
    refetchAuth();
    fetchBusinessContent();
    fetchCustomers();
  }, [refetchAuth, fetchBusinessContent, fetchCustomers]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`,
        display: { xs: "block", md: "flex" },
      }}
    >
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Mobile Top Nav */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          width: "100%",
          bgcolor: (theme) => theme.palette.background.paper,
          p: 1,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <DashboardIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={900} color="primary.dark">
            Dashboard
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 36,
            height: 36,
            fontWeight: 700,
          }}
        >
          {me?.data?.user?.firstName?.[0] || <PersonIcon />}
        </Avatar>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 1, sm: 2, md: 4 },
          pl: { md: 6 },
          pr: { md: 6 },
          bgcolor: (theme) => theme.palette.grey[50],
        }}
      >
        {/* Topbar */}
        <DashboardTopbar
          me={me}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Broadcast Section */}
        {me?.data?.user?.role === "vendor" && (
          <BroadcastSection
            broadcastMsg={broadcastMsg}
            setBroadcastMsg={setBroadcastMsg}
            broadcasting={broadcasting}
            broadcastSuccess={broadcastSuccess}
            onSendBroadcast={sendBroadcast}
          />
        )}

        {/* Editable Business Content */}
        {me?.data?.user?.role === "vendor" && businessContent && (
          <BusinessContentSection
            businessContent={businessContent}
            setBusinessContent={setBusinessContent}
            saving={businessSaving}
            onSave={handleSaveBusinessContent}
          />
        )}

        {/* Business Creation Modal */}
        <Dialog
          open={showBusinessModal}
          onClose={() => {}}
          disableEscapeKeyDown
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Your Business</DialogTitle>
          <DialogContent>
            <Typography mb={2} color="text.secondary">
              To use the dashboard, you must first create your business profile.
            </Typography>
            <CreateBusinessForm
              onSuccess={handleBusinessCreated}
              onCancel={() => setShowBusinessModal(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Customers Management Section */}
        <CustomersSection
          customers={customers}
          onAddCustomer={handleAddCustomer}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          onMessageCustomer={handleMessageCustomer}
          search={search}
        />

        {/* Broadcast Delivery Status */}
        <BroadcastDeliveryList />

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

        {authLoading && <Typography mt={2}>Loading profile…</Typography>}
        {authError && (
          <Typography color="error" fontWeight={600} mt={2}>
            {authError}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
