import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in right now."
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel glass-panel">
        <div className="auth-panel__content">
          <div className="auth-panel__back">
            <Link to="/" className="auth-back-link">
              ← Back to home
            </Link>
          </div>

          <div className="auth-branding">
            <span className="branding-pill">SmartBuys AI</span>
            <h1>Re-enter your autonomous sales workspace</h1>
            <p>
              Drive every conversation with AI-generated insights, personalized
              follow-ups, and end-to-end automations.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Work email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@smartbuys.ai"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error ? <p className="auth-error">{error}</p> : null}

            <button
              type="submit"
              className="btn btn--primary btn--lg auth-submit"
              disabled={loading}
            >
              {loading ? "Authenticating…" : "Sign in"}
            </button>
          </form>

          <div className="auth-meta">
            <Link to="/forgot-password">Forgot password?</Link>
            <span>
              New vendor?{" "}
              <Link to="/register">Create a SmartBuys AI account</Link>
            </span>
          </div>
        </div>
      </div>

      <aside className="auth-showcase glass-panel">
        <div className="auth-showcase__badge">AI Ops feed</div>
        <p className="auth-showcase__quote">
          “SmartBuys AI flagged an upsell opportunity with Shoes Limited.
          Prepared the pricing brief and queued an executive follow-up.”
        </p>
        <div className="auth-showcase__meta">
          <span>Confidence</span>
          <span className="auth-showcase__confidence">High</span>
        </div>
        <div className="auth-showcase__timeline">
          <div className="auth-showcase__event">
            <span className="auth-showcase__dot" />
            <div>
              <h4>Intent spike detected</h4>
              <p>Website visits +34% week over week</p>
            </div>
          </div>
          <div className="auth-showcase__event">
            <span className="auth-showcase__dot" />
            <div>
              <h4>AI drafted follow-up</h4>
              <p>Sent to Martina for review</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Login;
