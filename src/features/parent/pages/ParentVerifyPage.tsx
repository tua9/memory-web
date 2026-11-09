import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/features/auth/store/authStore';
import { parentApi } from '../api/parent.api';

export const ParentVerifyPage = () => {
    const [state, setState] = useState<'loading' | 'valid' | 'invalid' | 'done'>('loading');
    const [error, setError] = useState<string | null>(null);
    const { user, updateUser } = useAuthStore();
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    useEffect(() => {
        if (!token) { setState('invalid'); return; }
        void parentApi.inspect(token).then(() => setState('valid')).catch(() => setState('invalid'));
    }, [token]);
    const confirm = async () => {
        if (!token) return;
        try { await parentApi.verify(token); window.history.replaceState(null, '', window.location.pathname); updateUser({ isEmailVerified: true }); setState('done'); }
        catch (cause) { setError((cause as { message?: string }).message ?? 'Không xác minh được email.'); }
    };
    return <><Header /><main className="page-col py-12"><section className="panel mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">Xác minh email phụ huynh</h1>
        {state === 'loading' && <p>Đang kiểm tra liên kết...</p>}
        {state === 'invalid' && <p role="alert">Liên kết không hợp lệ, đã hết hạn hoặc đã được dùng. Hãy đăng nhập tài khoản con để gửi lại.</p>}
        {state === 'valid' && <div className="flex flex-col gap-4"><p>Chọn xác nhận để kích hoạt quyền xem hoạt động của con.</p><button className="btn btn--brand" onClick={confirm}>Xác nhận email</button></div>}
        {state === 'done' && <p>Email đã được xác minh. {user?.role === 'parent' ? <Link to="/parent">Vào khu vực phụ huynh</Link> : <Link to="/login">Đăng nhập phụ huynh</Link>}</p>}
        {error && <p role="alert">{error}</p>}
    </section></main></>;
};
