import { apiClient } from '@/lib/api-client';
import type {
    RegisterRequest,
    LoginRequest,
    AuthSuccessResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    MessageResponse,
} from '@/types/auth.types';

export const authApi = {
    // AUTH-01: Đăng ký
    register: (
        data: RegisterRequest
    ): Promise<MessageResponse> => {
        return apiClient.post(
            '/auth/register',
            data
        ) as unknown as Promise<MessageResponse>;
    },

    // AUTH-02: Đăng nhập
    login: (
        data: LoginRequest
    ): Promise<AuthSuccessResponse> => {
        return apiClient.post(
            '/auth/login',
            data
        ) as unknown as Promise<AuthSuccessResponse>;
    },

    // AUTH-03: Refresh Token
    refreshToken: (
        data: RefreshTokenRequest
    ): Promise<RefreshTokenResponse> => {
        return apiClient.post(
            '/auth/refresh',
            data
        ) as unknown as Promise<RefreshTokenResponse>;
    },

    // AUTH-04: Logout
    logout: (): Promise<MessageResponse> => {
        return apiClient.post(
            '/auth/logout'
        ) as unknown as Promise<MessageResponse>;
    },
};
