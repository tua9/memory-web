import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { GAME_META } from '@/features/shared-game/registry';
import type { ApiCoachAnalysis, ApiCoachPlan } from '../api/dashboard.api';
import { BlockState } from '../components/BlockState';
import { useCoachPlan, type Request } from '../hooks/useOverview';
import { DAY_LABELS } from '../constants';
import { applyCoachPlan, useCoachStore } from './coachStore';
import { WeekPlan, type WeekSession } from './WeekPlan';
import './coach.css';

const SKILL_LABELS: Record<ApiCoachAnalysis['skillLevel'], string> = {
    new: 'Mới bắt đầu',
    early: 'Đang làm quen',
    building: 'Đang xây nền',
    steady: 'Vững vàng',
    advanced: 'Thành thạo',
};

const SUGGESTED_MINUTES = 15;

const percent = (accuracy: number | null) => (accuracy === null ? '—' : `${Math.round(accuracy * 100)}%`);

// Câu phát hiện dưới tiêu đề khối: trình độ, độ chính xác và game nên ưu tiên
const describeFinding = (analysis: ApiCoachAnalysis) => {
    if (analysis.totalPlayed === 0) return 'Chưa có ván theo cấp độ nào. Chơi vài ván để lộ trình sát với bạn hơn.';
    const focus = analysis.focusGame ? ` · nên ưu tiên ${GAME_META[analysis.focusGame].label}` : '';
    return `${SKILL_LABELS[analysis.skillLevel]} · đúng ${percent(analysis.overallAccuracy)} qua ${analysis.totalPlayed} ván${focus}`;
};

// Lộ trình gợi ý 3 buổi do backend tính từ tiến độ, đổi sang dạng lộ trình để áp dụng được ngay
const suggestionOf = (analysis: ApiCoachAnalysis): ApiCoachPlan => ({
    goal: analysis.focusGame ? `Cải thiện ${GAME_META[analysis.focusGame].label}` : 'Làm quen các trò chơi',
    minutesPerDay: SUGGESTED_MINUTES,
    sessions: analysis.plan.map((step) => ({
        day: step.day,
        minutes: SUGGESTED_MINUTES,
        gameName: step.gameName,
        level: step.level,
        targetAccuracy: step.targetAccuracy,
        tip: step.tip,
    })),
});

interface TodayProps {
    sessions: WeekSession[];
    today: number;
}

