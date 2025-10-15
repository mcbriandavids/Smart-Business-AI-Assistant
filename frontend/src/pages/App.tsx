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
        <Outlet />
      </main>
    </div>
  );
}
