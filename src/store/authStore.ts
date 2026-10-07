import { create } from 'zustand';
import { storage } from '@/lib/storage';
import type { User } from '@/types/auth.types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hydrate: () => void;
    saveSession: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    hydrate: () => {
        const savedToken = storage.getAccessToken();
        const savedUser = localStorage.getItem('memio_user');

        if (savedToken) {
            let user: User | null = null;

            if (savedUser) {
                try {
                    user = JSON.parse(savedUser) as User;
                } catch {
                    user = null;
                }
            }

            set({
                user,
                token: savedToken,
                isAuthenticated: true,
                isLoading: false,
            });
            return;
        }

        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },
    saveSession: (user, token, refreshToken) => {
        storage.setTokens(token, refreshToken);
        localStorage.setItem('memio_user', JSON.stringify(user));

        set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
        });
    },
    logout: () => {
        storage.clearTokens();
        localStorage.removeItem('memio_user');

        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },
}));
