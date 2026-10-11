import { useAuthStore } from "@/features/auth/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

export const PublicOnlyRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore();
    

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8fbf8]">Đang tải...</div>;
    }

    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};