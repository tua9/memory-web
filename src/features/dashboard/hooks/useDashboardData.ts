import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import { toPeriodBucket } from '../utils/format';
import type { DashboardSummary, DateRange, GameFilter, Period, PeriodBucket } from '../types';

export interface DashboardData {
    buckets: PeriodBucket[];
    summary: DashboardSummary;
    previousSummary: DashboardSummary;
    range: DateRange;
}

export type DashboardState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; data: DashboardData };

// Thẻ thống kê, biểu đồ và bảng lịch sử dùng cùng khoảng thời gian và bộ lọc do backend tính,
// nên các con số luôn khớp nhau.
export const useDashboardData = (period: Period, game: GameFilter) => {
    const [state, setState] = useState<DashboardState>({ status: 'loading' });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        const loadTimeline = async () => {
            setState({ status: 'loading' });
            try {
                const { data: { timeline } } = await dashboardApi.getTimeline(period, game);
                if (!isCurrent) return;
                setState({
                    status: 'ready',
                    data: {
                        buckets: timeline.buckets.map((bucket) => toPeriodBucket(bucket, period, timeline.timeZone)),
                        summary: timeline.summary,
                        previousSummary: timeline.previousSummary,
                        range: { start: new Date(timeline.range.start), end: new Date(timeline.range.end) },
                    },
                });
            } catch (error) {
                if (isCurrent) {
                    setState({
                        status: 'error',
                        message: (error as { message?: string }).message ?? 'Không thể tải tiến độ. Vui lòng thử lại.',
                    });
                }
            }
        };

        void loadTimeline();
        return () => {
            isCurrent = false;
        };
    }, [period, game, reloadKey]);

    const reload = useCallback(() => setReloadKey((key) => key + 1), []);

    return { state, reload };
};
