import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

interface User {
  _id?: string;
  firstName?: string;
  avatar?: string;
  role?: string;
}

interface AuthData {
  data?: {
    user?: User;
  };
}

export function useAuth() {
  const [me, setMe] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/auth/me");
      setMe(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return { me, loading, error, refetch: fetchMe };
}