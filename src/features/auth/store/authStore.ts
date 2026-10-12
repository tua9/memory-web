import { create } from 'zustand';
import { setSessionHandlers } from '@/lib/api-client';
import { authApi } from '@/features/auth/api/auth.api';
import type { User } from '@/types/auth.types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hydrate: () => Promise<void>;
    saveSession: (user: User) => void;
    updateUser: (changes: Partial<User>) => void;
    clearSession: () => void;
    logout: () => Promise<void>;
}

// Token nằm trong cookie httpOnly nên frontend không đọc được; store chỉ giữ thông tin user.
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    // Khôi phục phiên khi tải trang: gọi refresh để lấy access token mới và userInfo từ cookie.
    hydrate: async () => {
        try {
            const user = await authApi.refreshToken();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    saveSession: (user) => {
        set({ user, isAuthenticated: true, isLoading: false });
    },

    updateUser: (changes) => {
        set((state) => (state.user ? { user: { ...state.user, ...changes } } : {}));
    },

    clearSession: () => {
        set({ user: null, isAuthenticated: false, isLoading: false });
    },

    // Gọi backend để thu hồi session và xóa cookie; dù lỗi vẫn đăng xuất phía client.
    logout: async () => {
        try {
            await authApi.logout();
        } catch {
            // Bỏ qua: cookie có thể đã hết hạn hoặc mất kết nối
        } finally {
            useAuthStore.getState().clearSession();
        }
    },
}));

setSessionHandlers({
    onRefreshed: (user) => useAuthStore.getState().saveSession(user),
    onExpired: () => useAuthStore.getState().clearSession(),
});
