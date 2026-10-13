import { create } from "zustand";
import type { ImageCard, GamePhase } from "../types/imageTypes";
import { generateImageDeck, getImageCountForLevel, shuffle } from "../utils/imageUtils";

interface ImagesGameState {
    preferences: ImagesPreferences;
    phase: GamePhase;
    level: number;
    memorizeTime: number;
    recallTime: number;
    imagesToMemorize: ImageCard[];
    userRecall: (ImageCard | null)[];
    shuffledDeck: ImageCard[];
    currentMemorizeIndex: number;
    selectedSlotIndex: number | null;
    phaseDeadline: number | null;

    setPreferences: (preferences: ImagesPreferences) => void;
    setLevel: (level: number) => void;
    setMemorizeTime: (time: number) => void;
    setRecallTime: (time: number) => void;
    startGame: () => void;
    nextMemorizeCard: () => void;
    prevMemorizeCard: () => void;
    finishMemorize: () => void;
    placeImage: (image: ImageCard) => void;
    removeImage: (slotIndex: number) => void;
    selectSlot: (index: number | null) => void;
    finishGame: () => void;
    resetGame: () => void;
}

export interface ImagesPreferences {
    groups: number;
    hideTimer: boolean;
    prepTime: number;
}

export const useImagesGameStore = create<ImagesGameState>((set, get) => ({
    preferences: {
        groups: 1,
        hideTimer: false,
        prepTime: 20,
    },
    phase: "idle",
    level: 1,
    memorizeTime: 60,
    recallTime: 180,
    imagesToMemorize: [],
    userRecall: [],
    shuffledDeck: [],
    currentMemorizeIndex: 0,
    selectedSlotIndex: null,
    phaseDeadline: null,

    setPreferences: (preferences) => set({ preferences }),
    setLevel: (level) => set({ level: Math.max(1, level) }),
    setMemorizeTime: (time) => set({ memorizeTime: time }),
    setRecallTime: (time) => set({ recallTime: time }),

    startGame: () => {
        const { level, memorizeTime } = get();
        const count = getImageCountForLevel(level);
        const selectedImages = generateImageDeck(count);

        set({
            phase: "memorize",
            imagesToMemorize: selectedImages,
            userRecall: Array(count).fill(null),
            shuffledDeck: shuffle([...selectedImages]),
            currentMemorizeIndex: 0,
            selectedSlotIndex: null,
            phaseDeadline: Date.now() + memorizeTime * 1000,
        });
    },

    nextMemorizeCard: () => {
        const { currentMemorizeIndex, imagesToMemorize, preferences } = get();
        const step = preferences.groups || 1;
        if (currentMemorizeIndex + step < imagesToMemorize.length) {
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

    placeImage: (image) => {
        const { userRecall, selectedSlotIndex } = get();
        const isUsed = userRecall.some((c) => c?.id === image.id);
        if (isUsed) return;

        let targetIndex = selectedSlotIndex;
        if (targetIndex === null) {
            targetIndex = userRecall.findIndex((c) => c === null);
        }

        if (targetIndex !== -1 && targetIndex !== null) {
            const newUserRecall = [...userRecall];
            newUserRecall[targetIndex] = image;
            set({ userRecall: newUserRecall, selectedSlotIndex: null });
        }
    },

    removeImage: (slotIndex) => {
        const { userRecall } = get();
        const newUserRecall = [...userRecall];
        newUserRecall[slotIndex] = null;
        set({ userRecall: newUserRecall });
    },

    selectSlot: (index) => set({ selectedSlotIndex: index }),
    finishGame: () => set({ phase: "result", phaseDeadline: null }),
    resetGame: () => set({ phase: "idle", phaseDeadline: null }),
}));
