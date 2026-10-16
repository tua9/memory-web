import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import {
  clampCardCount,
  getCardCountForLevel,
  MAX_CARD_COUNT,
  MIN_CARD_COUNT,
} from "../utils/cardUtils";

interface CardPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardPreferencesModal = ({
  isOpen,
  onClose,
}: CardPreferencesModalProps) => {
  const {
    preferences,
    setPreferences,
    memorizeTime,
    setMemorizeTime,
    recallTime,
    setRecallTime,
    level,
  } = useGameStore();

  const [hideTimer, setHideTimer] = useState(preferences.hideTimer);
  const [tempCardCount, setTempCardCount] = useState(
    preferences.cardCount ?? getCardCountForLevel(level),
  );
  const [tempGroups, setTempGroups] = useState(preferences.groups || 1);
  const [tempMemorizeTime, setTempMemorizeTime] = useState(memorizeTime);
  const [tempRecallTime, setTempRecallTime] = useState(recallTime);

  if (!isOpen) return null;

  const handleSave = () => {
    setMemorizeTime(tempMemorizeTime);
    setRecallTime(tempRecallTime);
    setPreferences({ hideTimer, cardCount: tempCardCount, groups: tempGroups });
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
                Cấu hình bài thi thẻ bài
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng tùy chọn"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085] transition hover:bg-[#e4e7ec] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3.5 overflow-y-auto p-6">
          <div className="flex items-center justify-between rounded-2xl border border-[#e0eee6] bg-[#f8faf9] p-4 transition hover:bg-[#f1f7f4]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7ed] text-lg text-[#1a7a4a]">
                🃏
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#1f2937]">
                  Nhóm thẻ cùng lúc
                </h4>
                <p className="text-[12px] text-[#667085]">
                  Số lá bài hiển thị trong mỗi lượt (1 - 5)
                </p>
              </div>
            </div>
            <div className="flex items-center rounded-xl border border-[#d7e5dd] bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setTempGroups(Math.max(1, tempGroups - 1))}
                disabled={tempGroups <= 1}
                aria-label="Giảm số thẻ trong nhóm"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[#40493d] transition hover:bg-[#e6f7ed] disabled:opacity-30 cursor-pointer"
              >
                −
              </button>
              <span className="w-9 text-center text-sm font-bold text-[#1f2937]">
                {tempGroups}
              </span>
              <button
                type="button"
                onClick={() => setTempGroups(Math.min(5, tempGroups + 1))}
                disabled={tempGroups >= 5}
                aria-label="Tăng số thẻ trong nhóm"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[#40493d] transition hover:bg-[#e6f7ed] disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#e0eee6] bg-[#f8faf9] p-4 transition hover:bg-[#f1f7f4]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7ed] text-lg text-[#1a7a4a]">
                🃏
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#1f2937]">
                  Số lượng thẻ
                </h4>
                <p className="text-[12px] text-[#667085]">
                  Chọn từ {MIN_CARD_COUNT} đến {MAX_CARD_COUNT} lá bài
                </p>
              </div>
            </div>
            <div className="flex items-center rounded-xl border border-[#d7e5dd] bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() =>
                  setTempCardCount(clampCardCount(tempCardCount - 1))
                }
                disabled={tempCardCount <= MIN_CARD_COUNT}
                aria-label="Giảm số lượng thẻ"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[#40493d] transition hover:bg-[#e6f7ed] disabled:opacity-30 cursor-pointer"
              >
                −
              </button>
              <input
                type="number"
                min={MIN_CARD_COUNT}
                max={MAX_CARD_COUNT}
                step={1}
                value={tempCardCount}
                onChange={(event) =>
                  setTempCardCount(clampCardCount(Number(event.target.value)))
                }
                aria-label="Số lượng thẻ"
                className="w-12 appearance-none bg-transparent text-center text-sm font-bold text-[#1f2937] outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setTempCardCount(clampCardCount(tempCardCount + 1))
                }
                disabled={tempCardCount >= MAX_CARD_COUNT}
                aria-label="Tăng số lượng thẻ"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[#40493d] transition hover:bg-[#e6f7ed] disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#e0eee6] bg-[#f8faf9] p-4 transition hover:bg-[#f1f7f4]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7ed] text-lg text-[#1a7a4a]">
                🧠
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#1f2937]">
                  Thời gian ghi nhớ
                </h4>
                <p className="text-[12px] text-[#667085]">
                  Thời gian xem và ghi nhớ thứ tự các lá bài
                </p>
              </div>
            </div>
            <select
              value={tempMemorizeTime}
              onChange={(event) =>
                setTempMemorizeTime(Number(event.target.value))
              }
              aria-label="Thời gian ghi nhớ"
              className="rounded-xl border border-[#d7e5dd] bg-white px-3.5 py-2 text-sm font-bold text-[#1f2937] shadow-xs transition focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 focus:outline-none cursor-pointer"
            >
              <option value={30}>30 giây</option>
              <option value={60}>1 phút</option>
              <option value={120}>2 phút</option>
              <option value={180}>3 phút</option>
              <option value={300}>5 phút</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#e0eee6] bg-[#f8faf9] p-4 transition hover:bg-[#f1f7f4]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7ed] text-lg text-[#1a7a4a]">
                🎯
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#1f2937]">
                  Thời gian hoàn thành
                </h4>
                <p className="text-[12px] text-[#667085]">
                  Thời gian tối đa để xếp lại các lá bài
                </p>
              </div>
            </div>
            <select
              value={tempRecallTime}
              onChange={(event) =>
                setTempRecallTime(Number(event.target.value))
              }
              aria-label="Thời gian hoàn thành"
              className="rounded-xl border border-[#d7e5dd] bg-white px-3.5 py-2 text-sm font-bold text-[#1f2937] shadow-xs transition focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 focus:outline-none cursor-pointer"
            >
              <option value={60}>1 phút</option>
              <option value={120}>2 phút</option>
              <option value={180}>3 phút</option>
              <option value={300}>5 phút</option>
              <option value={600}>10 phút</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#e0eee6] bg-[#f8faf9] p-4 transition hover:bg-[#f1f7f4]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f7ed] text-lg text-[#1a7a4a]">
                ⏱️
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#1f2937]">
                  Ẩn đồng hồ bấm giờ
                </h4>
                <p className="text-[12px] text-[#667085]">
                  Ẩn đồng hồ trong lúc ghi nhớ
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Ẩn đồng hồ bấm giờ"
              aria-checked={hideTimer}
              onClick={() => setHideTimer(!hideTimer)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${hideTimer ? "bg-[#2e7d32]" : "bg-[#d1d5db]"}`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${hideTimer ? "translate-x-5" : "translate-x-0"}`}
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
