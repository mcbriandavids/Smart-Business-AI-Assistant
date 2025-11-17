import { useState, useCallback } from "react";
import { api } from "../api/client";

export function useBusiness() {
  const [businessContent, setBusinessContent] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessContent = useCallback(async () => {
    try {
      const businessRes = await api.get("/api/businesses/content");
      setBusinessContent(businessRes.data?.data?.description || "");
      setError(null);
    } catch (err: any) {
      setBusinessContent("");
      setError(err?.response?.data?.message || "No business found");
    }
  }, []);

  const saveBusinessContent = useCallback(async (content: string) => {
    setSaving(true);
    try {
      await api.put("/api/businesses/content", {
        description: content,
      });
      setBusinessContent(content);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save content");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    businessContent,
    setBusinessContent,
    saving,
    error,
    fetchBusinessContent,
    saveBusinessContent,
  };
}