import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Link2, LogOut, RotateCcw, Search, Shuffle, Trophy, Undo2, UserMinus, X } from 'lucide-react';
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
import { RoomSetupForm } from '../components/RoomSetupForm';
import { RoomDialog } from '../components/RoomDialog';
import { Mascot } from '@/components/ui/Mascot';
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

// Bạn luôn đứng đầu với màu mint, người khác màu xanh trời: màu nhận diện, không phải dữ liệu
type Side = 'me' | 'opp';
const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0');

const Avatar = ({ player, side }: { player: Pick<RoomPlayer, 'username' | 'avatarUrl'>; side: Side }) => (
    <span className="duel-avatar" data-side={side} aria-hidden="true">
        {player.avatarUrl ? <img src={player.avatarUrl} alt="" /> : player.username.charAt(0).toUpperCase()}
    </span>
);

// Người chơi đang ở bước nào của vòng hiện tại
const playerStatus = (room: RoomView, player: RoomPlayer) => {
    if (room.state === 'waiting') return player.ready ? 'Đã sẵn sàng' : 'Chưa sẵn sàng';
    if (player.left) return 'Đã rời trận';
    if (room.state === 'memorizing' || room.state === 'recalling') {
        if (player.submitted) return 'Đã nộp bài';
        return player.inRecall ? 'Đang trả lời' : 'Đang ghi nhớ';
    }
    if (room.state === 'cancelled') return 'Trận đã dừng';
    if (player.place) return `Hạng ${player.place} · ${player.score.points} điểm`;
    return `${player.score.points} điểm`;
};

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Giới thiệu ngắn về người chơi: tổng số trận đã đấu và số cúp
const PlayerStats = ({ player }: { player: RoomPlayer }) => (
    <span className="duel-lane__stats num" aria-label={`${player.stats.matches} trận đã đấu, ${player.stats.cups} cúp`}>
        {player.stats.matches} trận · {player.stats.cups} <Trophy size={12} aria-hidden="true" />
    </span>
);

// Một chỗ ngồi: người chơi, hoặc chỗ trống (đang tìm người thì kèm thời gian còn lại của 60 giây)
const Lane = ({ room, player, side, searchLeft, onKick }: {
    room: RoomView; player?: RoomPlayer; side: Side; searchLeft: number | null; onKick?: (player: RoomPlayer) => void;
}) => player ? (
    <div className="duel-lane" data-side={side} data-left={player.left}
        data-done={!player.left && (player.submitted || (room.state === 'waiting' && player.ready))}>
        <Avatar player={player} side={side} />
        <span className="duel-lane__who">
            <strong>{player.isMe ? 'Bạn' : player.username}{player.isHost && <small> · chủ phòng</small>}</strong>
            <span>{playerStatus(room, player)}</span>
            <PlayerStats player={player} />
        </span>
        {onKick && room.isHost && room.state === 'waiting' && !player.isMe && (
            <button type="button" className="duel-lane__kick" aria-label={`Mời ${player.username} ra khỏi phòng`} title="Mời ra" onClick={() => onKick(player)}>
                <UserMinus size={15} aria-hidden="true" />
            </button>
        )}
    </div>
) : (
    <div className="duel-lane duel-lane--empty" data-side={side} data-searching={Boolean(searchLeft)}>
        <span className="duel-avatar" data-side={side} aria-hidden="true">
            {searchLeft ? <Search size={18} /> : '?'}
        </span>
        <span className="duel-lane__who">
            <strong>{searchLeft ? 'Đang tìm người chơi' : 'Chỗ trống'}</strong>
            <span>{searchLeft ? <span className="num">Còn {clock(searchLeft)}</span> : 'Gửi mã phòng để mời người vào'}</span>
        </span>
    </div>
);

// Đồng hồ dạng vòng: phần còn lại của thời gian cho bước hiện tại
const TimerRing = ({ remaining, total }: { remaining: number; total: number }) => {
    const radius = 22;
    const length = 2 * Math.PI * radius;
    const ratio = total > 0 ? Math.min(1, remaining / total) : 0;
    return (
        <span className="duel-timer" data-low={remaining <= 5} role="timer" aria-label={`Còn ${remaining} giây`}>
            <svg viewBox="0 0 52 52" aria-hidden="true">
                <circle cx="26" cy="26" r={radius} className="duel-timer__track" />
                <circle cx="26" cy="26" r={radius} className="duel-timer__fill" strokeDasharray={length} strokeDashoffset={length * (1 - ratio)} />
            </svg>
            <strong className="num">{remaining}</strong>
        </span>
    );
};

