import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, KeyRound, LoaderCircle, LogOut, ShieldCheck, Users } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/features/auth/store/authStore';
import { parentApi, type ParentOverview } from '../api/parent.api';
import { roomsApi } from '../api/rooms.api';
import '@/styles/app-screen.css';
import '@/features/profile/profile.css';

export const ParentProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout, clearSession } = useAuthStore();
    const [overview, setOverview] = useState<ParentOverview | null>(null);
    const [points, setPoints] = useState<{ points: number; sessions: { roomId: string; points: number; earnedAt: string }[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form đổi mật khẩu
    const [editingPassword, setEditingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    // Logout
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);

    // Nhóm tuổi
    const [ageSaving, setAgeSaving] = useState(false);

    useEffect(() => {
        let active = true;
        Promise.all([
            parentApi.overview().catch(() => null),
            roomsApi.points().catch(() => null),
        ]).then(([ov, pts]) => {
            if (!active) return;
            if (ov) setOverview(ov);
            if (pts) setPoints(pts);
            setLoading(false);
        }).catch((err: { message?: string }) => {
            if (active) {
                setError(err.message ?? 'Không tải được thông tin hồ sơ.');
                setLoading(false);
            }
        });

        return () => { active = false; };
    }, []);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (passwordForm.newPassword.length < 8) {
            setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }

        setPasswordSubmitting(true);
        try {
            await parentApi.password(passwordForm);
            setPasswordSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới...');
            setTimeout(() => {
                clearSession();
                navigate('/login', { replace: true });
            }, 1500);
        } catch (cause) {
            setPasswordError((cause as { message?: string }).message ?? 'Không đổi được mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
            setPasswordSubmitting(false);
        }
    };

    const handleUpdateAge = async (value: string) => {
        setAgeSaving(true);
        try {
            const result = await parentApi.ageGroup(value || null);
            setOverview((curr) => curr && { ...curr, ageGroup: result.ageGroup });
        } catch (cause) {
            setError((cause as { message?: string }).message ?? 'Không lưu được nhóm tuổi.');
        } finally {
            setAgeSaving(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setLogoutError(null);
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (err) {
            setLogoutError((err as { message?: string }).message ?? 'Đăng xuất thất bại. Vui lòng thử lại.');
            setIsLoggingOut(false);
        }
    };

    const parentName = user?.username || 'Phụ huynh';
    const initial = parentName.charAt(0).toUpperCase();
    const childName = overview?.child?.username ?? 'Con';

    return (
        <div className="min-h-svh">
            <Header />

            <main className="dash profile page-col">
                <div className="mb-4">
                    <Link
                        to="/parent"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep hover:underline"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Quay lại Tổng quan tiến độ con
                    </Link>
                </div>

                {loading && <p className="dash-note">Đang tải thông tin hồ sơ...</p>}
                {error && <p role="alert" className="dash-note dash-note--error">{error}</p>}

                {!loading && (
                    <div className="dash__grid">
                        {/* Header Hồ sơ Phụ huynh theo style phead */}
                        <section className="panel span-12 profile__head" aria-label="Hồ sơ phụ huynh">
                            <div className="phead">
                                <span className="phead__avatar" aria-hidden="true">{initial}</span>

                                <div className="phead__who">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-ink">{parentName}</h1>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF8EF] px-2.5 py-0.5 text-xs font-semibold text-[#1F6B2A]">
                                            <ShieldCheck size={14} /> Phụ huynh
                                        </span>
                                    </div>
                                    {user?.email && <p className="phead__email">{user.email}</p>}
                                    <p className="phead__facts">
                                        Đang kết nối cùng con: <strong>{childName}</strong> · Cấp {overview?.child?.profile?.level?.level ?? 1}
                                    </p>
                                </div>

                                <div className="phead__level">
                                    <p className="phead__badge">
                                        Điểm đồng hành: <strong>{points?.points ?? 0}</strong>
                                    </p>
                                    <p className="phead__exp">
                                        Tích luỹ từ các buổi luyện tập và phòng chơi gia đình cùng {childName}.
                                    </p>
                                    <Link to="/parent/room" className="btn btn--brand mt-1 text-center text-xs">
                                        <Users size={14} className="inline mr-1" />
                                        Mở phòng chơi cùng con
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Cài đặt tài khoản phụ huynh & Đổi mật khẩu */}
                        <section className="panel span-12" aria-labelledby="parent-account-title">
                            <div className="panel__head">
                                <h2 id="parent-account-title">Tài khoản & Bảo mật</h2>
                            </div>

                            <dl className="settings">
                                <div className="settings__row">
                                    <dt>Tên hiển thị</dt>
                                    <dd>
                                        <span className="settings__value">{parentName}</span>
                                        <span className="settings__hint">Tên hiển thị trong tài khoản phụ huynh</span>
                                    </dd>
                                </div>

                                {user?.email && (
                                    <div className="settings__row">
                                        <dt>Email đăng nhập</dt>
                                        <dd>
                                            <span className="settings__value">{user.email}</span>
                                            <span className="settings__hint">Email nhận thông báo và xác minh</span>
                                        </dd>
                                    </div>
                                )}

                                <div className="settings__row">
                                    <dt>Mật khẩu</dt>
                                    <dd>
                                        {editingPassword ? (
                                            <form className="settings__form max-w-lg" onSubmit={handlePasswordSubmit}>
                                                <div className="flex flex-col gap-3">
                                                    <label className="text-xs font-semibold text-ink">
                                                        Mật khẩu hiện tại
                                                        <input
                                                            type="password"
                                                            required
                                                            autoComplete="current-password"
                                                            className="settings__input mt-1 w-full"
                                                            value={passwordForm.currentPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                            placeholder="Nhập mật khẩu hiện tại"
                                                        />
                                                    </label>

                                                    <label className="text-xs font-semibold text-ink">
                                                        Mật khẩu mới
                                                        <input
                                                            type="password"
                                                            required
                                                            minLength={8}
                                                            autoComplete="new-password"
                                                            className="settings__input mt-1 w-full"
                                                            value={passwordForm.newPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                            placeholder="Tối thiểu 8 ký tự"
                                                        />
                                                    </label>

                                                    <label className="text-xs font-semibold text-ink">
                                                        Xác nhận mật khẩu mới
                                                        <input
                                                            type="password"
                                                            required
                                                            minLength={8}
                                                            autoComplete="new-password"
                                                            className="settings__input mt-1 w-full"
                                                            value={passwordForm.confirmPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                            placeholder="Nhập lại mật khẩu mới"
                                                        />
                                                    </label>

                                                    {passwordError && (
                                                        <p role="alert" className="settings__error text-xs">
                                                            {passwordError}
                                                        </p>
                                                    )}

                                                    {passwordSuccess && (
                                                        <p role="status" className="text-xs font-semibold text-[#1f6b2a] flex items-center gap-1">
                                                            <Check size={14} /> {passwordSuccess}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2 pt-2">
                                                        <button
                                                            type="submit"
                                                            className="btn btn--brand settings__btn"
                                                            disabled={passwordSubmitting}
                                                        >
                                                            {passwordSubmitting && <LoaderCircle size={16} className="animate-spin mr-1.5" aria-hidden="true" />}
                                                            {passwordSubmitting ? 'Đang đổi mật khẩu…' : 'Lưu mật khẩu mới'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn--quiet settings__btn"
                                                            onClick={() => {
                                                                setEditingPassword(false);
                                                                setPasswordError(null);
                                                                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                            }}
                                                        >
                                                            Huỷ
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <span className="settings__value flex items-center gap-2">
                                                    <KeyRound size={16} className="text-muted" /> ••••••••
                                                </span>
                                                <button
                                                    type="button"
                                                    className="settings__action"
                                                    onClick={() => setEditingPassword(true)}
                                                >
                                                    Đổi mật khẩu
                                                </button>
                                            </>
                                        )}
                                    </dd>
                                </div>

                                <div className="settings__row">
                                    <dt>Nhóm tuổi của con</dt>
                                    <dd>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={overview?.ageGroup ?? ''}
                                                onChange={(e) => void handleUpdateAge(e.target.value)}
                                                disabled={ageSaving}
                                                className="rounded-lg border border-[#d3dfd6] bg-white px-3 py-1.5 text-sm font-medium text-ink focus:border-brand-deep focus:outline-none"
                                            >
                                                <option value="">Chưa khai báo</option>
                                                <option value="6-8">6–8 tuổi</option>
                                                <option value="9-12">9–12 tuổi</option>
                                                <option value="13-15">13–15 tuổi</option>
                                            </select>
                                            {ageSaving && <span className="text-xs text-muted">Đang lưu…</span>}
                                        </div>
                                        <span className="settings__hint">Hệ thống gợi ý bài tập và thử thách phù hợp với lứa tuổi</span>
                                    </dd>
                                </div>

                                <div className="settings__row">
                                    <dt>Phiên đăng nhập</dt>
                                    <dd>
                                        <span className="settings__hint">Đăng xuất khỏi trình duyệt này.</span>
                                        {logoutError && (
                                            <span className="settings__error" role="alert">
                                                {logoutError}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="settings__action settings__action--danger"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                        >
                                            {isLoggingOut ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}
                                            {isLoggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
                                        </button>
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        {/* Điểm đồng hành & Lịch sử */}
                        <section className="panel span-12" aria-labelledby="points-history-title">
                            <div className="panel__head">
                                <h2 id="points-history-title">Lịch sử tích luỹ điểm đồng hành</h2>
                                <span className="text-xs text-muted">
                                    {points?.sessions?.length ?? 0} phiên gần nhất
                                </span>
                            </div>

                            <p className="text-xs text-muted mb-3">
                                Điểm đồng hành là điểm ghi nhận hoạt động phụ huynh cùng chơi và rèn luyện trí nhớ cùng con qua Memio, không đánh giá chất lượng làm cha mẹ.
                            </p>

                            {points?.sessions && points.sessions.length > 0 ? (
                                <ul className="divide-y divide-[#d3dfd6] rounded-xl border border-[#d3dfd6] bg-white">
                                    {points.sessions.map((entry) => (
                                        <li key={entry.roomId} className="flex items-center justify-between p-3.5 text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF8EF] text-xs font-bold text-[#1F6B2A]">
                                                    +{entry.points}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-ink">Hoàn thành ván chơi cùng con</p>
                                                    <p className="text-xs text-muted">Mã phòng: {entry.roomId.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <time className="text-xs text-muted">
                                                {new Date(entry.earnedAt).toLocaleString('vi-VN')}
                                            </time>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="rounded-xl border border-dashed border-[#d3dfd6] bg-white/50 p-6 text-center text-sm text-muted">
                                    Chưa có phiên chơi gia đình nào được ghi nhận. Hãy mở phòng và chơi cùng con để tích luỹ điểm!
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ParentProfilePage;

