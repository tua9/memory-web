import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { authApi } from '../api/auth.api';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schema';
import type { ApiErrorResponse } from '@/types/auth.types';

export const RegisterForm = (): ReactElement => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setServerError(null);
            await authApi.register({
                username: data.username,
                email: data.email,
                password: data.password,
            });

            setIsSuccess(true);
        } catch (err) {
            const error = err as ApiErrorResponse;
            if (error.code === 'EMAIL_ALREADY_EXISTS') {
                setServerError('Email này đã được sử dụng. Vui lòng thử email khác.');
            } else if (error.code === 'USERNAME_ALREADY_EXISTS') {
                setServerError('Tên người dùng này đã tồn tại. Vui lòng chọn tên khác.');
            } else {
                setServerError(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        }
    };

    if (isSuccess) {
        return (
            <div className="w-full max-w-[500px] bg-white rounded-[28px] border border-[#e3ebe6] p-8 sm:p-[44px] shadow-[0px_8px_24px_rgba(31,77,51,0.08)] shrink-0">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf8ef] text-2xl text-[#2e7d32]">
                        ✓
                    </div>
                    <h1 className="text-[28px] font-bold text-[#1f2937] tracking-tight">
                        Đăng ký thành công!
                    </h1>
                    <p className="mt-2 text-[14px] text-[#667085]">
                        Tài khoản của bạn đã được tạo. Hãy đăng nhập để bắt đầu học tập ngay.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2e7d32] text-[15px] font-semibold text-white transition-colors hover:bg-[#236527] cursor-pointer"
                >
                    Đi đến trang đăng nhập
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[500px] bg-white rounded-[28px] border border-[#e3ebe6] p-8 sm:p-[44px] shadow-[0px_8px_24px_rgba(31,77,51,0.08)] shrink-0">
            <div className="mb-6">
                <h1 className="text-[28px] font-bold text-[#1f2937] tracking-tight">
                    Tạo tài khoản mới
                </h1>
                <p className="mt-1.5 text-[14px] text-[#667085]">
                    Bắt đầu hành trình học tập với Memio ngay hôm nay.
                </p>
            </div>

            {serverError && (
                <div className="mb-4 rounded-[10px] bg-[#fff1f0] border border-[#ffa39e] p-3.5 text-[13px] text-[#b42318]">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                    <label htmlFor="username" className="mb-1.5 block text-[13px] font-semibold text-[#1f2937]">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Nhập username"
                        {...register('username')}
                        className={`h-[52px] w-full rounded-[14px] border px-4 text-[14px] outline-none transition-all placeholder:text-[#98a2b3] bg-white ${errors.username
                            ? 'border-[#b42318] focus:ring-1 focus:ring-[#b42318]'
                            : 'border-[#e3ebe6] focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32]'
                            }`}
                    />
                    {errors.username && (
                        <p className="mt-1 text-[12px] text-[#b42318]">{errors.username.message}</p>
                    )}
                </div>

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

                <div>
                    <label htmlFor="confirmPassword" className="mb-1.5 block text-[13px] font-semibold text-[#1f2937]">
                        Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                            className={`h-[52px] w-full rounded-[14px] border px-4 pr-12 text-[14px] outline-none transition-all placeholder:text-[#98a2b3] bg-white ${errors.confirmPassword
                                ? 'border-[#b42318] focus:ring-1 focus:ring-[#b42318]'
                                : 'border-[#e3ebe6] focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32]'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#2e7d32] cursor-pointer"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-[12px] text-[#b42318]">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2e7d32] text-[15px] font-semibold text-white transition-colors hover:bg-[#236527] disabled:opacity-60 cursor-pointer"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Đang tạo tài khoản...
                        </span>
                    ) : (
                        'Đăng ký'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-[13px]">
                <span className="text-[#667085]">Đã có tài khoản? </span>
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-semibold text-[#2e7d32] hover:underline cursor-pointer"
                >
                    Đăng nhập
                </button>
            </div>

            <p className="mt-8 text-center text-[12px] text-[#667085]">
                Không cần nhớ nhiều. Chỉ cần bắt đầu.
            </p>
        </div>
    );
};

export const RegisterFormSection = RegisterForm;
