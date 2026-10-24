import type { GameId } from './types';

// Thứ tự cố định: màu luôn đi theo game, không đổi khi lọc
export const GAME_IDS: readonly GameId[] = ['cards', 'images'];

// Cặp màu đã kiểm tra khả năng phân biệt cho người mù màu (validate_palette, light)
export const GAME_META: Record<GameId, { label: string; color: string }> = {
    cards: { label: 'Thẻ bài', color: '#2e7d32' },
    images: { label: 'Hình ảnh', color: '#2a78d6' },
};

export const CHART_COLORS = {
    surface: '#ffffff',
    grid: '#e8eeea',
    baseline: '#c9d6ce',
    hoverWash: '#f3f8f4',
    axisText: '#667085',
    ink: '#1f2937',
} as const;
