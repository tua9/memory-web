const ACCESS_TOKEN_KEY = 'memio_access_token';
const REFRESH_TOKEN_KEY = 'memio_refresh_token';
const USER_KEY = 'memio_user';

const decodeJwtPayload = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const decoded = atob(padded);
        const json = decodeURIComponent(
            decoded
                .split('')
                .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
};

export const isAccessTokenExpired = (token: string | null): boolean => {
    if (!token) return true;

    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const payload = decodeJwtPayload(cleanToken);

    if (!payload || typeof payload.exp !== 'number') {
        return false;
    }

    return Date.now() >= payload.exp * 1000;
};

export const storage = {
    getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
    getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
    getUser: (): any | null => {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },
    setTokens: (accessToken: string, refreshToken: string): void => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },
    setUser: (user: unknown): void => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clearSession: (): void => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
