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
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden btn btn--ghost"
        >
          {/* Hamburger / X icon toggle */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {menuOpen ? (
              <g>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </g>
            ) : (
              <g>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </g>
            )}
          </svg>
          <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
        </button>
      </header>
      {/* Mobile nav panel (always rendered for smooth animation) */}
      <nav
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`md:hidden slide-panel ${
          menuOpen ? "slide-panel--open" : "slide-panel--closed"
        }`}
      >
        <div className="px-4 pb-3 flex flex-col gap-2">
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
        </div>
      </nav>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
