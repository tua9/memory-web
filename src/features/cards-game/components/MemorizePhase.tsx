import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { usePhaseTimer } from "../hooks/usePhaseTimer";
import type { Card, Suit } from "../types/types";

// ─── Constants ──────────────────────────────────────────────────────────────

const SUIT_LABELS: Record<Suit, string> = {
    hearts: "Cơ",
    diamonds: "Rô",
    clubs: "Tép",
    spades: "Bích",
};

const SUIT_SYMBOLS: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
};

const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";

// Thumb card dimensions (px)
const THUMB_W = 40;
const THUMB_GAP = 8;
const THUMB_STEP = THUMB_W + THUMB_GAP;
// How many visible thumbnails in the viewport
const VISIBLE_THUMBS = 5;
const STRIP_WIDTH = VISIBLE_THUMBS * THUMB_STEP - THUMB_GAP;

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Large card in the center of the screen */
const BigCard = ({
    card,
    index,
    total,
}: {
    card: Card;
    index: number;
    total: number;
}) => {
    const red = isRed(card.suit);
    const color = red ? "#e45454" : "#202b39";
    const suitBg = red ? "#e45454" : "#202b39";

    return (
        <div className="relative w-[220px] rounded-3xl border border-[#e0eee6] bg-white shadow-lg">
            {/* Suit badge top-left */}
            <div
                className="absolute left-4 top-4 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: suitBg }}
            >
                {SUIT_LABELS[card.suit]}
            </div>

            {/* Card body */}
            <div className="flex flex-col items-center px-6 pb-6 pt-14">
                {/* Suit symbol big */}
                <div
                    className="flex h-36 w-36 items-center justify-center text-[96px] leading-none select-none"
                    style={{ color }}
                >
                    {SUIT_SYMBOLS[card.suit]}
                </div>

                {/* Rank + name */}
                <p
                    className="mt-3 text-3xl font-extrabold"
                    style={{ color }}
                >
                    {card.rank}
                </p>
            </div>

            {/* Position indicator */}
            <p className="px-4 pb-3 text-right text-xs text-[#77839a]">
                {index + 1}/{total}
            </p>
        </div>
    );
};

/**
 * Thumbnail strip with CSS sliding animation and drag/swipe support.
 * All cards are rendered in a track; we translateX to center the active card.
 */
