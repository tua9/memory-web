import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { calculateScore } from "../utils/cardUtils";
import type { Card, Suit } from "../types/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const SUIT_SYMBOLS: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
};

const SUIT_LABELS: Record<Suit, string> = {
    hearts: "Cơ",
    diamonds: "Rô",
    clubs: "Tép",
    spades: "Bích",
};

const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";

const MAX_LEVEL = 10;

// ─── Sub-components ──────────────────────────────────────────────────────────

const CardChip = ({
    card,
    isCorrect,
    showMark = false,
}: {
    card: Card | null;
    isCorrect?: boolean;
    showMark?: boolean;
}) => {
    if (!card) {
        return (
            <div className="flex h-16 w-12 items-center justify-center rounded-xl border-2 border-dashed border-[#c8d8d0] text-sm text-[#c8d8d0]">
                —
            </div>
        );
    }

    const red = isRed(card.suit);
    const borderColor = showMark
        ? isCorrect
            ? "#1a7a4a"
            : "#e45454"
        : "#e0eee6";
    const bgColor = showMark ? (isCorrect ? "#e6f7ed" : "#fef2f2") : "#fff";

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="flex h-16 w-12 flex-col items-center justify-center gap-0.5 rounded-xl border-2 text-[11px] font-bold"
                style={{ borderColor, backgroundColor: bgColor }}
            >
                <span
                    className="text-base leading-none"
                    style={{ color: red ? "#e45454" : "#202b39" }}
                >
                    {SUIT_SYMBOLS[card.suit]}
                </span>
                <span className="text-[10px] font-bold text-[#202b39]">
                    {card.rank}
                </span>
            </div>
            {showMark && (
                <span
                    className="text-xs font-bold"
                    style={{ color: isCorrect ? "#1a7a4a" : "#e45454" }}
                >
                    {isCorrect ? "✓" : "✗"}
                </span>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ResultPhase = () => {
    const { cardsToMemorize, userRecall, resetGame, level, setLevel } =
        useGameStore();

    const score = calculateScore(cardsToMemorize, userRecall as Card[]);
    const isPerfect = score === cardsToMemorize.length;
    const percentage = Math.round((score / cardsToMemorize.length) * 100);

    const handlePlayAgain = () => {
        if (isPerfect && level < MAX_LEVEL) {
            setLevel(level + 1);
        }
        resetGame();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") handlePlayAgain();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPerfect, level, setLevel, resetGame]);

    return (
        <div className="flex min-h-screen flex-col bg-[#f5faf7] font-sans text-[#202b39]">
            {/* ── Top bar ── */}
            <header className="flex items-center justify-between gap-4 border-b border-[#e0eee6] bg-white px-6 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-[#1a7a4a]">Thẻ bài</span>
                    <span className="text-[#c8d8d0]">•</span>
                    <span className="rounded-full bg-[#e6f7ed] px-2 py-0.5 text-xs font-semibold text-[#1a7a4a]">
                        Cấp độ {level}
                    </span>
                </div>
                <p className="text-xs text-[#77839a]">Kết quả lượt chơi</p>
            </header>

            <main className="flex flex-1 flex-col items-center gap-8 overflow-auto px-4 py-8">
                {/* ── Score card ── */}
                <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-sm">
                    {/* Decorative blob */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full opacity-40 blur-2xl"
                        style={{
                            background: isPerfect
                                ? "radial-gradient(circle, #a8e0c4, #d4f0e0)"
                                : "radial-gradient(circle, #fca5a5, #fee2e2)",
                        }}
                    />

                    {/* Score */}
                    <div
                        className="mb-1 text-6xl font-extrabold"
                        style={{ color: isPerfect ? "#1a7a4a" : "#e45454" }}
                    >
                        {score}
                        <span className="text-2xl font-medium text-[#77839a]">
                            /{cardsToMemorize.length}
                        </span>
                    </div>

                    <div className="mb-4 text-sm font-semibold text-[#77839a]">
                        Độ chính xác:{" "}
                        <span
                            className="font-extrabold"
                            style={{ color: isPerfect ? "#1a7a4a" : "#e45454" }}
                        >
                            {percentage}%
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6 h-2.5 w-full overflow-hidden rounded-full bg-[#e6f7ed]">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: isPerfect ? "#1a7a4a" : "#e45454",
                            }}
                        />
                    </div>

                    {/* Message */}
                    {isPerfect && level < MAX_LEVEL && (
                        <p className="mb-4 text-sm font-semibold text-[#1a7a4a]">
                            🎉 Tuyệt vời! Bạn đã mở khoá <strong>Cấp độ {level + 1}</strong>
                        </p>
                    )}
                    {isPerfect && level === MAX_LEVEL && (
                        <p className="mb-4 text-sm font-semibold text-[#1a7a4a]">
                            🏆 Chúc mừng! Bạn đã chinh phục cấp độ cao nhất!
                        </p>
                    )}
                    {!isPerfect && (
                        <p className="mb-4 text-sm text-[#77839a]">
                            Hãy cố gắng hơn ở lần tiếp theo nhé!
                        </p>
                    )}

                    {/* CTA button */}
                    <button
                        type="button"
                        onClick={handlePlayAgain}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-bold text-white shadow-md transition hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: "#1a7a4a" }}
                    >
                        {isPerfect && level < MAX_LEVEL ? "▶ Chơi Cấp độ tiếp theo" : "↩ Chơi lại"}
                    </button>

                    <p className="mt-3 text-xs text-[#c8d8d0]">
                        hoặc nhấn{" "}
                        <kbd className="rounded border border-[#e0eee6] bg-[#f5faf7] px-1 py-0.5 font-mono text-[10px] text-[#77839a]">
                            Enter
                        </kbd>
                    </p>
                </div>

                {/* ── Your answer ── */}
                <section className="w-full max-w-4xl rounded-2xl border border-[#e0eee6] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#77839a]">
                        Bài làm của bạn
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {userRecall.map((card, index) => {
                            const correct = cardsToMemorize[index];
                            const isCorrect =
                                card?.suit === correct.suit && card?.rank === correct.rank;
                            return (
                                <div key={`user-${index}`} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-[#77839a]">{index + 1}</span>
                                    <CardChip card={card} isCorrect={isCorrect} showMark />
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Correct answer ── */}
                <section className="w-full max-w-4xl rounded-2xl border border-[#e0eee6] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#77839a]">
                        Thứ tự đúng
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {cardsToMemorize.map((card, index) => (
                            <div key={`correct-${index}`} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] text-[#77839a]">{index + 1}</span>
                                <div className="flex h-16 w-12 flex-col items-center justify-center gap-0.5 rounded-xl border border-[#1a7a4a] bg-[#e6f7ed] text-[11px] font-bold">
                                    <span
                                        className="text-base leading-none"
                                        style={{ color: isRed(card.suit) ? "#e45454" : "#202b39" }}
                                    >
                                        {SUIT_SYMBOLS[card.suit]}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#202b39]">
                                        {card.rank}
                                    </span>
                                </div>
                                <span className="text-[9px] text-[#77839a]">
                                    {SUIT_LABELS[card.suit]}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};
