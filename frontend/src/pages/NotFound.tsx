<<<<<<< HEAD
export default function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>Page not found.</p>
=======
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="nf">
      <h1>404</h1>
      <p>We couldn’t find that page.</p>
      <Link className="btn btn--ghost" to="/">
        Go home
      </Link>
>>>>>>> frontend
    </section>
  );
}
