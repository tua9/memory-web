interface LevelExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LEVEL_EXPLANATIONS = [
    { level: 1, name: "Cấp 1", cards: "4 thẻ" },
    { level: 2, name: "Cấp 2", cards: "8 thẻ" },
    { level: 3, name: "Cấp 3", cards: "12 thẻ" },
    { level: 4, name: "Cấp 4", cards: "16 thẻ" },
    { level: 5, name: "Cấp 5", cards: "21 thẻ" },
    { level: 6, name: "Cấp 6", cards: "26 thẻ" },
    { level: 7, name: "Cấp 7", cards: "32 thẻ" },
    { level: 8, name: "Cấp 8", cards: "38 thẻ" },
    { level: 9, name: "Cấp 9", cards: "44 thẻ" },
    { level: 10, name: "Cấp 10 🎖️", isMax: true, cards: "52 thẻ" },
];

export const LevelExplanationModal = ({ isOpen, onClose }: LevelExplanationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in">
            {/* Khung chứa Modal */}
            <div className="relative flex max-h-[90vh] w-full max-w-[540px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">

                {/* Header Modal */}
                <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7f1e4] text-xl">
                            🎖️
                        </div>
                        <div>
                            <h2 className="text-[20px] font-extrabold text-[#1f2937]">Giải thích cấp độ</h2>
                            <p className="text-[12px] font-semibold text-[#667085]">Cấp độ Thẻ bài • Cards Levels</p>
                        </div>
                    </div>

                    {/* Nút Đóng (X) */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085] transition hover:bg-[#e4e7ec] cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Nội dung Modal */}
                <div className="flex-1 overflow-y-auto px-6 pb-4">
                    <div className="mb-4 text-[13px] leading-relaxed text-[#40493d]">
                        <p className="font-semibold text-[#1e5824]">
                            Thành viên mới bắt đầu từ Cấp độ 1. <span className="font-normal text-[#40493d]">Ở mỗi cấp độ, bé sẽ được thử thách ghi nhớ nhiều thẻ bài hơn.</span>
                        </p>
                    </div>

                    {/* Bảng danh sách Cấp độ */}
                    <div className="overflow-hidden rounded-2xl border border-[#e3ebe6] bg-[#f8faf9]">
                        <div className="flex bg-[#eff4ff] px-6 py-3 text-[13px] font-bold text-[#40493d]">
                            <span className="w-1/2">Cấp độ</span>
                            <span className="w-1/2 text-right">Số thẻ xuất hiện</span>
                        </div>

                        <div className="divide-y divide-[#e3ebe6] bg-white">
                            {LEVEL_EXPLANATIONS.map((item) => (
                                <div
                                    key={item.level}
                                    className="flex items-center justify-between px-6 py-2.5 text-[14px] transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-[#e0eee6]" />
                                        <span className="font-bold text-[#1f2937]">
                                            {item.name}
                                        </span>
                                    </div>

                                    <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-[12px] font-bold text-[#1f2937]">
                                        {item.cards}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mẹo luyện tập */}
                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#eff4ff] p-3 text-[12px] text-[#40493d]">
                        <span>📍</span>
                        <p>
                            <strong className="font-bold">Mẹo luyện tập:</strong> Hãy nhóm các thẻ bài theo chủ đề hoặc từng mùa (Xuân - Hạ - Thu - Đông) để ghi nhớ dễ dàng hơn.
                        </p>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-end border-t border-[#e3ebe6] bg-white p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-[#2e7d32] px-6 py-2.5 text-[14px] font-bold text-white shadow-md transition hover:bg-[#236527] cursor-pointer"
                    >
                        Đã hiểu & Bắt đầu luyện tập
                    </button>
                </div>
            </div>
        </div>
    );
};
