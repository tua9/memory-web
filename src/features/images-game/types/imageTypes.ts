export type ImageCard = {
    id: string;
    imageUrl: string;
    name?: string;
};

export type GamePhase = "idle" | "memorize" | "recall" | "result";
