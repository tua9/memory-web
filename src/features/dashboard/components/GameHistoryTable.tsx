import { AlertCircle, Check, LoaderCircle, Trophy, X } from 'lucide-react';
import { GAME_META } from '../constants';
import { useGameHistory } from '../hooks/useGameHistory';
import { formatClock, formatDateTime, formatPercent } from '../utils/format';
import type { DateRange, GameFilter, ResultGrade } from '../types';

// Kết quả luôn có icon + chữ, không chỉ dựa vào màu
const GRADE_META: Record<ResultGrade, { label: string; icon: typeof Check; className: string }> = {
    perfect: { label: 'Hoàn hảo', icon: Trophy, className: 'bg-[#fef7e0] text-[#92400e]' },
    pass: { label: 'Đạt', icon: Check, className: 'bg-[#eaf8ef] text-[#246629]' },
    fail: { label: 'Chưa đạt', icon: X, className: 'bg-[#fff1f0] text-[#b42318]' },
};

const GradeBadge = ({ grade }: { grade: ResultGrade }) => {
    const { label, icon: Icon, className } = GRADE_META[grade];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${className}`}>
            <Icon size={13} aria-hidden="true" />
            {label}
        </span>
    );
};

interface GameHistoryTableProps {
    range: DateRange;
    game: GameFilter;
    total: number;  // Tổng số ván trong khoảng thời gian, lấy từ thống kê
}

export const GameHistoryTable = ({ range, game, total }: GameHistoryTableProps) => {
    const { sessions, nextCursor, status, error, loadMore } = useGameHistory(
        range.start.toISOString(),
        range.end.toISOString(),
        game,
    );
    const isFirstLoad = status === 'loading' && sessions.length === 0;

    return (
        <section className="rounded-[24px] border border-[#e3ebe6] bg-white p-5 shadow-[0px_8px_24px_rgba(31,77,51,0.06)] sm:p-6">
            <div className="mb-4">
                <h2 className="text-[17px] font-bold text-[#1f2937]">Lịch sử ván chơi</h2>
                <p className="mt-0.5 text-[13px] text-[#667085]">{total} ván trong khoảng thời gian đã chọn</p>
            </div>

            {isFirstLoad ? (
                <p className="flex items-center justify-center gap-2 py-10 text-[13px] text-[#667085]">
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                    Đang tải lịch sử...
                </p>
            ) : sessions.length === 0 && status !== 'error' ? (
                <p className="py-10 text-center text-[13px] text-[#667085]">Chưa có ván chơi nào trong khoảng thời gian này.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-[13px]">
                            <thead className="text-[12px] text-[#667085]">
                                <tr className="border-b border-[#e3ebe6]">
                                    <th className="py-2.5 pr-4 font-medium">Thời gian</th>
                                    <th className="py-2.5 pr-4 font-medium">Trò chơi</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">Cấp độ</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">Kết quả</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">Độ chính xác</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">Thời lượng</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">EXP</th>
                                    <th className="py-2.5 font-medium">Đánh giá</th>
                                </tr>
                            </thead>
                            <tbody className="text-[#1f2937]">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="border-b border-[#f0f4f1] last:border-0">
                                        <td className="py-3 pr-4 tabular-nums text-[#667085]">{formatDateTime(session.playedAt)}</td>
                                        <td className="py-3 pr-4">
                                            <span className="inline-flex items-center gap-2 font-medium">
                                                <span
                                                    aria-hidden="true"
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{ backgroundColor: GAME_META[session.game].color }}
                                                />
                                                {GAME_META[session.game].label}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-right tabular-nums">
                                            {session.level ?? <span className="text-[#667085]">Tự chọn</span>}
                                        </td>
                                        <td className="py-3 pr-4 text-right tabular-nums">
                                            {session.correctItems}/{session.totalItems}
                                        </td>
                                        <td className="py-3 pr-4 text-right tabular-nums">{formatPercent(session.accuracy)}</td>
                                        <td className="py-3 pr-4 text-right tabular-nums">{formatClock(session.durationSec)}</td>
                                        <td className="py-3 pr-4 text-right tabular-nums font-semibold text-[#2e7d32]">
                                            +{session.expEarned}
                                        </td>
                                        <td className="py-3"><GradeBadge grade={session.grade} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {error && (
                        <p role="alert" className="mt-4 flex items-center gap-2 text-[13px] text-[#b42318]">
                            <AlertCircle size={15} aria-hidden="true" />
                            {error}
                        </p>
                    )}

                    {nextCursor && (
                        <button
                            type="button"
                            onClick={() => void loadMore()}
                            disabled={status === 'loading'}
                            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#e3ebe6] text-[13px] font-semibold text-[#2e7d32] transition-colors hover:bg-[#f3f8f4] disabled:cursor-wait disabled:opacity-70 cursor-pointer"
                        >
                            {status === 'loading' && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
                            {error ? 'Thử lại' : `Xem thêm (${Math.max(total - sessions.length, 0)} ván)`}
                        </button>
                    )}
                </>
            )}
        </section>
    );
};
