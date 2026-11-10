import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { roomsApi, type Leaderboard } from '../api/rooms.api';
import { RoomSetupForm, type RoomSetup } from '../components/RoomSetupForm';
import { CupLeaderboard } from '../components/CupLeaderboard';
import { QuickMatch } from '../components/QuickMatch';
import '@/styles/app-screen.css';
import '../rooms.css';

const messageOf = (cause: unknown, fallback: string) => (cause as { message?: string })?.message ?? fallback;

// Sảnh Đấu trí nhớ trên lưới 12 cột: dải chỉ số 12; rồi tìm trận nhanh 9 + vào phòng bằng mã 3;
// rồi tạo phòng 9 + bảng xếp hạng 3. Trên điện thoại: tìm trận, vào phòng, tạo phòng, bảng xếp hạng.
export const RoomsLobbyPage = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState<Leaderboard | null>(null);
    const [boardFailed, setBoardFailed] = useState(false);
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState<'create' | 'join' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchBoard = useCallback(() => roomsApi.leaderboard().then(setBoard).catch(() => setBoardFailed(true)), []);
    useEffect(() => { void fetchBoard(); }, [fetchBoard]);
    const retryBoard = () => { setBoardFailed(false); void fetchBoard(); };

    const create = async (setup: RoomSetup) => {
        setBusy('create'); setError(null);
        try {
            const room = await roomsApi.create(setup);
            navigate(`/rooms/${room.code}`);
        } catch (cause) {
            setError(messageOf(cause, 'Không tạo được phòng.'));
            setBusy(null);
        }
    };

    const join = async (event: FormEvent) => {
        event.preventDefault();
        setBusy('join'); setError(null);
        try {
            const room = await roomsApi.join(code);
            navigate(`/rooms/${room.code}`);
        } catch (cause) {
            setError(messageOf(cause, 'Không vào được phòng.'));
            setBusy(null);
        }
    };

    const me = board?.me;
    const stats = [
        { label: 'Trận đã đấu', value: me?.matches },
        { label: 'Thắng', value: me?.wins },
        { label: 'Cúp', value: me?.cups },
        { label: 'Hạng', value: me ? me.rank ?? null : undefined },
    ];

    return (
        <div className="min-h-svh">
            <Header />
            <main className="dash page-col rooms lobby">
                <header className="lobby__title">
                    <h1>Đấu trí nhớ</h1>
                    <p>Hai người ghi nhớ cùng một đề. Thắng nhiều vòng hơn thì thắng trận và nhận 1 cúp.</p>
                </header>

                <dl className="lobby__stats" aria-label="Thành tích đấu của bạn">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <dt>{stat.label}</dt>
                            <dd className="num" data-loading={stat.value === undefined}>
                                {stat.value === undefined ? '' : stat.value === null ? <span className="lobby__dash" aria-label="chưa có">–</span> : stat.value}
                            </dd>
                        </div>
                    ))}
                </dl>

                {error && <p role="alert" className="rooms__alert">{error}</p>}

                <div className="lobby__grid">
                    <div className="lobby__quick">
                        <QuickMatch />
                    </div>

                    <form className="panel lobby__join" onSubmit={join} aria-labelledby="join-title">
                        <h2 id="join-title">Vào phòng bằng mã</h2>
                        <label className="sr-only" htmlFor="room-code">Mã phòng 6 ký tự</label>
                        <input id="room-code" className="lobby__code num" required maxLength={6} autoComplete="off"
                            autoCapitalize="characters" spellCheck={false} placeholder="Mã 6 ký tự" value={code}
                            onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
                        <button className="duel-btn duel-btn--primary lobby__go" disabled={busy !== null || code.length !== 6}>
                            {busy === 'join' ? 'Đang vào phòng...' : <>Vào phòng <ArrowRight size={16} aria-hidden="true" /></>}
                        </button>
                    </form>

                    <div className="panel lobby__create">
                        <RoomSetupForm title="Tạo phòng mới" busy={busy !== null}
                            submitLabel={busy === 'create' ? 'Đang tạo phòng...' : 'Tạo phòng và lấy mã'}
                            onSubmit={(setup) => void create(setup)} onError={setError} />
                    </div>

                    <div className="lobby__board">
                        <CupLeaderboard board={board} failed={boardFailed} onRetry={retryBoard} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RoomsLobbyPage;
