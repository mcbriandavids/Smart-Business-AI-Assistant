import { useCallback, useState } from "react";
import { api } from "../../api/client";
import type {
  CustomerContact,
  Pagination,
  VendorCustomerResponse,
} from "../../types/admin";

interface LoadParams {
  vendorId: string;
  page?: number;
  search?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 15;

export function useVendorCustomers() {
  const [customers, setCustomers] = useState<CustomerContact[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async ({
      vendorId,
      page = 1,
      search = "",
      limit = DEFAULT_LIMIT,
    }: LoadParams) => {
      if (!vendorId) {
        setCustomers([]);
        setPagination(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<VendorCustomerResponse>(
          "/api/vendor-customers",
          {
            params: {
              vendorId,
              page,
              limit,
              search: search || undefined,
            },
          }
        );
        if (!res.data?.success) {
          throw new Error(res.data?.message || "Unable to load customers");
        }
        setCustomers(res.data.data?.items || []);
        setPagination(res.data.data?.pagination || null);
      } catch (err: any) {
        setError(err?.message || "Unable to load customers");
        setCustomers([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setCustomers([]);
    setPagination(null);
    setError(null);
  }, []);

  return { customers, pagination, loading, error, load, reset };
}
