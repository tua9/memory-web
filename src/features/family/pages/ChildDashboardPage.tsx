import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Swords } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { GAME_IDS, GAME_META, type GameName } from '@/features/shared-game/registry';
import type { GameCatalogItem } from '@/features/shared-game/api/games.api';
import { familyApi, type ChildOverview, type ChildReport, type FamilyLink } from '../api/family.api';
import { buildGameRows, buildWeek, dayKey, percent, pickSuggestion, summarySentence, weekLabel } from '../utils/weekProgress';
import { RollingNumber } from '@/components/ui/RollingNumber';
import butterfly from '@/assets/memio/guides/num-3-butterfly.svg';
import lociRoom from '@/assets/memio/guides/loci-room-items.svg';
import catUmbrella from '@/assets/memio/guides/story-cat-umbrella.svg';
import '@/styles/app-screen.css';
import '@/features/rooms/rooms.css';
import '../child-progress.css';

const messageOf = (cause: unknown, fallback: string) => (cause as { message?: string })?.message ?? fallback;
const label = (gameName: string) => GAME_META[gameName as GameName]?.label ?? gameName;
const minutes = (seconds: number) => Math.round(seconds / 60);
const time = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
const RECENT = 5;

// Tranh minh hoạ của từng phương pháp, dùng đúng chuyển động riêng của hình như ở trang Phương pháp
const METHOD_ART: Record<string, { src: string; motion: string }> = {
    '/methods/number-shape': { src: butterfly, motion: 'flap' },
    '/methods/memory-palace': { src: lociRoom, motion: 'bob' },
    '/methods/story-linking': { src: catUmbrella, motion: 'hop' },
};
const HALF_DAY = 12 * 60 * 60_000;

// Chênh lệch so với kỳ trước: có dấu và có mốc; tăng xanh, giảm đỏ, bằng thì xám
const Delta = ({ value, unit }: { value: number; unit: string }) => (
    <span className="kid-delta num" data-sign={Math.sign(value)}>
        {value > 0 ? '+' : value < 0 ? '−' : '±'}{Math.abs(value)}{unit}
    </span>
);

