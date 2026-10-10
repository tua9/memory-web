import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/features/auth/store/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import { authApi } from '../api/auth.api';
import type { ApiErrorResponse } from '@/types/auth.types';

export const LoginForm = (): ReactElement => {
    const navigate = useNavigate();
    const { saveSession } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: true,
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setServerError(null);
            const response = await authApi.login({
                email: data.email,
                password: data.password,
            });


            saveSession(response.data.userInfo, response.data.accessToken, response.data.refreshToken);
            navigate('/', { replace: true });
        } catch (err) {
            const error = err as ApiErrorResponse;
            if (error.code === 'INVALID_CREDENTIALS') {
                setServerError('Email hoặc mật khẩu không chính xác.');
            } else if (error.code === 'ACCOUNT_LOCKED') {
                setServerError('Tài khoản của bạn đã bị khóa.');
            } else {
                setServerError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="w-full max-w-[500px] bg-white rounded-[28px] border border-[#e3ebe6] p-8 sm:p-[44px] shadow-[0px_8px_24px_rgba(31,77,51,0.08)] shrink-0">
            <div className="mb-6">
                <h1 className="text-[28px] font-bold text-[#1f2937] tracking-tight">
                    Chào mừng bạn trở lại!
                </h1>
                <p className="mt-1.5 text-[14px] text-[#667085]">
                    Đăng nhập để tiếp tục học và luyện tập cùng Memio.
                </p>
            </div>

            {serverError && (
                <div className="mb-4 rounded-[10px] bg-[#fff1f0] border border-[#ffa39e] p-3.5 text-[13px] text-[#b42318]">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-[#1f2937]">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        className={`h-[52px] w-full rounded-[14px] border px-4 text-[14px] outline-none transition-all placeholder:text-[#98a2b3] bg-white ${errors.email
                            ? 'border-[#b42318] focus:ring-1 focus:ring-[#b42318]'
                            : 'border-[#e3ebe6] focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32]'
                            }`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-[12px] text-[#b42318]">{errors.email.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-[#1f2937]">
                        Mật khẩu
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('password')}
                            className={`h-[52px] w-full rounded-[14px] border px-4 pr-12 text-[14px] outline-none transition-all placeholder:text-[#98a2b3] bg-white ${errors.password
                                ? 'border-[#b42318] focus:ring-1 focus:ring-[#b42318]'
                                : 'border-[#e3ebe6] focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32]'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#2e7d32] cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-[12px] text-[#b42318]">{errors.password.message}</p>
                    )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#667085]">
                        <input
                            type="checkbox"
                            {...register('rememberMe')}
                            className="h-4 w-4 rounded border-[#e3ebe6] accent-[#2e7d32]"
                        />
                        Duy trì đăng nhập trên thiết bị này
                    </label>
                    <a href="#forgot-password" className="text-[13px] font-semibold text-[#2e7d32] hover:underline">
                        Quên mật khẩu?
                    </a>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2e7d32] text-[15px] font-semibold text-white transition-colors hover:bg-[#236527] disabled:opacity-60 cursor-pointer"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Đang đăng nhập...
                        </span>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-[#e3ebe6]" />
                <span className="text-[12px] text-[#667085]">hoặc</span>
                <div className="h-px flex-1 bg-[#e3ebe6]" />
            </div>

            {/* Google Login Button */}
            <button
                type="button"
                className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[14px] border border-[#e3ebe6] bg-white text-[14px] font-semibold text-[#1f2937] transition-colors hover:bg-[#f8faf9] cursor-pointer"
            >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ddf2e4] text-[12px] font-bold text-[#2e7d32]">
                    G
                </span>
                Tiếp tục với Google
            </button>

            {/* Register Link */}
            <div className="mt-6 text-center text-[13px]">
                <span className="text-[#667085]">Chưa có tài khoản? </span>
                <a href="/register" className="font-semibold text-[#2e7d32] hover:underline">
                    Đăng ký
                </a>
            </div>

            {/* Footer Quote */}
            <p className="mt-8 text-center text-[12px] text-[#667085]">
                Không cần nhớ nhiều. Chỉ cần bắt đầu.
            </p>
        </div>
    );
};

export const LoginFormSection = LoginForm;
