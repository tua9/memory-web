export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank =
    | "A"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "J"
    | "Q"
    | "K";

export type Card = {
    suit: Suit;
    rank: Rank;
};

export type GamePhase = "idle" | "memorize" | "recall" | "result";
