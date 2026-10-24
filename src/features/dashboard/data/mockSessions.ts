import { getCardCountForLevel } from '@/features/cards-game/utils/cardUtils';
import { getImageCountForLevel } from '@/features/images-game/utils/imageUtils';
import type { GameId, GameSession } from '../types';

// Dữ liệu mẫu cho dashboard khi chưa có API lịch sử ván chơi.
// Dùng bộ sinh số ngẫu nhiên có seed để mỗi lần tải trang ra cùng một bộ dữ liệu.
const createRandom = (seed: number) => () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Đủ dài để so sánh 6 tháng hiện tại với 6 tháng trước đó
const HISTORY_DAYS = 380;

export const createMockSessions = (now: Date): GameSession[] => {
    const random = createRandom(20261012);
    const sessions: GameSession[] = [];

    for (let daysAgo = HISTORY_DAYS; daysAgo >= 0; daysAgo--) {
        // 0 → 1 theo thời gian: người chơi tiến bộ dần, chơi đều hơn và lên cấp
        const progress = 1 - daysAgo / HISTORY_DAYS;
        const plays = random() < 0.4 ? 0 : 1 + Math.floor(random() * (1 + progress * 2));

        for (let i = 0; i < plays; i++) {
            const game: GameId = random() < 0.55 ? 'cards' : 'images';
            const level = clamp(1 + Math.floor(progress * 5 + random() * 2), 1, 10);
            const totalItems = game === 'cards' ? getCardCountForLevel(level) : getImageCountForLevel(level);
            const skill = 0.5 + progress * 0.38 + (random() - 0.5) * 0.3 - (game === 'cards' ? 0.05 : 0);

            const playedAt = new Date(now);
            playedAt.setDate(now.getDate() - daysAgo);
            playedAt.setHours(7 + Math.floor(random() * 15), Math.floor(random() * 60), 0, 0);
            if (playedAt > now) playedAt.setTime(now.getTime() - Math.floor(random() * 3_600_000));

            sessions.push({
                id: `mock-${sessions.length + 1}`,
                game,
                playedAt,
                level,
                totalItems,
                correctItems: clamp(Math.round(totalItems * skill), 0, totalItems),
                durationSec: Math.round(totalItems * (6 + random() * 6)),
            });
        }
    }

    return sessions.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
};
