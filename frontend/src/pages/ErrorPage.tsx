import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as any;
  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p>{message}</p>
      {import.meta.env.MODE !== "production" &&
        (error?.stack || error?.data) && (
          <pre
            style={{
              background: "#10162f",
              color: "#e8ecff",
              padding: 12,
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
            {error?.stack || JSON.stringify(error?.data, null, 2)}
          </pre>
        )}
      <Link
        to="/"
        className="btn"
        style={{ display: "inline-block", marginTop: 12 }}
      >
        Go home
      </Link>
    </div>
  );
}
