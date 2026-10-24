import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GameHistoryTable } from '../components/GameHistoryTable';
import { ProgressChart } from '../components/ProgressChart';
import { SegmentedControl } from '../components/SegmentedControl';
import { StatTiles } from '../components/StatTiles';
import { GAME_IDS } from '../constants';
import { useDashboardData } from '../hooks/useDashboardData';
import { PERIOD_CONFIG } from '../utils/aggregate';
import type { GameFilter, Period } from '../types';

const PERIOD_OPTIONS = [
    { value: 'week', label: 'Theo tuần' },
    { value: 'month', label: 'Theo tháng' },
] as const;

const GAME_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'cards', label: 'Thẻ bài' },
    { value: 'images', label: 'Hình ảnh' },
] as const;

export const DashboardPage = () => {
    const [period, setPeriod] = useState<Period>('week');
    const [game, setGame] = useState<GameFilter>('all');
    const { sessions, buckets, summary, previousSummary } = useDashboardData(period, game);

    const games = game === 'all' ? GAME_IDS : [game];
    const { label: periodLabel, compareLabel } = PERIOD_CONFIG[period];

    return (
        <div className="min-h-screen bg-[#f8fbf8] text-[#1f2937]">
            <Header />

            <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-[30px] font-extrabold tracking-tight sm:text-[36px]">Tiến độ của bạn</h1>
                        <p className="mt-1 text-[14px] text-[#667085]">
                            Theo dõi số ván, độ chính xác và lịch sử luyện tập · {periodLabel}
                        </p>
                    </div>
                    <span className="rounded-full bg-[#fef7e0] px-3 py-1 text-[12px] font-semibold text-[#92400e]">
                        Dữ liệu mẫu
                    </span>
                </div>

                {/* Bộ lọc áp dụng cho toàn bộ nội dung bên dưới */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <SegmentedControl label="Khoảng thời gian" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
                    <SegmentedControl label="Trò chơi" options={GAME_OPTIONS} value={game} onChange={setGame} />
                </div>

                <div className="space-y-6">
                    <StatTiles summary={summary} previousSummary={previousSummary} compareLabel={compareLabel} />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <ProgressChart
                            title="Độ chính xác"
                            description={`Tỷ lệ nhớ đúng ${period === 'week' ? 'mỗi tuần' : 'mỗi tháng'}`}
                            metric="accuracy"
                            buckets={buckets}
                            games={games}
                        />
                        <ProgressChart
                            title="Số ván đã chơi"
                            description={`Số ván hoàn thành ${period === 'week' ? 'mỗi tuần' : 'mỗi tháng'}`}
                            metric="played"
                            buckets={buckets}
                            games={games}
                        />
                    </div>

                    {/* key: quay về trang đầu của lịch sử khi đổi bộ lọc */}
                    <GameHistoryTable key={`${period}-${game}`} sessions={sessions} />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
