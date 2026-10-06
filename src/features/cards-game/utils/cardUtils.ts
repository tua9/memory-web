import type { Card, Rank, Suit } from "../types/types";

// User selected cards are compared with the correct cards to calculate the score.
// The score is the number of correct cards selected by the user.
export const createDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const suit of ["hearts", "diamonds", "clubs", "spades"] as Suit[]) {
        for (const rank of [
            "A",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "J",
            "Q",
            "K",
        ] as Rank[]) {
            deck.push({ suit, rank });
        }
    }
    return deck;
};

export const createPokerDeck = createDeck;

export const shuffle = <T>(array: T[]): T[] => {
    const shuffledArray = [...array];

    for (let index = shuffledArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledArray[index], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex],
            shuffledArray[index],
        ];
    }

    return shuffledArray;
};


export const calculateScore = (correct: Card[], userAnswer: Card[]): number => {
    return correct.reduce((score, correctCard, index) => {
        const answerCard = userAnswer[index];
        const isCorrect =
            answerCard?.suit === correctCard.suit &&
            answerCard?.rank === correctCard.rank;

        return score + Number(isCorrect);
    }, 0);
};

export const getCardCountForLevel = (level: number): number => {
    const safeLevel = Math.max(1, Math.min(10, level));
    // Level 1 = 4 cards, Level 10 = 52 cards
    // 48 cards distributed over 9 level steps -> ~5.33 cards per step
    const count = Math.round(4 + (safeLevel - 1) * (48 / 9));
    return Math.min(count, 52);
};
