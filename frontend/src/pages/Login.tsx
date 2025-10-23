import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login as storeToken } from "../utils/auth";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      const token = data?.data?.token ?? data?.token;
      if (!token) throw new Error("No token returned");
      storeToken(token);
      const to = location.state?.from?.pathname || "/";
      nav(to, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Login error");
    }
  }

  return (
    <section className="auth">
      <form className="card auth__form" onSubmit={onSubmit}>
        <h2>Welcome back</h2>
        {error && <div className="alert alert--danger">{error}</div>}
        <label>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button className="btn btn--primary" type="submit">
          Sign in
        </button>
        <div style={{ marginTop: 10 }}>
          New here? <Link to="/register">Create an account</Link>
        </div>
      </form>
    </section>
  );
}
