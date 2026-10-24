export type GameId = 'cards' | 'images';

// Một ván chơi đã hoàn thành - khi có backend, API lịch sử nên trả về đúng dạng này
export interface GameSession {
    id: string;
    game: GameId;
    playedAt: Date;
    level: number;
    totalItems: number;     // Số thẻ/hình phải ghi nhớ
    correctItems: number;   // Số thẻ/hình nhớ đúng
    durationSec: number;
}

export type Period = 'week' | 'month';
export type GameFilter = 'all' | GameId;
export type ChartMetric = 'accuracy' | 'played';
export type ResultGrade = 'perfect' | 'pass' | 'fail';

export interface GameStats {
    played: number;
    accuracy: number | null;    // 0..1, null khi không có ván nào
}

// Một cột trên trục thời gian: một tuần hoặc một tháng
export interface PeriodBucket {
    key: string;
    label: string;          // Nhãn ngắn trên trục X
    fullLabel: string;      // Nhãn đầy đủ trong tooltip và bảng
    byGame: Record<GameId, GameStats>;
}

export interface DashboardSummary {
    played: number;
    accuracy: number | null;
    bestLevel: number | null;
    perfectCount: number;
    durationSec: number;
}
