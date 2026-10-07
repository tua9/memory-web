// Model thông tin người dùng
export interface User {
    id: string;
    email: string;
    username: string;
    total_xp: number;
    current_level: number;
}

// Payload gửi lên API AUTH-01 Đăng ký
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// Payload gửi lên API AUTH-02 Đăng nhập
export interface LoginRequest {
    email: string;
    password: string;
}

// Response nhận về khi AUTH-02 Đăng nhập thành công
export interface AuthSuccessResponse {
    user: User;
    token: string;          // Access Token
    refresh_token: string;  // Refresh Token
}

// Payload và Response cho AUTH-03 Refresh Token
export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface RefreshTokenResponse {
    token: string;
    refresh_token: string;
}

// Generic Response cho các endpoint trả về message (AUTH-04, AUTH-05, AUTH-06)
export interface MessageResponse {
    message: string;
}

// Định dạng Lỗi chung từ Backend
export interface ApiErrorResponse {
    code: string;           // Ví dụ: 'INVALID_CREDENTIALS', 'ACCOUNT_LOCKED'
    message: string;        // Thông báo lỗi tiếng Việt từ backend
    status?: number;        // HTTP Status Code (401, 403, 400, 500,...)
}
