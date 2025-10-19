import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const showStyleguide =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_STYLEGUIDE === "true";

  useEffect(() => {
    setAuthed(isAuthenticated());
    const onAuth = (e: Event) => {
      setAuthed(isAuthenticated());
    };
    window.addEventListener("auth:change", onAuth as any);
    return () => window.removeEventListener("auth:change", onAuth as any);
  }, []);

  return (
    <div className="app-shell">
      <header className="nav">
        <div className="nav__brand">Smart Business AI</div>
        <nav className="nav__links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          {showStyleguide && <Link to="/styleguide">Styleguide</Link>}
          {!authed ? (
            <>
              <Link to="/login" className="btn">
                Login
              </Link>
              <Link to="/register" className="btn btn--primary">
                Create account
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                logout();
                setAuthed(false);
              }}
              className="btn btn--ghost"
            >
              Logout
            </button>
          )}
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
