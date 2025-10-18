import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="nf">
      <h1>404</h1>
      <p>We couldn’t find that page.</p>
      <Link className="btn btn--ghost" to="/">
        Go home
      </Link>
    </section>
  );
}
