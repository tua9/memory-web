// Tính toán cho trang tiến độ của con (ba mẹ xem): dải 7 ngày, bảng từng trò, câu tóm tắt và gợi ý.
// Module thuần, không gọi API, để kiểm thử được bằng node --test.

export const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const DAY_MS = 24 * 60 * 60_000;
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export type Activity = { gameName: string; completedAt: string; correctItems: number; totalItems: number; durationSec: number };
export type GameTally = { gameName: string; games: number; correct: number; total: number };
export type Summary = { games: number; practiceDays: number; accuracy: number | null; recordedPracticeSeconds: number; byGame: GameTally[] };

export type Day = { key: string; label: string; date: string; games: number; accuracy: number | null; isToday: boolean; isFuture: boolean };

const keyFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
export const dayKey = (value: Date | string) => keyFormat.format(new Date(value));
const dayMonth = (key: string) => `${Number(key.slice(8, 10))}/${Number(key.slice(5, 7))}`;

// Bảy ngày của tuần bắt đầu từ weekStart (nửa đêm thứ Hai giờ Việt Nam), mỗi ngày số ván và tỉ lệ đúng
export const buildWeek = (weekStart: string, activities: readonly Activity[], now = new Date()): Day[] => {
    const today = dayKey(now);
    return WEEKDAYS.map((label, index) => {
        const key = dayKey(new Date(new Date(weekStart).getTime() + index * DAY_MS + 12 * 60 * 60_000));
        const mine = activities.filter((item) => dayKey(item.completedAt) === key);
        const total = mine.reduce((sum, item) => sum + item.totalItems, 0);
        return {
            key, label, date: dayMonth(key), games: mine.length,
            accuracy: total ? mine.reduce((sum, item) => sum + item.correctItems, 0) / total : null,
            isToday: key === today, isFuture: key > today,
        };
    });
};

export const weekLabel = (days: readonly Day[]) => `${days[0].date} – ${days[6].date}`;

// Điểm phần trăm làm tròn, để chênh lệch là hiệu của hai số đang hiện trên màn hình
export const percent = (value: number | null) => (value === null ? null : Math.round(value * 100));
const accuracyOf = (tally?: GameTally) => (tally && tally.total ? tally.correct / tally.total : null);

export type GameRow = { gameName: string; level: number | null; maxLevel: number | null; games: number; accuracy: number | null; change: number | null; focus: boolean };

// Một dòng cho mỗi trò. Chỉ trò cần ôn nhất được đánh dấu: đúng dưới 70% hoặc giảm từ 5 điểm, chọn trò thấp nhất.
export const buildGameRows = (
    gameIds: readonly string[],
    current: Summary,
    previous: Summary,
    levels: Record<string, { level: number; maxLevel: number | null }>,
): GameRow[] => {
    const rows = gameIds.map((gameName) => {
        const now = accuracyOf(current.byGame.find((item) => item.gameName === gameName));
        const before = accuracyOf(previous.byGame.find((item) => item.gameName === gameName));
        const shownNow = percent(now);
        const shownBefore = percent(before);
        return {
            gameName,
            level: levels[gameName]?.level ?? null,
            maxLevel: levels[gameName]?.maxLevel ?? null,
            games: current.byGame.find((item) => item.gameName === gameName)?.games ?? 0,
            accuracy: shownNow,
            change: shownNow !== null && shownBefore !== null ? shownNow - shownBefore : null,
            focus: false,
        };
    });
    const weak = rows
        .filter((row) => row.accuracy !== null && (row.accuracy < 70 || (row.change !== null && row.change <= -5)))
        .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))[0];
    if (weak) weak.focus = true;
    return rows;
};

const signed = (value: number) => (value > 0 ? `tăng ${value}` : `giảm ${-value}`);

// Câu trả lời ngay câu hỏi của trang. Mốc so sánh luôn được nêu rõ.
export const summarySentence = (name: string, current: Summary, previous: Summary, incomplete: boolean) => {
    const span = incomplete ? 'tuần này' : 'tuần đó';
    if (!current.games) return `${name} chưa luyện ván nào ${span}.`;
    const accuracy = percent(current.accuracy);
    const before = percent(previous.accuracy);
    const base = `${name} luyện ${current.practiceDays}/7 ngày ${span}, ${current.games} ván, đúng ${accuracy}%`;
    if (before === null || accuracy === null) return `${base}.`;
    const diff = accuracy - before;
    const against = incomplete ? 'so với cùng thời điểm tuần trước' : 'so với tuần trước';
    return diff === 0 ? `${base}, giữ nguyên ${against}.` : `${base}, ${signed(diff)} điểm ${against}.`;
};

// Mỗi trò một phương pháp hướng dẫn phù hợp nhất
export const METHOD_FOR_GAME: Record<string, { label: string; route: string }> = {
    number: { label: 'Biến số thành hình', route: '/methods/number-shape' },
    card: { label: 'Cung điện trí nhớ', route: '/methods/memory-palace' },
    image: { label: 'Nối hình thành câu chuyện', route: '/methods/story-linking' },
    word: { label: 'Nối hình thành câu chuyện', route: '/methods/story-linking' },
    facename: { label: 'Nối hình thành câu chuyện', route: '/methods/story-linking' },
};

export type Suggestion = { gameName: string; text: string; method: { label: string; route: string } };

// Một việc cụ thể cho ba mẹ: ôn trò yếu nhất; chưa chơi tuần này thì rủ chơi trò quen nhất; đều tốt thì thử trò bỏ quên
export const pickSuggestion = (name: string, rows: readonly GameRow[], label: (gameName: string) => string, overallFavourite: string | null): Suggestion => {
    const focus = rows.find((row) => row.focus);
    if (focus) {
        const why = focus.change !== null && focus.change <= -5 ? `giảm ${-focus.change} điểm so với tuần trước` : `mới đúng ${focus.accuracy}%`;
        const method = METHOD_FOR_GAME[focus.gameName];
        return { gameName: focus.gameName, method, text: `${label(focus.gameName)} ${why}. Thử cùng ${name} luyện cách "${method.label}" trong 5 phút, rồi đấu một trận.` };
    }
    const played = rows.filter((row) => row.games > 0);
    if (!played.length) {
        const gameName = overallFavourite ?? 'card';
        return { gameName, method: METHOD_FOR_GAME[gameName], text: `Rủ ${name} đấu một trận ${label(gameName)} ngắn để bắt đầu lại nhịp luyện tập.` };
    }
    const skipped = rows.find((row) => row.games === 0);
    if (skipped) {
        return { gameName: skipped.gameName, method: METHOD_FOR_GAME[skipped.gameName], text: `${name} đang luyện tốt. Tuần này con chưa chơi ${label(skipped.gameName)}, thử rủ con đổi gió.` };
    }
    const best = [...played].sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0))[0];
    return { gameName: best.gameName, method: METHOD_FOR_GAME[best.gameName], text: `${name} đang luyện đều cả 5 trò. Đấu cùng con một trận ${label(best.gameName)} để giữ hứng thú.` };
};
