interface GameGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GameGuideModal = ({ isOpen, onClose }: GameGuideModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in">
            {/* Khung chứa Modal */}
            <div className="relative flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">

                {/* ── 1. Header Modal ── */}
                <div className="flex items-start justify-between p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2e7d32] text-2xl text-white shadow-md">
                            📖
                        </div>
                        <div>
                            <h2 className="mt-1 text-[24px] font-extrabold text-[#1f2937]">
                                Hướng Dẫn Chơi Thẻ Bài
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-semibold text-[#667085]">
                                    Chuẩn Trí Nhớ Thiếu Nhi
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nút Đóng (X) */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff4ff] text-[#667085] transition hover:bg-[#dee9fc] cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* ── 2. Nội dung chính (2 cột) ── */}
                <div className="flex-1 overflow-y-auto p-6 pt-3">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* ── CỘT TRÁI: Mục tiêu, Điểm số & Thời gian ── */}
                        <div className="flex flex-col gap-4">

                            {/* Khối 1: Mục tiêu & Điểm số */}
                            <div className="flex flex-col gap-3 rounded-2xl bg-[#f4f8fb] p-5">
                                <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#0d631b]">
                                    Mục tiêu & Điểm số
                                </h3>

                                <div className="flex items-start gap-2.5 rounded-xl bg-white p-3 shadow-xs">
                                    <span className="text-base">🎯</span>
                                    <p className="text-[13px] leading-relaxed text-[#40493d]">
                                        <strong className="font-bold text-[#0d631b]">Mục tiêu:</strong> Ghi nhớ dãy linh vật ngẫu nhiên chuẩn xác và hoàn thành nhanh nhất có thể.
                                    </p>
                                </div>

                                <div className="flex items-start gap-2.5 rounded-xl bg-white p-3 shadow-xs">
                                    <span className="text-base">✪</span>
                                    <p className="text-[13px] leading-relaxed text-[#40493d]">
                                        <strong className="font-bold text-[#0d631b]">Tính điểm:</strong> Nhớ lại và xếp đúng vị trí mỗi lá bài ban đầu được <span className="font-bold text-[#0d631b]">+1 điểm</span>.
                                    </p>
                                </div>
                            </div>

                            {/* Khối 2: Thời gian quy định */}
                            <div className="flex flex-col gap-3 rounded-2xl bg-[#f4f8fb] p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#0d631b]">
                                        Thời gian quy định
                                    </h3>
                                    <div className="flex gap-1.5">
                                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#667085] border border-[#e3ebe6]">
                                            ⏱ 1p ghi nhớ
                                        </span>
                                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#009e83] border border-[#e3ebe6]">
                                            ⏱ 4p xếp thẻ
                                        </span>
                                    </div>
                                </div>

                                <div className="text-[13px] leading-relaxed text-[#40493d]">
                                    ✓ Bé có thể ấn <span className="rounded-md bg-[#e3ebe6] px-2 py-0.5 font-bold text-[#1f2937]">Dừng sớm</span> nếu đã nhớ xong.
                                </div>

                                {/* Quy tắc vàng */}
                                <div className="flex items-start gap-2 rounded-xl bg-[#eef4f8] p-3 text-[12px] text-[#40493d]">
                                    <span className="text-base">🛡️</span>
                                    <p>
                                        <strong className="font-bold text-[#1f2937]">Quy tắc vàng:</strong> Độ chính xác quan trọng hơn tốc độ! Đúng 10 thẻ trong 60s điểm cao hơn đúng 9 thẻ trong 30s.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── CỘT PHẢI: Thao tác & Phím tắt ── */}
                        <div className="flex flex-col gap-4 rounded-2xl bg-[#edf4fc] p-5">
                            <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#0d631b]">
                                Thao tác & Phím tắt thi đấu
                            </h3>

                            {/* 1. Khi Ghi nhớ */}
                            <div className="flex flex-col gap-2 rounded-xl bg-white p-3.5 shadow-xs">
                                <h4 className="text-[13px] font-bold text-[#009e83]">
                                    1. Khi Ghi nhớ (Lật thẻ linh hoạt)
                                </h4>

                                <div className="flex items-center justify-between border-b border-[#f0f4f8] pb-2 text-[12px]">
                                    <div className="flex gap-1">
                                        <kbd className="rounded bg-[#edf4fc] px-2 py-0.5 font-mono text-[11px] font-bold">→</kbd>
                                        <kbd className="rounded bg-[#edf4fc] px-2 py-0.5 font-mono text-[11px] font-bold">←</kbd>
                                        <span className="ml-1 text-[#40493d]">Lật tiếp / Lùi lại</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <kbd className="rounded bg-[#edf4fc] px-2 py-0.5 font-mono text-[11px] font-bold">Space</kbd>
                                        <span>/</span>
                                        <kbd className="rounded bg-[#edf4fc] px-2 py-0.5 font-mono text-[11px] font-bold">↑</kbd>
                                        <span className="ml-1 text-[#40493d]">Về thẻ đầu</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1 text-[12px] text-[#40493d]">
                                    <kbd className="rounded bg-[#edf4fc] px-2 py-0.5 font-mono text-[11px] font-bold">Enter ↵</kbd>
                                    <span>hoặc</span>
                                    <span className="rounded-full bg-[#0d631b] px-2.5 py-0.5 text-[11px] font-bold text-white">Finished</span>
                                    <span>Hoàn thành ghi nhớ sớm</span>
                                </div>
                            </div>

                            {/* 2. Khi Nhớ lại & Xếp thẻ */}
                            <div className="flex flex-col gap-2.5 rounded-xl bg-white p-3.5 shadow-xs">
                                <h4 className="text-[13px] font-bold text-[#009e83]">
                                    2. Khi Nhớ lại & Xếp thẻ
                                </h4>

                                <div className="grid grid-cols-2 gap-2 text-[12px] text-[#40493d]">
                                    <div className="flex items-center gap-1.5">
                                        <span>⚓</span> Bấm ô trống chọn vị trí
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span>⬆</span> Bấm thẻ dưới để xếp lên
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <kbd className="rounded bg-[#edf4fc] px-2 py-0.5 font-mono text-[11px] font-bold">+</kbd> Chèn thêm thẻ mới
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <kbd className="rounded bg-[#edf4fc] px-2 py-0.5 font-mono text-[11px] font-bold">-</kbd> Xóa thẻ đã xếp
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── 3. Footer Modal ── */}
                <div className="flex items-center justify-between border-t border-[#e3ebe6] bg-white p-4 px-6">
                    <div className="flex items-center gap-2 text-[13px] text-[#40493d]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffdf97] text-xs">💡</span>
                        <span><strong className="font-bold">Mẹo:</strong> Bé có thể thao tác siêu tốc bằng cả chuột lẫn phím tắt!</span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 rounded-full bg-[#0d631b] px-7 py-3 text-[14px] font-bold text-white shadow-md transition hover:bg-[#094713] cursor-pointer"
                    >
                        <span>Đã hiểu</span>
                        <span>➔</span>
                    </button>
                </div>

            </div>
        </div>
    );
};
