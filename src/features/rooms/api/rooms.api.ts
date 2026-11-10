import { apiClient } from '@/lib/api-client';
import type { ApiSuccessResponse } from '@/types/auth.types';

export type RoomItem = { code: string; label?: string; imageUrl?: string };
export type RoomScore = { wins: number; losses: number; draws: number; points: number };
export type RoomPlayer = {
    _id: string; username: string; avatarUrl: string | null; ready: boolean; isHost: boolean; isMe: boolean;
    inRecall: boolean; submitted: boolean; score: RoomScore;
};
export type RoomPlayerResult = { _id: string; correct: number; total: number; usedMs: number; answers: (RoomItem | null)[]; marks: boolean[] };
export type RoomState = 'waiting' | 'memorizing' | 'recalling' | 'round_result' | 'completed' | 'cancelled';
export type RoomView = {
    code: string; revision: number; state: RoomState; phase: RoomState | 'waiting_for_other';
    gameName: string; rules: { mode: string; gameLevel: number | null; totalItems: number; memorizeLimitSec: number; recallLimitSec: number };
    roundCount: number; roundIndex: number; capacity: number; isHost: boolean; meId: string; serverNow: string;
    players: RoomPlayer[];
    round: null | {
        memorizeEndsAt: string; recallEndsAt: string; items?: RoomItem[]; recallOptions?: RoomItem[]; myAnswers?: (string | null)[];
        result?: { outcome: string | null; expected: RoomItem[]; players: RoomPlayerResult[] };
    };
    // Người thắng từng vòng đã chơi: userId, 'draw', hoặc null khi vòng đang diễn ra
    roundOutcomes: (string | null)[];
    // Phòng chờ đủ người: giờ trận tự bắt đầu (30 giây sau khi người thứ hai vào)
    startsAt: string | null;
    // Người nhận cúp của trận vừa xong (null khi hoà hoặc có vòng một người bỏ trống)
    cupWinnerId: string | null;
    // Người thắng các trận đã xong trong phòng: userId hoặc 'draw'
    history: { winner: string }[];
};
export type MatchStatus = { status: 'idle' } | { status: 'searching'; gameName: string; since: string } | { status: 'matched'; code: string };
export type RoomStats = { matches: number; wins: number; losses: number; draws: number; cups: number };
export type Leaderboard = {
    entries: { _id: string; username: string; avatarUrl: string | null; cups: number; wins: number; matches: number; rank: number; isMe: boolean }[];
    me: RoomStats & { rank: number | null };
};

const data = <T>(request: Promise<unknown>) => (request as Promise<ApiSuccessResponse<T>>).then((response) => response.data);
const at = (code: string, action = '') => `/rooms/${encodeURIComponent(code)}${action && `/${action}`}`;
const post = (code: string, action: string, body?: unknown) => data<RoomView>(apiClient.post(at(code, action), body));

export const roomsApi = {
    create: (body: unknown) => data<RoomView>(apiClient.post('/rooms', body)),
    stats: () => data<RoomStats>(apiClient.get('/rooms/stats')),
    leaderboard: () => data<Leaderboard>(apiClient.get('/rooms/leaderboard')),
    // Ghép trận tự động
    findMatch: (gameName: string) => data<MatchStatus>(apiClient.post('/rooms/matchmaking', { gameName })),
    pollMatch: () => data<MatchStatus>(apiClient.get('/rooms/matchmaking')),
    cancelMatch: () => data<MatchStatus>(apiClient.delete('/rooms/matchmaking')),
    get: (code: string) => data<RoomView>(apiClient.get(at(code))),
    join: (code: string) => post(code, 'join'),
    leave: (code: string) => post(code, 'leave'),
    kick: (code: string, userId: string) => post(code, 'kick', { userId }),
    ready: (code: string, ready: boolean) => post(code, 'ready', { ready }),
    start: (code: string) => post(code, 'start'),
    recall: (code: string) => post(code, 'recall'),
    submit: (code: string, answers: (string | null)[]) => post(code, 'submit', { answers }),
    next: (code: string) => post(code, 'next'),
    finish: (code: string) => post(code, 'finish'),
    // Không gửi cài đặt: chơi lại trò cũ; gửi cài đặt: đổi trò
    rematch: (code: string, setup?: unknown) => post(code, 'rematch', setup ?? {}),
};
