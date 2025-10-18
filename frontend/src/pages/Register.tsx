import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as storeToken } from "../utils/auth";

// Strong password: min 8 chars, includes upper, lower, number, special
const STRONG_PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
  };
};

export default function Register() {
  const nav = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (firstName.trim().length < 2)
      return "First name must be at least 2 characters";
    if (lastName.trim().length < 2)
      return "Last name must be at least 2 characters";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Enter a valid email";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15)
      return "Enter a valid phone number";
    if (!STRONG_PASSWORD_PATTERN.test(password))
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
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
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || "Registration failed");
      }
      const data = (await res.json()) as ApiResponse;
      const token = data?.data?.token;
      if (token) {
        storeToken(token);
        nav("/dashboard", { replace: true });
      } else {
        // If backend doesn't return token on register, go to login
        nav("/login", { replace: true });
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
        <div
          className="grid"
          style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
        >
          <label>
            <span>First name</span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
            />
          </label>
          <label>
            <span>Last name</span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </label>
        </div>
        <label>
          <span>Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
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
