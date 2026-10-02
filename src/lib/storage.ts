const ACCESS_TOKEN_KEY = 'memio_access_token';
const REFRESH_TOKEN_KEY = 'memio_refresh_token';

export const storage = {
    // Lấy Access Token
    getAccessToken: (): string | null => {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    // Lấy Refresh Token
    getRefreshToken: (): string | null => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    // Lưu cả 2 Token sau khi Đăng nhập/Refresh thành công
    setTokens: (accessToken: string, refreshToken: string): void => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    // Xóa Token khi Logout hoặc phiên làm việc hết hạn
    clearTokens: (): void => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};
