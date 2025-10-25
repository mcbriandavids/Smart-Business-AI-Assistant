import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { getToken } from "../utils/auth";

type Me = {
  success?: boolean;
  data?: any;
};

export default function Dashboard(): JSX.Element {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    async function fetchMe() {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        console.log("[Dashboard] Token in localStorage:", token);
        const res = await api.get("/api/auth/me");
        if (!active) return;
        console.log("[Dashboard] /api/auth/me response:", res.data);
        setMe(res.data || {});
      } catch (err: any) {
        if (!active) return;
        console.error("[Dashboard] /api/auth/me error:", err);
        // Redirect to login if unauthorized
        if (err?.response?.status === 401) {
          navigate("/login", { replace: true, state: { from: "/dashboard" } });
        } else {
          setError(err?.response?.data?.message || "Failed to fetch profile");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchMe();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <section>
      <h1>Dashboard</h1>
      <p>You're signed in. Below is your profile from the backend.</p>
      {loading && <p>Loading profile…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {me && me.data && me.data.user ? (
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 6,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(me.data.user, null, 2)}
        </pre>
      ) : (
        !loading && <p>No user data found.</p>
      )}
    </section>
  );
}
