import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card, GamePhase } from "../types/types";
import {
  createDeck,
  shuffle,
  getCardCountForLevel,
  clampCardCount,
} from "../utils/cardUtils";

interface GameState {
  preferences: CardPreferences;
  phase: GamePhase;
  level: number;
  memorizeTime: number; // in seconds
  recallTime: number; // in seconds
  cardsToMemorize: Card[];
  userRecall: (Card | null)[];
  deckCards: Card[];
  currentMemorizeIndex: number;
  selectedSlotIndex: number | null;
  lastPlayTime: number;
  phaseDeadline: number | null;

  // Actions
  setPreferences: (preferences: CardPreferences) => void;
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

interface CardPreferences {
  hideTimer: boolean;
  cardCount: number | null;
  groups: number;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      preferences: { hideTimer: false, cardCount: null, groups: 1 },
      phase: "idle",
      level: 1,
      memorizeTime: 120,
      recallTime: 300,
      cardsToMemorize: [],
      userRecall: [],
      deckCards: [],
      currentMemorizeIndex: 0,
      selectedSlotIndex: null,
      lastPlayTime: 0,
      phaseDeadline: null,

      setPreferences: (preferences) =>
        set({
          preferences: {
            ...preferences,
            groups: Math.max(
              1,
              Math.min(5, Math.round(preferences.groups || 1)),
            ),
          },
        }),
      setLevel: (level) => set({ level: Math.max(1, level) }),
      setMemorizeTime: (time) => set({ memorizeTime: time }),
      setRecallTime: (time) => set({ recallTime: time }),

      startGame: () => {
        const { level, memorizeTime, preferences } = get();
        const cardCount = clampCardCount(
          preferences.cardCount ?? getCardCountForLevel(level),
        );
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
        const { currentMemorizeIndex, cardsToMemorize, preferences } = get();
        const step = preferences.groups || 1;
        if (currentMemorizeIndex + step < cardsToMemorize.length) {
          set({ currentMemorizeIndex: currentMemorizeIndex + step });
        }
      },

      prevMemorizeCard: () => {
        const { currentMemorizeIndex, preferences } = get();
        const step = preferences.groups || 1;
        if (currentMemorizeIndex - step >= 0) {
          set({ currentMemorizeIndex: currentMemorizeIndex - step });
        } else {
          set({ currentMemorizeIndex: 0 });
        }
      },

      finishMemorize: () => {
        const { recallTime } = get();
        set({
          phase: "recall",
          selectedSlotIndex: null,
          phaseDeadline: Date.now() + recallTime * 1000,
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

      finishGame: () => {
        const { phaseDeadline, recallTime } = get();
        const remainingSeconds = phaseDeadline
          ? Math.max(0, Math.round((phaseDeadline - Date.now()) / 1000))
          : 0;
        const timeSpent = Math.max(1, recallTime - remainingSeconds);
        set({
          phase: "result",
          phaseDeadline: null,
          lastPlayTime: timeSpent,
        });
      },

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
    },
  ),
);
