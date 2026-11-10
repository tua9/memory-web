import { apiClient } from '@/lib/api-client';
import type { ApiSuccessResponse } from '@/types/auth.types';
import type { UserProfile } from '@/features/profile/api/profile.api';
import type { GameCatalogItem } from '@/features/shared-game/api/games.api';

export type Person = { _id: string; username: string; avatarUrl: string | null };
export type FamilyLink = { _id: string; status: 'pending' | 'active'; ageGroup: string | null; createdAt: string; acceptedAt: string | null; user: Person };
export type Family = { children: FamilyLink[]; guardians: FamilyLink[]; code: { code: string; expiresAt: string } | null; maxGuardians: number };
export type ActivitySummary = {
    games: number; practiceDays: number; accuracy: number | null; recordedPracticeSeconds: number; lastPlayedAt: string | null;
    byGame: { gameName: string; games: number; correct: number; total: number }[];
};
export type ChildOverview = {
    child: { _id: string; username: string; avatarUrl: string | null; profile: UserProfile };
    summary: ActivitySummary;
    progress: { gameName: string; unlockedLevel: number; stats: { played: number; totalCorrect: number; totalItems: number } }[];
    ageGroup: string | null;
    together: { matches: number; wins: number; losses: number; draws: number };
};
export type ChildReport = {
    period: 'day' | 'week'; date: string; incomplete: boolean; timeZone: string;
    summary: ActivitySummary; previousSummary: ActivitySummary;
    activities: { gameName: string; completedAt: string; correctItems: number; totalItems: number; durationSec: number }[];
    comment: { observation: string; evidence: string; trend: string; suggestion: string };
    suggestions: { title: string; reason: string; steps: string[]; question: string; gameName: string }[];
};

const data = <T>(request: Promise<unknown>) => (request as Promise<ApiSuccessResponse<T>>).then((response) => response.data);
const child = (childId: string) => `/family/children/${encodeURIComponent(childId)}`;

export const familyApi = {
    get: () => data<Family>(apiClient.get('/family')),
    createCode: () => data<{ code: string; expiresAt: string }>(apiClient.post('/family/link-code')),
    cancelCode: () => data<{ cancelled: boolean }>(apiClient.delete('/family/link-code')),
    requestLink: (code: string) => data<{ _id: string; status: string; user: Person }>(apiClient.post('/family/links', { code })),
    acceptLink: (linkId: string) => data<{ _id: string }>(apiClient.post(`/family/links/${linkId}/accept`)),
    removeLink: (linkId: string) => data<{ removed: boolean }>(apiClient.delete(`/family/links/${linkId}`)),
    invite: (email: string) => data<{ sent: boolean }>(apiClient.post('/family/invites', { email })),
    inspectInvite: (token: string) => data<{ child: Person }>(apiClient.post('/family/invites/inspect', { token })),
    acceptInvite: (token: string) => data<{ child: Person }>(apiClient.post('/family/invites/accept', { token })),
    overview: (childId: string) => data<ChildOverview>(apiClient.get(`${child(childId)}/overview`)),
    report: (childId: string, period: 'day' | 'week', date: string) =>
        data<ChildReport>(apiClient.get(`${child(childId)}/report`, { params: { period, date } })),
    games: (childId: string) => data<{ games: GameCatalogItem[] }>(apiClient.get(`${child(childId)}/games`)),
    ageGroup: (childId: string, ageGroup: string | null) => data<{ ageGroup: string | null }>(apiClient.patch(child(childId), { ageGroup })),
};