export const RoomPage = () => {
    const { code = '' } = useParams();
    const navigate = useNavigate();
    const [changing, setChanging] = useState(false);
    const [room, setRoom] = useState<RoomView | null>(null);
    const [answers, setAnswers] = useState<(string | null)[]>([]);
    const [slot, setSlot] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fatal, setFatal] = useState<string | null>(null);
    const [connected, setConnected] = useState(true);
    const [tick, setTick] = useState(Date.now());
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);
    // Hộp thoại kết quả đã đóng cho vòng/trận nào: hỏi phòng định kỳ không bật lại hộp đã đóng
    const [dismissed, setDismissed] = useState('');

    const offset = useRef(0);
    const version = useRef(0);
    const lastRevision = useRef(-1);
    const lastPhase = useRef<{ index: number; phase: string } | null>(null);
    const textInputs = useRef<(HTMLInputElement | null)[]>([]);
    const autoSubmitted = useRef('');

    const draftKey = (value: RoomView) => `memio-room-draft:${value.code}:${value.meId}:${value.history.length}:${value.roundIndex}`;

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

    // Hỏi phòng mỗi 2 giây; lỗi thì giãn dần tới 10 giây. Trận đã xong thì hỏi thưa hơn, chờ trận mới.
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
                if (active && ownVersion === version.current) {
                    timer = setTimeout(poll, finished ? 4_000 : Math.min(10_000, 2_000 * 2 ** Math.min(failures, 3)));
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
        if (busy) return false;
        setBusy(true);
        setError(null);
        try {
            apply(await action());
            return true;
        } catch (cause) {
            setError(messageOf(cause, 'Thao tác chưa thành công.'));
            return false;
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
    const startsIn = room?.state === 'waiting' && room.startsAt
        ? Math.max(0, Math.ceil((new Date(room.startsAt).getTime() - tick - offset.current) / 1000)) : null;

    // Ô gõ chữ giữ nguyên dấu cách khi đang gõ; khoảng trắng thừa chỉ bị bỏ lúc nộp
    const submit = () => roomsApi.submit(code, answers.map((answer) => answer?.trim() || null));

    // Hết giờ trả lời mà chưa bấm nộp: tự nộp những gì đã điền (server còn nhận thêm vài giây)
    useEffect(() => {
        const roundKey = room ? `${room.history.length}:${room.roundIndex}` : '';
        if (!room || room.phase !== 'recalling' || remaining !== 0 || autoSubmitted.current === roundKey) return;
        autoSubmitted.current = roundKey;
        void act(submit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remaining, room?.phase, room?.roundIndex]);

    useEffect(() => {
        if (startsIn !== 0) return;
        roomsApi.get(code).then(apply).catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startsIn === 0]);

    // Enter trong ô gõ chữ: sang ô kế tiếp
    const focusNext = (index: number) => {
        const next = Math.min(index + 1, answers.length - 1);
        setSlot(next);
        textInputs.current[next]?.focus();
    };

    const choose = (index: number, value: string | null) =>
        setAnswers((current) => current.map((answer, i) => (i === index ? value : answer)));

    const chooseOption = (index: number, value: string) =>
        setAnswers((current) => current.map((answer, i) => (i === index ? value : answer === value ? null : answer)));

    // Bàn phím nhanh cho ghi nhớ và trả lời
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (document.querySelector('dialog[open]')) return;
            if (room?.phase === 'memorizing' && e.key === 'Enter') {
                e.preventDefault();
                void act(() => roomsApi.recall(code));
            } else if (room?.phase === 'recalling') {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    void act(submit);
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
    const filledCount = answers.filter((a) => a?.trim()).length;
    const me = room?.players.find((player) => player.isMe);
    const others = room?.players.filter((player) => !player.isMe) ?? [];
    const opponent = others[0];
    const host = room?.players.find((player) => player.isHost);
    // Bạn đứng đầu, rồi tới những người khác theo thứ tự vào phòng
    const ordered = [me, ...others].filter((player): player is RoomPlayer => Boolean(player));
    // Phòng 2 người giữ dải đối đầu hai bên; phòng đông hơn xếp thành lưới chỗ ngồi
    const duo = room?.capacity === 2;
    const finished = room?.state === 'completed' || room?.state === 'cancelled';

    const imageOptions = round?.recallOptions ?? [];
    const imageOptionMap = new Map(imageOptions.map((opt) => [opt.code, opt]));

    const sideOf = (id: string | null | undefined) => (id === room?.meId ? 'me' : 'opp');
    const nameOf = (id: string | null | undefined) =>
        id === room?.meId ? 'Bạn' : room?.players.find((player) => player._id === id)?.username ?? 'Người chơi';
    const outcomeFor = (outcome: string | null | undefined) =>
        outcome === 'draw' ? 'draw' : outcome === room?.meId ? 'win' : 'lose';
    const lastWinner = room?.history.at(-1)?.winner;
    const finalOutcome = outcomeFor(lastWinner);
    // Bảng xếp hạng trận vừa xong
    const ranking = [...(room?.players ?? [])].sort((a, b) => (a.place ?? 99) - (b.place ?? 99));
    // Tỉ số chung của các trận đã chơi trong phòng này
    const series = room && room.history.length > 0 ? {
        mine: room.history.filter((match) => match.winner === room.meId).length,
        theirs: room.history.filter((match) => match.winner !== 'draw' && match.winner !== room.meId).length,
    } : null;
    const myCups = me?.cups ?? 0;
    const cupLine = myCups > 0 ? `Bạn nhận ${signed(myCups)} cúp!`
        : myCups < 0 ? `Bạn bị trừ ${-myCups} cúp.`
        : ranking.every((player) => !player.cups) ? 'Trận này không ai được cộng hay trừ cúp.'
        : 'Số cúp của bạn giữ nguyên.';

    // Mỗi vòng một chấm: màu của người thắng vòng, xám khi hoà, viền đậm cho vòng đang chơi, viền nhạt khi chưa chơi
    const pipState = (index: number) => {
        const outcome = room?.roundOutcomes[index];
        if (outcome === undefined) return 'todo';
        if (outcome === null) return 'now';
        return outcome === 'draw' ? 'draw' : sideOf(outcome);
    };

    const resultKey = room ? `${room.history.length}:${room.roundIndex}:${room.state}` : '';
    const roundDialogOpen = Boolean(room?.state === 'round_result' && round?.result && dismissed !== resultKey);
    const matchDialogOpen = Boolean(room?.state === 'completed' && dismissed !== resultKey && !changing);

    // Chủ phòng bấm tìm người chơi: phòng mở cho ghép trận nhanh 60 giây (không gia hạn); hết giờ thì báo đã dừng tìm
    const searchLeft = room?.searchEndsAt
        ? Math.max(0, Math.ceil((new Date(room.searchEndsAt).getTime() - tick - offset.current) / 1000)) : null;
    const searching = Boolean(searchLeft);
    const searchEnded = searchLeft === 0;
    const setSearching = (on: boolean) => void act(() => roomsApi.setSearching(code, on));
    const kick = (player: RoomPlayer) => {
        if (window.confirm(`Mời ${player.username} ra khỏi phòng?`)) void act(() => roomsApi.kick(code, player._id));
    };

    const leave = async () => {
        setBusy(true);
        try {
            await roomsApi.leave(code);
            navigate('/rooms');
        } catch (cause) {
            setError(messageOf(cause, 'Chưa rời được phòng.'));
            setBusy(false);
        }
    };
    // Rời giữa trận: bị xếp cuối và trừ cúp, những người còn lại chơi tiếp
    const quit = () => {
        if (window.confirm('Rời trận giữa chừng? Bạn sẽ bị xếp cuối và trừ cúp, những người còn lại vẫn chơi tiếp.')) void leave();
    };
    const rematch = async (setup?: unknown) => {
        if (await act(() => roomsApi.rematch(code, setup))) setChanging(false);
    };

    // Nút thao tác của bước hiện tại, luôn ở dải trên cùng để không phải cuộn xuống
    const actions = (): ReactNode => {
        if (!room) return null;
        const quiet = 'duel-btn';
        const primary = 'duel-btn duel-btn--primary';
        if (room.state === 'waiting') {
            return (
                <>
                    <button type="button" className={quiet} disabled={busy}
                        onClick={() => window.confirm(room.isHost && room.players.length > 1 ? 'Rời phòng? Người vào sớm nhất sẽ làm chủ phòng.' : 'Rời phòng này?') && void leave()}>
                        <LogOut size={16} aria-hidden="true" /> Rời phòng
                    </button>
                    {me?.ready && <button type="button" className={quiet} disabled={busy} onClick={() => void act(() => roomsApi.ready(code, false))}>Huỷ sẵn sàng</button>}
                    {!me?.ready && (
                        <button type="button" className={primary} disabled={busy} onClick={() => void act(() => roomsApi.ready(code, true))}>Sẵn sàng</button>
                    )}
                </>
            );
        }
        if (room.state === 'memorizing' || room.state === 'recalling' || room.state === 'round_result') {
            return (
                <>
                    {me && !me.left && <button type="button" className={quiet} disabled={busy} onClick={quit}><LogOut size={14} aria-hidden="true" /> Rời trận</button>}
                    {room.phase === 'memorizing' && (
                        <button type="button" className={primary} disabled={busy} onClick={() => void act(() => roomsApi.recall(code))}>Nhớ xong, trả lời</button>
                    )}
                    {room.phase === 'recalling' && (
                        <button type="button" className={primary} disabled={busy} onClick={() => void act(submit)}>
                            Nộp bài <span className="num">{filledCount}/{totalItems}</span>
                        </button>
                    )}
                    {room.phase === 'round_result' && !roundDialogOpen && (
                        <button type="button" className={quiet} onClick={() => setDismissed('')}>Kết quả vòng</button>
                    )}
                    {room.phase === 'round_result' && room.isHost && (room.roundIndex + 1 < room.roundCount ? (
                        <button type="button" className={primary} disabled={busy} onClick={() => void act(() => roomsApi.next(code))}>Sang vòng {room.roundIndex + 2}</button>
                    ) : (
                        <button type="button" className={primary} disabled={busy} onClick={() => void act(() => roomsApi.finish(code))}>Kết thúc trận</button>
                    ))}
                </>
            );
        }
        // Trận đã xong hoặc đã dừng
        return (
            <>
                {room.state === 'completed' && !matchDialogOpen && (
                    <button type="button" className={quiet} onClick={() => setDismissed('')}>Kết quả trận</button>
                )}
                <button type="button" className={quiet} disabled={busy} onClick={() => void leave()}>
                    <LogOut size={16} aria-hidden="true" /> Rời phòng
                </button>
                {room.isHost && (
                    <>
                        <button type="button" className={quiet} onClick={() => setChanging(true)}><Shuffle size={16} aria-hidden="true" /> Đổi trò</button>
                        <button type="button" className={primary} disabled={busy} onClick={() => void rematch()}><RotateCcw size={16} aria-hidden="true" /> Chơi lại</button>
                    </>
                )}
            </>
        );
    };

    // Dòng nhắc người chơi đang phải làm gì, ngay dưới dải đối đầu
    const notReady = room?.players.filter((player) => !player.ready && !player.isMe).map((player) => player.username) ?? [];
    const hint = !room ? '' : room.state === 'waiting'
        ? startsIn !== null ? `Mọi người đã sẵn sàng. Trận bắt đầu sau ${startsIn} giây.`
            : room.players.length < 2 ? 'Gửi mã phòng cho bạn bè, hoặc tìm người chơi ngẫu nhiên. Từ 2 người trở lên là đấu được.'
            : !me?.ready ? 'Bấm Sẵn sàng. Mọi người trong phòng đều sẵn sàng thì trận tự bắt đầu sau 5 giây.'
            : `Bạn đã sẵn sàng. Đang chờ ${notReady.join(', ')} sẵn sàng.`
        : me?.left && !finished ? 'Bạn đã rời trận này. Những người còn lại vẫn đang chơi.'
        : room.phase === 'memorizing' ? 'Ghi nhớ thứ tự. Nhớ xong thì bấm trả lời, hoặc nhấn Enter.'
        : room.phase === 'recalling' ? 'Xếp lại theo đúng thứ tự. Hết giờ sẽ tự nộp những gì bạn đã điền.'
        : room.phase === 'waiting_for_other' ? 'Đã nộp. Đang chờ những người khác nộp bài hoặc hết giờ.'
        : room.state === 'round_result' ? (room.isHost ? 'Xem kết quả rồi chuyển vòng.' : `Chờ ${host?.username ?? 'chủ phòng'} chuyển vòng. Sau 2 phút sẽ tự kết thúc.`)
        : room.state === 'cancelled' ? (room.isHost ? 'Trận đã dừng vì quá lâu không chuyển vòng, không tính cúp. Mở trận mới bằng nút Chơi lại.' : host ? `Trận đã dừng. Chờ ${host.username} mở trận mới.` : 'Phòng đã đóng.')
        : room.isHost ? 'Trận đã xong. Chơi lại hoặc đổi trò với người đang ở trong phòng.'
        : host ? `Trận đã xong. Chờ ${host.username} mở trận mới.` : 'Chủ phòng đã rời phòng.';

    if (fatal) {
        return (
            <div className="min-h-svh">
                <Header />
                <main className="dash page-col rooms">
                    <section className="panel room-note">
                        <h1>Không vào được phòng {code}</h1>
                        <p>{fatal}</p>
                        <Link to="/rooms" className="duel-btn duel-btn--primary">Về trang Đấu trí nhớ</Link>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-svh">
            <Header />
            <main className="dash page-col rooms room">
                {/* Dải đối đầu: dính ở đầu trang, chứa tỉ số, đồng hồ và mọi nút thao tác */}
                <section className="duel" aria-label="Trận đấu">
                    <div className="duel__head">
                        <Link to="/rooms" className="duel__back" aria-label="Về trang Đấu trí nhớ">
                            <ArrowLeft size={18} aria-hidden="true" />
                        </Link>
                        <div className="duel__title">
                            <h1>Phòng <span className="num">{code}</span></h1>
                            {room && meta && (
                                <p>
                                    <span className="duel__game" style={{ '--game': meta.color } as React.CSSProperties}>{meta.label}</span>
                                    {' · '}{room.rules.gameLevel ? `Cấp ${room.rules.gameLevel}` : 'Tự chọn'} · {totalItems} {meta.unit}
                                    {!connected && <span className="duel__net"> · đang kết nối lại</span>}
                                </p>
                            )}
                        </div>
                        <div className="duel__actions">{actions()}</div>
                    </div>

                    {room && (() => {
                        const mid = (
                            <div className="duel__mid">
                                {startsIn !== null
                                    ? <TimerRing remaining={startsIn} total={5} />
                                    : (room.phase === 'memorizing' || room.phase === 'recalling') && remaining !== null
                                    ? <TimerRing remaining={remaining} total={phaseTotal} />
                                    : duo
                                    ? <span className="duel__vs num" aria-label={room.roundIndex >= 0 ? `Tỉ số vòng ${me?.score.points ?? 0} – ${opponent?.score.points ?? 0}` : undefined}>
                                        {room.roundIndex >= 0 ? `${me?.score.points ?? 0} – ${opponent?.score.points ?? 0}` : 'VS'}
                                    </span>
                                    : <span className="duel__vs duel__vs--multi num">
                                        {room.roundIndex >= 0 ? `${me?.score.points ?? 0} điểm` : `${room.players.length}/${room.capacity} người`}
                                    </span>}
                                <ol className="duel__pips" aria-label={`Vòng ${Math.max(1, room.roundIndex + 1)} trên ${room.roundCount}`}>
                                    {Array.from({ length: room.roundCount }, (_, index) => (
                                        <li key={index} data-state={pipState(index)} title={`Vòng ${index + 1}`} />
                                    ))}
                                </ol>
                            </div>
                        );
                        if (duo) {
                            return (
                                <div className="duel__board">
                                    <Lane room={room} player={me} side="me" searchLeft={null} />
                                    {mid}
                                    <Lane room={room} player={opponent} side="opp" searchLeft={searchLeft} onKick={kick} />
                                </div>
                            );
                        }
                        const empty = room.state === 'waiting' ? Math.max(0, room.capacity - room.players.length) : 0;
                        return (
                            <div className="duel__board" data-multi="true">
                                {mid}
                                <div className="duel__seats">
                                    {ordered.map((player) => (
                                        <Lane key={player._id} room={room} player={player} side={player.isMe ? 'me' : 'opp'} searchLeft={null} onKick={kick} />
                                    ))}
                                    {Array.from({ length: empty }, (_, index) => (
                                        <Lane key={`empty-${index}`} room={room} side="opp" searchLeft={searchLeft} />
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                    {room && <p className="duel__hint" aria-live="polite">{hint}</p>}
                </section>

                {error && <p role="alert" className="rooms__alert">{error}</p>}
                {!room && <p className="dash-note">Đang vào phòng...</p>}

                {room && room.state === 'waiting' && (
                    <section className="panel room-wait" aria-labelledby={room.players.length < room.capacity ? 'wait-title' : undefined}
                        aria-label={room.players.length < room.capacity ? undefined : 'Luật trận'} data-full={room.players.length >= room.capacity}>
                        {room.players.length < room.capacity && <div className="room-wait__code">
                            <div className="room-wait__title">
                                <h2 id="wait-title">Mã phòng</h2>
                                <Mascot className="room-wait__mascot" />
                            </div>
                            <p className="room-tiles num" aria-label={`Mã ${code.split('').join(' ')}`}>
                                {code.split('').map((char, index) => <span key={index}>{char}</span>)}
                            </p>
                            <div className="room-wait__copy">
                                <button type="button" className="duel-btn" onClick={() => copy('code')}>
                                    {copied === 'code' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                                    {copied === 'code' ? 'Đã sao chép' : 'Sao chép mã'}
                                </button>
                                <button type="button" className="duel-btn" onClick={() => copy('link')}>
                                    {copied === 'link' ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
                                    {copied === 'link' ? 'Đã sao chép' : 'Sao chép link'}
                                </button>
                            </div>
                            {room.isHost && (
                                <div className="room-wait__random" data-searching={searching}>
                                    {searching ? (
                                        <>
                                            <p aria-live="polite">Phòng đang mở cho người chơi {meta?.label} ngẫu nhiên · còn <span className="num">{clock(searchLeft ?? 0)}</span></p>
                                            <button type="button" className="duel-btn" disabled={busy} onClick={() => setSearching(false)}><X size={16} aria-hidden="true" /> Thôi tìm</button>
                                        </>
                                    ) : (
                                        <>
                                            <p aria-live="polite">
                                                {searchEnded
                                                    ? `Đã dừng tìm: hết 60 giây mà phòng chưa đủ người. ${room.players.length >= 2 ? 'Mọi người sẵn sàng là vào trận, hoặc tìm thêm lần nữa.' : 'Tìm thêm lần nữa hoặc gửi mã phòng cho bạn bè.'}`
                                                    : `Chưa có ai để mời? Mở phòng 60 giây cho người đang muốn chơi ${meta?.label ?? ''}.`}
                                            </p>
                                            <button type="button" className="duel-btn duel-btn--primary" disabled={busy} onClick={() => setSearching(true)}>
                                                <Search size={16} aria-hidden="true" /> {searchEnded ? 'Tìm lại' : 'Tìm người chơi'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>}
                        <div className="room-wait__rules">
                            <h2>Luật trận</h2>
                            <ul>
                                <li>Phòng tối đa {room.capacity} người. Từ 2 người trở lên, mọi người đều sẵn sàng thì trận tự bắt đầu sau 5 giây.</li>
                                <li>{room.roundCount} vòng {meta?.label}, {totalItems} {meta?.unit} mỗi vòng. Ghi nhớ trong {room.rules.memorizeLimitSec} giây rồi trả lời trong {room.rules.recallLimitSec} giây.</li>
                                <li>Mỗi vòng, nhiều vị trí đúng hơn thì xếp trên (bằng nhau thì ai nhanh hơn); xếp trên mỗi người được 1 điểm.</li>
                                <li>Về nhất +2 cúp, về bét bị trừ cúp. Rời trận giữa chừng bị xếp cuối.</li>
                            </ul>
                        </div>
                    </section>
                )}

                {room && room.phase === 'memorizing' && round?.items && (
                    <section className="play__table room-play" aria-label={`Ghi nhớ thứ tự ${totalItems} ${meta?.unit ?? ''}`}>
                        <ol className="room-play__items">
                            {round.items.map((item, index) => (
                                <li key={`${room.roundIndex}-${index}`} style={{ '--i': Math.min(index, 20) } as React.CSSProperties}>
                                    <span className="num">{index + 1}</span>
                                    <RenderGameItem gameName={room.gameName} item={item} size={totalItems <= 6 ? 'lg' : 'md'} />
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                {room && room.phase === 'recalling' && round && (
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
                                                <main className="play__table play__table--recall room-play">
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
                                                                    className="slot num text-2xl font-bold"
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
                                                <div className="panel room-keypad">
                                                    <div className="room-keypad__digits">
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
                                                                    className="duel-btn room-keypad__key num"
                                                                >
                                                                    {digit}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="room-keypad__tools">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                choose(slot, null);
                                                                setSlot((curr) => Math.max(0, curr - 1));
                                                            }}
                                                            className="duel-btn"
                                                        >
                                                            Xoá ô này
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setAnswers(Array(room.rules.totalItems).fill(null))
                                                            }
                                                            className="duel-btn"
                                                        >
                                                            Xoá hết
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ghi nhớ từ: gõ lại từng từ */}
                                        {room.gameName === 'word' && (
                                            <div className="panel room-type">
                                                <div className="room-type__head">
                                                    <h3>
                                                        Nhập lại các từ vựng theo đúng thứ tự
                                                    </h3>
                                                    <p>
                                                        Gõ từ vào ô tương ứng, dùng phím Tab hoặc Enter để chuyển sang ô tiếp theo.
                                                    </p>
                                                </div>

                                                <div className="room-type__grid">
                                                    {answers.map((answer, index) => {
                                                        const isCurrent = slot === index;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="room-type__slot"
                                                                data-current={isCurrent}
                                                                data-filled={Boolean(answer?.trim())}
                                                                onClick={() => setSlot(index)}
                                                            >
                                                                <span className="room-type__no num">
                                                                    {index + 1}
                                                                </span>
                                                                <input
                                                                    ref={(element) => { textInputs.current[index] = element; }}
                                                                    type="text"
                                                                    value={answer ?? ''}
                                                                    aria-label={`Từ thứ ${index + 1}`}
                                                                    enterKeyHint={index === answers.length - 1 ? 'done' : 'next'}
                                                                    onFocus={() => setSlot(index)}
                                                                    onChange={(e) => choose(index, e.target.value || null)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                                                            e.preventDefault();
                                                                            focusNext(index);
                                                                        }
                                                                    }}
                                                                    placeholder="Gõ từ..."
                                                                    className="room-type__input"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Gương mặt & Tên: gõ tên cho từng gương mặt */}
                                        {room.gameName === 'facename' && (
                                            <div className="panel room-type">
                                                <div className="room-type__head">
                                                    <h3>
                                                        Nhớ lại tên cho từng gương mặt
                                                    </h3>
                                                    <p>
                                                        Gõ đúng tên của từng người theo thứ tự vị trí đã ghi nhớ.
                                                    </p>
                                                </div>

                                                <div className="room-type__grid room-type__grid--faces">
                                                    {answers.map((answer, index) => {
                                                        const imgUrl = round.recallOptions?.[index]?.imageUrl;
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="room-type__face"
                                                            >
                                                                <span className="room-type__no num">
                                                                    Người {index + 1}
                                                                </span>
                                                                <FaceAvatar
                                                                    src={imgUrl ?? ''}
                                                                    alt={`Người ${index + 1}`}
                                                                    size="md"
                                                                />
                                                                <input
                                                                    ref={(element) => { textInputs.current[index] = element; }}
                                                                    type="text"
                                                                    value={answer ?? ''}
                                                                    placeholder="Gõ tên..."
                                                                    aria-label={`Tên của người thứ ${index + 1}`}
                                                                    enterKeyHint={index === answers.length - 1 ? 'done' : 'next'}
                                                                    onFocus={() => setSlot(index)}
                                                                    onChange={(e) => choose(index, e.target.value || null)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                                                            e.preventDefault();
                                                                            focusNext(index);
                                                                        }
                                                                    }}
                                                                    className="room-type__input room-type__input--boxed"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                    </section>
                )}

                {room && room.phase === 'waiting_for_other' && (
                    <section className="panel room-note" aria-live="polite">
                        <h2>{me?.left ? 'Bạn đã rời trận' : 'Đã nộp bài'}</h2>
                        <p>{me?.left ? 'Những người còn lại vẫn đang chơi.' : 'Kết quả vòng hiện ra ngay khi mọi người nộp bài hoặc hết giờ.'}</p>
                    </section>
                )}

                {room && round?.result && (room.state === 'round_result' || room.state === 'completed') && (
                    <section className="panel room-compare-panel" aria-labelledby="compare-title">
                        <h2 id="compare-title">Đối chiếu vòng {room.roundIndex + 1}</h2>
                        <div className="table-scroll">
                            <table className="room-compare">
                                <thead>
                                    <tr>
                                        <th scope="col">Vị trí</th>
                                        <th scope="col">Đáp án</th>
                                        {ordered.map((player) => round.result?.players.some((item) => item._id === player._id) && (
                                            <th key={player._id} scope="col" data-side={player.isMe ? 'me' : 'opp'}>{player.isMe ? 'Bạn' : player.username}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {round.result.expected.map((expected, index) => (
                                        <tr key={index}>
                                            <th scope="row" className="num">{index + 1}</th>
                                            <td><RenderGameItem gameName={room.gameName} item={expected} size="sm" /></td>
                                            {ordered.map((player) => {
                                                const result = round.result?.players.find((item) => item._id === player._id);
                                                if (!result) return null;
                                                const answer = result.answers[index];
                                                const right = result.marks[index];
                                                return (
                                                    <td key={player._id} data-right={right}>
                                                        <span className="room-compare__cell">
                                                            {answer ? <RenderGameItem gameName={room.gameName} item={answer} size="sm" /> : <span className="room-compare__blank">Bỏ trống</span>}
                                                            {right ? <Check size={16} aria-label="đúng" /> : <X size={16} aria-label="sai" />}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {room && room.state === 'cancelled' && (
                    <section className="panel room-note">
                        <h2>Trận đã dừng</h2>
                        <p>Trận dừng giữa chừng nên không tính cúp.</p>
                    </section>
                )}

                {/* Kết quả vòng: hộp thoại giữa màn hình */}
                {room && round?.result && (
                    <RoomDialog open={roundDialogOpen} labelledBy="round-result-title" onClose={() => setDismissed(resultKey)}>
                        <div className="result" data-outcome={outcomeFor(round.result.outcome)}>
                            <Mascot className="result__mascot" celebrating={outcomeFor(round.result.outcome) === 'win'} />
                            <p className="result__over">Vòng {room.roundIndex + 1}/{room.roundCount}</p>
                            <h2 id="round-result-title">
                                {round.result.outcome === 'draw' ? 'Vòng này hoà' : `${nameOf(round.result.outcome)} thắng vòng này`}
                            </h2>
                            {(() => {
                                // Phòng đông: xếp theo kết quả vòng; phòng 2 người giữ bạn bên trái
                                const rows = round.result.players
                                    .map((result) => ({ result, player: room.players.find((item) => item._id === result._id) }))
                                    .filter((row): row is { result: typeof row.result; player: RoomPlayer } => Boolean(row.player))
                                    .sort((a, b) => duo ? Number(b.player.isMe) - Number(a.player.isMe) : b.result.correct - a.result.correct || a.result.usedMs - b.result.usedMs);
                                return (
                                    <div className="result__duel" style={{ '--cols': Math.min(rows.length, 3) } as React.CSSProperties}>
                                        {rows.map(({ player, result }) => (
                                            <div key={player._id} className="result__side" data-side={player.isMe ? 'me' : 'opp'} data-win={round.result?.outcome === player._id}>
                                                <Avatar player={player} side={player.isMe ? 'me' : 'opp'} />
                                                <span className="result__name">{player.isMe ? 'Bạn' : player.username}</span>
                                                <strong className="num">{result.correct}<small>/{result.total}</small></strong>
                                                <span className="result__time num">{seconds(result.usedMs)}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                            <p className="result__tally">
                                {duo ? <>Tỉ số vòng <strong className="num">{me?.score.points ?? 0} – {opponent?.score.points ?? 0}</strong></>
                                    : <>Bạn đang có <strong className="num">{me?.score.points ?? 0}</strong> điểm</>}
                            </p>
                            <div className="result__actions">
                                <button type="button" className="duel-btn" onClick={() => setDismissed(resultKey)}>Xem đối chiếu</button>
                                {room.isHost ? (room.roundIndex + 1 < room.roundCount ? (
                                    <button type="button" data-autofocus className="duel-btn duel-btn--primary" disabled={busy} onClick={() => void act(() => roomsApi.next(code))}>Sang vòng {room.roundIndex + 2}</button>
                                ) : (
                                    <button type="button" data-autofocus className="duel-btn duel-btn--primary" disabled={busy} onClick={() => void act(() => roomsApi.finish(code))}>Kết thúc trận</button>
                                )) : (
                                    <span className="result__wait">Chờ {host?.username ?? 'chủ phòng'} chuyển vòng</span>
                                )}
                            </div>
                        </div>
                    </RoomDialog>
                )}

                {/* Kết quả trận: hộp thoại giữa màn hình, kèm cúp và nút chơi lại */}
                {room && room.state === 'completed' && (
                    <RoomDialog open={matchDialogOpen} labelledBy="match-result-title" onClose={() => setDismissed(resultKey)}>
                        <div className="result result--match" data-outcome={finalOutcome}>
                            {finalOutcome === 'win' && <Confetti />}
                            <Mascot className="result__mascot" celebrating={finalOutcome === 'win'} />
                            <p className="result__over">Trận thứ {room.history.length}</p>
                            <h2 id="match-result-title">
                                {finalOutcome === 'win' ? 'Bạn về nhất!'
                                    : finalOutcome === 'draw' ? (duo ? 'Trận đấu hoà' : 'Đồng hạng nhất')
                                    : duo ? `${nameOf(lastWinner)} thắng trận`
                                    : `Bạn về hạng ${me?.place ?? ranking.length}/${ranking.length}`}
                            </h2>
                            {duo && <p className="result__score num">{me?.score.points ?? 0} – {opponent?.score.points ?? 0}</p>}
                            <p className="result__cup" data-mine={myCups > 0}>
                                {myCups > 0 && <Trophy size={20} aria-hidden="true" />} {cupLine}
                            </p>
                            <ol className="result__rank">
                                {ranking.map((player) => (
                                    <li key={player._id} data-me={player.isMe}>
                                        <span className="result__place num">{player.place}</span>
                                        <span className="result__who">{player.isMe ? 'Bạn' : player.username}{player.left && <small> · đã rời</small>}</span>
                                        <span className="num">{player.score.points} điểm</span>
                                        <span className="result__cups num" data-sign={Math.sign(player.cups ?? 0)}>
                                            {signed(player.cups ?? 0)} <Trophy size={13} aria-hidden="true" />
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            {duo && series && room.history.length > 1 && opponent && (
                                <p className="result__tally">Các trận với {opponent.username}: <strong className="num">{series.mine} – {series.theirs}</strong></p>
                            )}
                            <div className="result__actions">
                                <button type="button" className="duel-btn" onClick={() => setDismissed(resultKey)}>Xem đối chiếu</button>
                                {room.isHost ? (
                                    <>
                                        <button type="button" className="duel-btn" onClick={() => setChanging(true)}><Shuffle size={16} aria-hidden="true" /> Đổi trò</button>
                                        <button type="button" data-autofocus className="duel-btn duel-btn--primary" disabled={busy} onClick={() => void rematch()}><RotateCcw size={16} aria-hidden="true" /> Chơi lại</button>
                                    </>
                                ) : (
                                    <span className="result__wait">{host ? `Chờ ${host.username} mở trận mới` : 'Chủ phòng đã rời phòng'}</span>
                                )}
                            </div>
                        </div>
                    </RoomDialog>
                )}

                {/* Đổi trò cho trận mới: chủ phòng chọn trong hộp thoại */}
                {room?.isHost && finished && (
                    <RoomDialog open={changing} labelledBy="change-title" onClose={() => setChanging(false)} wide>
                        <RoomSetupForm title="Chọn trò cho trận mới" titleId="change-title" submitLabel="Mở trận mới" initialGame={room.gameName} busy={busy}
                            onSubmit={(setup) => void rematch(setup)} onError={setError} />
                    </RoomDialog>
                )}
            </main>
        </div>
    );
};

export default RoomPage;
