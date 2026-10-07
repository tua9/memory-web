import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import LoginPage from '@/features/auth/pages/LoginPage';
import HomePage from '@/features/home/pages/HomePage';

// Route Công khai: Nếu đã login -> Đẩy thẳng về trang Home (/)
const PublicOnlyRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8fbf8]">Đang tải...</div>;
    }

    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    // Route chỉ dành cho khách chưa login
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: '/login',
                element: <LoginPage />,
            },
        ],
    },
    // Mọi route không tồn tại tự về trang Home
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
