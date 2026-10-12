import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  ApiErrorResponse,
  AuthSuccessResponse,
  User,
} from "@/types/auth.types";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    // Đánh dấu request đã được thử lại sau khi refresh, tránh lặp vô hạn
    _retry?: boolean;
  }
}

// Tạo axios instance với baseURL lấy từ file .env.local
// withCredentials: trình duyệt tự gửi/nhận cookie httpOnly accessToken & refreshToken do backend set
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  withCredentials: true,
  // Không có timeout thì server treo sẽ làm hydrate() chờ mãi và kẹt ở màn "Đang tải..."
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store đăng ký các handler này để api-client không phải import store (tránh vòng import)
interface SessionHandlers {
  onRefreshed: (user: User) => void;
  onExpired: () => void;
}

let sessionHandlers: SessionHandlers | null = null;

export const setSessionHandlers = (handlers: SessionHandlers): void => {
  sessionHandlers = handlers;
};

// Backend xoay vòng refresh token mỗi lần gọi /auth/refresh, nên nhiều request 401 cùng lúc
// phải dùng chung một lần refresh; nếu không, các lần sau sẽ dùng token cũ đã bị thu hồi.
let refreshPromise: Promise<User> | null = null;

export const refreshSession = (): Promise<User> => {
  if (!refreshPromise) {
    refreshPromise = (
      apiClient.post("/auth/refresh") as unknown as Promise<AuthSuccessResponse>
    )
      .then((response) => response.data.userInfo)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const normalizeError = (error: AxiosError<ApiErrorResponse>): ApiErrorResponse => {
  if (error.response) {
    const data = error.response.data;
    return {
      code: data?.code || "UNKNOWN_ERROR",
      message: data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
      status: error.response.status,
      errors: data?.errors,
    };
  }

  return {
    code: "ERR_NETWORK",
    message:
      "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.",
    status: 0,
  };
};

// Các endpoint auth tự xử lý 401 (sai mật khẩu, refresh hết hạn...), không được kích hoạt refresh
const isAuthEndpoint = (url?: string): boolean =>
  !!url && url.replace(/^\/+/, "").startsWith("auth/");

// Response Interceptor: trả về body, tự refresh khi access token hết hạn và chuẩn hóa lỗi
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    // Cookie accessToken hết hạn sẽ bị trình duyệt xóa, khi đó backend trả 401 không kèm
    // code TOKEN_EXPIRED; vì vậy mọi 401 từ API được bảo vệ đều thử refresh một lần.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        const user = await refreshSession();
        sessionHandlers?.onRefreshed(user);
      } catch {
        sessionHandlers?.onExpired();
        return Promise.reject(normalizeError(error));
      }
      return apiClient(originalRequest);
    }

    return Promise.reject(normalizeError(error));
  },
);
