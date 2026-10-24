import { GAME_IDS } from '../constants';
import type {
    DashboardSummary,
    GameFilter,
    GameSession,
    Period,
    PeriodBucket,
    ResultGrade,
} from '../types';

export const PERIOD_CONFIG: Record<Period, { count: number; label: string; compareLabel: string }> = {
    week: { count: 8, label: '8 tuần gần nhất', compareLabel: 'so với 8 tuần trước' },
    month: { count: 6, label: '6 tháng gần nhất', compareLabel: 'so với 6 tháng trước' },
};

interface DateRange {
    start: Date;
    end: Date;  // Không bao gồm
}

const pad = (value: number) => String(value).padStart(2, '0');
const formatDayMonth = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

// Tuần bắt đầu từ thứ Hai
const startOfWeek = (date: Date): Date => {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return start;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addPeriods = (date: Date, period: Period, amount: number): Date => {
    const result = new Date(date);
    if (period === 'week') result.setDate(result.getDate() + amount * 7);
    else result.setMonth(result.getMonth() + amount);
    return result;
};

// Mốc bắt đầu của từng tuần/tháng; offset > 0 lùi về khoảng trước đó (để so sánh)
const getPeriodStarts = (period: Period, now: Date, offset = 0): Date[] => {
    const { count } = PERIOD_CONFIG[period];
    const current = period === 'week' ? startOfWeek(now) : startOfMonth(now);
    return Array.from({ length: count }, (_, index) => addPeriods(current, period, index - (count - 1) - offset));
};

export const getRange = (period: Period, now: Date, previous = false): DateRange => {
    const starts = getPeriodStarts(period, now, previous ? PERIOD_CONFIG[period].count : 0);
    return { start: starts[0], end: addPeriods(starts[starts.length - 1], period, 1) };
};

export const filterSessions = (
    sessions: GameSession[],
    range: DateRange,
    game: GameFilter,
): GameSession[] =>
    sessions.filter((session) =>
        session.playedAt >= range.start &&
        session.playedAt < range.end &&
        (game === 'all' || session.game === game),
    );

// Độ chính xác tính theo tổng số thẻ, để ván nhiều thẻ có trọng số lớn hơn ván ít thẻ
export const accuracyOf = (sessions: GameSession[]): number | null => {
    const total = sessions.reduce((sum, session) => sum + session.totalItems, 0);
    if (total === 0) return null;
    return sessions.reduce((sum, session) => sum + session.correctItems, 0) / total;
};

export const buildBuckets = (sessions: GameSession[], period: Period, now: Date): PeriodBucket[] =>
    getPeriodStarts(period, now).map((start) => {
        const end = addPeriods(start, period, 1);
        const inBucket = sessions.filter((session) => session.playedAt >= start && session.playedAt < end);
        const byGame = Object.fromEntries(
            GAME_IDS.map((game) => {
                const own = inBucket.filter((session) => session.game === game);
                return [game, { played: own.length, accuracy: accuracyOf(own) }];
            }),
        ) as PeriodBucket['byGame'];

        if (period === 'week') {
            const lastDay = new Date(end);
            lastDay.setDate(lastDay.getDate() - 1);
            return {
                key: start.toISOString(),
                label: formatDayMonth(start),
                fullLabel: `Tuần ${formatDayMonth(start)} – ${formatDayMonth(lastDay)}`,
                byGame,
            };
        }

        return {
            key: start.toISOString(),
            label: `Th${start.getMonth() + 1}`,
            fullLabel: `Tháng ${start.getMonth() + 1}/${start.getFullYear()}`,
            byGame,
        };
    });

export const summarize = (sessions: GameSession[]): DashboardSummary => ({
    played: sessions.length,
    accuracy: accuracyOf(sessions),
    bestLevel: sessions.length ? Math.max(...sessions.map((session) => session.level)) : null,
    perfectCount: sessions.filter((session) => gradeOf(session) === 'perfect').length,
    durationSec: sessions.reduce((sum, session) => sum + session.durationSec, 0),
});

export const accuracyOfSession = (session: GameSession) => session.correctItems / session.totalItems;

export const gradeOf = (session: GameSession): ResultGrade => {
    const accuracy = accuracyOfSession(session);
    if (accuracy === 1) return 'perfect';
    return accuracy >= 0.7 ? 'pass' : 'fail';
};

export const formatPercent = (value: number | null) =>
    value === null ? '—' : `${Math.round(value * 100)}%`;

export const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
};

export const formatClock = (seconds: number) => `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export const formatDateTime = (date: Date) => dateTimeFormatter.format(date);
