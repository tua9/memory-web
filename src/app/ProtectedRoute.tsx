import { useAuthStore } from "@/features/auth/store/authStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8fbf8]">Đang tải...</div>;
    }

    if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
    return user?.role === 'parent' ? <Navigate to={user.isEmailVerified ? '/parent' : '/parent/pending'} replace /> : <Outlet />;
};
