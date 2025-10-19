import { useEffect, useState } from "react";
import { api } from "../api/client";
import { logout } from "../utils/auth";

type Me = {
  success?: boolean;
  data?: any;
};

export default function Dashboard() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const firstName =
    (me as any)?.data?.user?.firstName ||
    (me as any)?.user?.firstName ||
    (me as any)?.firstName ||
    "";
  const user: any = (me as any)?.data?.user ?? (me as any)?.user ?? (me as any);
  const profile = {
    fullName:
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") || undefined,
    email: user?.email,
    role: user?.role,
    phone: user?.phone,
    verified: typeof user?.verified === "boolean" ? user.verified : undefined,
    id: user?._id || user?.id,
  };

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          {firstName && (
            <div style={{ opacity: 0.9, marginTop: 4 }}>
              Welcome, {firstName} 👋
            </div>
          )}
        </div>
        <button className="btn btn--ghost" onClick={logout}>
          Sign out
        </button>
      </div>
      <p>You're signed in. Below is your profile from the backend.</p>
      {loading && <p>Loading profile…</p>}
      {error && (
        <div className="alert alert--danger" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
      {me ? (
        <>
          {/* Profile summary card */}
          <div className="card" style={{ padding: 12, marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>Profile</strong>
              <button
                className="btn btn--ghost"
                onClick={() => setShowRaw((v) => !v)}
                aria-expanded={showRaw}
              >
                {showRaw ? "Hide raw JSON" : "View raw JSON"}
              </button>
            </div>
            <div
              style={{
                marginTop: 8,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                rowGap: 6,
                columnGap: 12,
              }}
            >
              <span style={{ opacity: 0.7 }}>Name</span>
              <span>{profile.fullName || "—"}</span>

              <span style={{ opacity: 0.7 }}>Email</span>
              <span>{profile.email || "—"}</span>

              <span style={{ opacity: 0.7 }}>Role</span>
              <span>{profile.role || "—"}</span>

              <span style={{ opacity: 0.7 }}>Phone</span>
              <span>{profile.phone || "—"}</span>

              <span style={{ opacity: 0.7 }}>Verified</span>
              <span>
                {profile.verified === undefined
                  ? "—"
                  : profile.verified
                  ? "Yes"
                  : "No"}
              </span>

              <span style={{ opacity: 0.7 }}>ID</span>
              <span>{profile.id || "—"}</span>
            </div>
          </div>

          {showRaw && (
            <pre
              className="card"
              style={{
                background: "#0c1130",
                color: "#e8ecff",
                padding: 12,
                borderRadius: 6,
                overflowX: "auto",
                marginTop: 12,
              }}
            >
              {JSON.stringify(me, null, 2)}
            </pre>
          )}
        </>
      ) : (
        !loading && !error && <p>No profile data yet.</p>
      )}
    </section>
  );
}
