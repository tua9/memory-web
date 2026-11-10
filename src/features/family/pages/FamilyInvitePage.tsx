import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/features/auth/store/authStore';
import { familyApi, type Person } from '../api/family.api';
import '@/styles/app-screen.css';
import '@/features/profile/profile.css';
import '../family.css';

const STORAGE_KEY = 'memio-family-invite';

// Token nằm sau dấu # của link trong email. Cất vào sessionStorage để vẫn còn sau khi người nhận đi đăng nhập rồi quay lại.
const takeToken = () => {
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get('token');
    try {
        if (fromHash) {
            sessionStorage.setItem(STORAGE_KEY, fromHash);
            window.history.replaceState(null, '', window.location.pathname);
        }
        return fromHash ?? sessionStorage.getItem(STORAGE_KEY);
    } catch {
        return fromHash;
    }
};

const forget = () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable */ }
};

export const FamilyInvitePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuthStore();
    const [token] = useState(takeToken);
    const [child, setChild] = useState<Person | null>(null);
    const [state, setState] = useState<'checking' | 'ready' | 'invalid' | 'done'>(token ? 'checking' : 'invalid');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        familyApi.inspectInvite(token)
            .then((value) => { setChild(value.child); setState('ready'); })
            .catch(() => { forget(); setState('invalid'); });
    }, [token]);

    const accept = async () => {
        if (!token) return;
        setBusy(true); setError(null);
        try {
            await familyApi.acceptInvite(token);
            forget();
            setState('done');
        } catch (cause) {
            setError((cause as { message?: string }).message ?? 'Chưa chấp nhận được lời mời.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-svh">
            <Header />
            <main className="dash page-col">
                <section className="panel family family-invite" aria-labelledby="invite-title">
                    <h1 id="invite-title">Lời mời đồng hành</h1>

                    {state === 'checking' && <p className="dash-note">Đang kiểm tra lời mời...</p>}
                    {state === 'invalid' && (
                        <p role="alert" className="settings__hint">
                            Lời mời không hợp lệ, đã hết hạn hoặc đã được dùng. Hãy nhờ con gửi lời mời mới trong mục Gia đình của hồ sơ.
                        </p>
                    )}

                    {child && state !== 'invalid' && (
                        <div className="family__row family-invite__who">
                            <span className="family__avatar" aria-hidden="true">
                                {child.avatarUrl ? <img src={child.avatarUrl} alt="" /> : child.username.charAt(0).toUpperCase()}
                            </span>
                            <span className="family__who">
                                <strong>{child.username}</strong>
                                <span>{state === 'done' ? 'Đã liên kết với bạn' : 'mời bạn theo dõi tiến độ luyện trí nhớ'}</span>
                            </span>
                        </div>
                    )}

                    {state === 'ready' && !isLoading && (isAuthenticated ? (
                        <div className="family__inline">
                            <button type="button" className="btn btn--brand" disabled={busy} onClick={() => void accept()}>
                                {busy ? 'Đang liên kết...' : 'Chấp nhận lời mời'}
                            </button>
                            <Link to="/" className="settings__action">Để sau</Link>
                        </div>
                    ) : (
                        <>
                            <p className="settings__hint">Đăng nhập hoặc tạo tài khoản Memio của ba mẹ để chấp nhận lời mời.</p>
                            <div className="family__inline">
                                <button type="button" className="btn btn--brand"
                                    onClick={() => navigate('/login', { state: { from: { pathname: '/family/invite' } } })}>
                                    Đăng nhập
                                </button>
                                <Link to="/register" className="settings__action">Tạo tài khoản</Link>
                            </div>
                        </>
                    ))}

                    {state === 'done' && child && (
                        <Link to={`/family/${child._id}`} className="btn btn--brand family-invite__go">Xem hoạt động của {child.username}</Link>
                    )}
                    {error && <p role="alert" className="settings__error">{error}</p>}
                </section>
            </main>
        </div>
    );
};

export default FamilyInvitePage;
