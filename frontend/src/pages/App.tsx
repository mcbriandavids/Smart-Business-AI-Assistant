import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const showStyleguide =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_STYLEGUIDE === "true";

  useEffect(() => {
    // Optionally, listen for authentication changes here (e.g., via events or polling)
    // For demonstration, we'll just update on mount.
    setAuthed(isAuthenticated());
  }, []);

  // Close the mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Manage focus when menu opens/closes and trap focus within the panel
  useEffect(() => {
    const btn = menuButtonRef.current;
    const panel = panelRef.current;

    if (menuOpen) {
      // Focus the first focusable element inside the panel
      const focusables = panel?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusables && focusables[0];
      (first || panel)?.focus?.();

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setMenuOpen(false);
          btn?.focus?.();
          return;
        }
        if (e.key === "Tab") {
          const items = panel?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (!items || items.length === 0) return;
          const firstEl = items[0];
          const lastEl = items[items.length - 1];
          const active = document.activeElement as HTMLElement | null;
          if (e.shiftKey && active === firstEl) {
            e.preventDefault();
            lastEl.focus();
          } else if (!e.shiftKey && active === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    } else {
      // Return focus to the toggle button when closing
      btn?.focus?.();
    }
  }, [menuOpen]);

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
          ref={menuButtonRef}
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
      {/* Mobile overlay to dismiss menu */}
      {menuOpen && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          className="mobile-overlay md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {/* Mobile nav panel (always rendered for smooth animation) */}
      <nav
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`md:hidden slide-panel ${
          menuOpen ? "slide-panel--open" : "slide-panel--closed"
        }`}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          className="px-4 pb-3 flex flex-col gap-2 slide-panel__content"
          role="menu"
        >
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
