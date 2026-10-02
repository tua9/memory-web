import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/lib/storage';
import type { ApiErrorResponse } from '@/types/auth.types';

// Tạo axios instance với baseURL lấy từ file .env.local
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Tự động gắn Access Token vào header của mọi request
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = storage.getAccessToken();
        if (token && config.headers) {
            // Sử dụng hàm set chuẩn của AxiosHeaders
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý response & chuẩn hóa lỗi từ backend
apiClient.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError<ApiErrorResponse>) => {
        if (error.response && error.response.data) {
            const customError: ApiErrorResponse = {
                code: error.response.data.code || 'UNKNOWN_ERROR',
                message: error.response.data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
                status: error.response.status,
            };
            return Promise.reject(customError);
        }

        const networkError: ApiErrorResponse = {
            code: 'ERR_NETWORK',
            message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.',
            status: 0,
        };
        return Promise.reject(networkError);
    }
);
