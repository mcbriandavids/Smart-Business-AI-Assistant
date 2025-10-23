<<<<<<< HEAD
import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="app">
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <main>
=======
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Show the styleguide link in development only (adjust to your needs)
  const showStyleguide = process.env.NODE_ENV === "development";

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Keep auth state in sync when component mounts (or when auth changes externally)
  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  return (
    <div className="app-shell">
      {/* Hide header/nav when modal (menuOpen) is open to prevent nav links from showing above overlay */}
      {/* Hide header/nav when modal is open to prevent background links from showing */}
      {!menuOpen && (
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
        </header>
      )}
      {/* Only show mobile modal on small screens */}
      {menuOpen && (
        <div className="modal-overlay-blur flex lg:hidden">
          <div className="modal-centered-panel">
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="modal-close-btn text-white text-2xl font-bold focus:outline-none"
              style={{ background: "none", border: "none" }}
            >
              &times;
            </button>
            <nav
              id="mobile-menu"
              aria-hidden={!menuOpen}
              className="flex flex-col items-center gap-10 w-full"
            >
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-extrabold text-white text-center w-full"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-extrabold text-white text-center w-full"
              >
                Dashboard
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="modal-login-link mx-auto"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Floating menu button for mobile */}
      {/* Hamburger menu only visible on mobile (xs/sm) */}
      <button
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen((v) => !v)}
        className="mobile-fab"
        ref={menuButtonRef}
      >
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

      {/* Remove duplicate modal for all screens */}

      <main className="page">
>>>>>>> frontend
        <Outlet />
      </main>
    </div>
  );
}
