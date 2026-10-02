import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { storage } from '@/lib/storage';
import type { User } from '@/types/auth.types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    saveSession: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Khi ứng dụng khởi chạy (F5 lại trang), tự kiểm tra Token trong LocalStorage
    useEffect(() => {
        const savedToken = storage.getAccessToken();
        if (savedToken) {
            setToken(savedToken);
            // Giả lập khôi phục user từ token (hoặc lưu user object vào storage)
            const savedUser = localStorage.getItem('memio_user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch {
                    setUser(null);
                }
            }
        }
        setIsLoading(false);
    }, []);

    // Hàm lưu phiên làm việc sau khi Đăng nhập thành công
    const saveSession = (userData: User, accessToken: string, refreshToken: string) => {
        setUser(userData);
        setToken(accessToken);
        storage.setTokens(accessToken, refreshToken);
        localStorage.setItem('memio_user', JSON.stringify(userData));
    };

    // Hàm Đăng xuất
    const logout = () => {
        setUser(null);
        setToken(null);
        storage.clearTokens();
        localStorage.removeItem('memio_user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isLoading,
                saveSession,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook để các component sử dụng AuthContext dễ dàng
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
    }
    return context;
};
