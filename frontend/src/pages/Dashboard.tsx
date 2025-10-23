import { useEffect, useState } from "react";
import { api } from "../api/client";

type Me = {
  success?: boolean;
  data?: any;
};

export default function Dashboard() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchMe() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/auth/me");
        if (!active) return;
        setMe(res.data || {});
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.message || "Failed to fetch profile");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchMe();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <h1>Dashboard</h1>
      <p>You're signed in. Below is your profile from the backend.</p>
      {loading && <p>Loading profile…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {me && (
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 6,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(me, null, 2)}
        </pre>
      )}
    </section>
  );
}
