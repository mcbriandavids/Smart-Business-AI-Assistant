import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUser } from "../utils/auth";

export default function ProtectedAdminRoute() {
  const location = useLocation();
  const user = getUser();
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
