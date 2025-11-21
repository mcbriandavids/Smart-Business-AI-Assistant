import React, { useEffect, useState, useCallback } from "react";

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
import Modal from "../components/Modal";

// cSpell:disable LGA Topbar

export default function Dashboard() {
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
  const [activeView, setActiveView] = useState<"overview" | "customers">(
    "overview"
  );

  // Custom hooks
  const {
    me,
    loading: authLoading,
    error: authError,
    refetch: refetchAuth,
  } = useAuth();
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

  // Debug logging removed to prevent noisy console warnings in production

  // Show business creation modal if vendor/owner and no business exists
  useEffect(() => {
    if (
      (me?.data?.user?.role === "vendor" || me?.data?.user?.role === "owner") &&
      (!businessContent || businessContent.trim() === "") &&
      (businessError === "No business found" ||
        businessError === "Business not found")
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
  const handleAddCustomer = useCallback(
    async (customerData: Omit<Customer, "_id">) => {
      try {
        await addCustomer(customerData);
        setSnackbar({
          open: true,
          message: "Customer added",
          severity: "success",
        });
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err?.response?.data?.message || "Failed to add customer",
          severity: "error",
        });
      }
    },
    [addCustomer]
  );

  const handleEditCustomer = useCallback(
    async (customer: Customer) => {
      try {
        await updateCustomer(customer._id!, {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          notes: customer.notes,
        });
        setSnackbar({
          open: true,
          message: "Customer updated",
          severity: "success",
        });
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err?.response?.data?.message || "Failed to update customer",
          severity: "error",
        });
      }
    },
    [updateCustomer]
  );

  const handleDeleteCustomer = useCallback(
    async (customer: Customer) => {
      if (!window.confirm(`Delete customer ${customer.name || ""}?`)) return;
      try {
        await deleteCustomer(customer._id!);
        setSnackbar({
          open: true,
          message: "Customer deleted",
          severity: "success",
        });
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err?.response?.data?.message || "Delete failed",
          severity: "error",
        });
      }
    },
    [deleteCustomer]
  );

  const handleMessageCustomer = useCallback(
    async (customer: Customer, content: string) => {
      try {
        await sendMessage(customer._id!, content);
        setSnackbar({
          open: true,
          message: "Message sent",
          severity: "success",
        });
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err?.response?.data?.message || "Message failed",
          severity: "error",
        });
      }
    },
    [sendMessage]
  );

  const handleSaveBusinessContent = useCallback(async () => {
    try {
      await saveBusinessContent(businessContent);
      setSnackbar({
        open: true,
        message: "Business content saved",
        severity: "success",
      });
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

  useEffect(() => {
    if (!snackbar.open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [snackbar.open]);

  const overviewTabId = "dashboard-tab-overview";
  const customersTabId = "dashboard-tab-customers";
  const overviewPanelId = "dashboard-panel-overview";
  const customersPanelId = "dashboard-panel-customers";

  return (
    <div className="stack stack--loose">
      {snackbar.open ? (
        <div
          className={`callout ${
            snackbar.severity === "success"
              ? "callout--success"
              : "callout--error"
          }`}
          role={snackbar.severity === "success" ? "status" : "alert"}
          aria-live={snackbar.severity === "success" ? "polite" : "assertive"}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>{snackbar.message}</span>
          <button
            type="button"
            className="vendor-button vendor-button--ghost vendor-button--compact"
            onClick={() => setSnackbar({ ...snackbar, open: false })}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <DashboardTopbar
        me={me}
        search={search}
        onSearchChange={setSearch}
        showSearch={activeView === "customers"}
      />

      <div
        className="tab-switcher"
        role="tablist"
        aria-label="Dashboard sections"
      >
        <button
          type="button"
          role="tab"
          id={overviewTabId}
          aria-controls={overviewPanelId}
          aria-selected={activeView === "overview"}
          className={`tab-switcher__button${
            activeView === "overview" ? " tab-switcher__button--active" : ""
          }`}
          tabIndex={activeView === "overview" ? 0 : -1}
          onClick={() => setActiveView("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          id={customersTabId}
          aria-controls={customersPanelId}
          aria-selected={activeView === "customers"}
          className={`tab-switcher__button${
            activeView === "customers" ? " tab-switcher__button--active" : ""
          }`}
          tabIndex={activeView === "customers" ? 0 : -1}
          onClick={() => setActiveView("customers")}
        >
          Customers
        </button>
      </div>

      {activeView === "overview" ? (
        <div
          role="tabpanel"
          id={overviewPanelId}
          aria-labelledby={overviewTabId}
          className="stack stack--loose"
        >
          <div className="layout-grid layout-grid--two">
            <div className="stack stack--loose">
              {me?.data?.user?.role === "vendor" ? (
                <BroadcastSection
                  broadcastMsg={broadcastMsg}
                  setBroadcastMsg={setBroadcastMsg}
                  broadcasting={broadcasting}
                  broadcastSuccess={broadcastSuccess}
                  onSendBroadcast={sendBroadcast}
                />
              ) : null}

              {me?.data?.user?.role === "vendor" && businessContent ? (
                <BusinessContentSection
                  businessContent={businessContent}
                  setBusinessContent={setBusinessContent}
                  saving={businessSaving}
                  onSave={handleSaveBusinessContent}
                />
              ) : null}
            </div>

            <div className="stack stack--loose">
              <DashboardSidebar
                customerCount={customers.length}
                hasBusinessProfile={Boolean(businessContent)}
              />
            </div>

            <div className="layout-span-full">
              <BroadcastDeliveryList />
            </div>
          </div>
        </div>
      ) : null}

      {activeView === "customers" ? (
        <div
          role="tabpanel"
          id={customersPanelId}
          aria-labelledby={customersTabId}
          className="stack stack--loose"
        >
          <CustomersSection
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onMessageCustomer={handleMessageCustomer}
            search={search}
          />
        </div>
      ) : null}

      {authLoading ? (
        <div className="callout" style={{ alignSelf: "flex-start" }}>
          <span className="assistant-spinner" style={{ marginRight: 12 }} />{" "}
          Loading profile…
        </div>
      ) : null}

      {authError ? (
        <div
          className="callout callout--error"
          style={{ alignSelf: "flex-start" }}
        >
          {authError}
        </div>
      ) : null}

      <Modal
        open={showBusinessModal}
        onClose={() => setShowBusinessModal(false)}
        title="Create your business"
        description="Set up your business profile to unlock broadcasts, customer messaging, and analytics."
        size="lg"
      >
        <CreateBusinessForm
          onSuccess={handleBusinessCreated}
          onCancel={() => setShowBusinessModal(false)}
        />
      </Modal>
    </div>
  );
}
