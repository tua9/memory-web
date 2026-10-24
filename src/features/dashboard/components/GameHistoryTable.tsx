import { useState } from 'react';
import { Check, Trophy, X } from 'lucide-react';
import { GAME_META } from '../constants';
import {
    accuracyOfSession,
    formatClock,
    formatDateTime,
    formatPercent,
    gradeOf,
} from '../utils/aggregate';
import type { GameSession, ResultGrade } from '../types';

const PAGE_SIZE = 10;

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
    sessions: GameSession[];    // Đã sắp xếp mới nhất trước
}

export const GameHistoryTable = ({ sessions }: GameHistoryTableProps) => {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const visibleSessions = sessions.slice(0, visibleCount);

    return (
        <section className="rounded-[24px] border border-[#e3ebe6] bg-white p-5 shadow-[0px_8px_24px_rgba(31,77,51,0.06)] sm:p-6">
            <div className="mb-4">
                <h2 className="text-[17px] font-bold text-[#1f2937]">Lịch sử ván chơi</h2>
                <p className="mt-0.5 text-[13px] text-[#667085]">{sessions.length} ván trong khoảng thời gian đã chọn</p>
            </div>

            {sessions.length === 0 ? (
                <p className="py-10 text-center text-[13px] text-[#667085]">Chưa có ván chơi nào trong khoảng thời gian này.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-[13px]">
                            <thead className="text-[12px] text-[#667085]">
                                <tr className="border-b border-[#e3ebe6]">
                                    <th className="py-2.5 pr-4 font-medium">Thời gian</th>
                                    <th className="py-2.5 pr-4 font-medium">Trò chơi</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">Cấp độ</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">Kết quả</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">Độ chính xác</th>
                                    <th className="py-2.5 pr-4 text-right font-medium">Thời lượng</th>
                                    <th className="py-2.5 font-medium">Đánh giá</th>
                                </tr>
                            </thead>
                            <tbody className="text-[#1f2937]">
                                {visibleSessions.map((session) => (
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
                                        <td className="py-3 pr-4 text-right tabular-nums">{session.level}</td>
                                        <td className="py-3 pr-4 text-right tabular-nums">
                                            {session.correctItems}/{session.totalItems}
                                        </td>
                                        <td className="py-3 pr-4 text-right tabular-nums">
                                            {formatPercent(accuracyOfSession(session))}
                                        </td>
                                        <td className="py-3 pr-4 text-right tabular-nums">{formatClock(session.durationSec)}</td>
                                        <td className="py-3"><GradeBadge grade={gradeOf(session)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {visibleCount < sessions.length && (
                        <button
                            type="button"
                            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                            className="mt-4 h-10 w-full rounded-[12px] border border-[#e3ebe6] text-[13px] font-semibold text-[#2e7d32] transition-colors hover:bg-[#f3f8f4] cursor-pointer"
                        >
                            Xem thêm ({sessions.length - visibleCount} ván)
                        </button>
                    )}
                </>
            )}
        </section>
    );
};
