import { useMemo } from 'react';
import { createMockSessions } from '../data/mockSessions';
import { buildBuckets, filterSessions, getRange, summarize } from '../utils/aggregate';
import type { GameFilter, Period } from '../types';

// TODO: thay bằng dữ liệu từ API lịch sử ván chơi khi backend sẵn sàng
const MOCK_SESSIONS = createMockSessions(new Date());

// Mọi số liệu trên dashboard đều tính từ cùng một danh sách ván chơi và cùng bộ lọc,
// nên thẻ thống kê, biểu đồ và bảng lịch sử luôn khớp nhau.
export const useDashboardData = (period: Period, game: GameFilter) =>
    useMemo(() => {
        const now = new Date();
        const sessions = filterSessions(MOCK_SESSIONS, getRange(period, now), game);
        const previousSessions = filterSessions(MOCK_SESSIONS, getRange(period, now, true), game);

        return {
            sessions,
            buckets: buildBuckets(sessions, period, now),
            summary: summarize(sessions),
            previousSummary: summarize(previousSessions),
        };
    }, [period, game]);
