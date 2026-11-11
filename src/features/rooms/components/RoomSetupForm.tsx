import { useEffect, useState, type FormEvent } from 'react';
import { gamesApi, type GameCatalogItem } from '@/features/shared-game/api/games.api';
import { GAME_META, type GameName } from '@/features/shared-game/registry';
import { formatSeconds } from '@/features/shared-game/utils/formatTime';

export type RoomSetup = { gameName: GameName; mode: 'level' | 'custom'; roundCount: number; memorizeSec: number; gameLevel?: number; itemCount?: number };

const ROUND_CHOICES = [1, 3, 5];

// Chọn trò, độ khó, thời gian ghi nhớ và số vòng. Dùng khi tạo phòng và khi chơi lại với trò khác.
export const RoomSetupForm = ({ title, titleId, submitLabel, busy, initialGame, onSubmit, onError }: {
    title: string;
    titleId?: string;
    submitLabel: string;
    busy: boolean;
    initialGame?: string;
    onSubmit: (setup: RoomSetup) => void;
    onError: (message: string) => void;
}) => {
    const [games, setGames] = useState<GameCatalogItem[]>([]);
    const [gameName, setGameName] = useState<GameName>('card');
    const [mode, setMode] = useState<'level' | 'custom'>('level');
    const [level, setLevel] = useState(1);
    const [itemCount, setItemCount] = useState(5);
    const [memorizeSec, setMemorizeSec] = useState(60);
    const [roundCount, setRoundCount] = useState(3);

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
                const first = data.games.find((game) => game.gameName === initialGame) ?? data.games[0];
                if (first) choose(first);
            })
            .catch((cause: { message?: string }) => onError(cause?.message ?? 'Không tải được danh sách trò chơi.'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const game = games.find((item) => item.gameName === gameName);
    const meta = GAME_META[gameName];
    const items = mode === 'level' ? game?.levels.find((item) => item.level === level)?.itemCount : itemCount;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit({ gameName, mode, roundCount, memorizeSec, ...(mode === 'level' ? { gameLevel: level } : { itemCount }) });
    };

    return (
        <form className="setup" onSubmit={submit} aria-label={title}>
            <h2 id={titleId}>{title}</h2>

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
                                    {formatSeconds(value)}
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
                    <strong>{meta.label}</strong> · {items ?? '…'} {meta.unit} · {formatSeconds(memorizeSec)} ghi nhớ · {roundCount} vòng
                </p>
                <button className="btn btn--brand" disabled={busy || !game}>{submitLabel}</button>
            </div>
        </form>
    );
};
