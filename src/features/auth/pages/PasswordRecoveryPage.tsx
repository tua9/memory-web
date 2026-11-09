import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';

export const PasswordRecoveryPage = ({ parent = false, reset = false }: { parent?: boolean; reset?: boolean }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [state, setState] = useState<'idle' | 'checking' | 'valid' | 'sent' | 'done' | 'invalid'>('idle');
    const [error, setError] = useState<string | null>(null);
    const token = reset ? new URLSearchParams(window.location.hash.slice(1)).get('token') : null;
    const base = parent ? '/parent/password-reset' : '/password-reset';
    useEffect(() => {
        if (!reset) return;
        if (!token) { setState('invalid'); return; }
        setState('checking');
        void apiClient.post(`${base}/validate`, { token }).then(() => setState('valid')).catch(() => setState('invalid'));
    }, [reset, token, base]);
    const submit = async (event: React.FormEvent) => {
        event.preventDefault(); setError(null);
        try {
            if (reset) {
                await apiClient.post(`${base}/confirm`, { token, newPassword: password, confirmPassword });
                window.history.replaceState(null, '', window.location.pathname);
                setState('done');
            } else {
                // Both endpoints use the same generic response; the account type is resolved on the server.
                await Promise.all([apiClient.post('/password-reset/forgot', { email }), apiClient.post('/parent/password-reset/forgot', { email })]);
                setState('sent');
            }
        } catch (cause) { setError((cause as { message?: string }).message ?? 'Không thể xử lý yêu cầu.'); }
    };
    return <><Header /><main className="page-col py-12"><section className="panel mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">{reset ? 'Đặt lại mật khẩu' : 'Quên mật khẩu'}</h1>
        {state === 'checking' && <p>Đang kiểm tra liên kết...</p>}
        {state === 'invalid' && <p role="alert">Liên kết không hợp lệ, đã hết hạn hoặc đã dùng. <Link to="/forgot-password">Yêu cầu liên kết mới</Link>.</p>}
        {state === 'sent' && <p>Nếu email có tài khoản, hướng dẫn đặt lại mật khẩu sẽ được gửi tới hộp thư.</p>}
        {state === 'done' && <p>Mật khẩu đã đổi. <Link to="/login">Đăng nhập lại</Link>.</p>}
        {(state === 'idle' || state === 'valid') && <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
            {reset ? <><label>Mật khẩu mới<input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="w-full rounded-ui border p-3" /></label><label>Xác nhận mật khẩu<input type="password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" className="w-full rounded-ui border p-3" /></label></>
                : <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="w-full rounded-ui border p-3" /></label>}
            <button className="btn btn--brand">{reset ? 'Đặt mật khẩu mới' : 'Gửi hướng dẫn'}</button>
        </form>}
        {error && <p role="alert">{error}</p>}
    </section></main></>;
};
