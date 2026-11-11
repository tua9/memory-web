import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { GAME_META } from '@/features/shared-game/registry';
import type { ApiPlanSession } from '../api/dashboard.api';
import { DAY_LABELS } from '../constants';
import { PROGRESS_TIME_ZONE, dayKey } from '../utils/format';

const DAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export type WeekSession = ApiPlanSession & { bestAccuracy?: number | null };

interface WeekPlanProps {
    sessions: WeekSession[];
    // Chỉ lộ trình đã lưu mới có ngày thật và tiến độ; bản nháp trong chat thì không
    weekStart?: string;
    today?: number;
    // Lúc lưu lộ trình: các ngày trước đó trong tuần chưa có lộ trình nên không tính là bỏ lỡ
    savedAt?: string;
}

const dateOf = (weekStart: string, offset: number) => {
    const [year, month, day] = weekStart.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + offset));
    return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
};

// Thứ (1-7) của ngày lưu nếu lưu trong tuần này, ngược lại 1 (lộ trình có hiệu lực cả tuần)
const startDayOf = (weekStart?: string, savedAt?: string) => {
    if (!weekStart || !savedAt) return 1;
    const saved = dayKey(new Date(savedAt), PROGRESS_TIME_ZONE);
    const offset = Math.round((Date.parse(saved) - Date.parse(weekStart)) / 86_400_000);
    return offset > 0 && offset < 7 ? offset + 1 : 1;
};

const stateOf = (session: WeekSession, today: number | undefined, startDay: number) => {
    if (session.bestAccuracy != null) return 'done';
    if (today === undefined || session.day >= today) return 'todo';
    return session.day < startDay ? 'before' : 'missed';
};

// Dải 7 cột; trong khung hẹp (chat, điện thoại) CSS đổi thành danh sách dọc bằng container query
export const WeekPlan = ({ sessions, weekStart, today, savedAt }: WeekPlanProps) => {
    const startDay = startDayOf(weekStart, savedAt);
    return (
    <ol className="week">
        {DAY_LABELS.map((label, index) => {
            const day = index + 1;
            const items = sessions.filter((session) => session.day === day);
            return (
                <li
                    key={label}
                    className="week__day"
                    data-today={day === today || undefined}
                    data-rest={items.length === 0 || undefined}
                >
                    <p className="week__label">
                        <span className="week__short" aria-hidden="true">{DAY_SHORT[index]}</span>
                        <span className="week__long">{label}</span>
                        {weekStart && <span className="week__date">{dateOf(weekStart, index)}</span>}
                    </p>
                    {items.length ? (
                        <ul>
                            {items.map((session, order) => {
                                const game = GAME_META[session.gameName];
                                const state = stateOf(session, today, startDay);
                                return (
                                    <li
                                        key={`${session.gameName}-${order}`}
                                        className="week__session"
                                        data-state={state}
                                        style={{ '--game': game.color, '--i': index + order } as CSSProperties}
                                    >
                                        <Link to={game.route} className="week__link" aria-label={`${label}: ${game.label}, cấp ${session.level}, ${session.minutes} phút${state === 'done' ? ', đã tập' : ''}`}>
                                            <strong>{game.label}</strong>
                                            <span>Cấp {session.level}</span>
                                            <span>{session.minutes} phút</span>
                                            {state === 'done' ? (
                                                <span className="week__result">
                                                    <Check size={13} aria-hidden="true" /> {Math.round((session.bestAccuracy ?? 0) * 100)}%
                                                </span>
                                            ) : (
                                                <span className="week__target">Mục tiêu {session.targetAccuracy}%</span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="week__rest">Nghỉ</p>
                    )}
                </li>
            );
        })}
    </ol>
    );
};
