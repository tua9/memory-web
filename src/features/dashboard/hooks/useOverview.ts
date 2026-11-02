import { useCallback, useEffect, useState } from 'react';
import { profileApi, type UserProfile } from '@/features/profile/api/profile.api';
import { gamesApi, type GameCatalogItem } from '@/features/shared-game/api/games.api';
import { dashboardApi } from '../api/dashboard.api';
import { toGameSession } from './useGameHistory';
import type { GameSession } from '../types';

// Mỗi khối trên dashboard tự tải và tự báo lỗi: một API hỏng không làm trắng cả trang
export type Request<T> =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; data: T };

const toMessage = (error: unknown, fallback: string) => (error as { message?: string }).message ?? fallback;

// loader phải ổn định (khai báo ở cấp module) để không tải lại sau mỗi lần render
const useRequest = <T>(loader: () => Promise<T>, fallbackError: string) => {
    const [state, setState] = useState<Request<T>>({ status: 'loading' });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        loader()
            .then((data) => isCurrent && setState({ status: 'ready', data }))
            .catch((error) => isCurrent && setState({ status: 'error', message: toMessage(error, fallbackError) }));
        return () => {
            isCurrent = false;
        };
    }, [loader, fallbackError, reloadKey]);

    const reload = useCallback(() => {
        setState({ status: 'loading' });
        setReloadKey((key) => key + 1);
    }, []);

    return { state, reload };
};

const loadProfile = async (): Promise<UserProfile> => (await profileApi.getProfile()).data.profile;

const loadCatalog = async (): Promise<GameCatalogItem[]> => (await gamesApi.getGames()).data.games;

// Đủ để vẽ dải 14 ngày: lật trang (50 ván mỗi trang) tới khi qua mốc 14 ngày, tối đa 6 trang
export const STRIP_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PAGES = 6;

const loadRecent = async (): Promise<GameSession[]> => {
    // Lùi thêm 1 ngày để không hụt ngày đầu dải khi múi giờ trình duyệt khác múi giờ của backend
    const cutoff = Date.now() - (STRIP_DAYS + 1) * DAY_MS;
    const sessions: GameSession[] = [];
    let cursor: string | undefined;

    for (let page = 0; page < MAX_PAGES; page++) {
        const { data } = await dashboardApi.getHistory({ limit: 50, cursor });
        sessions.push(...data.items.map(toGameSession));
        cursor = data.nextCursor ?? undefined;
        const oldest = sessions.at(-1);
        if (!cursor || !oldest || oldest.playedAt.getTime() < cutoff) break;
    }
    return sessions;
};

export const useProfile = () => useRequest(loadProfile, 'Không tải được thông tin tài khoản.');
export const useCatalog = () => useRequest(loadCatalog, 'Không tải được danh sách trò chơi.');
export const useRecentSessions = () => useRequest(loadRecent, 'Không tải được các ván gần đây.');
