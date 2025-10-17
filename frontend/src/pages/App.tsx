import { Link, Outlet } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

export default function App() {
  const authed = isAuthenticated();
  return (
    <div className="app-shell">
      <header className="nav">
        <div className="nav__brand">Smart Business AI</div>
        <nav className="nav__links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/styleguide">Styleguide</Link>
          {!authed ? (
            <Link to="/login" className="btn btn--primary">
              Login
            </Link>
          ) : (
            <button onClick={logout} className="btn btn--ghost">
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
import { Outlet, Link } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

export default function App() {
  return (
    <div className="app">
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/dashboard">Dashboard</Link>
          {isAuthenticated() && (
            <button onClick={logout} style={{ marginLeft: 8 }}>
              Logout
            </button>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
