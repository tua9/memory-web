import type { ImageCard } from "../types/imageTypes";

export const shuffle = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const getImageCountForLevel = (level: number): number => {
    const safeLevel = Math.max(1, Math.min(10, level));
    return 6 + (safeLevel - 1) * 2;
};

export const generateImageDeck = (count: number): ImageCard[] => {
    const gameSession = Math.random().toString(36).substring(2, 9);

    return Array.from({ length: count }, (_, index) => {
        const seed = `memio_${gameSession}_${index}`;
        return {
            id: `img-${seed}`,
            imageUrl: `https://picsum.photos/seed/${seed}/400/400`,
        };
    });
};
