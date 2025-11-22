import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Pagination, Vendor, VendorListResponse } from "../../types/admin";

const getVendorId = (vendor: Vendor) => vendor._id || vendor.id || "";

export function useVendorDirectory(pageSize = 20) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<VendorListResponse>("/api/vendors", {
          params: { page: targetPage, limit: pageSize },
        });
        if (!res.data?.success) {
          throw new Error(res.data?.message || "Unable to load vendors");
        }
        const list = (res.data.data?.vendors || []).map((vendor) => ({
          ...vendor,
          _id: vendor._id || vendor.id,
        }));
        setVendors(list);
        setPagination(res.data.data?.pagination || null);
      } catch (err: any) {
        setError(err?.message || "Unable to load vendors");
        setVendors([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const refresh = useCallback(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const toggleActive = useCallback(async (vendorId: string) => {
    if (!vendorId) {
      return;
    }
    setTogglingId(vendorId);
    try {
      const res = await api.put(`/api/admin/users/${vendorId}/toggle-active`);
      const isActive = res.data?.data?.user?.isActive as boolean | undefined;
      setVendors((prev) =>
        prev.map((item) =>
          getVendorId(item) === vendorId
            ? { ...item, isActive: isActive ?? !item.isActive }
            : item
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to update user");
    } finally {
      setTogglingId(null);
    }
  }, []);

  return {
    vendors,
    pagination,
    page,
    setPage,
    loading,
    error,
    refresh,
    toggleActive,
    togglingId,
  };
}
