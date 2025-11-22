import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminMetricsGrid from "../components/admin/AdminMetricsGrid";
import VendorDirectoryTable from "../components/admin/VendorDirectoryTable";
import VendorDetailPanel from "../components/admin/VendorDetailPanel";
import { useAdminStats } from "../hooks/admin/useAdminStats";
import { useVendorDirectory } from "../hooks/admin/useVendorDirectory";
import { useVendorCustomers } from "../hooks/admin/useVendorCustomers";
import { formatNumber } from "../utils/format";
import { logout } from "../utils/auth";
import type { Vendor } from "../types/admin";

const getVendorId = (vendor: Vendor | null | undefined) =>
  vendor?._id || vendor?.id || "";

const AdminDashboard: React.FC = () => {
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useAdminStats();

  const {
    vendors,
    pagination: vendorPagination,
    setPage: setVendorPage,
    loading: vendorLoading,
    error: vendorError,
    refresh: refreshVendors,
    toggleActive,
    togglingId,
  } = useVendorDirectory();

  const {
    customers,
    pagination: customerPagination,
    loading: customerLoading,
    error: customerError,
    load: loadCustomers,
    reset: resetCustomers,
  } = useVendorCustomers();

  const [vendorSearch, setVendorSearch] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [customerSearchInput, setCustomerSearchInput] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const filteredVendors = useMemo(() => {
    const query = vendorSearch.trim().toLowerCase();
    if (!query) {
      return vendors;
    }
    return vendors.filter((vendor) => {
      const name = `${vendor.firstName} ${vendor.lastName}`.toLowerCase();
      return (
        name.includes(query) ||
        vendor.email.toLowerCase().includes(query) ||
        (vendor.phone || "").toLowerCase().includes(query)
      );
    });
  }, [vendors, vendorSearch]);

  const computedSelectedVendorId = useMemo(() => {
    if (filteredVendors.length === 0) {
      return null;
    }
    if (
      selectedVendorId &&
      filteredVendors.some((vendor) => getVendorId(vendor) === selectedVendorId)
    ) {
      return selectedVendorId;
    }
    const fallbackId = getVendorId(filteredVendors[0]);
    return fallbackId || null;
  }, [filteredVendors, selectedVendorId]);

  const selectedVendor = useMemo(
    () =>
      computedSelectedVendorId
        ? filteredVendors.find(
            (vendor) => getVendorId(vendor) === computedSelectedVendorId
          ) || null
        : null,
    [filteredVendors, computedSelectedVendorId]
  );

  const previousVendorIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!computedSelectedVendorId) {
      resetCustomers();
      previousVendorIdRef.current = null;
      setCustomerSearch("");
      setCustomerSearchInput("");
      return;
    }

    if (previousVendorIdRef.current === computedSelectedVendorId) {
      return;
    }

    previousVendorIdRef.current = computedSelectedVendorId;
    setCustomerSearch("");
    setCustomerSearchInput("");
    loadCustomers({
      vendorId: computedSelectedVendorId,
      page: 1,
      search: "",
    });
  }, [computedSelectedVendorId, loadCustomers, resetCustomers]);

  const activeVendorCount = useMemo(
    () => vendors.filter((vendor) => vendor.isActive).length,
    [vendors]
  );

  const handleVendorPageChange = (direction: "prev" | "next") => {
    if (!vendorPagination) return;
    if (direction === "prev" && vendorPagination.page > 1) {
      setVendorPage(vendorPagination.page - 1);
    }
    if (
      direction === "next" &&
      vendorPagination.page < vendorPagination.pages
    ) {
      setVendorPage(vendorPagination.page + 1);
    }
  };

  const handleCustomerPageChange = (direction: "prev" | "next") => {
    if (!customerPagination || !computedSelectedVendorId) return;
    const { page, pages } = customerPagination;
    const nextPage = direction === "prev" ? page - 1 : page + 1;
    if (nextPage < 1 || nextPage > pages) {
      return;
    }
    loadCustomers({
      vendorId: computedSelectedVendorId,
      page: nextPage,
      search: customerSearch,
    });
  };

  const handleVendorSelect = (vendorId: string) => {
    if (computedSelectedVendorId === vendorId) {
      return;
    }
    setSelectedVendorId(vendorId);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCustomerSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!computedSelectedVendorId) {
      return;
    }
    const term = customerSearchInput.trim();
    setCustomerSearchInput(term);
    setCustomerSearch(term);
    loadCustomers({
      vendorId: computedSelectedVendorId,
      page: 1,
      search: term,
    });
  };

  return (
    <div className="admin-shell">
      <header className="admin-header glass-panel">
        <div className="admin-header__top">
          <div>
            <h1 className="admin-header__title">Command Center</h1>
            <p className="admin-header__subtitle">
              Monitor vendor activity, customer relationships, and platform
              health.
            </p>
          </div>
          <div className="admin-header__meta">
            <span className="admin-chip admin-chip--primary">
              Active vendors: {formatNumber(activeVendorCount)}
            </span>
            {vendorPagination ? (
              <span className="admin-chip">
                Page {vendorPagination.page} / {vendorPagination.pages}
              </span>
            ) : null}
          </div>
        </div>
        <div className="admin-toolbar">
          <div className="admin-search">
            <input
              type="search"
              value={vendorSearch}
              onChange={(event) => setVendorSearch(event.target.value)}
              placeholder="Search vendors by name, email, or phone"
            />
          </div>
          <div className="admin-toolbar__actions">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={refreshVendors}
              disabled={vendorLoading}
            >
              Refresh data
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={refreshStats}
              disabled={statsLoading}
            >
              Sync metrics
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <AdminMetricsGrid
        stats={stats}
        loading={statsLoading}
        error={statsError}
      />

      <main className="admin-main">
        <VendorDirectoryTable
          vendors={filteredVendors}
          loading={vendorLoading}
          error={vendorError}
          pagination={vendorPagination}
          selectedVendorId={computedSelectedVendorId}
          onSelectVendor={handleVendorSelect}
          onPageChange={handleVendorPageChange}
          onToggleActive={toggleActive}
          togglingId={togglingId}
        />

        <VendorDetailPanel
          vendor={selectedVendor}
          customers={customers}
          loading={customerLoading}
          error={customerError}
          pagination={customerPagination}
          customerSearchValue={customerSearchInput}
          onCustomerSearchChange={setCustomerSearchInput}
          onCustomerSearchSubmit={handleCustomerSearchSubmit}
          onCustomerPageChange={handleCustomerPageChange}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
