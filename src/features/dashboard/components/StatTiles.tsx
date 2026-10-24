import type { ReactNode } from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { formatPercent, formatTotalDuration } from '../utils/aggregate';
import type { DashboardSummary } from '../types';

interface DeltaProps {
    value: number;
    formatted: string;
    compareLabel: string;
}

// Mọi chỉ số trên dashboard đều "tăng là tốt"
const Delta = ({ value, formatted, compareLabel }: DeltaProps) => {
    const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
    const color = value > 0 ? 'text-[#2e7d32]' : value < 0 ? 'text-[#b42318]' : 'text-[#667085]';

    return (
        <p className="mt-2 flex items-center gap-1 text-[12px] text-[#667085]">
            <span className={`inline-flex items-center gap-1 font-semibold ${color}`}>
                <Icon size={14} aria-hidden="true" />
                {formatted}
            </span>
            {compareLabel}
        </p>
    );
};

const StatTile = ({ label, value, footer }: { label: string; value: string; footer: ReactNode }) => (
    <div className="rounded-[20px] border border-[#e3ebe6] bg-white p-5 shadow-[0px_8px_24px_rgba(31,77,51,0.06)]">
        <p className="text-[13px] font-medium text-[#667085]">{label}</p>
        <p className="mt-2 text-[28px] font-bold leading-none text-[#1f2937]">{value}</p>
        {footer}
    </div>
);

const signed = (value: number, unit: string) => `${value > 0 ? '+' : ''}${value}${unit}`;

interface StatTilesProps {
    summary: DashboardSummary;
    previousSummary: DashboardSummary;
    compareLabel: string;
}

export const StatTiles = ({ summary, previousSummary, compareLabel }: StatTilesProps) => {
    const playedDelta = summary.played - previousSummary.played;
    const accuracyDelta =
        summary.accuracy !== null && previousSummary.accuracy !== null
            ? Math.round((summary.accuracy - previousSummary.accuracy) * 100)
            : null;
    const durationDelta = Math.round((summary.durationSec - previousSummary.durationSec) / 60);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
                label="Số ván đã chơi"
                value={new Intl.NumberFormat('vi-VN').format(summary.played)}
                footer={<Delta value={playedDelta} formatted={signed(playedDelta, ' ván')} compareLabel={compareLabel} />}
            />
            <StatTile
                label="Độ chính xác trung bình"
                value={formatPercent(summary.accuracy)}
                footer={
                    accuracyDelta === null ? (
                        <p className="mt-2 text-[12px] text-[#667085]">Chưa đủ dữ liệu để so sánh</p>
                    ) : (
                        <Delta value={accuracyDelta} formatted={signed(accuracyDelta, ' điểm %')} compareLabel={compareLabel} />
                    )
                }
            />
            <StatTile
                label="Cấp độ cao nhất"
                value={summary.bestLevel === null ? '—' : `Cấp ${summary.bestLevel}`}
                footer={<p className="mt-2 text-[12px] text-[#667085]">{summary.perfectCount} ván hoàn hảo (100%)</p>}
            />
            <StatTile
                label="Thời gian luyện tập"
                value={formatTotalDuration(summary.durationSec)}
                footer={<Delta value={durationDelta} formatted={signed(durationDelta, ' phút')} compareLabel={compareLabel} />}
            />
        </div>
    );
};
