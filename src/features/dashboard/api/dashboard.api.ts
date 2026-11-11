import { apiClient } from '@/lib/api-client';
import type { ApiSuccessResponse } from '@/types/auth.types';

// Kiểu dữ liệu khớp với response của backend (GET /api/progress/timeline, GET /api/game-sessions).
// Ngày giờ trong JSON là chuỗi ISO.
export type { GameName as ApiGameName } from '@/features/shared-game/registry';
import type { GameName as ApiGameName } from '@/features/shared-game/registry';
export type ApiPeriod = 'week' | 'month';
export type ApiResult = 'perfect' | 'pass' | 'fail';

export interface ApiDateRange {
    start: string;
    end: string;    // Không bao gồm mốc này
}

export interface ApiGameStats {
    played: number;
    accuracy: number | null;
}

export interface ApiTimelineBucket extends ApiDateRange {
    byGame: Record<ApiGameName, ApiGameStats>;
}

export interface ApiTimelineSummary {
    played: number;
    accuracy: number | null;
    bestLevel: number | null;
    perfectCount: number;
    durationSec: number;
}

export interface ApiTimeline {
    period: ApiPeriod;
    game: ApiGameName | 'all';
    timeZone: string;   // Múi giờ backend dùng để chia tuần/tháng
    range: ApiDateRange;
    previousRange: ApiDateRange;
    buckets: ApiTimelineBucket[];
    summary: ApiTimelineSummary;
    previousSummary: ApiTimelineSummary;
}

export interface ApiHistoryItem {
    sessionId: string;
    gameName: ApiGameName;
    mode: 'level' | 'custom' | 'daily';
    gameLevel: number | null;
    totalItems: number;
    correctItems: number;
    accuracy: number;
    result: ApiResult;
    memorizeSec: number;
    recallSec: number;
    expEarned: number;
    newRecords: string[];
    completedAt: string;
}

export interface ApiHistoryPage {
    items: ApiHistoryItem[];
    nextCursor: string | null;  // null khi đã hết dữ liệu
}

export interface ApiCoachGame {
    gameName: ApiGameName;
    played: number;
    accuracy: number | null;
    unlockedLevel: number;
    bestLevel: number | null;
    perfect: number;
}

export interface ApiCoachPlanStep {
    day: number;
    focus: 'practice' | 'maintain' | 'review';
    gameName: ApiGameName;
    level: number;
    targetAccuracy: number;
    tip: string;
}

export interface ApiCoachAnalysis {
    totalPlayed: number;
    overallAccuracy: number | null;
    skillLevel: 'new' | 'early' | 'building' | 'steady' | 'advanced';
    strongestGame: ApiGameName | null;
    focusGame: ApiGameName | null;
    games: ApiCoachGame[];
    plan: ApiCoachPlanStep[];
}

export interface ApiCoachChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Lộ trình tuần: day 1 là Thứ 2, ..., 7 là Chủ nhật
export interface ApiPlanSession {
    day: number;
    minutes: number;
    gameName: ApiGameName;
    level: number;
    targetAccuracy: number;
    tip: string;
}

export interface ApiCoachPlan {
    goal: string;
    minutesPerDay: number;
    sessions: ApiPlanSession[];
}

// Lộ trình đã lưu kèm tiến độ tuần hiện tại (giờ Việt Nam); bestAccuracy null là buổi chưa tập
export interface ApiSavedCoachPlan extends ApiCoachPlan {
    savedAt: string;
    weekStart: string;
    today: number;
    sessions: (ApiPlanSession & { bestAccuracy: number | null })[];
}

// Không truyền from/to thì backend trả các ván mới nhất (tối đa 50 mỗi trang)
export interface HistoryQuery {
    from?: string;
    to?: string;
    limit: number;
    game?: ApiGameName;
    cursor?: string;
}

export const dashboardApi = {
    // Số liệu theo tuần/tháng cho ô thống kê và biểu đồ, kèm kỳ trước để so sánh
    getTimeline: (
        period: ApiPeriod,
        game: ApiGameName | 'all',
    ): Promise<ApiSuccessResponse<{ timeline: ApiTimeline }>> => {
        return apiClient.get('/progress/timeline', {
            params: { period, game },
        }) as unknown as Promise<ApiSuccessResponse<{ timeline: ApiTimeline }>>;
    },

    // Lịch sử các ván đã hoàn thành, mới nhất trước, phân trang bằng cursor
    getHistory: (query: HistoryQuery): Promise<ApiSuccessResponse<ApiHistoryPage>> => {
        return apiClient.get('/game-sessions', {
            params: query,
        }) as unknown as Promise<ApiSuccessResponse<ApiHistoryPage>>;
    },

    getCoach: (): Promise<ApiSuccessResponse<{ analysis: ApiCoachAnalysis }>> => {
        return apiClient.get('/progress/coach') as unknown as Promise<ApiSuccessResponse<{ analysis: ApiCoachAnalysis }>>;
    },

    // draft: lộ trình đang bàn để AI sửa tiếp; plan trong kết quả là bản nháp, chỉ lưu khi người dùng bấm Áp dụng
    chatWithCoach: (messages: ApiCoachChatMessage[], draft: ApiCoachPlan | null): Promise<ApiSuccessResponse<{ reply: string; plan: ApiCoachPlan | null }>> => {
        return apiClient.post('/progress/coach/chat', { messages, draft }, { timeout: 125_000 }) as unknown as Promise<ApiSuccessResponse<{ reply: string; plan: ApiCoachPlan | null }>>;
    },

    getCoachPlan: (): Promise<ApiSuccessResponse<{ savedPlan: ApiSavedCoachPlan | null }>> => {
        return apiClient.get('/progress/coach/plan') as unknown as Promise<ApiSuccessResponse<{ savedPlan: ApiSavedCoachPlan | null }>>;
    },

    saveCoachPlan: (plan: ApiCoachPlan): Promise<ApiSuccessResponse<{ savedPlan: ApiSavedCoachPlan }>> => {
        return apiClient.put('/progress/coach/plan', plan) as unknown as Promise<ApiSuccessResponse<{ savedPlan: ApiSavedCoachPlan }>>;
    },
};
