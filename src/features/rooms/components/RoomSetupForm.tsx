import { useEffect, useId, useState, type FormEvent } from 'react';
import { gamesApi, type GameCatalogItem } from '@/features/shared-game/api/games.api';
import { GAME_META, type GameName } from '@/features/shared-game/registry';
import { formatSeconds } from '@/features/shared-game/utils/formatTime';

export type RoomSetup = { gameName: GameName; mode: 'level' | 'custom'; roundCount: number; memorizeSec: number; gameLevel?: number; itemCount?: number; capacity?: number };

const ROUND_CHOICES = [1, 3, 5];
// Phòng 5 chỗ vẫn chơi được với 2–4 người, nên chỉ cần hai lựa chọn
const PLAYER_CHOICES = [{ value: 2, label: '2 người' }, { value: 5, label: 'Tối đa 5' }];

// Chọn trò, độ khó, thời gian ghi nhớ và số vòng. Dùng khi tạo phòng (kèm số người) và khi chơi lại với trò khác.
export const RoomSetupForm = ({ title, titleId, submitLabel, busy, initialGame, withPlayers = false, onSubmit, onError }: {
    title: string;
    titleId?: string;
    submitLabel: string;
    busy: boolean;
    initialGame?: string;
    withPlayers?: boolean;
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
    const [capacity, setCapacity] = useState(2);

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
        onSubmit({ gameName, mode, roundCount, memorizeSec, ...(mode === 'level' ? { gameLevel: level } : { itemCount }), ...(withPlayers ? { capacity } : {}) });
    };

    const maxLevel = game?.levels.length ?? 1;
    const difficultyId = useId();

    return (
        <form className="setup" onSubmit={submit} aria-label={title}>
            <h2 id={titleId}>{title}</h2>

            <div className="setup__games" role="group" aria-label="Trò chơi">
                {games.map((item) => (
                    <button key={item.gameName} type="button" className="setup__game"
                        aria-pressed={item.gameName === gameName}
                        style={{ '--game': GAME_META[item.gameName].color } as React.CSSProperties}
                        title={`Bạn đã mở cấp ${item.player?.unlockedLevel ?? 1}`}
                        onClick={() => choose(item)}>
                        <strong>{GAME_META[item.gameName].label}</strong>
                        <span className="num">cấp {item.player?.unlockedLevel ?? 1}</span>
                    </button>
                ))}
            </div>

            {game && (
                <div className="setup__field" role="group" aria-labelledby={difficultyId}>
                    <div className="setup__head">
                        <span id={difficultyId} className="setup__label">Độ khó</span>
                        {game.customItems && (
                            <div className="seg" role="group" aria-label="Cách chọn độ khó">
                                <button type="button" className="seg__option" aria-pressed={mode === 'level'} onClick={() => setMode('level')}>Theo cấp</button>
                                <button type="button" className="seg__option" aria-pressed={mode === 'custom'} onClick={() => setMode('custom')}>Tự chọn</button>
                            </div>
                        )}
                    </div>
                    <div className="setup__difficulty">
                        <p className="setup__readout num" aria-live="polite">
                            {mode === 'level' && <span>Cấp {level}</span>}
                            <strong>{items ?? '…'}</strong> {meta.unit}
                        </p>
                        {mode === 'level' ? (
                            // Thang cấp: cột cao dần theo cấp, các cấp tới cấp đang chọn được tô màu
                            <div className="setup__ladder">
                                {game.levels.map((item) => (
                                    <button key={item.level} type="button" className="setup__step"
                                        aria-pressed={item.level === level} data-on={item.level <= level}
                                        style={{ '--h': `${30 + (70 * item.level) / maxLevel}%` } as React.CSSProperties}
                                        aria-label={`Cấp ${item.level}, ${item.itemCount} ${meta.unit}`} onClick={() => setLevel(item.level)}>
                                        <span className="setup__bar" aria-hidden="true" />
                                        <span className="setup__no num" aria-hidden="true">{item.level}</span>
                                    </button>
                                ))}
                            </div>
                        ) : game.customItems && (
                            <input className="setup__range" type="range" min={game.customItems.min} max={game.customItems.max} value={itemCount}
                                aria-label={`Số ${meta.unit}`} onChange={(event) => setItemCount(Number(event.target.value))} />
                        )}
                    </div>
                </div>
            )}

            {game && (
                <div className="setup__row">
                    <OptionGroup label="Ghi nhớ" options={game.memorizeSecOptions.map((value) => ({ value, label: formatSeconds(value) }))}
                        value={memorizeSec} onChange={setMemorizeSec} />
                    <OptionGroup label="Số vòng" options={ROUND_CHOICES.map((value) => ({ value, label: `${value} vòng` }))}
                        value={roundCount} onChange={setRoundCount} />
                    {withPlayers && <OptionGroup label="Người chơi" options={PLAYER_CHOICES} value={capacity} onChange={setCapacity} />}
                </div>
            )}

            <div className="rooms__summary">
                <p>
                    <strong>{meta.label}</strong> · {items ?? '…'} {meta.unit} · {formatSeconds(memorizeSec)} ghi nhớ · {roundCount} vòng
                    {withPlayers && <> · {capacity === 2 ? '2 người' : 'tối đa 5 người'}</>}
                </p>
                <button className="btn btn--brand" disabled={busy || !game}>{submitLabel}</button>
            </div>
        </form>
    );
};

// Một nhóm lựa chọn liền khối có nhãn: thời gian ghi nhớ, số vòng, số người
const OptionGroup = ({ label, options, value, onChange }: {
    label: string;
    options: { value: number; label: string }[];
    value: number;
    onChange: (value: number) => void;
}) => (
    <div className="setup__group">
        <span className="setup__label">{label}</span>
        <div className="seg" role="group" aria-label={label}>
            {options.map((option) => (
                <button key={option.value} type="button" className="seg__option" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);
