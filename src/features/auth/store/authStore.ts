import { create } from 'zustand';
import { isAccessTokenExpired, storage } from '@/lib/storage';
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
        console.log('Hydrating auth store...');

        const savedToken = storage.getAccessToken();
        const savedUser = storage.getUser();

        if (savedToken && savedUser && !isAccessTokenExpired(savedToken)) {
            set({
                user: savedUser as User,
                token: savedToken,
                isAuthenticated: true,
                isLoading: false,
            });
            return;
        }

        storage.clearSession();
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    saveSession: (userInfo, accessToken, refreshToken) => {
        storage.setTokens(accessToken, refreshToken);
        storage.setUser(userInfo);

        console.log('Session saved:', {
            user: userInfo,
            accessToken,
            refreshToken,
        });

        console.log(storage.getAccessToken(), storage.getRefreshToken(), storage.getUser());
        set({
            user: userInfo,
            token: accessToken,
            isAuthenticated: !isAccessTokenExpired(accessToken),
            isLoading: false,
        });
    },

    logout: () => {
        storage.clearSession();

        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },
}));
