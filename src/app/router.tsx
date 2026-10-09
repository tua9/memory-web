import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import HomePage from '@/features/home/pages/HomePage';
import GameSelectionPage from '@/features/cards-game/pages/GameSelectionPage';
import { CardsGame } from '@/features/cards-game/components/CardsGame';
import { ImagesGame } from '@/features/images-game/components/ImagesGame';


// Route Công khai: Nếu đã login -> Đẩy thẳng về trang Home (/)
const PublicOnlyRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore();

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
    {
        path: '/games',
        element: <GameSelectionPage />,
    },
    {
        path: '/games/cards',
        element: <CardsGame />,
    },
    {
        path: '/games/images',
        element: <ImagesGame />,
    },
    // Route chỉ dành cho khách chưa login
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: '/login',
                element: <LoginPage />,
            },
            {
                path: '/register',
                element: <RegisterPage />,
            },
        ],
    },
    // Mọi route không tồn tại tự về trang Home
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
