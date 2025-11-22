import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      Boolean(token) && password.length >= 8 && password === confirmPassword,
    [token, password, confirmPassword]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError(
        "Your reset link is missing a token. Request a new one and try again."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      await api.post("/api/auth/reset-password", { token, password });
      setStatus("success");
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        "Unable to reset password right now.";
      setError(message);
      setStatus("error");
    }
  };

  const showTokenError = !token && status === "idle";

  return (
    <div className="auth-shell">
      <div className="auth-panel glass-panel">
        <div className="auth-panel__content">
          <div className="auth-panel__back">
            <Link to="/login" className="auth-back-link">
              ← Back to sign in
            </Link>
          </div>

          <div className="auth-branding">
            <span className="branding-pill">SmartBuys AI</span>
            <h1>Choose a new password</h1>
            <p>
              Passwords must include at least eight characters. We recommend
              mixing letters, numbers, and symbols for added security.
            </p>
          </div>

          {status === "success" ? (
            <div className="auth-success">
              <h2>Password updated</h2>
              <p>
                Your SmartBuys AI credentials have been reset. You can now sign
                in with the new password.
              </p>
              <Link to="/login" className="btn btn--primary btn--lg">
                Return to sign in
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter a new password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat the new password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              {showTokenError ? (
                <p className="auth-error">
                  This reset link is missing a token. Request a new email from
                  the <Link to="/forgot-password">forgot password page</Link>.
                </p>
              ) : null}

              {error ? <p className="auth-error">{error}</p> : null}

              <button
                type="submit"
                className="btn btn--primary btn--lg auth-submit"
                disabled={status === "loading" || !canSubmit}
              >
                {status === "loading"
                  ? "Updating password…"
                  : "Update password"}
              </button>
            </form>
          )}

          <div className="auth-meta">
            <span>
              Didn&apos;t request this change?{" "}
              <Link to="/login">Secure your account</Link>
            </span>
          </div>
        </div>
      </div>

      <aside className="auth-showcase glass-panel">
        <div className="auth-showcase__badge">Account security</div>
        <p className="auth-showcase__quote">
          “Keep your SmartBuys AI account safe by using unique, rotating
          passwords.”
        </p>
        <div className="auth-showcase__meta">
          <span>Best practice</span>
          <span className="auth-showcase__confidence">
            Rotate every 90 days
          </span>
        </div>
        <div className="auth-showcase__timeline">
          <div className="auth-showcase__event">
            <span className="auth-showcase__dot" />
            <div>
              <h4>Reset link</h4>
              <p>Use the link sent to your inbox within 15 minutes.</p>
            </div>
          </div>
          <div className="auth-showcase__event">
            <span className="auth-showcase__dot" />
            <div>
              <h4>Set password</h4>
              <p>
                Create a strong credential before returning to the dashboard.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ResetPassword;
