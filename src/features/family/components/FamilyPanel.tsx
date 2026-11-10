import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Mail, X } from 'lucide-react';
import { familyApi, type Family, type FamilyLink, type Person } from '../api/family.api';
import { Mascot } from '@/components/ui/Mascot';
import '../family.css';

const messageOf = (cause: unknown, fallback: string) => (cause as { message?: string })?.message ?? fallback;
const since = (value: string | null) => (value ? new Date(value).toLocaleDateString('vi-VN') : '');

const Avatar = ({ person }: { person: Person }) => (
    <span className="family__avatar" aria-hidden="true">
        {person.avatarUrl ? <img src={person.avatarUrl} alt="" /> : person.username.charAt(0).toUpperCase()}
    </span>
);

const Row = ({ person, note, children, tone }: { person: Person; note: string; children: ReactNode; tone?: 'ask' }) => (
    <li className="family__row" data-tone={tone}>
        <Avatar person={person} />
        <span className="family__who">
            <strong>{person.username}</strong>
            <span>{note}</span>
        </span>
        <span className="family__actions">{children}</span>
    </li>
);

// Đếm ngược tới lúc mã hết hạn, theo giây
const useRemaining = (expiresAt: string | undefined) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!expiresAt) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [expiresAt]);
    return expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000)) : 0;
};

