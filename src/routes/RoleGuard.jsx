import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";
import { hasWildcard } from "../lib/roles.js";

/**
 * Restricts content to specific roles or permission keys.
 * allowedRoles: ["admin"]
 * allowedPermissions: ["Users.Create"]
 */
export default function RoleGuard({
  children,
  allowedRoles = [],
  allowedPermissions = [],
  fallback = "/dashboard",
}) {
  const { isLoaded, isSignedIn, user, permissions } = useAuthContext();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <div className="w-10 h-10 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isSignedIn) return <Navigate to="/login" replace />;

  if (hasWildcard(permissions)) return children;

  const roleOk = !allowedRoles.length || allowedRoles.includes(user?.role);
  const permOk =
    !allowedPermissions.length ||
    allowedPermissions.some((p) => permissions.includes(p));

  if (roleOk && permOk) return children;
  return <Navigate to={fallback} replace />;
}
