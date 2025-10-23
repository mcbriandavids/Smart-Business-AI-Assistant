import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function Home() {
  const [authed, setAuthed] = useState(isAuthenticated());
  useEffect(() => {
    // Update auth state on mount (and could subscribe to changes if available)
    setAuthed(isAuthenticated());
  }, []);

  return (
    <section className="hero">
      {/* Decorative animated blobs */}
      <div className="blob" aria-hidden="true" />
      <div className="blob blob--2" aria-hidden="true" />
      <div className="blob blob--3" aria-hidden="true" />
      <div className="blob blob--4" aria-hidden="true" />
      <div className="blob blob--5" aria-hidden="true" />
      <div className="hero__content">
        <h1>Operate brilliantly.</h1>
        <p>AI that helps small businesses sell, fulfill, and grow.</p>
        <div style={{ marginTop: 16 }}>
          {!authed ? (
            <Link to="/login" className="btn btn--primary">
              Log in
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn--primary">
              Open dashboard
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
