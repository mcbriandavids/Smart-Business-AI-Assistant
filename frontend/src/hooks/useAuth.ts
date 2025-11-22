import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { getToken, login as persistAuth } from "../utils/auth";

interface User {
  _id?: string;
  firstName?: string;
  avatar?: string;
  role?: string;
}

interface AuthData {
  success?: boolean;
  data?: {
    user?: User;
  };
  message?: string;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: User;
    business?: unknown;
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
    if (!getToken()) {
      return;
    }

    fetchMe();
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.post<LoginResponse>("/api/auth/login", {
          email,
          password,
        });

        if (!res.data?.success || !res.data?.data?.token) {
          const message = res.data?.message || "Login failed";
          throw new Error(message);
        }

        const { token, user } = res.data.data;
        persistAuth(token as string, user);

        await fetchMe();
        const target = user?.role === "admin" ? "/admin" : "/dashboard";
        navigate(target);

        return res.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message || err?.message || "Login failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchMe, navigate]
  );

  return { me, loading, error, refetch: fetchMe, login };
}
