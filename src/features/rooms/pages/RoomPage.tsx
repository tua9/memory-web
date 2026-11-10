import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Link2, Undo2, UserMinus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { roomsApi, type RoomItem, type RoomPlayer, type RoomView } from '../api/rooms.api';
import { PlayingCard } from '@/features/cards-game/components/PlayingCard';
import type { Card, Rank, Suit } from '@/features/cards-game/types/types';
import { cardFromCode, cardToCode } from '@/features/cards-game/utils/cardUtils';
import { cardLabel, SUIT_LABELS, SUIT_SYMBOLS } from '@/features/cards-game/utils/cardLabels';
import { PhotoTile } from '@/features/images-game/components/PhotoTile';
import { WordCard } from '@/features/words-game/components/WordCard';
import { FaceAvatar } from '@/features/facename-game/components/FaceAvatar';
import { RecallBoard } from '@/features/shared-game/components/RecallBoard';
import { Confetti } from '@/features/shared-game/components/Confetti';
import { GAME_META, type GameName } from '@/features/shared-game/registry';
import '@/features/shared-game/game.css';
import '@/styles/app-screen.css';
import '../rooms.css';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const ALL_CARDS: Card[] = SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
const CARD_GROUPS = SUITS.map((suit) => ({
    label: `${SUIT_SYMBOLS[suit]} ${SUIT_LABELS[suit]}`,
    items: ALL_CARDS.filter((c) => c.suit === suit),
}));

const tryCardFromCode = (code: string | null | undefined): Card | null => {
    if (!code) return null;
    try {
        return cardFromCode(code);
    } catch {
        return null;
    }
};