// Trang ba mẹ xem tiến độ của con. Câu hỏi của trang: "Tuần này con luyện tập thế nào?"
// Thứ tự: câu tóm tắt, dải 7 ngày, 4 chỉ số, từng trò, rồi một gợi ý cụ thể và các ván trong tuần.
export const ChildDashboardPage = () => {
    const { childId = '' } = useParams();
    const [children, setChildren] = useState<FamilyLink[]>([]);
    const [overview, setOverview] = useState<ChildOverview | null>(null);
    const [catalog, setCatalog] = useState<GameCatalogItem[] | null>(null);
    const [report, setReport] = useState<ChildReport | null>(null);
    const [date, setDate] = useState(() => dayKey(new Date()));
    const [error, setError] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        familyApi.get().then((family) => setChildren(family.children.filter((link) => link.status === 'active'))).catch(() => undefined);
    }, []);

    useEffect(() => {
        let active = true;
        Promise.all([familyApi.overview(childId), familyApi.games(childId)])
            .then(([value, games]) => { if (active) { setOverview(value); setCatalog(games.games); } })
            .catch((cause) => { if (active) setError(messageOf(cause, 'Không tải được tiến độ của con.')); });
        return () => { active = false; };
    }, [childId]);

    useEffect(() => {
        let active = true;
        familyApi.report(childId, 'week', date)
            .then((value) => { if (active) setReport(value); })
            .catch((cause) => { if (active) setError(messageOf(cause, 'Không tải được báo cáo tuần.')); });
        return () => { active = false; };
    }, [childId, date]);

    const name = overview?.child.username ?? children.find((link) => link.user._id === childId)?.user.username ?? 'Con';
    const days = useMemo(() => (report ? buildWeek(report.start, report.activities) : null), [report]);
    const rows = useMemo(() => {
        if (!report || !catalog) return null;
        const levels = Object.fromEntries(catalog.map((game) => [game.gameName, { level: game.player?.unlockedLevel ?? 1, maxLevel: game.maxLevel }]));
        return buildGameRows(GAME_IDS, report.summary, report.previousSummary, levels);
    }, [report, catalog]);
    const favourite = overview ? [...overview.summary.byGame].sort((a, b) => b.games - a.games)[0]?.gameName ?? null : null;
    const tip = rows ? pickSuggestion(name, rows, label, favourite) : null;
    const maxGames = days ? Math.max(3, ...days.map((day) => day.games)) : 3;

    const summary = report?.summary;
    const previous = report?.previousSummary;
    const accuracyNow = percent(summary?.accuracy ?? null);
    const accuracyBefore = percent(previous?.accuracy ?? null);
    const baseline = report?.incomplete ? 'so với cùng thời điểm tuần trước' : 'so với tuần trước';
    const recent = report ? (showAll ? report.activities : report.activities.slice(0, RECENT)) : [];

    // Nửa ngày trước thứ Hai là tuần trước; nửa ngày sau thứ Hai kế tiếp là tuần sau
    const shiftWeek = (direction: -1 | 1) => {
        if (!report) return;
        const anchor = direction < 0 ? new Date(report.start).getTime() - HALF_DAY : new Date(report.end).getTime() + HALF_DAY;
        setDate(dayKey(new Date(anchor)));
        setShowAll(false);
    };

    return (
        <div className="min-h-svh">
            <Header />
            <main className="dash page-col rooms kid">
                <nav className="kid__nav" aria-label="Chọn con">
                    <Link to="/profile#family" className="kid__back">
                        <ArrowLeft size={16} aria-hidden="true" /> Gia đình
                    </Link>
                    {children.length > 1 && (
                        <div className="kid__tabs">
                            {children.map((link) => (
                                <Link key={link._id} to={`/family/${link.user._id}`} className="kid__tab" aria-current={link.user._id === childId ? 'page' : undefined}>
                                    <span className="kid__avatar" aria-hidden="true">
                                        {link.user.avatarUrl ? <img src={link.user.avatarUrl} alt="" /> : link.user.username.charAt(0).toUpperCase()}
                                    </span>
                                    {link.user.username}
                                </Link>
                            ))}
                        </div>
                    )}
                </nav>

                <header className="kid__head">
                    <span className="kid__hero-avatar" aria-hidden="true">
                        {overview?.child.avatarUrl ? <img src={overview.child.avatarUrl} alt="" /> : name.charAt(0).toUpperCase()}
                    </span>
                    <div className="kid__title">
                        <h1>Tiến độ của {name}</h1>
                        <p className="kid__summary" aria-live="polite">
                            {summary && previous && report ? summarySentence(name, summary, previous, report.incomplete) : 'Đang tải tiến độ tuần này...'}
                        </p>
                        {overview && (
                            <p className="kid__meta">
                                Cấp tài khoản {overview.child.profile.level.level} · chuỗi {overview.child.profile.streaks} ngày
                                {overview.summary.lastPlayedAt ? ` · ván gần nhất ${time.format(new Date(overview.summary.lastPlayedAt))}` : ' · chưa chơi ván nào'}
                            </p>
                        )}
                    </div>
                    <div className="kid__week-nav" role="group" aria-label="Chọn tuần">
                        <button type="button" className="kid__step" onClick={() => shiftWeek(-1)} disabled={!report} aria-label="Tuần trước">
                            <ChevronLeft size={18} aria-hidden="true" />
                        </button>
                        <span className="num">{days ? (report?.incomplete ? `Tuần này · ${weekLabel(days)}` : weekLabel(days)) : '…'}</span>
                        <button type="button" className="kid__step" onClick={() => shiftWeek(1)} disabled={!report || report.incomplete} aria-label="Tuần sau">
                            <ChevronRight size={18} aria-hidden="true" />
                        </button>
                    </div>
                </header>

                {error && <p role="alert" className="rooms__alert">{error}</p>}

                {/* Dải 7 ngày: cột cao theo số ván, đậm theo tỉ lệ đúng */}
                <section className="panel kid-week" aria-labelledby="week-title">
                    <div className="kid-week__head">
                        <h2 id="week-title">Từng ngày</h2>
                        <p className="kid-legend">
                            <span><i data-level="high" aria-hidden="true" />đúng từ 80%</span>
                            <span><i data-level="mid" aria-hidden="true" />50–79%</span>
                            <span><i data-level="low" aria-hidden="true" />dưới 50%</span>
                        </p>
                    </div>
                    <ol className="kid-week__days">
                        {days ? days.map((day, index) => (
                            <li key={day.key} data-today={day.isToday} data-future={day.isFuture} style={{ '--i': index } as React.CSSProperties}
                                aria-label={`${day.label} ${day.date}: ${day.games ? `${day.games} ván, đúng ${percent(day.accuracy)}%` : day.isFuture ? 'chưa tới' : 'không luyện'}`}>
                                <span className="kid-week__count num">{day.games ? `${day.games} ván` : day.isFuture ? '' : '—'}</span>
                                <span className="kid-week__track">
                                    {day.games > 0 && (
                                        <span className="kid-week__bar"
                                            data-level={(day.accuracy ?? 0) >= 0.8 ? 'high' : (day.accuracy ?? 0) >= 0.5 ? 'mid' : 'low'}
                                            style={{ height: `${Math.max(12, (day.games / maxGames) * 100)}%` }} />
                                    )}
                                </span>
                                <span className="kid-week__day">
                                    {day.isToday ? <><span className="kid-wide">Hôm nay</span><span className="kid-narrow">{day.label}</span></> : day.label}
                                    <small className="num">{day.date}</small>
                                </span>
                            </li>
                        )) : Array.from({ length: 7 }, (_, index) => <li key={index} className="kid-week__loading" aria-hidden="true" />)}
                    </ol>
                </section>

                {/* Bốn chỉ số trong một khối; chênh lệch nêu rõ mốc so sánh */}
                <dl className="kid-stats" aria-label="Chỉ số tuần">
                    <div>
                        <dt>Ngày luyện tập</dt>
                        <dd className="num">{summary ? <><RollingNumber value={summary.practiceDays} /><small>/7</small></> : ''}</dd>
                    </div>
                    <div>
                        <dt>Số ván</dt>
                        <dd className="num">{summary ? <RollingNumber value={summary.games} /> : ''}</dd>
                        {summary && previous && <p><Delta value={summary.games - previous.games} unit=" ván" /> {baseline}</p>}
                    </div>
                    <div>
                        <dt>Độ chính xác</dt>
                        <dd className="num">{summary ? (accuracyNow === null ? <span className="kid-dash">—</span> : <><RollingNumber value={accuracyNow} />%</>) : ''}</dd>
                        {accuracyNow !== null && accuracyBefore !== null && <p><Delta value={accuracyNow - accuracyBefore} unit=" điểm" /> {baseline}</p>}
                    </div>
                    <div>
                        <dt>Thời gian luyện</dt>
                        <dd className="num">{summary ? <><RollingNumber value={minutes(summary.recordedPracticeSeconds)} /><small> phút</small></> : ''}</dd>
                    </div>
                </dl>

                {/* Từng trò: một dòng mỗi trò, chỉ trò cần ôn nhất được đánh dấu */}
                <section className="panel kid-games" aria-labelledby="games-title">
                    <h2 id="games-title">Từng trò</h2>
                    <div className="table-scroll">
                        <table className="kid-table">
                            <thead>
                                <tr>
                                    <th scope="col">Trò chơi</th>
                                    <th scope="col" className="num">Cấp đã mở</th>
                                    <th scope="col" className="num">Ván tuần này</th>
                                    <th scope="col" className="num">Đúng</th>
                                    <th scope="col" className="num">So với tuần trước</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(rows ?? []).map((row) => (
                                    <tr key={row.gameName} data-focus={row.focus}>
                                        <th scope="row">
                                            <span className="kid-game" style={{ '--game': GAME_META[row.gameName as GameName].color } as React.CSSProperties}>{label(row.gameName)}</span>
                                            {row.focus && <span className="kid-flag">Cần ôn</span>}
                                        </th>
                                        <td className="num" data-label="Cấp">{row.level ?? '—'}<small>/{row.maxLevel ?? 10}</small></td>
                                        <td className="num" data-label="Ván">{row.games}</td>
                                        <td className="num kid-table__acc">{row.accuracy === null ? <span className="kid-dash">—</span> : `${row.accuracy}%`}</td>
                                        <td className="num" data-label="So với tuần trước">{row.change === null ? <span className="kid-dash">—</span> : <Delta value={row.change} unit=" điểm" />}</td>
                                    </tr>
                                ))}
                                {!rows && <tr><td colSpan={5} className="kid-dash">Đang tải...</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="kid-pair">
                    <section className="panel kid-tip" aria-labelledby="tip-title">
                        {tip ? (
                            <>
                                {METHOD_ART[tip.method.route] && (
                                    <img key={tip.method.route} src={METHOD_ART[tip.method.route].src} alt="" aria-hidden="true"
                                        className="shape is-live kid-tip__art" data-motion={METHOD_ART[tip.method.route].motion} />
                                )}
                                <div className="kid-tip__body">
                                    <h2 id="tip-title">Gợi ý tuần này</h2>
                                    <p className="kid-tip__text">{tip.text}</p>
                                </div>
                                <div className="kid-tip__actions">
                                    <Link to={`/rooms?game=${tip.gameName}`} className="duel-btn duel-btn--primary">
                                        <Swords size={16} aria-hidden="true" /> Mời con đấu 1 trận
                                    </Link>
                                    <Link to={tip.method.route} className="duel-btn">Hướng dẫn: {tip.method.label}</Link>
                                </div>
                            </>
                        ) : <h2 id="tip-title" className="kid-dash">Đang chuẩn bị gợi ý...</h2>}
                        {overview && (
                            <p className="kid-tip__together">
                                {overview.together.matches
                                    ? `Đấu cùng ${name}: ${overview.together.matches} trận, ba mẹ thắng ${overview.together.wins}, con thắng ${overview.together.losses}, hoà ${overview.together.draws}.`
                                    : `Ba mẹ chưa đấu trận nào cùng ${name}.`}
                            </p>
                        )}
                    </section>

                    <section className="panel kid-recent" aria-labelledby="recent-title">
                        <h2 id="recent-title">Ván trong tuần</h2>
                        {report && report.activities.length === 0 && <p className="kid-dash">Chưa có ván nào trong tuần này.</p>}
                        <ul className="kid-recent__list">
                            {recent.map((item, index) => (
                                <li key={`${item.completedAt}-${index}`}>
                                    <span className="kid-recent__main">
                                        <strong>{label(item.gameName)}</strong>
                                        <span className="num">{time.format(new Date(item.completedAt))}</span>
                                    </span>
                                    <span className="kid-recent__score num">
                                        {item.correctItems}/{item.totalItems} đúng
                                        <small>{Math.round(item.durationSec)} giây</small>
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {report && report.activities.length > RECENT && (
                            <button type="button" className="kid-more" aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}>
                                {showAll ? 'Thu gọn' : `Xem tất cả ${report.activities.length} ván`}
                            </button>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ChildDashboardPage;
