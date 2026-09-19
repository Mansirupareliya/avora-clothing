import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../Context/AdminAuthContext";
import { ADMIN_BASE } from "../adminConfig";

export default function ProtectedAdminRoute() {
  const { isAdmin } = useAdminAuth();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to={`${ADMIN_BASE}/login`} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
