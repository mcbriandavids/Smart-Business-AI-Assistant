import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      await api.post("/api/auth/forgot-password", { email });
      setStatus("sent");
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        "Unable to send reset email right now.";
      setError(message);
      setStatus("error");
    }
  };

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
            <h1>Reset your SmartBuys AI password</h1>
            <p>
              Enter the work email associated with your account and we&apos;ll
              email you a reset link.
            </p>
          </div>

          {status === "sent" ? (
            <div className="auth-success">
              <h2>Check your inbox</h2>
              <p>
                If an account exists for <strong>{email}</strong>, we sent reset
                instructions. The link will expire in 15 minutes.
              </p>
              <p>
                Need help? Contact your SmartBuys AI administrator or reach out
                to support.
              </p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="email">Work email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@smartbuys.ai"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {error ? <p className="auth-error">{error}</p> : null}

              <button
                type="submit"
                className="btn btn--primary btn--lg auth-submit"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? "Sending instructions…"
                  : "Send reset link"}
              </button>
            </form>
          )}

          <div className="auth-meta">
            <span>
              Remembered your password?{" "}
              <Link to="/login">Return to sign in</Link>
            </span>
          </div>
        </div>
      </div>

      <aside className="auth-showcase glass-panel">
        <div className="auth-showcase__badge">Security tip</div>
        <p className="auth-showcase__quote">
          “SmartBuys AI keeps your account secure with time-bound reset links
          and activity alerts.”
        </p>
        <div className="auth-showcase__meta">
          <span>Reset links expire</span>
          <span className="auth-showcase__confidence">15 minutes</span>
        </div>
        <div className="auth-showcase__timeline">
          <div className="auth-showcase__event">
            <span className="auth-showcase__dot" />
            <div>
              <h4>Request</h4>
              <p>Submit your email to trigger a secure reset link.</p>
            </div>
          </div>
          <div className="auth-showcase__event">
            <span className="auth-showcase__dot" />
            <div>
              <h4>Confirm</h4>
              <p>Open the link to set a new password and log back in.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ForgotPassword;
