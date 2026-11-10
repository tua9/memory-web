import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Flame, Gamepad2, ShieldAlert, Sparkles, Swords, Users } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { familyApi, type ChildOverview, type ChildReport } from '../api/family.api';
import { Achievements } from '@/features/profile/components/Achievements';
import { buildBadges } from '@/features/profile/utils/badges';
import type { GameCatalogItem } from '@/features/shared-game/api/games.api';
import { ChildGameProgress } from '../components/ChildGameProgress';
import { formatNumber, getLevelProgress } from '@/features/profile/utils/profileProgress';
import '@/styles/app-screen.css';
import '@/features/profile/profile.css';
import '@/features/shared-game/game.css';

const today = () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const gameNames: Record<string, string> = {
    card: 'Thẻ bài',
    image: 'Hình ảnh',
    number: 'Ghi nhớ số',
    facename: 'Gương mặt & Tên',
    word: 'Ghi nhớ từ',
};

export const ChildDashboardPage = () => {
    const { childId = '' } = useParams();
    const [overview, setOverview] = useState<ChildOverview | null>(null);
    const [report, setReport] = useState<ChildReport | null>(null);
    const [period, setPeriod] = useState<'day' | 'week'>('day');
    const [date, setDate] = useState(today());
    const [loading, setLoading] = useState(true);
    const [catalog, setCatalog] = useState<GameCatalogItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ageSaving, setAgeSaving] = useState(false);

    useEffect(() => {
        let active = true;
        familyApi.overview(childId)
            .then((value) => { if (active) setOverview(value); })
            .catch((cause: { message?: string }) => { if (active) setError(cause.message ?? 'Không tải được tổng quan.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [childId]);

    useEffect(() => {
        let active = true;
        setReport(null);
        familyApi.report(childId, period, date)
            .then((value) => { if (active) { setReport(value); setError(null); } })
            .catch((cause: { message?: string }) => { if (active) setError(cause.message ?? 'Không tải được báo cáo.'); });
        return () => { active = false; };
    }, [childId, period, date]);

    useEffect(() => {
        let active = true;
        familyApi.games(childId)
            .then((value) => { if (active) setCatalog(value.games); })
            .catch((cause: { message?: string }) => { if (active) setError(cause.message ?? 'Không tải được danh mục trò chơi.'); });
        return () => { active = false; };
    }, [childId]);

    const updateAge = async (value: string) => {
        setAgeSaving(true);
        try {
            const result = await familyApi.ageGroup(childId, value || null);
            setOverview((current) => current && { ...current, ageGroup: result.ageGroup });
        } catch (cause) {
            setError((cause as { message?: string }).message ?? 'Không lưu được nhóm tuổi.');
        } finally {
            setAgeSaving(false);
        }
    };

    const childName = overview?.child?.username ?? 'Con';
    const childInitial = childName.charAt(0).toUpperCase();
    const childProfile = overview?.child?.profile;
    const levelProgress = childProfile ? getLevelProgress(childProfile.level) : null;

    return (
        <div className="min-h-svh">
            <Header />

            <main className="dash page-col">
                <Link to="/profile" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep hover:underline">
                    <ArrowLeft size={16} aria-hidden="true" />
                    Về mục Gia đình trong hồ sơ
                </Link>
                {/* Header trang */}
                <header className="dash__head">
                    <div>
                        <h1>Hôm nay {childName} đã làm gì?</h1>
                        <p className="progress__finding">
                            Theo dõi sự tiến bộ và đồng hành phát triển trí nhớ cùng {childName}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to={`/family/${childId}/profile`} className="btn btn--quiet">
                            <Sparkles size={16} aria-hidden="true" />
                            Xem hồ sơ của con
                        </Link>
                        <Link to="/rooms" className="btn btn--brand">
                            <Gamepad2 size={16} aria-hidden="true" />
                            Đấu cùng con
                        </Link>
                    </div>
                </header>

                {loading && <p className="dash-note">Đang tải thông tin của {childName}...</p>}
                {error && <p role="alert" className="dash-note dash-note--error">{error}</p>}

                {overview && (
                    <div className="dash__grid">
                        {/* Thẻ tổng quan con (Phong cách ProfileHeader & app-screen của con) */}
                        <section className="panel span-12 profile__head" aria-label={`Tổng quan về ${childName}`}>
                            <div className="phead">
                                <span className="phead__avatar" aria-hidden="true">
                                    {overview.child.avatarUrl ? <img src={overview.child.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : childInitial}
                                </span>

                                <div className="phead__who">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-ink">{childName}</h2>
                                        <Link
                                            to={`/family/${childId}/profile`}
                                            className="text-xs font-semibold text-brand-deep hover:underline"
                                        >
                                            Xem hồ sơ chi tiết →
                                        </Link>
                                    </div>

                                    {/* 4 Chỉ số KPI dạng card phẳng sạch sẽ */}
                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        <div className="rounded-lg border border-[#d3dfd6] bg-white p-2.5">
                                            <span className="flex items-center gap-1.5 text-xs text-muted">
                                                <Gamepad2 size={14} className="text-[#2e7d32]" /> Đã chơi
                                            </span>
                                            <p className="mt-0.5 text-base font-extrabold text-ink">
                                                {formatNumber(overview.summary.games)} <span className="text-xs font-normal text-muted">ván</span>
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-[#d3dfd6] bg-white p-2.5">
                                            <span className="flex items-center gap-1.5 text-xs text-muted">
                                                <Calendar size={14} className="text-[#2a78d6]" /> Luyện tập
                                            </span>
                                            <p className="mt-0.5 text-base font-extrabold text-ink">
                                                {overview.summary.practiceDays} <span className="text-xs font-normal text-muted">ngày</span>
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-[#d3dfd6] bg-white p-2.5">
                                            <span className="flex items-center gap-1.5 text-xs text-muted">
                                                <Clock size={14} className="text-[#987000]" /> Thời gian
                                            </span>
                                            <p className="mt-0.5 text-base font-extrabold text-ink">
                                                {Math.round(overview.summary.recordedPracticeSeconds / 60)} <span className="text-xs font-normal text-muted">phút</span>
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-[#d3dfd6] bg-white p-2.5">
                                            <span className="flex items-center gap-1.5 text-xs text-muted">
                                                <Flame size={14} className="text-[#e65100]" /> Chuỗi ngày
                                            </span>
                                            <p className="mt-0.5 text-base font-extrabold text-ink">
                                                {overview.child.profile.streaks} <span className="text-xs font-normal text-muted">ngày</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                                        <span>
                                            Lần luyện tập gần nhất:{' '}
                                            <strong className="text-ink font-semibold">
                                                {overview.summary.lastPlayedAt
                                                    ? new Date(overview.summary.lastPlayedAt).toLocaleString('vi-VN')
                                                    : 'Chưa có'}
                                            </strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Khối Level & Meter bên phải */}
                                <div className="phead__level">
                                    <p className="phead__badge">
                                        Cấp <strong>{overview.child.profile.level.level}</strong>
                                    </p>
                                    <div
                                        className="meter"
                                        role="progressbar"
                                        aria-label={`EXP của con trong cấp ${overview.child.profile.level.level}`}
                                        aria-valuemin={0}
                                        aria-valuemax={overview.child.profile.level.expForNextLevel}
                                        aria-valuenow={overview.child.profile.level.expIntoLevel}
                                    >
                                        <span style={{ width: `${levelProgress?.percentage ?? 0}%` }} />
                                    </div>
                                    <p className="phead__exp">
                                        {formatNumber(overview.child.profile.level.expIntoLevel)}/
                                        {formatNumber(overview.child.profile.level.expForNextLevel)} EXP · còn{' '}
                                        {formatNumber(levelProgress?.remaining ?? 0)} EXP để lên cấp{' '}
                                        {levelProgress?.nextLevel ?? overview.child.profile.level.level + 1}
                                    </p>

                                    <div className="mt-2 border-t border-[#d3dfd6] pt-2">
                                        <label className="flex items-center justify-between text-xs font-semibold text-ink">
                                            <span>Nhóm tuổi của con:</span>
                                            <select
                                                value={overview.ageGroup ?? ''}
                                                onChange={(event) => void updateAge(event.target.value)}
                                                disabled={ageSaving}
                                                className="rounded-md border border-[#d3dfd6] bg-white px-2 py-1 text-xs font-medium text-ink focus:border-brand-deep focus:outline-none"
                                            >
                                                <option value="">Chưa khai báo</option>
                                                <option value="6-8">6–8 tuổi</option>
                                                <option value="9-12">9–12 tuổi</option>
                                                <option value="13-15">13–15 tuổi</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tiến độ từng trò - Thang cấp độ 10 bậc y hệt role của con */}
                        <section className="panel span-12" aria-labelledby="games-progress-title">
                            <div className="panel__head">
                                <div>
                                    <h2 id="games-progress-title">Tiến độ từng trò</h2>
                                    <p className="text-xs text-muted mt-0.5">
                                        Cấp độ mở khoá và thành tích của con qua 5 trò chơi rèn luyện
                                    </p>
                                </div>
                                <Link to={`/family/${childId}/profile`} className="dash-link text-xs">
                                    Xem kỷ lục cá nhân
                                </Link>
                            </div>
                            <ChildGameProgress catalog={catalog} progress={overview.progress} />
                        </section>

                        {/* Huy hiệu của con */}
                        <section className="panel span-12" aria-labelledby="child-badges-title">
                            <div className="panel__head">
                                <div>
                                    <h2 id="child-badges-title">Huy hiệu của con</h2>
                                    <p className="text-xs text-muted mt-0.5">
                                        Cột mốc luyện tập và phần thưởng con đã chinh phục
                                    </p>
                                </div>
                                <Link to={`/family/${childId}/profile`} className="dash-link text-xs">
                                    Xem tất cả huy hiệu
                                </Link>
                            </div>
                            {catalog ? (
                                <Achievements badges={buildBadges(overview.child.profile, catalog)} />
                            ) : (
                                <p className="dash-note">Đang tải huy hiệu...</p>
                            )}
                        </section>

                        {/* Nhìn lại theo ngày hoặc tuần */}
                        <section className="panel span-12" aria-labelledby="period-report-title">
                            <div className="panel__head">
                                <div>
                                    <h2 id="period-report-title">Nhìn lại theo ngày hoặc tuần</h2>
                                    <p className="text-xs text-muted mt-0.5">
                                        Báo cáo phân tích và nhận xét chi tiết quá trình rèn luyện
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex rounded-lg border border-[#d3dfd6] bg-white p-0.5 text-xs font-semibold">
                                        <button
                                            type="button"
                                            className={`rounded-md px-3 py-1 transition-colors ${period === 'day' ? 'bg-[#EAF8EF] text-[#1F6B2A]' : 'text-muted hover:text-ink'}`}
                                            onClick={() => setPeriod('day')}
                                        >
                                            Theo ngày
                                        </button>
                                        <button
                                            type="button"
                                            className={`rounded-md px-3 py-1 transition-colors ${period === 'week' ? 'bg-[#EAF8EF] text-[#1F6B2A]' : 'text-muted hover:text-ink'}`}
                                            onClick={() => setPeriod('week')}
                                        >
                                            Theo tuần
                                        </button>
                                    </div>

                                    <label className="flex items-center gap-2 text-xs font-medium text-muted">
                                        Ngày xem:
                                        <input
                                            type="date"
                                            value={date}
                                            max={today()}
                                            onChange={(event) => setDate(event.target.value)}
                                            className="rounded-lg border border-[#d3dfd6] bg-white px-2.5 py-1 text-xs font-medium text-ink focus:border-brand-deep focus:outline-none"
                                        />
                                    </label>
                                </div>
                            </div>

                            {!report && !error && <p className="dash-note">Đang phân tích báo cáo...</p>}

                            {report && (
                                <div className="space-y-4">
                                    {report.incomplete && (
                                        <div className="flex items-center gap-2 rounded-lg bg-[#fff8e1] p-3 text-xs text-[#8a6d3b]">
                                            <ShieldAlert size={16} className="shrink-0" />
                                            <span>Kỳ hiện tại chưa kết thúc; hệ thống so sánh cùng khoảng thời gian tương ứng của kỳ trước.</span>
                                        </div>
                                    )}

                                    {/* Nhận xét chuyên môn */}
                                    <div className="rounded-xl border border-[#d3dfd6] bg-white p-4 space-y-2">
                                        <h3 className="text-sm font-bold text-ink">Nhận xét chuyên môn</h3>
                                        {report.comment.observation && (
                                            <p className="text-sm text-ink"><strong className="font-semibold text-brand-deep">Quan sát:</strong> {report.comment.observation}</p>
                                        )}
                                        {report.comment.evidence && (
                                            <p className="text-sm text-ink"><strong className="font-semibold text-brand-deep">Dẫn chứng:</strong> {report.comment.evidence}</p>
                                        )}
                                        {report.comment.trend && (
                                            <p className="text-sm text-ink"><strong className="font-semibold text-brand-deep">Xu hướng:</strong> {report.comment.trend}</p>
                                        )}

                                        <div className="pt-2 border-t border-[#edf3ef] flex items-center gap-4 text-xs font-medium text-muted">
                                            <span>Tổng số ván: <strong className="text-ink font-bold">{report.summary.games}</strong></span>
                                            <span>
                                                Độ chính xác trung bình:{' '}
                                                <strong className="text-ink font-bold">
                                                    {report.summary.accuracy === null ? 'Chưa có dữ liệu' : `${Math.round(report.summary.accuracy * 100)}%`}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Chi tiết từng hoạt động */}
                                    {report.activities.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                                                Các ván đã hoàn thành trong kỳ ({report.activities.length} ván)
                                            </h4>
                                            <ul className="divide-y divide-[#d3dfd6] rounded-xl border border-[#d3dfd6] bg-white">
                                                {report.activities.map((item, index) => (
                                                    <li key={`${item.completedAt}-${index}`} className="flex items-center justify-between p-3 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <span className="rounded-full bg-[#EAF8EF] px-2.5 py-0.5 text-xs font-semibold text-[#1F6B2A]">
                                                                {gameNames[item.gameName] ?? item.gameName}
                                                            </span>
                                                            <span className="font-medium text-ink">
                                                                {item.correctItems}/{item.totalItems} mục đúng ({Math.round((item.correctItems / item.totalItems) * 100)}%)
                                                            </span>
                                                        </div>
                                                        <time className="text-xs text-muted">
                                                            {new Date(item.completedAt).toLocaleString('vi-VN')}
                                                        </time>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Ba mẹ có thể làm gì tiếp? Gợi ý đồng hành */}
                        <section className="panel span-12" aria-labelledby="suggestions-title">
                            <div className="panel__head">
                                <div>
                                    <h2 id="suggestions-title">Ba mẹ có thể làm gì tiếp?</h2>
                                    <p className="text-xs text-muted mt-0.5">
                                        Gợi ý phương pháp và câu chuyện giúp con phát huy tối đa tiềm năng trí nhớ
                                    </p>
                                </div>

                                <Link to="/rooms" className="btn btn--brand">
                                    <Users size={16} aria-hidden="true" />
                                    Mở phòng đấu cùng con
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {report?.suggestions.map((item) => (
                                    <article key={item.title} className="rounded-xl border border-[#d3dfd6] bg-white p-4 shadow-xs">
                                        <h3 className="font-bold text-ink text-base">{item.title}</h3>
                                        <p className="mt-1 text-xs text-muted leading-relaxed">{item.reason}</p>

                                        {item.steps?.length > 0 && (
                                            <ol className="my-2.5 space-y-1 pl-4 text-xs text-ink list-decimal">
                                                {item.steps.map((step) => (
                                                    <li key={step}>{step}</li>
                                                ))}
                                            </ol>
                                        )}

                                        {item.question && (
                                            <div className="mt-3 rounded-lg bg-[#EAF8EF] p-2.5 text-xs text-[#1F6B2A]">
                                                <strong>Gợi chuyện cùng con:</strong> &ldquo;{item.question}&rdquo;
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>

                            {/* Số trận ba mẹ đã đấu cùng con trong phòng đấu */}
                            <div className="mt-4 rounded-xl border border-[#d3dfd6] bg-white p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF8EF] text-[#1F6B2A]">
                                        <Swords size={20} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-ink text-sm">Đấu cùng {childName}</h3>
                                        <p className="text-xs text-muted">
                                            {overview.together.matches
                                                ? `${overview.together.matches} trận: ba mẹ thắng ${overview.together.wins}, con thắng ${overview.together.losses}, hoà ${overview.together.draws}.`
                                                : 'Chưa có trận nào. Tạo phòng đấu rồi gửi mã cho con nhé.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChildDashboardPage;
