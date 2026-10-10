import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { usePhaseTimer } from "../hooks/usePhaseTimer";
import type { Card, Suit } from "../types/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const SUIT_SYMBOLS: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
};

const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";

// ─── Sub-components ──────────────────────────────────────────────────────────

/** A single answer slot (empty or filled) */
const AnswerSlot = ({
    card,
    index,
    isSelected,
    onClickEmpty,
    onClickFilled,
}: {
    card: Card | null;
    index: number;
    isSelected: boolean;
    onClickEmpty: () => void;
    onClickFilled: () => void;
}) => {
    if (card) {
        const red = isRed(card.suit);
        return (
            <button
                type="button"
                onClick={onClickFilled}
                title="Click để trả bài về deck"
                className="flex h-16 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-[#1a7a4a] bg-[#e6f7ed] shadow-sm transition hover:border-red-400 hover:bg-red-50"
            >
                <span
                    className="text-base leading-none"
                    style={{ color: red ? "#e45454" : "#202b39" }}
                >
                    {SUIT_SYMBOLS[card.suit]}
                </span>
                <span
                    className="text-[11px] font-bold"
                    style={{ color: red ? "#e45454" : "#202b39" }}
                >
                    {card.rank}
                </span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClickEmpty}
            title="Chọn ô này"
            className={`flex h-16 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-dashed text-sm font-bold transition-all ${
                isSelected
                    ? "border-[#1a7a4a] bg-[#e6f7ed] text-[#1a7a4a]"
                    : "border-[#c8d8d0] bg-transparent text-[#77839a] hover:border-[#1a7a4a]"
            }`}
        >
            {isSelected ? "✎" : index + 1}
        </button>
    );
};

/** A deck card tile */
const DeckTile = ({
    card,
    isUsed,
    onClick,
}: {
    card: Card;
    isUsed: boolean;
    onClick: () => void;
}) => {
    const red = isRed(card.suit);
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isUsed}
            className={`flex h-14 w-10 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border text-[11px] font-bold transition-all ${
                isUsed
                    ? "cursor-not-allowed border-[#e0eee6] bg-white opacity-25 grayscale"
                    : "cursor-pointer border-[#e0eee6] bg-white hover:-translate-y-1 hover:border-[#1a7a4a] hover:shadow-sm"
            }`}
        >
            <span
                className="text-base leading-none"
                style={{ color: isUsed ? "#aaa" : red ? "#e45454" : "#202b39" }}
            >
                {SUIT_SYMBOLS[card.suit]}
            </span>
            <span
                className="text-[10px] font-bold"
                style={{ color: isUsed ? "#aaa" : "#202b39" }}
            >
                {card.rank}
            </span>
        </button>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const RecallPhase = () => {
    const {
        cardsToMemorize,
        userRecall,
        deckCards,
        selectedSlotIndex,
        selectSlot,
        placeCard,
        removeCard,
        finishGame,
        phaseDeadline,
        level,
        resetGame,
    } = useGameStore();

    const { formattedTime } = usePhaseTimer(phaseDeadline, finishGame);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") finishGame();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [finishGame]);

    const filledCount = userRecall.filter(Boolean).length;

    return (
        <div className="flex min-h-screen flex-col bg-[#f5faf7] font-sans text-[#202b39]">
            {/* ── Top bar ── */}
            <header className="flex items-center justify-between gap-4 border-b border-[#e0eee6] bg-white px-6 py-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="text-[#1a7a4a]">Thẻ bài</span>
                        <span className="text-[#c8d8d0]">•</span>
                        <span className="rounded-full bg-[#e6f7ed] px-2 py-0.5 text-xs font-semibold text-[#1a7a4a]">
                            Cấp độ {level}
                        </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#77839a]">
                        Đã điền {filledCount}/{cardsToMemorize.length} lá bài
                    </p>
                </div>

                {/* Timer */}
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#e0eee6] bg-white px-4 py-1.5 font-mono text-sm font-semibold">
                    ⏱ <span className="text-[#1a7a4a]">{formattedTime}</span>
                </div>

                {/* Buttons */}
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={resetGame}
                        className="rounded-full border border-[#e0eee6] bg-white px-4 py-1.5 text-sm font-medium text-[#77839a] transition hover:border-[#1a7a4a] hover:text-[#1a7a4a]"
                    >
                        Thoát
                    </button>
                    <button
                        type="button"
                        onClick={finishGame}
                        className="flex items-center gap-2 rounded-full bg-[#1a7a4a] px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#15633c] active:scale-95"
                    >
                        ✓ Hoàn thành
                    </button>
                </div>
            </header>

            <main className="flex flex-1 flex-col gap-6 overflow-auto px-4 py-6">
                {/* Answer slots */}
                <section className="rounded-2xl border border-[#e0eee6] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-center text-sm font-semibold text-[#77839a] uppercase tracking-wide">
                        Ô trả lời ({cardsToMemorize.length} lá)
                    </h2>
                    <div className="flex flex-wrap justify-center gap-2">
                        {userRecall.map((card, index) => (
                            <AnswerSlot
                                key={`slot-${index}`}
                                card={card}
                                index={index}
                                isSelected={selectedSlotIndex === index}
                                onClickEmpty={() => selectSlot(index)}
                                onClickFilled={() => removeCard(index)}
                            />
                        ))}
                    </div>

                    {selectedSlotIndex !== null && (
                        <p className="mt-3 text-center text-xs text-[#1a7a4a]">
                            Đang chọn ô {selectedSlotIndex + 1} — click lá bài bên dưới để điền vào
                        </p>
                    )}
                </section>

                {/* Deck */}
                <section className="rounded-2xl border border-[#e0eee6] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-center text-sm font-semibold text-[#77839a] uppercase tracking-wide">
                        Bộ bài (52 lá)
                    </h2>
                    <div className="flex flex-wrap justify-center gap-2">
                        {deckCards.map((card) => {
                            const isUsed = userRecall.some(
                                (c) => c?.suit === card.suit && c?.rank === card.rank,
                            );
                            return (
                                <DeckTile
                                    key={`deck-${card.suit}-${card.rank}`}
                                    card={card}
                                    isUsed={isUsed}
                                    onClick={() => {
                                        if (!isUsed) placeCard(card);
                                    }}
                                />
                            );
                        })}
                    </div>
                </section>
            </main>

            {/* Keyboard hint */}
            <footer className="border-t border-[#e0eee6] bg-white px-6 py-2 text-center">
                <p className="flex items-center justify-center gap-1.5 text-xs text-[#77839a]">
                    <kbd className="rounded border border-[#e0eee6] bg-[#f5faf7] px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>
                    <span>để nộp bài</span>
                </p>
            </footer>
        </div>
    );
};
