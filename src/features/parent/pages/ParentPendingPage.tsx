import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/authStore';

export const ParentPendingPage = () => {
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const saveSession = useAuthStore((state) => state.saveSession);
    const check = async () => {
        try { const user = await authApi.refreshToken(); saveSession(user); if (user.isEmailVerified) navigate('/parent', { replace: true }); else setMessage('Email vẫn chưa được xác minh.'); }
        catch { setMessage('Không kiểm tra được trạng thái. Vui lòng thử lại.'); }
    };
    return <><Header /><main className="page-col py-12"><section className="panel mx-auto max-w-xl">
    <h1 className="text-2xl font-bold">Chờ xác minh email</h1>
    <p>Ba mẹ hãy mở liên kết trong email để xác minh tài khoản. Nếu chưa nhận được email, hãy đăng nhập tài khoản con trên thiết bị hoặc hồ sơ trình duyệt riêng và chọn gửi lại trong hồ sơ.</p>
    <button className="btn btn--brand" onClick={() => void check()}>Tôi đã xác minh, kiểm tra lại</button>
    {message && <p role="status">{message}</p>}
    <p>Hoặc <Link to="/forgot-password">đặt lại mật khẩu</Link> nếu cần.</p>
    </section></main></>;
};
