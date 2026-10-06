import type { Card as CardType, Suit } from "../types/types";
import { Card } from "@/components/ui/card";
import { useState } from "react";

type Size = "small" | "medium" | "large";

type PlayingCardProps = {
    card: CardType;
    size: Size;
};

const suitSymbols: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
};

const sizeClasses = {
    small: { card: "h-20 w-14", rank: "text-xs", suit: "text-3xl" },
    medium: { card: "h-28 w-20", rank: "text-sm", suit: "text-5xl" },
    large: { card: "h-40 w-28", rank: "text-lg", suit: "text-7xl" },
} as const satisfies Record<Size, Record<string, string>>;

export const PlayingCard = ({ card, size }: PlayingCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const classes = sizeClasses[size];
    const isRedSuit = card.suit === "hearts" || card.suit === "diamonds";
    const label = `${card.rank} of ${card.suit}`;

    return (
        <button
            type="button"
            aria-label={isFlipped ? `Reveal ${label}` : `Hide ${label}`}
            aria-pressed={isFlipped}
            onClick={() => setIsFlipped((flipped) => !flipped)}
            className={`shrink-0 rounded-md p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${classes.card}`}
        >
            <Card
                className={`relative grid h-full w-full place-items-center gap-0 overflow-hidden rounded-md border border-border p-0 py-0 shadow-sm ring-0 transition-colors duration-200 ${
                    isFlipped
                        ? "bg-primary text-primary-foreground"
                        : `bg-card ${isRedSuit ? "text-red-600" : "text-gray-950"}`
                }`}
            >
                {isFlipped ? (
                    <span className="grid size-[calc(100%-8px)] place-items-center rounded-sm border border-current/40 text-2xl opacity-80">
                        ♦
                    </span>
                ) : (
                    <>
                        <span className={`absolute left-1 top-1 font-semibold ${classes.rank}`}>
                            {card.rank}
                        </span>
                        <span className={classes.suit}>{suitSymbols[card.suit]}</span>
                    </>
                )}
            </Card>
        </button>
    );
};

export default PlayingCard;
