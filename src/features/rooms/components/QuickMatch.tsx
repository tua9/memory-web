import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { GAME_IDS, GAME_META, type GameName } from '@/features/shared-game/registry';
import { roomsApi, type MatchStatus } from '../api/rooms.api';

const messageOf = (cause: unknown, fallback: string) => (cause as { message?: string })?.message ?? fallback;

// Tìm trận nhanh: chọn trò rồi chờ người khác cũng đang tìm trò đó. Ghép được thì vào phòng ngay,
// trận tự bắt đầu sau 30 giây. Rời trang khi đang tìm thì huỷ vé để không ai bị ghép với người đã đi.
export const QuickMatch = () => {
    const navigate = useNavigate();
    const [gameName, setGameName] = useState<GameName>('card');
    const [status, setStatus] = useState<MatchStatus>({ status: 'idle' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const searching = useRef(false);

    const apply = (next: MatchStatus) => {
        searching.current = next.status === 'searching';
        if (next.status === 'matched') {
            navigate(`/rooms/${next.code}`);
            return;
        }
        setStatus(next);
        if (next.status === 'searching') setGameName(next.gameName as GameName);
    };

    // Mở lại trang khi đang tìm dở (tải lại trang): tiếp tục chờ với vé cũ
    useEffect(() => {
        roomsApi.pollMatch().then(apply).catch(() => undefined);
        return () => {
            if (searching.current) void roomsApi.cancelMatch().catch(() => undefined);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Đang tìm: hỏi mỗi 2 giây (vừa giữ vé còn hạn, vừa thử ghép lại) và đếm thời gian đã chờ
    useEffect(() => {
        if (status.status !== 'searching') return;
        const poll = setInterval(() => { roomsApi.pollMatch().then(apply).catch(() => undefined); }, 2000);
        const clock = setInterval(() => setNow(Date.now()), 1000);
        return () => { clearInterval(poll); clearInterval(clock); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status.status]);

    const find = async () => {
        setBusy(true); setError(null);
        try {
            apply(await roomsApi.findMatch(gameName));
        } catch (cause) {
            setError(messageOf(cause, 'Chưa tìm trận được.'));
        } finally {
            setBusy(false);
        }
    };

    const cancel = async () => {
        setBusy(true);
        try {
            apply(await roomsApi.cancelMatch());
        } catch (cause) {
            setError(messageOf(cause, 'Chưa huỷ được.'));
        } finally {
            setBusy(false);
        }
    };

    const waited = status.status === 'searching' ? Math.max(0, Math.floor((now - new Date(status.since).getTime()) / 1000)) : 0;

    return (
        <section className="panel quick" aria-labelledby="quick-title" data-searching={status.status === 'searching'}>
            <div className="quick__head">
                <h2 id="quick-title">Tìm trận nhanh</h2>
                <p>Ghép với người đang tìm cùng trò. Ghép xong, trận tự bắt đầu sau 30 giây.</p>
            </div>

            {status.status === 'searching' ? (
                <div className="quick__wait" aria-live="polite">
                    <span className="quick__pulse" aria-hidden="true" />
                    <p>
                        Đang tìm người chơi <strong>{GAME_META[gameName].label}</strong>
                        <span className="num"> · {Math.floor(waited / 60)}:{String(waited % 60).padStart(2, '0')}</span>
                    </p>
                    <button type="button" className="duel-btn" disabled={busy} onClick={() => void cancel()}>
                        <X size={16} aria-hidden="true" /> Huỷ tìm
                    </button>
                </div>
            ) : (
                <div className="quick__pick">
                    <div className="quick__games" role="group" aria-label="Chọn trò để tìm trận">
                        {GAME_IDS.map((id) => (
                            <button key={id} type="button" className="rooms__chip quick__game" aria-pressed={id === gameName}
                                style={{ '--game': GAME_META[id].color } as React.CSSProperties} onClick={() => setGameName(id)}>
                                {GAME_META[id].label}
                            </button>
                        ))}
                    </div>
                    <button type="button" className="duel-btn duel-btn--primary quick__go" disabled={busy} onClick={() => void find()}>
                        <Search size={16} aria-hidden="true" /> Tìm trận
                    </button>
                </div>
            )}
            {error && <p role="alert" className="quick__error">{error}</p>}
        </section>
    );
};
