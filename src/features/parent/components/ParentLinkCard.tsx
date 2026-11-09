import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentApi, type ParentLink } from '../api/parent.api';
import { useAuthStore } from '@/features/auth/store/authStore';

export const ParentLinkCard = ({ childName }: { childName: string }) => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const childAvatarUrl = useAuthStore((state) => state.user?.avatarUrl);
    const [link, setLink] = useState<ParentLink | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({ fullname: '', email: '', password: '', confirmPassword: '' });
    useEffect(() => { void parentApi.link().then(setLink).catch((cause: { message?: string }) => setError(cause.message ?? 'Không tải được trạng thái liên kết.')); }, []);
    const register = async (event: React.FormEvent) => {
        event.preventDefault(); setBusy(true); setError(null);
        try { setLink(await parentApi.register(form)); }
        catch (cause) {
            setError((cause as { message?: string }).message ?? 'Không thể đăng ký.');
            // SMTP may fail after the account was saved. Refresh status instead of offering another account.
            try { setLink(await parentApi.link()); } catch { /* retain error */ }
        } finally { setBusy(false); }
    };
    const resend = async () => {
        setBusy(true); setError(null);
        try { await parentApi.resend(); setLink(await parentApi.link()); }
        catch (cause) { setError((cause as { message?: string }).message ?? 'Chưa gửi được email.'); }
        finally { setBusy(false); }
    };
    return <section className="panel span-12" aria-labelledby="parent-link-title">
        <div className="panel__head"><h2 id="parent-link-title">Phụ huynh đồng hành</h2></div>
        {!link && !error && <p>Đang tải trạng thái...</p>}
        {error && <p role="alert">{error}</p>}
        {link?.state === 'verified' && <div className="flex flex-col gap-3"><p>Đã liên kết với {link.fullname}. Ba mẹ nên đăng nhập trên thiết bị hoặc hồ sơ trình duyệt riêng để hai người chơi cùng lúc.</p><button className="btn btn--quiet" type="button" onClick={async () => { try { await logout(); navigate('/login'); } catch (cause) { setError((cause as { message?: string }).message ?? 'Không đăng xuất được.'); } }}>Đăng nhập phụ huynh trên trình duyệt này</button></div>}
        {link?.state === 'pending' && <div className="flex flex-col gap-3">
            <p>Chờ xác minh email {link.maskedEmail}. Vui lòng kiểm tra hộp thư và thư rác.</p>
            <button type="button" className="btn btn--quiet" disabled={busy} onClick={resend}>Gửi lại email xác minh</button>
        </div>}
        {link?.state === 'none' && <div className="flex flex-col gap-4">
            <p>Đăng ký tài khoản phụ huynh cho {childName}. Sau khi xác minh email, ba mẹ được xem hoạt động của tài khoản con này.</p>
            <div className="flex items-center gap-3"><span className="phead__avatar" aria-hidden="true">{childAvatarUrl ? <img src={childAvatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : childName.charAt(0).toUpperCase()}</span><p>Con: <strong>{childName}</strong> (chỉ đọc)</p></div>
            <form onSubmit={register} className="flex max-w-lg flex-col gap-3">
                <label>Họ tên phụ huynh<input className="w-full rounded-ui border p-3" required minLength={2} maxLength={100} autoComplete="name" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} /></label>
                <label>Email phụ huynh<input className="w-full rounded-ui border p-3" required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                <label>Mật khẩu<input className="w-full rounded-ui border p-3" required type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
                <label>Xác nhận mật khẩu<input className="w-full rounded-ui border p-3" required type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></label>
                <button className="btn btn--brand" disabled={busy}>{busy ? 'Đang xử lý...' : 'Đăng ký tài khoản phụ huynh'}</button>
            </form>
        </div>}
    </section>;
};
