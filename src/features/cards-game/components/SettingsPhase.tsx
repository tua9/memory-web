import { useGameStore } from "../store/gameStore";
import { getCardCountForLevel } from "../utils/cardUtils";

const MAX_LEVEL = 10;

const MEMORIZE_TIME_OPTIONS = [
    { value: 30, label: "30 giây" },
    { value: 60, label: "60 giây" },
    { value: 120, label: "2 phút" },
    { value: 300, label: "5 phút" },
];

const getLevelLabel = (lvl: number) => {
    if (lvl <= 3) return "Mức căn bản";
    if (lvl <= 6) return "Mức trung cấp";
    return "Mức nâng cao";
};

export const SettingsPhase = () => {
    const { level, memorizeTime, setLevel, setMemorizeTime, startGame } = useGameStore();
    const cardCount = getCardCountForLevel(level);
    const timeLabel = MEMORIZE_TIME_OPTIONS.find((o) => o.value === memorizeTime)?.label ?? `${memorizeTime}s`;

    return (
        <main className="min-h-screen bg-[#f5faf7] px-4 pb-16 pt-12 font-sans text-[#202b39]">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="flex items-center gap-2 text-3xl font-extrabold text-[#1a7a4a]">
                        Thẻ bài
                    </h1>
                </div>

                {/* Main Card */}
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
                    {/* Decorative gradient blob */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-br from-[#d4f0e0] to-[#a8e0c4] opacity-40 blur-3xl"
                    />

                    <div className="relative flex flex-col gap-0 sm:flex-row">
                        {/* ── Left: info + start ── */}
                        <div className="flex-1 p-8">
                            {/* Level + badges */}
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-extrabold">Cấp độ {level}</h2>
                                <span className="flex items-center gap-1 rounded-full bg-[#e6f7ed] px-3 py-1 text-xs font-semibold text-[#1a7a4a]">
                                    🌱 {getLevelLabel(level)}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="mb-2 text-[15px] leading-relaxed text-[#202b39]">
                                Bạn có <span className="font-bold">{cardCount} thẻ bài</span> cần ghi nhớ. Ghi nhớ và chọn
                                đúng tất cả để mở khóa cấp độ {level < MAX_LEVEL ? level + 1 : level} nhé!
                            </p>

                            <p className="mb-6 flex items-center gap-1 text-sm text-[#1a7a4a]">
                                <span>✅</span> Độ chính xác yêu cầu: <span className="font-bold">100%</span>
                            </p>

                            {/* Start button */}
                            <button
                                type="button"
                                onClick={startGame}
                                className="flex items-center gap-2 rounded-xl bg-[#1a7a4a] px-7 py-3 text-[15px] font-bold text-white shadow-md transition hover:bg-[#15633c] hover:shadow-lg active:scale-95"
                            >
                                ▶ Bắt đầu
                            </button>
                        </div>

                        {/* ── Divider ── */}
                        <div className="w-px bg-[#e0eee6] self-stretch hidden sm:block" />

                        {/* ── Right: config panel ── */}
                        <div className="flex w-full flex-col gap-4 p-8 sm:w-56 sm:shrink-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#77839a]">
                                Cấu hình
                            </p>

                            {/* Level */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-[#77839a]">Cấp độ</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setLevel(Math.max(1, level - 1))}
                                        disabled={level <= 1}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e0eee6] bg-white text-sm font-bold text-[#77839a] transition hover:border-[#1a7a4a] hover:text-[#1a7a4a] disabled:opacity-30"
                                    >
                                        −
                                    </button>
                                    <span className="flex-1 rounded-lg bg-[#f5faf7] py-1 text-center text-sm font-extrabold text-[#1a7a4a]">
                                        {level}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setLevel(Math.min(MAX_LEVEL, level + 1))}
                                        disabled={level >= MAX_LEVEL}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e0eee6] bg-white text-sm font-bold text-[#77839a] transition hover:border-[#1a7a4a] hover:text-[#1a7a4a] disabled:opacity-30"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Card count */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-[#77839a]">Số thẻ bài</span>
                                <div className="flex items-center justify-between rounded-lg bg-[#f5faf7] px-3 py-1.5">
                                    <span className="text-sm font-extrabold text-[#202b39]">{cardCount}</span>
                                    <span className="text-[11px] text-[#77839a]">lá bài</span>
                                </div>
                            </div>

                            {/* Time limit */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-[#77839a]">Thời gian ghi nhớ</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {MEMORIZE_TIME_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setMemorizeTime(opt.value)}
                                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${memorizeTime === opt.value
                                                ? "bg-[#1a7a4a] text-white shadow-sm"
                                                : "border border-[#e0eee6] bg-white text-[#77839a] hover:border-[#1a7a4a]"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
