import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [menuOpen, setMenuOpen] = useState(false);
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
        {/* Desktop nav */}
        <nav className="nav__links hidden md:flex">
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
        {/* Mobile menu button */}
        <button
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden btn btn--ghost"
        >
          Menu
        </button>
      </header>
      {/* Mobile nav panel */}
      {menuOpen && (
        <nav className="md:hidden px-4 pb-3 flex flex-col gap-2">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          {showStyleguide && (
            <Link to="/styleguide" onClick={() => setMenuOpen(false)}>
              Styleguide
            </Link>
          )}
          {!authed ? (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="btn btn--primary"
              >
                Create account
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                logout();
                setAuthed(false);
                setMenuOpen(false);
              }}
              className="btn btn--ghost"
            >
              Logout
            </button>
          )}
        </nav>
      )}
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