const ThumbStrip = ({
    cards,
    activeIndex,
    onSelect,
}: {
    cards: Card[];
    activeIndex: number;
    onSelect: (index: number) => void;
}) => {
    // translateX to center the active card in the STRIP_WIDTH viewport
    const centerOffset = STRIP_WIDTH / 2 - THUMB_W / 2;
    const baseTranslate = -activeIndex * THUMB_STEP + centerOffset;

    // Drag state
    const dragRef = useRef<{ startX: number; startIndex: number } | null>(null);
    const [dragDelta, setDragDelta] = useState(0);
    const isDragging = useRef(false);

    const onPointerDown = (e: React.PointerEvent) => {
        isDragging.current = false;
        dragRef.current = { startX: e.clientX, startIndex: activeIndex };
        setDragDelta(0);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current) return;
        const delta = e.clientX - dragRef.current.startX;
        if (Math.abs(delta) > 4) isDragging.current = true;
        setDragDelta(delta);
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (!dragRef.current) return;
        const delta = e.clientX - dragRef.current.startX;
        const steps = -Math.round(delta / THUMB_STEP);
        if (steps !== 0) {
            const next = Math.max(0, Math.min(cards.length - 1, dragRef.current.startIndex + steps));
            onSelect(next);
        }
        dragRef.current = null;
        setDragDelta(0);
    };

    const trackTranslate = baseTranslate + (dragRef.current ? dragDelta : 0);

    return (
        <div
            style={{ width: STRIP_WIDTH }}
            className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
            {/* Left/Right fade masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10 bg-gradient-to-r from-[#f5faf7] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10 bg-gradient-to-l from-[#f5faf7] to-transparent" />

            {/* Draggable track */}
            <div
                className="flex items-center py-1"
                style={{
                    gap: THUMB_GAP,
                    transform: `translateX(${trackTranslate}px)`,
                    transition: dragRef.current ? "none" : "transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    willChange: "transform",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                {cards.map((card, idx) => {
                    const red = isRed(card.suit);
                    const active = idx === activeIndex;
                    return (
                        <button
                            key={`thumb-${idx}`}
                            type="button"
                            aria-label={`Lá bài ${idx + 1}`}
                            onClick={() => {
                                if (!isDragging.current) onSelect(idx);
                            }}
                            style={{ width: THUMB_W, flexShrink: 0 }}
                            className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-[11px] font-bold transition-all ${active
                                ? "border-[#1a7a4a] bg-[#e6f7ed] shadow-sm"
                                : "border-[#e0eee6] bg-white hover:border-[#1a7a4a]"
                                }`}
                        >
                            <span
                                className="text-sm leading-none"
                                style={{ color: active ? "#1a7a4a" : red ? "#e45454" : "#202b39" }}
                            >
                                {SUIT_SYMBOLS[card.suit]}
                            </span>
                            <span
                                className="text-[10px] font-bold"
                                style={{ color: active ? "#1a7a4a" : "#202b39" }}
                            >
                                {card.rank}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const MemorizePhase = () => {
    const {
        cardsToMemorize,
        currentMemorizeIndex,
        nextMemorizeCard,
        prevMemorizeCard,
        finishMemorize,
        phaseDeadline,
        level,
        resetGame,
    } = useGameStore();

    const { formattedTime } = usePhaseTimer(phaseDeadline, finishMemorize);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prevMemorizeCard();
            else if (e.key === "ArrowRight") nextMemorizeCard();
            else if (e.key === " ") {
                e.preventDefault();
                useGameStore.setState({ currentMemorizeIndex: 0 });
            } else if (e.key === "Enter") finishMemorize();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [prevMemorizeCard, nextMemorizeCard, finishMemorize]);

    const currentCard = cardsToMemorize[currentMemorizeIndex];
    const isFirst = currentMemorizeIndex === 0;
    const isLast = currentMemorizeIndex === cardsToMemorize.length - 1;

    return (
        <div className="flex min-h-screen flex-col bg-[#f5faf7] font-sans text-[#202b39]">
            {/* ── Top bar ── */}
            <header className="flex items-center justify-between gap-4 border-b border-[#e0eee6] bg-white px-6 py-3">
                {/* Breadcrumb */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="text-[#1a7a4a]">Thẻ bài</span>
                        <span className="text-[#c8d8d0]">•</span>
                        <span className="rounded-full bg-[#e6f7ed] px-2 py-0.5 text-xs font-semibold text-[#1a7a4a]">
                            Cấp độ {level}
                        </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#77839a]">
                        Mục tiêu: Ghi nhớ chuẩn xác thứ tự {cardsToMemorize.length} lá bài
                    </p>
                </div>

                {/* Done button */}
                <button
                    type="button"
                    onClick={finishMemorize}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-[#1a7a4a] px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#15633c] active:scale-95"
                >
                    ✓ Tôi đã nhớ xong
                </button>

                {/* Timer + quit */}
                <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-[#e0eee6] bg-white px-4 py-1.5 text-sm font-mono font-semibold">
                        ⏱{" "}
                        <span className="text-[#1a7a4a]">{formattedTime}</span>
                    </div>
                    <button
                        type="button"
                        onClick={resetGame}
                        className="rounded-full border border-[#e0eee6] bg-white px-4 py-1.5 text-sm font-medium text-[#77839a] transition hover:border-[#1a7a4a] hover:text-[#1a7a4a]"
                    >
                        Thoát
                    </button>
                </div>
            </header>

            {/* ── Main content ── */}
            <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">


                {/* Big card */}
                {currentCard && (
                    <BigCard
                        card={currentCard}
                        index={currentMemorizeIndex}
                        total={cardsToMemorize.length}
                    />
                )}

                {/* Thumbnail strip with sliding animation + drag */}
                <ThumbStrip
                    cards={cardsToMemorize}
                    activeIndex={currentMemorizeIndex}
                    onSelect={(idx) =>
                        useGameStore.setState({ currentMemorizeIndex: idx })
                    }
                />

                {/* Dot pagination */}
                <div className="flex gap-1.5">
                    {cardsToMemorize.map((_, idx) => (
                        <span
                            key={`dot-${idx}`}
                            className={`h-1.5 rounded-full transition-all ${idx === currentMemorizeIndex
                                ? "w-4 bg-[#1a7a4a]"
                                : "w-1.5 bg-[#c8d8d0]"
                                }`}
                        />
                    ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => useGameStore.setState({ currentMemorizeIndex: 0 })}
                        disabled={isFirst}
                        title="Về đầu (Space)"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0eee6] bg-white text-base text-[#77839a] transition hover:border-[#1a7a4a] hover:text-[#1a7a4a] disabled:opacity-30"
                    >
                        ⏮
                    </button>
                    <button
                        type="button"
                        onClick={prevMemorizeCard}
                        disabled={isFirst}
                        title="Trước (←)"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0eee6] bg-white text-xl font-bold text-[#77839a] transition hover:border-[#1a7a4a] hover:text-[#1a7a4a] disabled:opacity-30"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={nextMemorizeCard}
                        disabled={isLast}
                        title="Tiếp (→)"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a7a4a] text-xl font-bold text-white shadow-md transition hover:bg-[#15633c] disabled:opacity-40"
                    >
                        ›
                    </button>
                </div>

                {/* Keyboard hints */}
                <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#77839a]">
                    <kbd className="rounded border border-[#e0eee6] bg-white px-1.5 py-0.5 font-mono text-[10px]">←</kbd>
                    <kbd className="rounded border border-[#e0eee6] bg-white px-1.5 py-0.5 font-mono text-[10px]">→</kbd>
                    <span>để lật thẻ</span>
                    <span className="mx-1 text-[#c8d8d0]">•</span>
                    <kbd className="rounded border border-[#e0eee6] bg-white px-1.5 py-0.5 font-mono text-[10px]">Space</kbd>
                    <span>về đầu</span>
                    <span className="mx-1 text-[#c8d8d0]">•</span>
                    <kbd className="rounded border border-[#e0eee6] bg-white px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>
                    <span>khi đã nhớ xong</span>
                </p>
            </main>
        </div>
    );
};
