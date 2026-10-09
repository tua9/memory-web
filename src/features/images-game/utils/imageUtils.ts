import type { ImageCard } from "../types/imageTypes";

export const IMAGE_POOL: ImageCard[] = [
    { id: "img-1", emoji: "🍏", name: "Táo Xanh", bgColor: "bg-[#eaf8ef]" },
    { id: "img-2", emoji: "🌸", name: "Hoa Đào", bgColor: "bg-[#fce7f3]" },
    { id: "img-3", emoji: "🍋", name: "Chanh Vàng", bgColor: "bg-[#fef9c3]" },
    { id: "img-4", emoji: "🍇", name: "Nho Tím", bgColor: "bg-[#f3e8ff]" },
    { id: "img-5", emoji: "🥑", name: "Quả Bơ", bgColor: "bg-[#e6f4ea]" },
    { id: "img-6", emoji: "🦊", name: "Cáo Nhỏ", bgColor: "bg-[#ffedd5]" },
    { id: "img-7", emoji: "🐼", name: "Gấu Trúc", bgColor: "bg-[#f1f5f9]" },
    { id: "img-8", emoji: "🦁", name: "Sư Tử", bgColor: "bg-[#fef3c7]" },
    { id: "img-9", emoji: "🐬", name: "Cá Heo", bgColor: "bg-[#e0f2fe]" },
    { id: "img-10", emoji: "🚀", name: "Tên Lửa", bgColor: "bg-[#e0e7ff]" },
];

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
    return 6 + (safeLevel - 1) * 2; // Cấp 1 = 6 hình, Cấp 10 = 24 hình
};

export const generateImageDeck = (count: number): ImageCard[] => {
    const pool = shuffle([...IMAGE_POOL]);
    return pool.slice(0, count);
};
