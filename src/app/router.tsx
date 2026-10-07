import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import LoginPage from '@/features/auth/pages/LoginPage';
import HomePage from '@/features/home/pages/HomePage';

// Route Bảo vệ: Nếu chưa login -> Đẩy về /login
const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8fbf8]">Đang tải...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Route Công khai: Nếu đã login -> Đẩy thẳng về trang Home (/)
const PublicOnlyRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8fbf8]">Đang tải...</div>;
    }

    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export const router = createBrowserRouter([
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
    // Route yêu cầu phải login thành công mới vào được
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <HomePage />,
            },
        ],
    },
    // Mọi route không tồn tại tự về trang Home
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
