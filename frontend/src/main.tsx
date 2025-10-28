import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./pages/App";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
// cspell:ignore Styleguide
// Lazy-load Styleguide and register it conditionally
const Styleguide = lazy(() => import("./pages/Styleguide"));
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import "./styles.css";

const SHOW_STYLEGUIDE =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_STYLEGUIDE === "true";

const routes: any[] = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "dashboard", element: <Dashboard /> }],
      },
      {
        element: <ProtectedAdminRoute />,
        children: [{ path: "admin", element: <AdminDashboard /> }],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];

if (SHOW_STYLEGUIDE) {
  (routes[0].children as any[]).splice(3, 0, {
    path: "styleguide",
    element: <Styleguide />,
  });
}

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
