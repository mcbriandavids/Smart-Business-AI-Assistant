import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as storeToken } from "../utils/auth";

type ApiResponse = {
  token?: string;
  message?: string;
};

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Please enter your name";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Enter a valid email";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirm) return "Passwords do not match";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || "Registration failed");
      }
      const data = (await res.json()) as ApiResponse;
      if (data?.token) {
        storeToken(data.token);
        nav("/dashboard", { replace: true });
      } else {
        nav({ pathname: "/login" }, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Registration error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth">
      <form className="card auth__form" onSubmit={onSubmit}>
        <h2>Create your account</h2>
        {error && <div className="alert alert--danger">{error}</div>}
        <label>
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </label>
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
        <label>
          <span>Confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
        <div style={{ marginTop: 10 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </section>
  );
}

async function safeMessage(res: Response) {
  try {
    const data = (await res.clone().json()) as any;
    return data?.message;
  } catch {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
}
