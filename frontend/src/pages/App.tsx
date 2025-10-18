import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const showStyleguide =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_STYLEGUIDE === "true";

  useEffect(() => {
    // Optionally, listen for authentication changes here (e.g., via events or polling)
    // For demonstration, we'll just update on mount.
    setAuthed(isAuthenticated());
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
