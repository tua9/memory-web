import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card, GamePhase } from "../types/types";
import { createDeck, shuffle, getCardCountForLevel } from "../utils/cardUtils";

interface GameState {
    phase: GamePhase;
    level: number;
    memorizeTime: number; // in seconds
    recallTime: number; // in seconds
    cardsToMemorize: Card[];
    userRecall: (Card | null)[];
    deckCards: Card[];
    currentMemorizeIndex: number;
    selectedSlotIndex: number | null;
    phaseDeadline: number | null;

    // Actions
    setLevel: (level: number) => void;
    setMemorizeTime: (time: number) => void;
    setRecallTime: (time: number) => void;
    startGame: () => void;
    nextMemorizeCard: () => void;
    prevMemorizeCard: () => void;
    finishMemorize: () => void;
    placeCard: (card: Card) => void;
    removeCard: (slotIndex: number) => void;
    selectSlot: (index: number | null) => void;
    finishGame: () => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            phase: "idle",
            level: 1,
            memorizeTime: 120,
            recallTime: 300,
            cardsToMemorize: [],
            userRecall: [],
            deckCards: [],
            currentMemorizeIndex: 0,
            selectedSlotIndex: null,
            phaseDeadline: null,

            setLevel: (level) => set({ level: Math.max(1, level) }),
            setMemorizeTime: (time) => set({ memorizeTime: time }),
            setRecallTime: (time) => set({ recallTime: time }),

            startGame: () => {
                const { level, memorizeTime } = get();
                const cardCount = getCardCountForLevel(level);
                const deck = shuffle(createDeck());
                const cardsToMemorize = deck.slice(0, cardCount);

                set({
                    phase: "memorize",
                    cardsToMemorize,
                    currentMemorizeIndex: 0,
                    userRecall: Array(cardCount).fill(null),
                    deckCards: createDeck(), // standard deck
                    selectedSlotIndex: null,
                    phaseDeadline: Date.now() + memorizeTime * 1000,
                });
            },

            nextMemorizeCard: () => {
                const { currentMemorizeIndex, cardsToMemorize } = get();
                if (currentMemorizeIndex < cardsToMemorize.length - 1) {
                    set({ currentMemorizeIndex: currentMemorizeIndex + 1 });
                }
            },

            prevMemorizeCard: () => {
                const { currentMemorizeIndex } = get();
                if (currentMemorizeIndex > 0) {
                    set({ currentMemorizeIndex: currentMemorizeIndex - 1 });
                }
            },

            finishMemorize: () => {
                const { recallTime } = get();
                set({ 
                    phase: "recall", 
                    selectedSlotIndex: null,
                    phaseDeadline: Date.now() + recallTime * 1000
                });
            },

            placeCard: (card) => {
                const { userRecall, selectedSlotIndex } = get();

                // Check if card already placed
                const isCardUsed = userRecall.some(
                    (c) => c?.suit === card.suit && c?.rank === card.rank,
                );
                if (isCardUsed) return;

                let targetIndex = selectedSlotIndex;

                if (targetIndex === null) {
                    targetIndex = userRecall.findIndex((c) => c === null);
                }

                if (targetIndex !== -1 && targetIndex !== null) {
                    const newUserRecall = [...userRecall];
                    newUserRecall[targetIndex] = card;

                    set({
                        userRecall: newUserRecall,
                        selectedSlotIndex: null,
                    });
                }
            },

            removeCard: (slotIndex) => {
                const { userRecall } = get();
                const newUserRecall = [...userRecall];
                newUserRecall[slotIndex] = null;
                set({ userRecall: newUserRecall });
            },

            selectSlot: (index) => {
                const { selectedSlotIndex } = get();
                set({ selectedSlotIndex: index === selectedSlotIndex ? null : index });
            },

            finishGame: () => set({ phase: "result", phaseDeadline: null }),

            resetGame: () =>
                set({
                    phase: "idle",
                    cardsToMemorize: [],
                    userRecall: [],
                    currentMemorizeIndex: 0,
                    selectedSlotIndex: null,
                    phaseDeadline: null,
                }),
        }),
        {
            name: "cards-game-storage",
        }
    )
);
