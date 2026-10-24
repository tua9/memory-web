import { useState } from 'react';
import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { GameHistoryTable } from '../components/GameHistoryTable';
import { ProgressChart } from '../components/ProgressChart';
import { SegmentedControl } from '../components/SegmentedControl';
import { StatTiles } from '../components/StatTiles';
import { GAME_IDS } from '../constants';
import { useDashboardData } from '../hooks/useDashboardData';
import { describePeriod } from '../utils/format';
import type { GameFilter, Period } from '../types';

const PERIOD_OPTIONS = [
    { value: 'week', label: 'Theo tuần' },
    { value: 'month', label: 'Theo tháng' },
] as const;

const GAME_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'card', label: 'Thẻ bài' },
    { value: 'image', label: 'Hình ảnh' },
] as const;

const PANEL_CLASS = 'rounded-[24px] border border-[#e3ebe6] bg-white p-10 text-center shadow-[0px_8px_24px_rgba(31,77,51,0.06)]';

export const DashboardPage = () => {
    const [period, setPeriod] = useState<Period>('week');
    const [game, setGame] = useState<GameFilter>('all');
    const { state, reload } = useDashboardData(period, game);

    const games = game === 'all' ? GAME_IDS : [game];
    const periodText = state.status === 'ready' ? describePeriod(period, state.data.buckets.length) : null;

    return (
        <div className="min-h-screen bg-[#f8fbf8] text-[#1f2937]">
            <Header />

            <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10">
                <div className="mb-6">
                    <h1 className="text-[30px] font-extrabold tracking-tight sm:text-[36px]">Tiến độ của bạn</h1>
                    <p className="mt-1 text-[14px] text-[#667085]">
                        Theo dõi số ván, độ chính xác và lịch sử luyện tập{periodText && ` · ${periodText.label}`}
                    </p>
                </div>

                {/* Bộ lọc áp dụng cho toàn bộ nội dung bên dưới */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <SegmentedControl label="Khoảng thời gian" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
                    <SegmentedControl label="Trò chơi" options={GAME_OPTIONS} value={game} onChange={setGame} />
                </div>

                {state.status === 'loading' && (
                    <div className={PANEL_CLASS}>
                        <p className="flex items-center justify-center gap-2 text-[14px] text-[#667085]">
                            <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                            Đang tải tiến độ...
                        </p>
                    </div>
                )}

                {state.status === 'error' && (
                    <div role="alert" className={PANEL_CLASS}>
                        <p className="flex items-center justify-center gap-2 text-[14px] font-semibold text-[#b42318]">
                            <AlertCircle size={18} aria-hidden="true" />
                            {state.message}
                        </p>
                        <button
                            type="button"
                            onClick={reload}
                            className="mx-auto mt-4 inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e3ebe6] px-4 text-[13px] font-semibold text-[#2e7d32] transition-colors hover:bg-[#f3f8f4] cursor-pointer"
                        >
                            <RefreshCw size={15} aria-hidden="true" />
                            Thử lại
                        </button>
                    </div>
                )}

                {state.status === 'ready' && periodText && (
                    <div className="space-y-6">
                        <StatTiles
                            summary={state.data.summary}
                            previousSummary={state.data.previousSummary}
                            compareLabel={periodText.compareLabel}
                        />

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <ProgressChart
                                title="Độ chính xác"
                                description={`Tỷ lệ nhớ đúng ${period === 'week' ? 'mỗi tuần' : 'mỗi tháng'}`}
                                metric="accuracy"
                                buckets={state.data.buckets}
                                games={games}
                            />
                            <ProgressChart
                                title="Số ván đã chơi"
                                description={`Số ván hoàn thành ${period === 'week' ? 'mỗi tuần' : 'mỗi tháng'}`}
                                metric="played"
                                buckets={state.data.buckets}
                                games={games}
                            />
                        </div>

                        {/* key: tải lại lịch sử từ trang đầu khi đổi bộ lọc hoặc khoảng thời gian */}
                        <GameHistoryTable
                            key={`${period}-${game}-${state.data.range.start.toISOString()}`}
                            range={state.data.range}
                            game={game}
                            total={state.data.summary.played}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;
