import { useAuthStore } from '@/features/auth/store/authStore';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const FamilyRoomRoute = () => {
    const { user, isLoading } = useAuthStore();
    const location = useLocation();
    if (isLoading) return <div className="min-h-svh" aria-busy="true" />;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    if (user.role === 'parent' && !user.isEmailVerified) return <Navigate to="/parent/pending" replace />;
    return <Outlet />;
};
