import React, { useState } from "react";
import CustomerTable from "./CustomerTable";
import CustomerForm from "./CustomerForm";
import { Customer } from "../hooks/useCustomers";
import Modal from "./Modal";

interface CustomersSectionProps {
  customers: Customer[];
  onAddCustomer: (customerData: Omit<Customer, "_id">) => void;
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
      <section className="glass-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow">Directory</div>
            <h3 className="panel-title">Customers</h3>
            <p className="panel-subtitle">
              Add, edit, and message customers while keeping conversations
              focused.
            </p>
          </div>
          <div className="panel-actions">
            <button
              type="button"
              className="vendor-button vendor-button--primary"
              onClick={handleAddCustomer}
            >
              Add customer
            </button>
          </div>
        </div>

        {snackbar.open ? (
          <div
            className={`callout ${
              snackbar.severity === "success"
                ? "callout--success"
                : "callout--error"
            }`}
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

        <CustomerTable
          customers={filteredCustomers}
          onEdit={handleEditCustomer}
          onDelete={onDeleteCustomer}
          onMessage={handleMessageCustomer}
        />
      </section>

      <Modal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title={editingCustomer ? "Edit customer" : "Add customer"}
        description={
          editingCustomer
            ? "Update details to keep your customer list aligned."
            : "Capture key contact information so the assistant can take action."
        }
        size="md"
      >
        <CustomerForm
          initialData={editingCustomer || undefined}
          onSuccess={(customerData) => {
            if (editingCustomer) {
              onEditCustomer({ ...editingCustomer, ...customerData });
            } else {
              onAddCustomer(customerData);
            }
            setShowCustomerModal(false);
            setSnackbar({
              open: true,
              message: "Customer saved",
              severity: "success",
            });
          }}
          onCancel={() => setShowCustomerModal(false)}
        />
      </Modal>

      <Modal
        open={messageDialog.open}
        onClose={() => setMessageDialog({ open: false })}
        title="Message customer"
        description={
          messageDialog.customer
            ? `Send a quick note to ${messageDialog.customer.name}.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="vendor-button vendor-button--ghost"
              onClick={() => setMessageDialog({ open: false })}
              disabled={messageLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="vendor-button vendor-button--primary"
              onClick={handleSendMessage}
              disabled={messageLoading || !messageText.trim()}
            >
              {messageLoading ? "Sending…" : "Send message"}
            </button>
          </>
        }
      >
        <div className="form-field">
          <label className="form-label" htmlFor="message-text">
            Message
          </label>
          <textarea
            id="message-text"
            className="form-input form-textarea"
            minLength={1}
            placeholder="Type your message…"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            disabled={messageLoading}
          />
        </div>
      </Modal>
    </>
  );
}
