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

// #Unuse
// export const getRandomCards = (count: number): Card[] => {
//     const deck = shuffle(createDeck());
//     const cardCount = Math.max(0, Math.min(Math.floor(count), deck.length));

//     return deck.slice(0, cardCount);
// };

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
    level = level > 25 && level > 0 ? 25 : level;
    const safeLevel = level < 1 ? 1 : level;

    return Math.min(4 + (safeLevel - 1) * 2, 52);
};
