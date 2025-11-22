import React from "react";
import type { CustomerContact, Pagination, Vendor } from "../../types/admin";
import { formatCurrency, formatTimestamp } from "../../utils/format";

interface VendorDetailPanelProps {
  vendor: Vendor | null;
  customers: CustomerContact[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  customerSearchValue: string;
  onCustomerSearchChange: (value: string) => void;
  onCustomerSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCustomerPageChange: (direction: "prev" | "next") => void;
}

const VendorDetailPanel: React.FC<VendorDetailPanelProps> = ({
  vendor,
  customers,
  loading,
  error,
  pagination,
  customerSearchValue,
  onCustomerSearchChange,
  onCustomerSearchSubmit,
  onCustomerPageChange,
}) => {
  if (!vendor) {
    return (
      <aside className="admin-detail glass-panel">
        <div className="admin-table__empty">
          Select a vendor to inspect their customer workspace.
        </div>
      </aside>
    );
  }

  return (
    <aside className="admin-detail glass-panel">
      <div className="admin-detail__content">
        <header className="admin-section-header">
          <div>
            <h2>
              {vendor.firstName} {vendor.lastName}
            </h2>
            <p>{vendor.email}</p>
          </div>
          <span
            className={`admin-status ${
              vendor.isActive ? "admin-status--success" : "admin-status--muted"
            }`}
          >
            {vendor.isActive ? "Active" : "Inactive"}
          </span>
        </header>

        <div className="admin-detail__meta">
          <div>
            <span className="admin-detail__label">Phone</span>
            <strong>{vendor.phone || "Not provided"}</strong>
          </div>
          <div>
            <span className="admin-detail__label">Joined</span>
            <strong>{formatTimestamp(vendor.createdAt)}</strong>
          </div>
        </div>

        <section className="admin-subsection">
          <header className="admin-subsection__header">
            <div>
              <h3>Customer Directory</h3>
              <p>Inspect the vendor contact book and lifecycle stages.</p>
            </div>
            <form
              className="admin-customer-search"
              onSubmit={onCustomerSearchSubmit}
            >
              <input
                type="search"
                placeholder="Search contacts"
                value={customerSearchValue}
                onChange={(event) => onCustomerSearchChange(event.target.value)}
              />
              <button type="submit" className="btn btn--ghost btn--sm">
                Filter
              </button>
            </form>
          </header>

          {loading ? (
            <div className="admin-table__empty">Loading contacts…</div>
          ) : error ? (
            <div className="admin-table__empty admin-table__empty--alert">
              {error}
            </div>
          ) : customers.length === 0 ? (
            <div className="admin-table__empty">
              No customer contacts available for this vendor.
            </div>
          ) : (
            <ul className="admin-customer-list">
              {customers.map((customer) => (
                <li key={customer.id}>
                  <div className="admin-customer__row">
                    <div>
                      <strong>{customer.contact.name}</strong>
                      <p>
                        {customer.contact.email ||
                          customer.contact.phone ||
                          "No direct channel"}
                      </p>
                    </div>
                    <span className="admin-chip">
                      {customer.lifecycleStage || "lead"}
                    </span>
                  </div>
                  <div className="admin-customer__meta">
                    <span>
                      Prefers{" "}
                      {customer.preferredChannel?.replace("_", " ") || "in_app"}
                    </span>
                    <span>
                      Last touch: {formatTimestamp(customer.lastInteractionAt)}
                    </span>
                    <span>
                      Orders: {customer.metrics?.totalOrders ?? 0} · Revenue:{" "}
                      {formatCurrency(customer.metrics?.totalRevenue)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pagination ? (
            <div className="admin-pagination admin-pagination--sub">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => onCustomerPageChange("prev")}
                disabled={loading || pagination.page <= 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} / {pagination.pages}
              </span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => onCustomerPageChange("next")}
                disabled={loading || pagination.page >= pagination.pages}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </aside>
  );
};

export default VendorDetailPanel;