const messageOf = (cause: unknown, fallback: string) => (cause as { message?: string })?.message ?? fallback;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} giây`;

// Vẽ một mục của trò chơi đúng như ở màn chơi một mình
const RenderGameItem = ({ gameName, item, size = 'md', showLabel = true }: {
    gameName: string;
    item: RoomItem;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}): ReactNode => {
    if (gameName === 'card') {
        const card = tryCardFromCode(item.code);
        return card ? <PlayingCard card={card} size={size} /> : <span className="pcard pcard--back" data-size={size} />;
    }
    if (gameName === 'image') {
        return <PhotoTile image={{ id: item.code, imageUrl: item.imageUrl ?? '' }} size={size} label={item.label ?? item.code} />;
    }
    if (gameName === 'number') {
        return <span className="room-digit" data-size={size}>{item.code}</span>;
    }
    if (gameName === 'word') {
        return <WordCard word={item.label || item.code} size={size} />;
    }
    if (gameName === 'facename') {
        return (
            <span className="room-face">
                <FaceAvatar src={item.imageUrl ?? ''} alt={item.label ?? ''} size={size === 'lg' ? 'lg' : size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
                {showLabel && item.label && <span>{item.label}</span>}
            </span>
        );
    }
    return <span className="room-word">{item.label ?? item.code}</span>;
};

const Avatar = ({ player }: { player: Pick<RoomPlayer, 'username' | 'avatarUrl'> }) => (
    <span className="room-player__avatar" aria-hidden="true">
        {player.avatarUrl ? <img src={player.avatarUrl} alt="" /> : player.username.charAt(0).toUpperCase()}
    </span>
);

// Trạng thái của từng người chơi trong vòng hiện tại, để ai cũng thấy đối thủ đang ở bước nào
const playerStatus = (room: RoomView, player: RoomPlayer) => {
    if (room.state === 'waiting') return player.ready ? 'Đã sẵn sàng' : 'Chưa sẵn sàng';
    if (room.state === 'memorizing' || room.state === 'recalling') {
        if (player.submitted) return 'Đã nộp bài';
        return player.inRecall ? 'Đang trả lời' : 'Đang ghi nhớ';
    }
    return `${player.score.wins} thắng · ${player.score.draws} hoà`;
};

// Đồng hồ dạng vòng: phần còn lại của thời gian cho bước hiện tại
const TimerRing = ({ remaining, total }: { remaining: number; total: number }) => {
    const radius = 26;
    const length = 2 * Math.PI * radius;
    const ratio = total > 0 ? Math.min(1, remaining / total) : 0;
    return (
        <span className="room-timer" data-low={remaining <= 5} role="timer" aria-label={`Còn ${remaining} giây`}>
            <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r={radius} className="room-timer__track" />
                <circle cx="32" cy="32" r={radius} className="room-timer__fill" strokeDasharray={length} strokeDashoffset={length * (1 - ratio)} />
            </svg>
            <strong>{remaining}</strong>
        </span>
    );
};

export const RoomPage = () => {
    const { code = '' } = useParams();
    const [room, setRoom] = useState<RoomView | null>(null);
    const [answers, setAnswers] = useState<(string | null)[]>([]);
    const [slot, setSlot] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fatal, setFatal] = useState<string | null>(null);
    const [connected, setConnected] = useState(true);
    const [tick, setTick] = useState(Date.now());
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);

    const offset = useRef(0);
    const version = useRef(0);
    const lastRevision = useRef(-1);
    const lastPhase = useRef<{ index: number; phase: string } | null>(null);
    const autoSubmitted = useRef(-1);

    const draftKey = (value: RoomView) => `memio-room-draft:${value.code}:${value.meId}:${value.roundIndex}`;

    const apply = (value: RoomView) => {
        if (value.revision < lastRevision.current) return;
        lastRevision.current = value.revision;
        offset.current = new Date(value.serverNow).getTime() - Date.now();
        if (
            lastPhase.current?.index !== value.roundIndex ||
            (lastPhase.current.phase !== 'recalling' && value.phase === 'recalling')
        ) {
            let draft: (string | null)[] = Array(value.rules.totalItems).fill(null);
            if (value.round?.myAnswers && value.round.myAnswers.length === value.rules.totalItems) {
                draft = value.round.myAnswers;
            } else {
                try {
                    const saved = JSON.parse(sessionStorage.getItem(draftKey(value)) ?? 'null');
                    if (Array.isArray(saved) && saved.length === value.rules.totalItems && saved.every((item) => item === null || typeof item === 'string')) {
                        draft = saved;
                    }
                } catch {
                    /* use empty draft */
                }
            }
            setAnswers(draft);
            setSlot(0);
        }
        if (value.phase === 'round_result' || value.phase === 'completed' || value.phase === 'cancelled') {
            try {
                sessionStorage.removeItem(draftKey(value));
            } catch {
                /* storage unavailable */
            }
        }
        lastPhase.current = { index: value.roundIndex, phase: value.phase };
        setRoom(value);
        setConnected(true);
    };

    // Hỏi phòng mỗi 2 giây; lỗi thì giãn dần tới 10 giây. Trận đã xong thì thôi không hỏi nữa.
    // Mở link phòng khi chưa ở trong phòng: thử vào phòng một lần.
    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout> | null = null;
        let failures = 0;
        let triedJoin = false;
        const ownVersion = ++version.current;
        lastRevision.current = -1;
        lastPhase.current = null;

        const poll = async () => {
            let finished = false;
            try {
                const value = await roomsApi.get(code);
                if (!active || ownVersion !== version.current) return;
                apply(value);
                failures = 0;
                finished = value.state === 'completed' || value.state === 'cancelled';
            } catch (cause) {
                if (!active || ownVersion !== version.current) return;
                const status = (cause as { status?: number })?.status;
                if (status === 404 && !triedJoin) {
                    triedJoin = true;
                    try {
                        apply(await roomsApi.join(code));
                    } catch (joinError) {
                        setFatal(messageOf(joinError, 'Không vào được phòng này.'));
                        return;
                    }
                } else if (status === 404) {
                    setFatal('Không tìm thấy phòng. Phòng có thể đã bị huỷ hoặc bạn đã rời phòng.');
                    return;
                } else {
                    failures += 1;
                    setConnected(false);
                }
            } finally {
                if (active && ownVersion === version.current && !finished) {
                    timer = setTimeout(poll, Math.min(10_000, 2_000 * 2 ** Math.min(failures, 3)));
                }
            }
        };

        void poll();
        return () => {
            active = false;
            version.current += 1;
            if (timer) clearTimeout(timer);
        };
    }, [code]);

    useEffect(() => {
        const timer = setInterval(() => setTick(Date.now()), 250);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (room?.phase !== 'recalling' || answers.length !== room.rules.totalItems) return;
        try {
            sessionStorage.setItem(draftKey(room), JSON.stringify(answers));
        } catch {
            /* storage unavailable */
        }
    }, [answers, room]);

    const act = async (action: () => Promise<RoomView>) => {
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
            apply(await action());
        } catch (cause) {
            setError(messageOf(cause, 'Thao tác chưa thành công.'));
        } finally {
            setBusy(false);
        }
    };

    const copy = (kind: 'code' | 'link') => {
        const text = kind === 'code' ? code : `${window.location.origin}/rooms/${code}`;
        void navigator.clipboard?.writeText(text).then(() => {
            setCopied(kind);
            setTimeout(() => setCopied(null), 1800);
        });
    };

    const round = room?.round;
    const deadline = room?.phase === 'memorizing' ? round?.memorizeEndsAt : round?.recallEndsAt;
    const remaining = deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - tick - offset.current) / 1000)) : null;
    const phaseTotal = room ? (room.phase === 'memorizing' ? room.rules.memorizeLimitSec : room.rules.recallLimitSec) : 0;

    // Hết giờ trả lời mà chưa bấm nộp: tự nộp những gì đã điền (server còn nhận thêm vài giây)
    useEffect(() => {
        if (!room || room.phase !== 'recalling' || remaining !== 0 || autoSubmitted.current === room.roundIndex) return;
        autoSubmitted.current = room.roundIndex;
        void act(() => roomsApi.submit(code, answers));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remaining, room?.phase, room?.roundIndex]);

    const choose = (index: number, value: string | null) =>
        setAnswers((current) => current.map((answer, i) => (i === index ? value : answer)));

    const chooseOption = (index: number, value: string) =>
        setAnswers((current) => current.map((answer, i) => (i === index ? value : answer === value ? null : answer)));

    // Bàn phím nhanh cho ghi nhớ và trả lời
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (room?.phase === 'memorizing' && e.key === 'Enter') {
                e.preventDefault();
                void act(() => roomsApi.recall(code));
            } else if (room?.phase === 'recalling') {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    void act(() => roomsApi.submit(code, answers));
                } else if (e.key === 'Backspace') {
                    e.preventDefault();
                    if (slot >= 0 && answers[slot] !== null) {
                        choose(slot, null);
                    } else {
                        const lastFilled = answers.findLastIndex((a) => a !== null);
                        if (lastFilled !== -1) {
                            choose(lastFilled, null);
                            setSlot(lastFilled);
                        }
                    }
                } else if (room.gameName === 'number' && /^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    const target = slot >= 0 ? slot : answers.findIndex((a) => a === null);
                    if (target !== -1) {
                        choose(target, e.key);
                        setSlot((curr) => Math.min(curr + 1, answers.length - 1));
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room?.phase, room?.gameName, answers, slot, code]);

    const meta = room ? GAME_META[room.gameName as GameName] : null;
    const totalItems = room?.rules.totalItems ?? 0;
    const filledCount = answers.filter((a) => a !== null && a !== '').length;
    const me = room?.players.find((player) => player.isMe);
    const opponent = room?.players.find((player) => !player.isMe);
    const seats = room ? [me, opponent] : [];

    const imageOptions = round?.recallOptions ?? [];
    const imageOptionMap = new Map(imageOptions.map((opt) => [opt.code, opt]));

    const outcomeFor = (outcome: string | null | undefined) =>
        outcome === 'draw' ? 'draw' : outcome === room?.meId ? 'win' : 'lose';
    const finalOutcome = me && opponent
        ? me.score.points > opponent.score.points ? 'win' : me.score.points < opponent.score.points ? 'lose' : 'draw'
        : 'draw';

    if (fatal) {
        return (
            <div className="min-h-svh">
                <Header />
                <main className="dash page-col rooms">
                    <section className="panel room-end">
                        <h1>Không vào được phòng {code}</h1>
                        <p>{fatal}</p>
                        <Link to="/rooms" className="btn btn--brand">Về trang Đấu trí nhớ</Link>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-svh">
            <Header />
            <main className="dash page-col rooms room">
                <div className="room__bar">
                    <Link to="/rooms" className="room__back" aria-label="Về trang Đấu trí nhớ">
                        <ArrowLeft size={18} aria-hidden="true" />
                    </Link>
                    <div className="room__title">
                        <h1>Phòng {code}</h1>
                        {room && meta && (
                            <p>
                                <span className="room__game" style={{ '--game': meta.color } as React.CSSProperties}>{meta.label}</span>
                                {' · '}{room.rules.gameLevel ? `Cấp ${room.rules.gameLevel}` : 'Tự chọn'} · {totalItems} {meta.unit} · {room.roundCount} vòng
                            </p>
                        )}
                    </div>
                    <span className="room__link" data-ok={connected} role="status">
                        {connected ? 'Đã kết nối' : 'Đang kết nối lại...'}
                    </span>
                </div>

                {error && <p role="alert" className="rooms__alert">{error}</p>}
                {!room && <p className="dash-note">Đang vào phòng...</p>}

                {room && (
                    <>
                        {/* Hai người chơi đối mặt, luôn ở đầu trang: ai đang ở bước nào, tỉ số bao nhiêu */}
                        <section className="room-versus" aria-label="Người chơi">
                            {seats.map((player, index) => player ? (
                                <article key={player._id} className="room-player" data-me={player.isMe}
                                    data-done={player.submitted || (room.state === 'waiting' && player.ready)}>
                                    <Avatar player={player} />
                                    <div className="room-player__who">
                                        <strong>{player.isMe ? 'Bạn' : player.username}</strong>
                                        <span>{player.isHost ? 'Chủ phòng · ' : ''}{playerStatus(room, player)}</span>
                                    </div>
                                    {room.roundIndex >= 0 && <span className="room-player__wins" aria-label={`${player.score.wins} vòng thắng`}>{player.score.wins}</span>}
                                </article>
                            ) : (
                                <article key={`empty-${index}`} className="room-player room-player--empty">
                                    <span className="room-player__avatar" aria-hidden="true">?</span>
                                    <div className="room-player__who">
                                        <strong>Đang chờ người chơi</strong>
                                        <span>Gửi mã phòng để người kia vào</span>
                                    </div>
                                </article>
                            ))}
                            <div className="room-versus__mid">
                                {(room.phase === 'memorizing' || room.phase === 'recalling') && remaining !== null
                                    ? <TimerRing remaining={remaining} total={phaseTotal} />
                                    : <span className="room-versus__vs">VS</span>}
                                <span>{room.roundIndex >= 0 ? `Vòng ${room.roundIndex + 1}/${room.roundCount}` : `${room.roundCount} vòng`}</span>
                            </div>
                        </section>

                        {room.state === 'waiting' && (
                            <section className="panel room-wait" aria-labelledby="wait-title">
                                <div className="room-wait__code">
                                    <h2 id="wait-title">Mã phòng</h2>
                                    <p className="room-tiles" aria-label={`Mã ${code.split('').join(' ')}`}>
                                        {code.split('').map((char, index) => <span key={index} style={{ animationDelay: `${index * 60}ms` }}>{char}</span>)}
                                    </p>
                                    <p className="rooms__muted">Người chơi cùng mở mục Đấu trí nhớ và nhập mã này, hoặc mở link phòng.</p>
                                    <div className="room__actions">
                                        <button type="button" className="settings__action" onClick={() => copy('code')}>
                                            {copied === 'code' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                                            {copied === 'code' ? 'Đã sao chép' : 'Sao chép mã'}
                                        </button>
                                        <button type="button" className="settings__action" onClick={() => copy('link')}>
                                            {copied === 'link' ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
                                            {copied === 'link' ? 'Đã sao chép' : 'Sao chép link'}
                                        </button>
                                    </div>
                                </div>
                                <div className="room-wait__go">
                                    <h2>Sẵn sàng?</h2>
                                    <ul className="room-rules">
                                        <li>Hai người cùng ghi nhớ một đề trong {room.rules.memorizeLimitSec} giây, rồi trả lời theo đúng thứ tự.</li>
                                        <li>Nhiều vị trí đúng hơn thì thắng vòng; bằng nhau thì ai nhanh hơn thắng.</li>
                                        <li>Chơi đủ {room.roundCount} vòng và cả hai đều có trả lời: mỗi người nhận 10 điểm giao lưu.</li>
                                    </ul>
                                    <div className="room__actions">
                                        <button type="button" className={me?.ready ? 'settings__action' : 'btn btn--brand'} disabled={busy}
                                            onClick={() => void act(() => roomsApi.ready(code, !me?.ready))}>
                                            {me?.ready ? 'Huỷ sẵn sàng' : 'Tôi đã sẵn sàng'}
                                        </button>
                                        {room.isHost && (
                                            <button type="button" className="btn btn--brand" disabled={busy || room.players.length < room.capacity || !room.players.every((p) => p.ready)}
                                                onClick={() => void act(() => roomsApi.start(code))}>
                                                Bắt đầu trận
                                            </button>
                                        )}
                                    </div>
                                    <div className="room__actions room__actions--quiet">
                                        {room.isHost && opponent && (
                                            <button type="button" className="settings__action" disabled={busy}
                                                onClick={() => window.confirm(`Mời ${opponent.username} ra khỏi phòng?`) && void act(() => roomsApi.kick(code, opponent._id))}>
                                                <UserMinus size={16} aria-hidden="true" /> Mời ra
                                            </button>
                                        )}
                                        <button type="button" className="settings__action settings__action--danger" disabled={busy}
                                            onClick={() => window.confirm(room.isHost ? 'Huỷ phòng này?' : 'Rời phòng này?') && void act(() => roomsApi.leave(code))}>
                                            {room.isHost ? 'Huỷ phòng' : 'Rời phòng'}
                                        </button>
                                    </div>
                                    {room.isHost && room.players.length === room.capacity && !room.players.every((p) => p.ready) && (
                                        <p className="rooms__muted">Bắt đầu được khi cả hai đã sẵn sàng.</p>
                                    )}
                                </div>
                            </section>
                        )}

                        {room.phase === 'memorizing' && round?.items && (
                            <section className="play__table room-play" aria-labelledby="memorize-title">
                                <div className="room-play__head">
                                    <h2 id="memorize-title">Ghi nhớ thứ tự {totalItems} {meta?.unit}</h2>
                                    <p>Nhớ xong trước thì bấm trả lời ngay, đối thủ vẫn có đủ thời gian của mình.</p>
                                </div>
                                <ol className="room-play__items">
                                    {round.items.map((item, index) => (
                                        <li key={index} style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}>
                                            <span>{index + 1}</span>
                                            <RenderGameItem gameName={room.gameName} item={item} size={totalItems <= 6 ? 'lg' : 'md'} />
                                        </li>
                                    ))}
                                </ol>
                                <button type="button" className="btn btn--sun room-play__go" disabled={busy}
                                    onClick={() => void act(() => roomsApi.recall(code))}>
                                    Nhớ xong, trả lời
                                </button>
                            </section>
                        )}

                        {room.phase === 'recalling' && round && (
                            <section className="room-recall" aria-label="Trả lời">
                                        {/* Thẻ bài: chọn lá từ bộ 52 lá */}
                                        {room.gameName === 'card' && (
                                            <div className="space-y-4">
                                                <RecallBoard<Card>
                                                    slots={answers.map(tryCardFromCode)}
                                                    selectedIndex={slot >= 0 ? slot : null}
                                                    shape="card"
                                                    unit="lá"
                                                    onSelectSlot={(idx) => setSlot(idx === slot ? -1 : idx)}
                                                    onClearSlot={(idx) => choose(idx, null)}
                                                    deckTitle="Bộ bài · 52 lá"
                                                    groups={CARD_GROUPS}
                                                    isUsed={(card) => answers.includes(cardToCode(card))}
                                                    onPick={(card) => {
                                                        const targetSlot =
                                                            slot >= 0 ? slot : answers.findIndex((a) => a === null);
                                                        if (targetSlot !== -1) {
                                                            chooseOption(targetSlot, cardToCode(card));
                                                            const nextEmpty = answers.findIndex(
                                                                (a, idx) => idx > targetSlot && a === null
                                                            );
                                                            setSlot(
                                                                nextEmpty !== -1
                                                                    ? nextEmpty
                                                                    : Math.min(targetSlot + 1, answers.length - 1)
                                                            );
                                                        }
                                                    }}
                                                    keyOf={(card) => `${card.rank}${card.suit}`}
                                                    labelOf={cardLabel}
                                                    renderItem={(card) => <PlayingCard card={card} size="sm" />}
                                                />
                                            </div>
                                        )}

                                        {/* Hình ảnh: chọn từ bộ hình đã xáo */}
                                        {room.gameName === 'image' && (
                                            <div className="space-y-4">
                                                <RecallBoard<RoomItem>
                                                    slots={answers.map((ans) =>
                                                        ans ? imageOptionMap.get(ans) ?? { code: ans } : null
                                                    )}
                                                    selectedIndex={slot >= 0 ? slot : null}
                                                    shape="photo"
                                                    unit="hình"
                                                    onSelectSlot={(idx) => setSlot(idx === slot ? -1 : idx)}
                                                    onClearSlot={(idx) => choose(idx, null)}
                                                    deckTitle={`Bộ hình · ${imageOptions.length} hình`}
                                                    groups={[{ items: imageOptions }]}
                                                    isUsed={(item) => answers.includes(item.code)}
                                                    onPick={(item) => {
                                                        const targetSlot =
                                                            slot >= 0 ? slot : answers.findIndex((a) => a === null);
                                                        if (targetSlot !== -1) {
                                                            chooseOption(targetSlot, item.code);
                                                            const nextEmpty = answers.findIndex(
                                                                (a, idx) => idx > targetSlot && a === null
                                                            );
                                                            setSlot(
                                                                nextEmpty !== -1
                                                                    ? nextEmpty
                                                                    : Math.min(targetSlot + 1, answers.length - 1)
                                                            );
                                                        }
                                                    }}
                                                    keyOf={(item) => item.code}
                                                    labelOf={(item) => item.label ?? item.code}
                                                    renderItem={(item, place) => (
                                                        <PhotoTile
                                                            image={{ id: item.code, imageUrl: item.imageUrl ?? '' }}
                                                            size={place === 'slot' ? undefined : 'md'}
                                                            label=""
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {/* Ghi nhớ số: bàn phím số */}
                                        {room.gameName === 'number' && (
                                            <div className="space-y-5">
                                                <main className="play__table play__table--recall w-full shadow-lg">
                                                    <div className="answer__head">
                                                        <div>
                                                            <h2>Gõ lại dãy số theo đúng thứ tự</h2>
                                                            <p className="text-sm text-white/85">
                                                                Đã điền {filledCount} trên {totalItems}. Bấm số bên dưới hoặc gõ bàn phím vào ô sáng màu.
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="answer__undo"
                                                            onClick={() => {
                                                                const lastFilled = answers.findLastIndex((a) => a !== null);
                                                                if (lastFilled !== -1) choose(lastFilled, null);
                                                            }}
                                                            disabled={!answers.some(Boolean)}
                                                        >
                                                            <Undo2 size={16} /> Gỡ số cuối
                                                        </button>
                                                    </div>

                                                    <ol className="slots my-4">
                                                        {answers.map((ans, idx) => (
                                                            <li key={idx}>
                                                                <span className="slots__no">#{idx + 1}</span>
                                                                <button
                                                                    type="button"
                                                                    className="slot font-mono text-2xl font-bold"
                                                                    data-target={slot === idx}
                                                                    data-filled={ans !== null}
                                                                    onClick={() => setSlot(idx)}
                                                                >
                                                                    {ans ?? ''}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </main>

                                                {/* Bàn phím số 0-9 */}
                                                <div className="mx-auto max-w-sm rounded-2xl border border-[#d3dfd6] bg-white p-4 shadow-sm">
                                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                                        {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
                                                            (digit) => (
                                                                <button
                                                                    key={digit}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        choose(slot, digit);
                                                                        setSlot((curr) =>
                                                                            Math.min(curr + 1, answers.length - 1)
                                                                        );
                                                                    }}
                                                                    className="h-12 rounded-xl border border-[#d3dfd6] bg-[#fbfbf9] text-xl font-extrabold text-ink transition-all hover:bg-step active:scale-95 shadow-xs"
                                                                >
                                                                    {digit}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                choose(slot, null);
                                                                setSlot((curr) => Math.max(0, curr - 1));
                                                            }}
                                                            className="flex-1 rounded-xl border border-[#d3dfd6] bg-white py-2 text-xs font-bold text-muted hover:bg-step"
                                                        >
                                                            Xoá ô này
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setAnswers(Array(room.rules.totalItems).fill(null))
                                                            }
                                                            className="rounded-xl border border-[#d3dfd6] bg-white px-4 py-2 text-xs font-bold text-[#b42318] hover:bg-[#ffe4df]"
                                                        >
                                                            Xoá hết
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ghi nhớ từ: gõ lại từng từ */}
                                        {room.gameName === 'word' && (
                                            <div className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-sm">
                                                <div className="border-b border-[#edf3ef] pb-3 mb-5">
                                                    <h3 className="text-base font-bold text-ink">
                                                        Nhập lại các từ vựng theo đúng thứ tự
                                                    </h3>
                                                    <p className="text-xs text-muted">
                                                        Gõ từ vào ô tương ứng, dùng phím Tab hoặc Enter để chuyển sang ô tiếp theo.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                                    {answers.map((answer, index) => {
                                                        const isCurrent = slot === index;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`flex items-center rounded-xl border-2 px-3 py-2.5 transition-all ${
                                                                    isCurrent
                                                                        ? 'border-brand-deep bg-[#EAF8EF] ring-2 ring-brand-deep/20 shadow-xs'
                                                                        : answer
                                                                        ? 'border-[#AFD5C0] bg-white'
                                                                        : 'border-[#d3dfd6] bg-[#fbfbf9]'
                                                                }`}
                                                                onClick={() => setSlot(index)}
                                                            >
                                                                <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-step text-xs font-bold text-muted">
                                                                    #{index + 1}
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={answer ?? ''}
                                                                    onFocus={() => setSlot(index)}
                                                                    onChange={(e) =>
                                                                        choose(index, e.target.value.trim() || null)
                                                                    }
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            setSlot((curr) =>
                                                                                Math.min(curr + 1, answers.length - 1)
                                                                            );
                                                                        }
                                                                    }}
                                                                    placeholder="Gõ từ..."
                                                                    className="w-full bg-transparent text-sm font-bold text-ink outline-none"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Gương mặt & Tên: gõ tên cho từng gương mặt */}
                                        {room.gameName === 'facename' && (
                                            <div className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-sm">
                                                <div className="border-b border-[#edf3ef] pb-3 mb-5">
                                                    <h3 className="text-base font-bold text-ink">
                                                        Nhớ lại tên cho từng gương mặt
                                                    </h3>
                                                    <p className="text-xs text-muted">
                                                        Gõ đúng tên của từng người theo thứ tự vị trí đã ghi nhớ.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                                    {answers.map((answer, index) => {
                                                        const imgUrl = round.recallOptions?.[index]?.imageUrl;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="flex flex-col items-center rounded-2xl border border-[#d3dfd6] bg-[#fbfbf9] p-3 text-center"
                                                            >
                                                                <span className="rounded-full bg-step px-2.5 py-0.5 text-xs font-bold text-muted mb-2">
                                                                    Người #{index + 1}
                                                                </span>
                                                                <FaceAvatar
                                                                    src={imgUrl ?? ''}
                                                                    alt={`Người ${index + 1}`}
                                                                    size="md"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={answer ?? ''}
                                                                    placeholder="Gõ tên..."
                                                                    onChange={(e) =>
                                                                        choose(index, e.target.value.trim() || null)
                                                                    }
                                                                    className="mt-2.5 w-full rounded-lg border border-[#d3dfd6] bg-white p-2 text-center text-xs font-bold text-ink focus:border-brand-deep focus:outline-none"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                <div className="room-recall__submit">
                                    <p>Đã điền {filledCount}/{totalItems}. Hết giờ sẽ tự nộp những gì bạn đã điền.</p>
                                    <button type="button" className="btn btn--brand" disabled={busy}
                                        onClick={() => void act(() => roomsApi.submit(code, answers))}>
                                        {busy ? 'Đang nộp...' : 'Nộp bài'}
                                    </button>
                                </div>
                            </section>
                        )}

                        {room.phase === 'waiting_for_other' && (
                            <section className="panel room-end" aria-live="polite">
                                <h2>Đã nộp bài</h2>
                                <p>Đang chờ {opponent?.username ?? 'đối thủ'} nộp bài hoặc hết giờ. Kết quả vòng sẽ hiện ngay sau đó.</p>
                            </section>
                        )}

                        {round?.result && (room.state === 'round_result' || room.state === 'completed') && (
                            <section className="panel room-result" aria-labelledby="result-title" data-outcome={outcomeFor(round.result.outcome)}>
                                <h2 id="result-title">
                                    {outcomeFor(round.result.outcome) === 'win' ? `Bạn thắng vòng ${room.roundIndex + 1}`
                                        : outcomeFor(round.result.outcome) === 'lose' ? `${opponent?.username ?? 'Đối thủ'} thắng vòng ${room.roundIndex + 1}`
                                        : `Vòng ${room.roundIndex + 1} hoà`}
                                </h2>
                                <div className="room-result__scores">
                                    {seats.map((player) => {
                                        const result = player && round.result?.players.find((item) => item._id === player._id);
                                        return player && result ? (
                                            <div key={player._id} data-win={round.result?.outcome === player._id}>
                                                <span>{player.isMe ? 'Bạn' : player.username}</span>
                                                <strong>{result.correct}/{result.total}</strong>
                                                <span>{seconds(result.usedMs)}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>

                                <div className="table-scroll">
                                    <table className="room-compare">
                                        <caption className="sr-only">Đối chiếu đáp án từng vị trí</caption>
                                        <thead>
                                            <tr>
                                                <th scope="col">Vị trí</th>
                                                <th scope="col">Đáp án</th>
                                                {seats.map((player) => player && <th key={player._id} scope="col">{player.isMe ? 'Bạn' : player.username}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {round.result.expected.map((expected, index) => (
                                                <tr key={index}>
                                                    <th scope="row">{index + 1}</th>
                                                    <td><RenderGameItem gameName={room.gameName} item={expected} size="sm" /></td>
                                                    {seats.map((player) => {
                                                        const result = player && round.result?.players.find((item) => item._id === player._id);
                                                        if (!player || !result) return null;
                                                        const answer = result.answers[index];
                                                        const right = result.marks[index];
                                                        return (
                                                            <td key={player._id} data-right={right}>
                                                                {answer ? <RenderGameItem gameName={room.gameName} item={answer} size="sm" /> : <span className="room-compare__blank">Bỏ trống</span>}
                                                                <span className="sr-only">{right ? 'đúng' : 'sai'}</span>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {room.state === 'round_result' && (room.isHost ? (
                                    <div className="room__actions">
                                        {room.roundIndex + 1 < room.roundCount ? (
                                            <>
                                                <button type="button" className="btn btn--brand" disabled={busy} onClick={() => void act(() => roomsApi.next(code))}>
                                                    Sang vòng {room.roundIndex + 2}
                                                </button>
                                                <button type="button" className="settings__action" disabled={busy}
                                                    onClick={() => window.confirm('Dừng trận giữa chừng? Trận dừng sớm không được tính điểm.') && void act(() => roomsApi.finish(code))}>
                                                    Dừng trận
                                                </button>
                                            </>
                                        ) : (
                                            <button type="button" className="btn btn--brand" disabled={busy} onClick={() => void act(() => roomsApi.finish(code))}>
                                                Xem kết quả trận
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="rooms__muted">Chờ chủ phòng chuyển vòng. Sau 2 phút không chuyển, trận tự kết thúc.</p>
                                ))}
                            </section>
                        )}

                        {room.state === 'completed' && (
                            <section className="panel room-end room-final" data-outcome={finalOutcome} aria-labelledby="final-title">
                                {finalOutcome === 'win' && <Confetti />}
                                <h2 id="final-title">
                                    {finalOutcome === 'win' ? 'Bạn thắng trận!' : finalOutcome === 'lose' ? `${opponent?.username ?? 'Đối thủ'} thắng trận` : 'Trận đấu hoà'}
                                </h2>
                                <p className="room-final__score">
                                    {me?.score.wins ?? 0} – {opponent?.score.wins ?? 0}
                                </p>
                                <p>
                                    {room.pointsEarned
                                        ? `Mỗi người nhận ${room.pointsEarned} điểm giao lưu.`
                                        : 'Trận này không có điểm giao lưu vì có vòng một người bỏ trống toàn bộ.'}
                                </p>
                                <div className="room__actions">
                                    <Link to="/rooms" className="btn btn--brand">Tạo trận mới</Link>
                                </div>
                            </section>
                        )}

                        {room.state === 'cancelled' && (
                            <section className="panel room-end">
                                <h2>Phòng đã đóng</h2>
                                <p>Trận bị huỷ hoặc dừng giữa chừng nên không tính điểm.</p>
                                <Link to="/rooms" className="btn btn--brand">Về trang Đấu trí nhớ</Link>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default RoomPage;
