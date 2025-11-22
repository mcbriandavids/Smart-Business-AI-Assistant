import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import type { AdminStats, AdminStatsResponse } from "../../types/admin";

export function useAdminStats(auto = true) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AdminStatsResponse>("/api/admin/stats");
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to load stats");
      }
      setStats(res.data.data || null);
    } catch (err: any) {
      setError(err?.message || "Unable to load stats");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    fetchStats();
  }, [auto, fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
