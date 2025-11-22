import React from "react";
import type { Pagination, Vendor } from "../../types/admin";
import { formatTimestamp } from "../../utils/format";

const getVendorId = (vendor: Vendor) => vendor._id || vendor.id || "";

interface VendorDirectoryTableProps {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  selectedVendorId: string | null;
  onSelectVendor: (vendorId: string) => void;
  onPageChange: (direction: "prev" | "next") => void;
  onToggleActive: (vendorId: string) => void;
  togglingId: string | null;
}

const VendorDirectoryTable: React.FC<VendorDirectoryTableProps> = ({
  vendors,
  loading,
  error,
  pagination,
  selectedVendorId,
  onSelectVendor,
  onPageChange,
  onToggleActive,
  togglingId,
}) => {
  return (
    <section className="admin-table glass-panel">
      <header className="admin-section-header">
        <div>
          <h2>Vendor Directory</h2>
          <p>Audit onboarding timelines, activation status, and contacts.</p>
        </div>
        <div className="admin-pagination">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onPageChange("prev")}
            disabled={loading || !pagination || pagination.page <= 1}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onPageChange("next")}
            disabled={
              loading ||
              !pagination ||
              pagination.page >= (pagination.pages || 1)
            }
          >
            Next
          </button>
        </div>
      </header>

      {loading ? (
        <div className="admin-table__empty">Loading vendors…</div>
      ) : error ? (
        <div className="admin-table__empty admin-table__empty--alert">
          {error}
        </div>
      ) : vendors.length === 0 ? (
        <div className="admin-table__empty">No vendors match your search.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => {
              const vendorId = getVendorId(vendor);
              if (!vendorId) {
                return null;
              }
              const isSelected = selectedVendorId === vendorId;
              return (
                <tr
                  key={vendorId}
                  className={isSelected ? "admin-row--active" : undefined}
                >
                  <td>
                    <button
                      type="button"
                      className="admin-link"
                      onClick={() => onSelectVendor(vendorId)}
                    >
                      {vendor.firstName} {vendor.lastName}
                    </button>
                  </td>
                  <td>{vendor.email}</td>
                  <td>{vendor.phone || "—"}</td>
                  <td>{formatTimestamp(vendor.createdAt)}</td>
                  <td>
                    <span
                      className={`admin-status ${
                        vendor.isActive
                          ? "admin-status--success"
                          : "admin-status--muted"
                      }`}
                    >
                      {vendor.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => onSelectVendor(vendorId)}
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => onToggleActive(vendorId)}
                        disabled={togglingId === vendorId}
                      >
                        {vendor.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default VendorDirectoryTable;
