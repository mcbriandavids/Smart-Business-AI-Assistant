import { useState } from "react";
import { api } from "@/api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign in</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
  );
}
