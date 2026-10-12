import { useState, useEffect } from "react";
import { useImagesGameStore } from "../store/imagesGameStore";

interface ImagesPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ImagesPreferencesModal = ({ isOpen, onClose }: ImagesPreferencesModalProps) => {
    const { preferences, setPreferences } = useImagesGameStore();

    const [groups, setGroups] = useState(preferences.groups);
    const [hideTimer, setHideTimer] = useState(preferences.hideTimer);
    const [prepTime, setPrepTime] = useState(preferences.prepTime);

    useEffect(() => {
        if (isOpen) {
            setGroups(preferences.groups);
            setHideTimer(preferences.hideTimer);
            setPrepTime(preferences.prepTime);
        }
    }, [isOpen, preferences]);

    if (!isOpen) return null;

    const handleSave = () => {
        setPreferences({
            groups: Math.max(1, Math.min(5, groups)),
            hideTimer,
            prepTime,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in">
            <div className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-[#f2f4f7] p-6 pb-5">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7f1e4] text-2xl text-[#1a7a4a] shadow-xs">
                            ⚙️
                        </div>
                        <div>
                            <h2 className="text-[20px] font-extrabold text-[#1f2937]">
                                Tùy chọn ghi nhớ
                            </h2>
                            <p className="text-[12px] font-semibold text-[#667085]">
                                Cấu hình bài thi hình ảnh • Preferences
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085] transition hover:bg-[#e4e7ec] cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 space-y-3.5 overflow-y-auto p-6">

                    <div className="flex items-center justify-between rounded-2xl border border-[#e0eee6] bg-[#f8faf9] p-4 transition hover:bg-[#f1f7f4]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7ed] text-lg text-[#1a7a4a]">
                                🖼️
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-[#1f2937]">Nhóm ảnh cùng lúc</h4>
                                <p className="text-[12px] text-[#667085]">Số lượng ảnh hiển thị đồng thời (1 - 5 ảnh)</p>
                            </div>
                        </div>

                        <div className="flex items-center rounded-xl border border-[#d7e5dd] bg-white p-1 shadow-xs">
                            <button
                                type="button"
                                onClick={() => setGroups(Math.max(1, groups - 1))}
                                disabled={groups <= 1}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[#40493d] transition hover:bg-[#e6f7ed] disabled:opacity-30 cursor-pointer"
                            >
                                −
                            </button>
                            <span className="w-9 text-center text-sm font-bold text-[#1f2937]">
                                {groups}
                            </span>
                            <button
                                type="button"
                                onClick={() => setGroups(Math.min(5, groups + 1))}
                                disabled={groups >= 5}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[#40493d] transition hover:bg-[#e6f7ed] disabled:opacity-30 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-[#e0eee6] bg-[#f8faf9] p-4 transition hover:bg-[#f1f7f4]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7ed] text-lg text-[#1a7a4a]">
                                ⏱️
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-[#1f2937]">Ẩn đồng hồ bấm giờ</h4>
                                <p className="text-[12px] text-[#667085]">Ẩn thời gian đếm ngược trong lúc ghi nhớ</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={hideTimer}
                            onClick={() => setHideTimer(!hideTimer)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${hideTimer ? "bg-[#2e7d32]" : "bg-[#d1d5db]"
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${hideTimer ? "translate-x-5" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#e3ebe6] bg-[#f8faf9]/50 p-4.5 px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-[#f2f4f7] px-6 py-2.5 text-[14px] font-bold text-[#667085] transition hover:bg-[#e4e7ec] cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-full bg-[#2e7d32] px-7 py-2.5 text-[14px] font-bold text-white shadow-md shadow-[#2e7d32]/20 transition hover:bg-[#236527] active:scale-95 cursor-pointer"
                    >
                        Lưu tùy chọn
                    </button>
                </div>
            </div>
        </div>
    );
};