export const FamilyPanel = () => {
    const [family, setFamily] = useState<Family | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState(false);

    const load = useCallback(() => familyApi.get().then(setFamily).catch((cause) => setError(messageOf(cause, 'Không tải được mục Gia đình.'))), []);
    useEffect(() => { void load(); }, [load]);

    const remaining = useRemaining(family?.code?.expiresAt);
    const codeOpen = Boolean(family?.code) && remaining > 0;

    // Khi mã đang mở, hỏi lại mỗi 5 giây để yêu cầu của ba mẹ hiện ra ngay mà không phải tải lại trang
    useEffect(() => {
        if (!codeOpen) return;
        const timer = setInterval(() => void familyApi.get().then(setFamily).catch(() => undefined), 5000);
        return () => clearInterval(timer);
    }, [codeOpen]);

    const run = async (action: () => Promise<unknown>, done?: string) => {
        setBusy(true); setError(null); setNotice(null);
        try {
            await action();
            if (done) setNotice(done);
            await load();
            return true;
        } catch (cause) {
            setError(messageOf(cause, 'Thao tác chưa thành công.'));
            return false;
        } finally {
            setBusy(false);
        }
    };

    const remove = (link: FamilyLink, question: string) => {
        if (window.confirm(question)) void run(() => familyApi.removeLink(link._id));
    };

    const sendCode = async (event: FormEvent) => {
        event.preventDefault();
        const value = code.trim().toUpperCase();
        if (await run(() => familyApi.requestLink(value), 'Đã gửi yêu cầu. Liên kết có hiệu lực khi con bấm Đồng ý trong hồ sơ của con.')) setCode('');
    };

    const sendInvite = async (event: FormEvent) => {
        event.preventDefault();
        if (await run(() => familyApi.invite(email.trim()), `Đã gửi lời mời tới ${email.trim()}.`)) setEmail('');
    };

    const copyCode = () => {
        if (!family?.code) return;
        void navigator.clipboard?.writeText(family.code.code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    const pending = family?.guardians.filter((link) => link.status === 'pending') ?? [];
    const guardians = family?.guardians.filter((link) => link.status === 'active') ?? [];
    const full = family ? family.guardians.length >= family.maxGuardians : false;

    return (
        <section id="family" className="panel span-12 family" aria-labelledby="family-title">
            <div className="panel__head">
                <h2 id="family-title">Gia đình</h2>
            </div>

            {!family && !error && <p className="dash-note">Đang tải...</p>}
            {error && <p role="alert" className="settings__error family__message">{error}</p>}
            {notice && <p role="status" className="settings__status family__message">{notice}</p>}

            {family && (
                <div className="family__grid">
                    <div className="family__side">
                        <h3>Ba mẹ theo dõi bạn</h3>
                        <p className="settings__hint">Ba mẹ xem được tiến độ và báo cáo luyện tập của bạn. Bạn có thể gỡ bất kỳ lúc nào.</p>

                        {pending.length > 0 && (
                            <ul className="family__list">
                                {pending.map((link) => (
                                    <Row key={link._id} person={link.user} note="muốn theo dõi tiến độ của bạn" tone="ask">
                                        <button type="button" className="btn btn--brand settings__btn" disabled={busy}
                                            onClick={() => void run(() => familyApi.acceptLink(link._id), `Đã liên kết với ${link.user.username}.`)}>
                                            <Check size={16} aria-hidden="true" /> Đồng ý
                                        </button>
                                        <button type="button" className="settings__action settings__action--danger" disabled={busy}
                                            onClick={() => void run(() => familyApi.removeLink(link._id))}>
                                            Từ chối
                                        </button>
                                    </Row>
                                ))}
                            </ul>
                        )}

                        {codeOpen && family.code ? (
                            <div className="family__code" aria-live="polite">
                                <p className="family__code-label">Mã liên kết của bạn, đưa cho ba mẹ nhập:</p>
                                <p className="family__tiles" aria-label={`Mã ${family.code.code.split('').join(' ')}`}>
                                    {family.code.code.split('').map((char, index) => (
                                        <span key={`${family.code?.code}-${index}`} style={{ animationDelay: `${index * 60}ms` }}>{char}</span>
                                    ))}
                                </p>
                                <p className="settings__hint">
                                    Còn {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} · dùng được một lần
                                </p>
                                <div className="family__inline">
                                    <button type="button" className="settings__action" onClick={copyCode}>
                                        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                                        {copied ? 'Đã sao chép' : 'Sao chép'}
                                    </button>
                                    <button type="button" className="settings__action" disabled={busy} onClick={() => void run(() => familyApi.cancelCode())}>
                                        <X size={16} aria-hidden="true" /> Huỷ mã
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" className="btn btn--brand settings__btn family__make" disabled={busy || full}
                                onClick={() => void run(() => familyApi.createCode())}>
                                Tạo mã liên kết
                            </button>
                        )}

                        <form className="family__inline family__invite" onSubmit={sendInvite}>
                            <label className="sr-only" htmlFor="family-invite">Email của ba mẹ</label>
                            <input id="family-invite" className="settings__input" type="email" required autoComplete="off"
                                placeholder="Hoặc mời qua email của ba mẹ" value={email} onChange={(event) => setEmail(event.target.value)} />
                            <button className="settings__action" disabled={busy || full || !email.trim()}>
                                <Mail size={16} aria-hidden="true" /> Gửi lời mời
                            </button>
                        </form>
                        {full && <p className="settings__hint">Đã đủ {family.maxGuardians} người theo dõi. Gỡ bớt một người để mời thêm.</p>}

                        {guardians.length > 0 && (
                            <ul className="family__list">
                                {guardians.map((link) => (
                                    <Row key={link._id} person={link.user} note={`Theo dõi từ ${since(link.acceptedAt)}`}>
                                        <button type="button" className="settings__action settings__action--danger" disabled={busy}
                                            onClick={() => remove(link, `Gỡ ${link.user.username}? Người này sẽ không xem được tiến độ của bạn nữa.`)}>
                                            Gỡ
                                        </button>
                                    </Row>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="family__side">
                        <h3>Con bạn đang theo dõi</h3>
                        <p className="settings__hint">Nhập mã liên kết con tạo trong hồ sơ của con. Con đồng ý xong là bạn xem được hoạt động của con.</p>

                        <form className="family__inline" onSubmit={sendCode}>
                            <label className="sr-only" htmlFor="family-code">Mã liên kết của con</label>
                            <input id="family-code" className="settings__input family__code-input" required maxLength={6} autoComplete="off"
                                autoCapitalize="characters" spellCheck={false} placeholder="Mã 6 ký tự"
                                value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
                            <button className="btn btn--brand settings__btn" disabled={busy || code.trim().length !== 6}>Gửi yêu cầu</button>
                        </form>

                        {family.children.length > 0 ? (
                            <ul className="family__list">
                                {family.children.map((link) => link.status === 'active' ? (
                                    <Row key={link._id} person={link.user} note={`Liên kết từ ${since(link.acceptedAt)}`}>
                                        <Link to={`/family/${link.user._id}`} className="btn btn--brand settings__btn">Xem hoạt động</Link>
                                        <button type="button" className="settings__action settings__action--danger" disabled={busy}
                                            onClick={() => remove(link, `Ngừng theo dõi ${link.user.username}?`)}>
                                            Gỡ
                                        </button>
                                    </Row>
                                ) : (
                                    <Row key={link._id} person={link.user} note="Đang chờ con đồng ý">
                                        <button type="button" className="settings__action" disabled={busy}
                                            onClick={() => void run(() => familyApi.removeLink(link._id))}>
                                            Huỷ yêu cầu
                                        </button>
                                    </Row>
                                ))}
                            </ul>
                        ) : (
                            <div className="family__empty">
                                <Mascot className="family__mascot" />
                                <p>Chưa theo dõi tài khoản nào. Nhờ con tạo mã liên kết trong hồ sơ của con rồi nhập ở trên.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};
