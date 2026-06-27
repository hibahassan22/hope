import { useAuthContext } from "../lib/AuthContext";
import { useLocation, Navigate } from "react-router-dom";
import { canAccess } from "../lib/roles";

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, user } = useAuthContext();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f5f0e8]" dir="rtl">
        <div className="w-14 h-14 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-medium">جاري تحميل النظام...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  const role = user?.role ?? "admin";
  if (!canAccess(role, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