const Today = ({ sessions, today }: TodayProps) => {
    const todays = sessions.filter((session) => session.day === today);
    const next = sessions.find((session) => session.day > today);

    if (!todays.length) {
        return (
            <div className="coach-today coach-today--rest">
                <p className="coach-today__title">Hôm nay nghỉ</p>
                <p className="coach-today__tip">
                    {next
                        ? `Buổi tiếp theo: ${DAY_LABELS[next.day - 1]}, ${GAME_META[next.gameName].label} cấp ${next.level}.`
                        : 'Không còn buổi nào trong tuần. Hãy nhờ huấn luyện viên lập lộ trình tuần sau.'}
                </p>
            </div>
        );
    }

    return (
        <ul className="coach-today">
            {todays.map((session, index) => {
                const game = GAME_META[session.gameName];
                const done = session.bestAccuracy != null;
                return (
                    <li key={`${session.gameName}-${index}`} style={{ '--game': game.color } as CSSProperties}>
                        <div>
                            <p className="coach-today__title">
                                Hôm nay: {game.label} cấp {session.level} · {session.minutes} phút
                            </p>
                            <p className="coach-today__tip">{session.tip}</p>
                        </div>
                        <div className="coach-today__action">
                            {done ? (
                                <>
                                    <p className="coach-today__done">
                                        <Check size={16} aria-hidden="true" /> Đã tập · đúng {percent(session.bestAccuracy ?? null)}
                                        <span> / mục tiêu {session.targetAccuracy}%</span>
                                    </p>
                                    <Link to={game.route} className="dash-link">Chơi thêm</Link>
                                </>
                            ) : (
                                <Link to={game.route} className="btn btn--brand coach-today__play">
                                    Tập ngay <ArrowRight size={18} aria-hidden="true" />
                                </Link>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

interface CoachPanelProps {
    request: Request<ApiCoachAnalysis>;
    onRetry: () => void;
}

export const CoachPanel = ({ request, onRetry }: CoachPanelProps) => {
    const planRequest = useCoachPlan();
    const [suggestionState, setSuggestionState] = useState<'idle' | 'saving' | 'error'>('idle');
    const openChat = useCoachStore((state) => state.setOpen);
    const planVersion = useCoachStore((state) => state.planVersion);
    const { reload } = planRequest;

    // Lộ trình vừa được áp dụng (ở đây hoặc trong hộp chat nổi): tải lại để có cả tiến độ tuần
    useEffect(() => {
        if (planVersion > 0) reload();
    }, [planVersion, reload]);

    const savedPlan = planRequest.state.status === 'ready' ? planRequest.state.data : null;

    const applySuggestion = async (plan: ApiCoachPlan) => {
        setSuggestionState('saving');
        try {
            await applyCoachPlan(plan);
            setSuggestionState('idle');
        } catch {
            setSuggestionState('error');
        }
    };

    return (
        <section className="panel span-12 coach" aria-labelledby="coach-title">
            <div className="coach__head">
                <div>
                    <h2 id="coach-title">Huấn luyện viên AI</h2>
                    {request.status === 'ready' && <p className="coach__finding">{describeFinding(request.data)}</p>}
                </div>
                <button type="button" className="btn btn--quiet coach__chat" onClick={() => openChat(true)}>
                    <MessageCircle size={18} aria-hidden="true" /> Chat với huấn luyện viên
                </button>
            </div>
            <BlockState request={request} onRetry={onRetry}>
                {(analysis) => {
                    const done = savedPlan?.sessions.filter((session) => session.bestAccuracy != null) ?? [];
                    const total = savedPlan?.sessions.length ?? 0;
                    const suggestion = suggestionOf(analysis);
                    return (
                                <div className="coach__main">
                                    <section className="coach-week" aria-labelledby="coach-week-title">
                                        <div className="coach-week__head">
                                            <div>
                                                <h3 id="coach-week-title">{savedPlan ? savedPlan.goal : 'Gợi ý cho tuần này'}</h3>
                                                <p className="coach-week__meta">
                                                    {savedPlan
                                                        ? `Lộ trình tuần này · tối đa ${savedPlan.minutesPerDay} phút mỗi ngày`
                                                        : `${suggestion.sessions.length} buổi ${SUGGESTED_MINUTES} phút, tính từ thành tích của bạn`}
                                                </p>
                                            </div>
                                            {savedPlan && (
                                                <div className="coach-week__progress">
                                                    <p>
                                                        <strong>{done.length}/{total}</strong> buổi đã tập
                                                    </p>
                                                    <div
                                                        className="coach-meter"
                                                        role="progressbar"
                                                        aria-label="Buổi đã tập trong tuần"
                                                        aria-valuemin={0}
                                                        aria-valuemax={total}
                                                        aria-valuenow={done.length}
                                                    >
                                                        <span style={{ '--ratio': total ? done.length / total : 0 } as CSSProperties} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {planRequest.state.status === 'loading' ? (
                                            <p className="dash-note">Đang tải lộ trình…</p>
                                        ) : savedPlan ? (
                                            <>
                                                <WeekPlan
                                                    key={savedPlan.savedAt}
                                                    sessions={savedPlan.sessions}
                                                    weekStart={savedPlan.weekStart}
                                                    today={savedPlan.today}
                                                    savedAt={savedPlan.savedAt}
                                                />
                                                <Today sessions={savedPlan.sessions} today={savedPlan.today} />
                                            </>
                                        ) : (
                                            <>
                                                <WeekPlan sessions={suggestion.sessions} />
                                                <div className="coach-week__actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn--brand"
                                                        onClick={() => void applySuggestion(suggestion)}
                                                        disabled={suggestionState === 'saving'}
                                                    >
                                                        {suggestionState === 'saving' ? 'Đang áp dụng…' : 'Áp dụng gợi ý này'}
                                                    </button>
                                                    <button type="button" className="dash-link" onClick={() => openChat(true)}>
                                                        Hoặc tự lập với huấn luyện viên
                                                    </button>
                                                    {suggestionState === 'error' && (
                                                        <p className="coach-week__error" role="alert">Chưa áp dụng được. Vui lòng thử lại.</p>
                                                    )}
                                                    {planRequest.state.status === 'error' && (
                                                        <p className="coach-week__error" role="alert">{planRequest.state.message}</p>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </section>

                                    <section className="coach-skills" aria-labelledby="coach-skills-title">
                                        <h3 id="coach-skills-title">Năng lực theo trò</h3>
                                        <ul>
                                            {analysis.games.map((game) => {
                                                const meta = GAME_META[game.gameName];
                                                const tag = game.gameName === analysis.focusGame
                                                    ? 'Cần luyện'
                                                    : game.gameName === analysis.strongestGame ? 'Mạnh nhất' : null;
                                                return (
                                                    <li key={game.gameName} style={{ '--game': meta.color } as CSSProperties}>
                                                        <p className="coach-skills__name">{meta.label}</p>
                                                        <p className="coach-skills__value" data-empty={game.accuracy === null || undefined}>
                                                            {percent(game.accuracy)}
                                                        </p>
                                                        <p className="coach-skills__meta">
                                                            {game.played ? `${game.played} ván · mở cấp ${game.unlockedLevel}` : 'Chưa chơi'}
                                                        </p>
                                                        {tag && <span className="coach-skills__tag" data-tag={tag === 'Cần luyện' ? 'focus' : 'strong'}>{tag}</span>}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </section>
                                </div>
                    );
                }}
            </BlockState>
        </section>
    );
};
