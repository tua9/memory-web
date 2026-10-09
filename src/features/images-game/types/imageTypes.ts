export type ImageCard = {
    id: string;
    emoji: string;
    name: string;
    bgColor: string;
};

export type GamePhase = "idle" | "memorize" | "recall" | "result";
