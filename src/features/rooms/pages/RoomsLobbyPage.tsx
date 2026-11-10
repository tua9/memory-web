import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { gamesApi, type GameCatalogItem } from '@/features/shared-game/api/games.api';
import { GAME_META, type GameName } from '@/features/shared-game/registry';
import { roomsApi, type RoomStats } from '../api/rooms.api';
import '@/styles/app-screen.css';
import '../rooms.css';

const ROUND_CHOICES = [1, 3, 5];
const messageOf = (cause: unknown, fallback: string) => (cause as { message?: string })?.message ?? fallback;
const seconds = (value: number) => (value >= 60 && value % 60 === 0 ? `${value / 60} phút` : `${value} giây`);

export const RoomsLobbyPage = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState<GameCatalogItem[]>([]);
    const [stats, setStats] = useState<RoomStats | null>(null);
    const [gameName, setGameName] = useState<GameName>('card');
    const [mode, setMode] = useState<'level' | 'custom'>('level');
    const [level, setLevel] = useState(1);
    const [itemCount, setItemCount] = useState(5);
    const [memorizeSec, setMemorizeSec] = useState(60);
    const [roundCount, setRoundCount] = useState(3);
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState<'create' | 'join' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const choose = (game: GameCatalogItem) => {
        setGameName(game.gameName);
        setMode('level');
        // Gợi ý cấp mình đã mở; phòng đấu vẫn cho chọn mọi cấp
        setLevel(Math.min(game.player?.unlockedLevel ?? 1, game.maxLevel));
        setItemCount(game.customItems?.min ?? 5);
        setMemorizeSec(game.defaultMemorizeSec);
    };

    useEffect(() => {
        gamesApi.getGames()
            .then(({ data }) => {
                setGames(data.games);
                if (data.games[0]) choose(data.games[0]);
            })
            .catch((cause) => setError(messageOf(cause, 'Không tải được danh sách trò chơi.')));
        roomsApi.stats().then(setStats).catch(() => undefined);
    }, []);

    const game = games.find((item) => item.gameName === gameName);
    const meta = GAME_META[gameName];
    const items = mode === 'level' ? game?.levels.find((item) => item.level === level)?.itemCount : itemCount;

    const create = async (event: FormEvent) => {
        event.preventDefault();
        setBusy('create'); setError(null);
        try {
            const room = await roomsApi.create({
                gameName, mode, roundCount, memorizeSec,
                ...(mode === 'level' ? { gameLevel: level } : { itemCount }),
            });
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

    return (
        <div className="min-h-svh">
            <Header />
            <main className="dash page-col rooms">
                <header className="rooms__head">
                    <div>
                        <h1>Đấu trí nhớ</h1>
                        <p>Tạo phòng, gửi mã cho bạn bè hoặc người thân. Hai người ghi nhớ cùng một đề, ai nhớ đúng hơn và nhanh hơn thì thắng vòng.</p>
                    </div>
                    {stats && (
                        <dl className="rooms__stats" aria-label="Thành tích đấu của bạn">
                            <div><dt>Trận đã đấu</dt><dd>{stats.matches}</dd></div>
                            <div><dt>Thắng</dt><dd>{stats.wins}</dd></div>
                            <div><dt>Điểm giao lưu</dt><dd>{stats.points}</dd></div>
                        </dl>
                    )}
                </header>

                {error && <p role="alert" className="rooms__alert">{error}</p>}

                <div className="rooms__grid">
                    <form className="panel rooms__join" onSubmit={join} aria-labelledby="join-title">
                        <h2 id="join-title">Có mã phòng?</h2>
                        <p className="rooms__muted">Nhập mã 6 ký tự người tạo phòng gửi cho bạn.</p>
                        <label className="sr-only" htmlFor="room-code">Mã phòng</label>
                        <input id="room-code" className="rooms__code-input" required maxLength={6} autoComplete="off"
                            autoCapitalize="characters" spellCheck={false} placeholder="MÃ PHÒNG" value={code}
                            onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
                        <button className="btn btn--brand rooms__wide" disabled={busy !== null || code.length !== 6}>
                            {busy === 'join' ? 'Đang vào phòng...' : <>Vào phòng <ArrowRight size={18} aria-hidden="true" /></>}
                        </button>
                    </form>

                    <form className="panel rooms__create" onSubmit={create} aria-labelledby="create-title">
                        <h2 id="create-title">Tạo phòng mới</h2>

                        <fieldset className="rooms__field">
                            <legend>Trò chơi</legend>
                            <div className="rooms__games">
                                {games.map((item) => (
                                    <button key={item.gameName} type="button" className="rooms__game"
                                        aria-pressed={item.gameName === gameName}
                                        style={{ '--game': GAME_META[item.gameName].color } as React.CSSProperties}
                                        onClick={() => choose(item)}>
                                        <strong>{GAME_META[item.gameName].label}</strong>
                                        <span>Bạn đã mở cấp {item.player?.unlockedLevel ?? 1}</span>
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        {game && (
                            <fieldset className="rooms__field">
                                <legend>Độ khó</legend>
                                {game.customItems && (
                                    <div className="seg rooms__seg" role="group" aria-label="Cách chọn độ khó">
                                        <button type="button" className="seg__option" aria-pressed={mode === 'level'} onClick={() => setMode('level')}>Theo cấp</button>
                                        <button type="button" className="seg__option" aria-pressed={mode === 'custom'} onClick={() => setMode('custom')}>Tự chọn số lượng</button>
                                    </div>
                                )}
                                {mode === 'level' ? (
                                    <div className="rooms__levels">
                                        {game.levels.map((item) => (
                                            <button key={item.level} type="button" className="rooms__chip" aria-pressed={item.level === level}
                                                aria-label={`Cấp ${item.level}, ${item.itemCount} ${meta.unit}`} onClick={() => setLevel(item.level)}>
                                                <strong>{item.level}</strong>
                                                <span>{item.itemCount} {meta.unit}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : game.customItems && (
                                    <label className="rooms__range">
                                        <span>{itemCount} {meta.unit}</span>
                                        <input type="range" min={game.customItems.min} max={game.customItems.max} value={itemCount}
                                            onChange={(event) => setItemCount(Number(event.target.value))} />
                                    </label>
                                )}
                            </fieldset>
                        )}

                        {game && (
                            <div className="rooms__pair">
                                <fieldset className="rooms__field">
                                    <legend>Thời gian ghi nhớ</legend>
                                    <div className="rooms__chips">
                                        {game.memorizeSecOptions.map((value) => (
                                            <button key={value} type="button" className="rooms__chip" aria-pressed={value === memorizeSec} onClick={() => setMemorizeSec(value)}>
                                                {seconds(value)}
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>
                                <fieldset className="rooms__field">
                                    <legend>Số vòng</legend>
                                    <div className="rooms__chips">
                                        {ROUND_CHOICES.map((value) => (
                                            <button key={value} type="button" className="rooms__chip" aria-pressed={value === roundCount} onClick={() => setRoundCount(value)}>
                                                {value} vòng
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>
                        )}

                        <div className="rooms__summary">
                            <p>
                                <strong>{meta.label}</strong> · {items ?? '…'} {meta.unit} · {seconds(memorizeSec)} ghi nhớ · {roundCount} vòng
                            </p>
                            <button className="btn btn--brand" disabled={busy !== null || !game}>
                                {busy === 'create' ? 'Đang tạo phòng...' : 'Tạo phòng và lấy mã'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default RoomsLobbyPage;
