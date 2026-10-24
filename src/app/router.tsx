import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import HomePage from '@/features/home/pages/HomePage';
import GameSelectionPage from '@/components/layout/GameSelectionPage';
import { CardsGame } from '@/features/cards-game/components/CardsGame';
import { ImagesGame } from '@/features/images-game/components/ImagesGame';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { ProtectedRoute } from './ProtectedRoute';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import UpdateProfilePage from '@/features/profile/pages/UpdateProfilePage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';



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
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/profile',
                element: <ProfilePage />,
            },
            {
                path: '/profile/update',
                element: <UpdateProfilePage />,
            },
            {
                path: '/dashboard',
                element: <DashboardPage />,
            },
        ],
    },
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
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
