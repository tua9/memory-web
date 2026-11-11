import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shuffle, X } from 'lucide-react';
import { GAME_IDS, GAME_META, type GameName } from '@/features/shared-game/registry';
import { roomsApi, type MatchStatus } from '../api/rooms.api';
import { Mascot } from '@/components/ui/Mascot';

// 'any': ghép với bất kỳ ai đang tìm trận, trò chơi lấy theo người kia (hai bên cùng 'any' thì chọn ngẫu nhiên)
const ANY = 'any';
type Choice = GameName | typeof ANY;
const choiceLabel = (choice: Choice) => (choice === ANY ? 'bất kỳ trò nào' : GAME_META[choice].label);

const messageOf = (cause: unknown, fallback: string) => (cause as { message?: string })?.message ?? fallback;

// Tìm trận nhanh: vào ngẫu nhiên một phòng đang mở tìm người, không có thì ghép với người cũng đang tìm
// thành phòng mới (tối đa 5 người). Rời trang khi đang tìm thì huỷ vé để không ai bị ghép với người đã đi.
export const QuickMatch = () => {
    const navigate = useNavigate();
    // Mặc định tìm bất kỳ trò nào: nhiều người để ghép nhất, chờ ít nhất
    const [gameName, setGameName] = useState<Choice>(ANY);
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
        if (next.status === 'searching') setGameName(next.gameName as Choice);
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
                <p>Vào ngay một phòng đang tìm người, hoặc ghép với người đang tìm cùng trò. Phòng tối đa 5 người; mọi người sẵn sàng là vào trận.</p>
            </div>

            {status.status === 'searching' ? (
                <div className="quick__wait" aria-live="polite">
                    {/* Linh vật nhún nhảy giữa các vòng sóng lan ra trong lúc chờ ghép */}
                    <span className="quick__radar" aria-hidden="true">
                        <Mascot className="quick__mascot" />
                    </span>
                    <p>
                        Đang tìm người chơi <strong>{choiceLabel(gameName)}</strong>
                        <span className="num"> · {Math.floor(waited / 60)}:{String(waited % 60).padStart(2, '0')}</span>
                    </p>
                    <button type="button" className="duel-btn" disabled={busy} onClick={() => void cancel()}>
                        <X size={16} aria-hidden="true" /> Huỷ tìm
                    </button>
                </div>
            ) : (
                <div className="quick__pick">
                    <div className="quick__games" role="group" aria-label="Chọn trò để tìm trận">
                        <button type="button" className="rooms__chip quick__game quick__game--any" aria-pressed={gameName === ANY} onClick={() => setGameName(ANY)}>
                            <Shuffle size={14} aria-hidden="true" /> Bất kỳ trò nào
                        </button>
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
