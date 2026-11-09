import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Flame,
    Info,
    Loader2,
    Swords,
    Timer,
    Trophy,
    Undo2,
    Users,
    XCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { roomsApi, type RoomItem, type RoomView } from '../api/rooms.api';
import mascotSvg from '@/assets/memio/mascot.svg';
import { PlayingCard } from '@/features/cards-game/components/PlayingCard';
import type { Card, Rank, Suit } from '@/features/cards-game/types/types';
import { cardFromCode, cardToCode } from '@/features/cards-game/utils/cardUtils';
import { cardLabel, SUIT_LABELS, SUIT_SYMBOLS } from '@/features/cards-game/utils/cardLabels';
import { PhotoTile } from '@/features/images-game/components/PhotoTile';
import { WordCard } from '@/features/words-game/components/WordCard';
import { FaceAvatar } from '@/features/facename-game/components/FaceAvatar';
import { RecallBoard } from '@/features/shared-game/components/RecallBoard';
import { Confetti } from '@/features/shared-game/components/Confetti';
import '@/features/shared-game/game.css';
import '@/styles/app-screen.css';

const gameMeta: Record<string, { label: string; icon: string; color: string }> = {
    card: { label: 'Thẻ bài', icon: '🃏', color: '#2e7d32' },
    image: { label: 'Hình ảnh', icon: '🖼️', color: '#2a78d6' },
    number: { label: 'Ghi nhớ số', icon: '🔢', color: '#987000' },
    facename: { label: 'Gương mặt & Tên', icon: '👤', color: '#a04465' },
    word: { label: 'Ghi nhớ từ', icon: '📝', color: '#7c3aed' },
};

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

/**
 * Hiển thị mục trò chơi theo đúng phong cách và linh hồn của role con:
 * - card: PlayingCard chuẩn (đỏ/đen, cơ, rô, tép, bích)
 * - image: PhotoTile với khung ảnh tinh tế
 * - number: Khối số to, nổi bật
 * - word: WordCard sinh động
 * - facename: FaceAvatar tròn trịa kèm tên
 */
const RenderGameItem = ({
    gameName,
    item,
    size = 'md',
    showLabel = true,
}: {
    gameName: string;
    item: RoomItem | { code: string; label?: string; imageUrl?: string };
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}): ReactNode => {
    if (gameName === 'card') {
        const card = tryCardFromCode(item.code);
        if (card) {
            return <PlayingCard card={card} size={size} />;
        }
        return <span className="pcard pcard--back" data-size={size} />;
    }

    if (gameName === 'image') {
        return (
            <PhotoTile
                image={{ id: item.code, imageUrl: item.imageUrl ?? '' }}
                size={size}
                label={item.label ?? item.code}
            />
        );
    }

    if (gameName === 'number') {
        const sizeClasses = {
            xs: 'h-8 w-8 text-sm font-extrabold',
            sm: 'h-10 w-10 text-base font-extrabold',
            md: 'h-14 w-14 text-2xl font-extrabold',
            lg: 'h-20 w-20 text-3xl font-extrabold sm:h-24 sm:w-24 sm:text-4xl',
        }[size];
        return (
            <div
                className={`flex items-center justify-center rounded-2xl border-2 border-[#d3dfd6] bg-white text-ink shadow-md font-mono ${sizeClasses}`}
            >
                {item.code}
            </div>
        );
    }

    if (gameName === 'word') {
        return <WordCard word={item.label || item.code} size={size} />;
    }

    if (gameName === 'facename') {
        return (
            <div className="flex flex-col items-center">
                <FaceAvatar
                    src={item.imageUrl ?? ''}
                    alt={item.label ?? ''}
                    size={size === 'lg' ? 'lg' : size === 'xs' ? 'sm' : 'md'}
                />
                {showLabel && item.label && (
                    <span className="mt-1.5 max-w-28 truncate text-xs font-bold text-ink bg-white/90 px-2 py-0.5 rounded-md shadow-xs">
                        {item.label}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#d3dfd6] bg-white p-3">
            <span className="font-bold text-ink">{item.label ?? item.code}</span>
        </div>
    );
};

export const FamilyRoomPage = () => {
    const { code = '' } = useParams();
    const [room, setRoom] = useState<RoomView | null>(null);
    const [answers, setAnswers] = useState<(string | null)[]>([]);
    const [slot, setSlot] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(true);
    const [tick, setTick] = useState(Date.now());
    const [copied, setCopied] = useState(false);

    const offset = useRef(0);
    const version = useRef(0);
    const lastRevision = useRef(-1);
    const lastPhase = useRef<{ index: number; phase: string } | null>(null);

    const draftKey = (value: RoomView) => `memio-room-draft:${value.code}:${value.role}:${value.roundIndex}`;

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
                    if (
                        Array.isArray(saved) &&
                        saved.length === value.rules.totalItems &&
                        saved.every((item) => item === null || typeof item === 'string')
                    ) {
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

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout> | null = null;
        let failures = 0;
        const ownVersion = ++version.current;
        lastRevision.current = -1;
        lastPhase.current = null;

        const poll = async () => {
            try {
                const value = await roomsApi.get(code);
                if (!active || ownVersion !== version.current) return;
                apply(value);
                failures = 0;
            } catch (cause) {
                if (!active || ownVersion !== version.current) return;
                failures += 1;
                setConnected(false);
                setError((cause as { message?: string }).message ?? 'Không đồng bộ được phòng.');
            } finally {
                if (active && ownVersion === version.current) {
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
            setError((cause as { message?: string }).message ?? 'Thao tác thất bại.');
        } finally {
            setBusy(false);
        }
    };

    const handleCopyCode = () => {
        void navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const round = room?.round;
    const deadline = room?.phase === 'memorizing' ? round?.memorizeEndsAt : round?.recallEndsAt;
    const remaining = deadline
        ? Math.max(0, Math.ceil((new Date(deadline).getTime() - tick - offset.current) / 1000))
        : null;

    const choose = (index: number, value: string | null) =>
        setAnswers((current) => current.map((answer, i) => (i === index ? value : answer)));

    const chooseOption = (index: number, value: string) =>
        setAnswers((current) =>
            current.map((answer, i) => (i === index ? value : answer === value ? null : answer))
        );

    // Bàn phím nhanh cho ghi nhớ và trả lời
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
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
    }, [room?.phase, room?.gameName, answers, slot, code]);

    const score = room?.scores;
    const gameInfo = room ? gameMeta[room.gameName] ?? { label: room.gameName, icon: '🎮', color: '#2e7d32' } : null;
    const totalItems = room?.rules.totalItems ?? 0;
    const filledCount = answers.filter((a) => a !== null && a !== '').length;

    // Tìm ảnh cho phần hình ảnh
    const imageOptions = round?.recallOptions ?? [];
    const imageOptionMap = new Map(imageOptions.map((opt) => [opt.code, opt]));
    const findImageUrl = (codeVal: string | null) => {
        if (!codeVal) return undefined;
        return (
            imageOptionMap.get(codeVal)?.imageUrl ??
            round?.items?.find((i) => i.code === codeVal)?.imageUrl ??
            round?.result?.expected.find((i) => i.code === codeVal)?.imageUrl
        );
    };

    return (
        <div className="min-h-svh bg-wall">
            <Header />

            <main className="page-col py-8 max-w-5xl">
                {/* Header trạng thái phòng */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d3dfd6] pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            to={room?.role === 'parent' ? '/parent' : '/'}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d3dfd6] bg-white text-ink transition-colors hover:bg-step"
                            title="Rời khỏi phòng"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xl font-extrabold tracking-wider text-ink sm:text-2xl">
                                    Phòng {code}
                                </span>
                                {gameInfo && (
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                                        style={{ backgroundColor: `${gameInfo.color}15`, color: gameInfo.color }}
                                    >
                                        {gameInfo.icon} {gameInfo.label}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted">
                                Vai trò của bạn:{' '}
                                <strong className="text-ink font-semibold">
                                    {room?.role === 'parent' ? 'Ba mẹ (Chủ phòng)' : 'Con (Người tham gia)'}
                                </strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={`flex items-center gap-1.5 text-xs font-semibold ${
                                connected ? 'text-[#1F6B2A]' : 'text-[#b42318]'
                            }`}
                        >
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                    connected ? 'bg-[#1F6B2A] animate-pulse' : 'bg-[#b42318]'
                                }`}
                            />
                            {connected ? 'Đã kết nối' : 'Đang thử kết nối lại...'}
                        </span>

                        <button
                            type="button"
                            onClick={handleCopyCode}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d3dfd6] bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-step"
                        >
                            {copied ? <Check size={14} className="text-[#1F6B2A]" /> : <Copy size={14} />}
                            {copied ? 'Đã chép mã' : 'Sao chép mã'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div role="alert" className="mb-6 rounded-xl border border-[#ffd2cc] bg-[#ffe4df] p-4 text-sm text-[#8f1d14]">
                        {error}
                    </div>
                )}

                {/* NỘI DUNG CHÍNH PHÒNG THI ĐẤU */}
                {room && (
                    <div className="space-y-6">
                        {/* 1. GIAI ĐOẠN ĐANG CHỜ (WAITING ROOM) */}
                        {room.state === 'waiting' && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                                {/* Thẻ lời mời & Mã phòng */}
                                <div className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-xs md:col-span-7">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF8EF] text-[#1F6B2A]">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-ink">Phòng chờ thi đấu</h2>
                                            <p className="text-xs text-muted">
                                                Cả hai cùng xác nhận sẵn sàng trước khi bắt đầu
                                            </p>
                                        </div>
                                    </div>

                                    {room.role === 'parent' && (
                                        <div className="rounded-xl border border-dashed border-brand-deep/30 bg-[#EAF8EF]/40 p-4 text-center my-4">
                                            <p className="text-xs font-semibold text-[#1F6B2A] mb-1">
                                                Đọc mã này cho con để cùng vào phòng:
                                            </p>
                                            <div className="font-mono text-3xl font-extrabold tracking-widest text-brand-deep">
                                                {room.code}
                                            </div>
                                            <p className="text-[11px] text-muted mt-1">
                                                Con mở mục &ldquo;Chơi cùng ba mẹ&rdquo; và nhập mã trên.
                                            </p>
                                        </div>
                                    )}

                                    {/* Danh sách 2 đấu thủ */}
                                    <div className="grid grid-cols-2 gap-3 my-5">
                                        {/* Ba mẹ */}
                                        <div className="rounded-xl border border-[#d3dfd6] bg-[#fbfbf9] p-3 text-center">
                                            <span className="text-xs font-bold text-muted uppercase">Ba mẹ (Chủ phòng)</span>
                                            <p className="mt-2 font-bold text-ink">
                                                {room.parentReady ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-[#1F6B2A]">
                                                        <CheckCircle2 size={16} /> Đã sẵn sàng
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                                                        <Clock size={16} /> Chưa sẵn sàng
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Con */}
                                        <div className="rounded-xl border border-[#d3dfd6] bg-[#fbfbf9] p-3 text-center">
                                            <span className="text-xs font-bold text-muted uppercase">Con</span>
                                            <p className="mt-2 font-bold text-ink">
                                                {room.childJoined ? (
                                                    room.childReady ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-[#1F6B2A]">
                                                            <CheckCircle2 size={16} /> Đã sẵn sàng
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-sky-700">
                                                            <Clock size={16} /> Đã vào, chuẩn bị...
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                                                        <Loader2 size={16} className="animate-spin text-muted" /> Đang chờ vào...
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hành động của người chơi */}
                                    <div className="space-y-3 pt-2">
                                        {room.role === 'child' && !room.childJoined && (
                                            <button
                                                type="button"
                                                className="btn btn--brand h-11 w-full text-sm font-bold"
                                                disabled={busy}
                                                onClick={() => void act(() => roomsApi.join(code))}
                                            >
                                                Tham gia phòng
                                            </button>
                                        )}

                                        {((room.role === 'parent' && !room.parentReady) ||
                                            (room.role === 'child' && room.childJoined && !room.childReady)) && (
                                            <button
                                                type="button"
                                                className="btn btn--brand h-11 w-full text-sm font-bold"
                                                disabled={busy}
                                                onClick={() => void act(() => roomsApi.ready(code))}
                                            >
                                                <CheckCircle2 size={18} className="mr-1.5" />
                                                Tôi đã sẵn sàng!
                                            </button>
                                        )}

                                        {room.role === 'parent' && room.parentReady && room.childReady && (
                                            <button
                                                type="button"
                                                className="btn btn--brand h-12 w-full text-base font-bold shadow-md hover:shadow-lg"
                                                disabled={busy}
                                                onClick={() => void act(() => roomsApi.start(code))}
                                            >
                                                <Swords size={20} className="mr-2" />
                                                Bắt đầu vòng thi đấu 1
                                            </button>
                                        )}

                                        {room.role === 'parent' && (
                                            <button
                                                type="button"
                                                className="btn btn--quiet h-10 w-full text-xs"
                                                disabled={busy}
                                                onClick={() => void act(() => roomsApi.finish(code))}
                                            >
                                                Kết thúc sớm
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Thẻ Luật thi đấu & Gợi ý bên phải */}
                                <div className="space-y-4 md:col-span-5">
                                    <div className="rounded-2xl border border-[#d3dfd6] bg-white p-5 shadow-xs">
                                        <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-3">
                                            <Info size={16} className="text-[#2e7d32]" />
                                            Quy tắc thi đấu
                                        </h3>
                                        <ul className="space-y-2 text-xs text-muted">
                                            <li className="flex items-start gap-2">
                                                <span className="text-brand-deep">•</span>
                                                Mỗi ván thi đấu gồm {room.roundCount} vòng liên tiếp.
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-brand-deep">•</span>
                                                Giai đoạn 1: Cùng ghi nhớ thứ tự vị trí các mục.
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-brand-deep">•</span>
                                                Giai đoạn 2: Trả lời lại đúng thứ tự đã nhớ.
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-brand-deep">•</span>
                                                Ai nhớ đúng nhiều hơn và nộp nhanh hơn sẽ thắng vòng đó!
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="rounded-2xl border border-[#d3dfd6] bg-[#EAF8EF] p-5 shadow-xs flex items-center gap-3.5">
                                        <img src={mascotSvg} alt="" className="h-12 w-12 shrink-0" />
                                        <p className="text-xs text-[#1F6B2A] font-semibold leading-relaxed">
                                            Hoàn thành đủ {room.roundCount} vòng, ba mẹ sẽ nhận ngay 10 điểm đồng hành!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. GIAI ĐOẠN ĐANG THI ĐẤU (ROUND ACTIVE) */}
                        {round && (
                            <div className="space-y-6">
                                {/* Thanh trạng thái vòng & Đồng hồ đếm ngược */}
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d3dfd6] bg-white p-4 shadow-xs">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted">
                                            Trận đấu gia đình · {gameInfo?.icon} {gameInfo?.label}
                                        </span>
                                        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
                                            Vòng {room.roundIndex + 1} / {room.roundCount}
                                            {room.rules.gameLevel && (
                                                <span className="ml-2 text-sm font-semibold text-brand-deep">
                                                    (Cấp {room.rules.gameLevel})
                                                </span>
                                            )}
                                        </h2>
                                    </div>

                                    {(room.phase === 'memorizing' || room.phase === 'recalling') && (
                                        <div className="flex items-center gap-3">
                                            {room.phase === 'recalling' && (
                                                <span className="rounded-full bg-[#EAF8EF] px-3 py-1 text-xs font-bold text-[#1F6B2A]">
                                                    Đã điền {filledCount} / {totalItems}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2 rounded-xl border border-brand-deep/30 bg-[#EAF8EF] px-4 py-2 text-brand-deep shadow-xs">
                                                <Timer size={20} className="animate-spin text-brand-deep" />
                                                <span className="font-mono text-xl font-extrabold tabular-nums">
                                                    {remaining ?? 0}s
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PHA 1: GHI NHỚ (MEMORIZING) - BÀN CHƠI XANH CHUẨN CỦA CON */}
                                {room.phase === 'memorizing' && (
                                    <div className="space-y-4">
                                        <main className="play__table w-full shadow-lg">
                                            <div className="w-full text-center mb-1">
                                                <p className="text-base font-extrabold text-white sm:text-lg">
                                                    Hãy ghi nhớ vị trí và thứ tự các mục dưới đây!
                                                </p>
                                                <p className="text-xs text-white/85 mt-1 max-w-lg mx-auto">
                                                    Ai nhớ xong trước có thể bấm trả lời ngay mà không ảnh hưởng tới đối thủ.
                                                </p>
                                            </div>

                                            {/* Bàn trải các lá bài / hình ảnh / số / từ */}
                                            <div className="flex flex-wrap items-center justify-center gap-4 py-4 w-full">
                                                {round.items?.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
                                                    >
                                                        <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-extrabold text-white shadow-xs">
                                                            #{index + 1}
                                                        </span>
                                                        <RenderGameItem
                                                            gameName={room.gameName}
                                                            item={item}
                                                            size={totalItems <= 6 ? 'lg' : 'md'}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-2 text-center w-full">
                                                <button
                                                    type="button"
                                                    className="btn btn--sun h-12 px-8 text-base font-bold shadow-md hover:shadow-lg transition-transform active:scale-95"
                                                    disabled={busy}
                                                    onClick={() => void act(() => roomsApi.recall(code))}
                                                >
                                                    {busy ? 'Đang chuyển bước...' : 'Tôi đã nhớ xong, bắt đầu trả lời! (Enter)'}
                                                </button>
                                            </div>
                                        </main>
                                    </div>
                                )}

                                {/* PHA 2: TRẢ LỜI (RECALLING) - DÙNG RECALL BOARD & KEYPAD CHUẨN */}
                                {room.phase === 'recalling' && (
                                    <div className="space-y-5">
                                        {/* TRƯỜNG HỢP 1: THẺ BÀI (Dùng RecallBoard 52 lá chuẩn) */}
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

                                        {/* TRƯỜNG HỢP 2: HÌNH ẢNH (Dùng RecallBoard bộ hình xáo trộn) */}
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

                                        {/* TRƯỜNG HỢP 3: GHI NHỚ SỐ */}
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

                                        {/* TRƯỜNG HỢP 4: GHI NHỚ TỪ */}
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

                                        {/* TRƯỜNG HỢP 5: GƯƠNG MẶT & TÊN */}
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

                                        {/* Nút nộp bài */}
                                        <div className="pt-2 text-center">
                                            <button
                                                type="button"
                                                className="btn btn--brand h-12 px-10 text-base font-bold shadow-md hover:shadow-lg transition-transform active:scale-95"
                                                disabled={busy}
                                                onClick={() => void act(() => roomsApi.submit(code, answers))}
                                            >
                                                {busy ? 'Đang chấm điểm...' : 'Nộp bài thi đấu vòng này (Enter)'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* PHA 3: ĐANG CHỜ NGƯỜI CÒN LẠI (WAITING_FOR_OTHER) */}
                                {room.phase === 'waiting_for_other' && (
                                    <div className="rounded-2xl border border-[#d3dfd6] bg-white p-10 text-center shadow-xs space-y-4">
                                        <div className="flex justify-center">
                                            <Loader2 size={40} className="animate-spin text-brand-deep" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-ink">
                                            Đã nộp bài thành công!
                                        </h3>
                                        <p className="text-xs text-muted max-w-md mx-auto">
                                            Đang chờ người chơi còn lại nộp bài hoặc khi hết giờ thi đấu. Bảng so tài sẽ tự động mở ngay sau đó!
                                        </p>
                                    </div>
                                )}

                                {/* PHA 4: KẾT QUẢ VÒNG (ROUND_RESULT) - SO TÀI ĐỐI CHIẾU TỪNG VỊ TRÍ */}
                                {round.result && (
                                    <div className="space-y-6">
                                        {/* Banner kết quả vòng */}
                                        <div
                                            className={`rounded-2xl border p-6 text-center shadow-xs ${
                                                round.result.outcome === 'draw'
                                                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                                                    : round.result.outcome === room.role
                                                    ? 'border-[#AFD5C0] bg-[#EAF8EF] text-[#1F6B2A]'
                                                    : 'border-[#d3dfd6] bg-[#fbfbf9] text-ink'
                                            }`}
                                        >
                                            <div className="flex justify-center mb-2">
                                                {round.result.outcome === 'draw' ? (
                                                    <span className="text-4xl">🤝</span>
                                                ) : round.result.outcome === room.role ? (
                                                    <Trophy size={40} className="text-[#1F6B2A]" />
                                                ) : (
                                                    <Flame size={40} className="text-amber-600" />
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-extrabold">
                                                {round.result.outcome === 'draw'
                                                    ? 'Vòng này hòa nhau!'
                                                    : round.result.outcome === room.role
                                                    ? 'Chúc mừng! Bạn đã thắng vòng này!'
                                                    : 'Đối thủ đã thắng vòng này. Hãy cùng cố gắng ở vòng tiếp nhé!'}
                                            </h3>
                                        </div>

                                        {/* Bảng so sánh thành tích 2 bên */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-2xl border border-[#d3dfd6] bg-white p-5 text-center shadow-xs">
                                                <span className="text-xs font-bold text-muted uppercase">
                                                    Ba mẹ
                                                </span>
                                                <p className="mt-1 text-3xl font-extrabold text-ink">
                                                    {round.result.parent.correct}/{round.result.parent.total}
                                                    <span className="text-xs text-muted font-normal ml-1">đúng</span>
                                                </p>
                                                <p className="text-xs text-muted mt-1">
                                                    Thời gian: {(round.result.parent.usedMs / 1000).toFixed(2)}s
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-[#d3dfd6] bg-white p-5 text-center shadow-xs">
                                                <span className="text-xs font-bold text-muted uppercase">
                                                    Con
                                                </span>
                                                <p className="mt-1 text-3xl font-extrabold text-ink">
                                                    {round.result.child.correct}/{round.result.child.total}
                                                    <span className="text-xs text-muted font-normal ml-1">đúng</span>
                                                </p>
                                                <p className="text-xs text-muted mt-1">
                                                    Thời gian: {(round.result.child.usedMs / 1000).toFixed(2)}s
                                                </p>
                                            </div>
                                        </div>

                                        {/* BẢNG ĐỐI CHIẾU TỪNG VỊ TRÍ */}
                                        <div className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-xs">
                                            <div className="border-b border-[#edf3ef] pb-3 mb-5">
                                                <h4 className="text-sm font-bold text-ink uppercase tracking-wider">
                                                    Đối chiếu từng vị trí
                                                </h4>
                                                <p className="text-xs text-muted">
                                                    Hàng trên: Bạn đã chọn · Hàng dưới: Đáp án chính xác của vòng
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-center gap-3">
                                                {round.result.expected.map((expItem, index) => {
                                                    const myCode = answers[index] ?? round.myAnswers?.[index] ?? null;
                                                    let isCorrect = false;
                                                    if (myCode) {
                                                        if (room.gameName === 'word') {
                                                            isCorrect =
                                                                myCode.trim().toLowerCase() ===
                                                                (expItem.label ?? expItem.code).trim().toLowerCase();
                                                        } else if (room.gameName === 'facename') {
                                                            isCorrect =
                                                                myCode.trim().toLowerCase() ===
                                                                (expItem.label ?? '').trim().toLowerCase();
                                                        } else {
                                                            isCorrect = myCode === expItem.code;
                                                        }
                                                    }

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`flex flex-col items-center rounded-xl border p-2.5 transition-all ${
                                                                isCorrect
                                                                    ? 'border-[#AFD5C0] bg-[#EAF8EF]/40'
                                                                    : 'border-red-200 bg-red-50/30'
                                                            }`}
                                                        >
                                                            <span className="text-xs font-bold text-muted mb-2">
                                                                #{index + 1}
                                                            </span>

                                                            {/* Mục bạn đã chọn */}
                                                            <div className="mb-2">
                                                                {myCode ? (
                                                                    <RenderGameItem
                                                                        gameName={room.gameName}
                                                                        item={{
                                                                            code: myCode,
                                                                            imageUrl: findImageUrl(myCode),
                                                                            label: myCode,
                                                                        }}
                                                                        size="sm"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-11 w-9 items-center justify-center rounded-lg border-2 border-dashed border-[#d3dfd6] text-[10px] text-muted">
                                                                        Trống
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Mục chuẩn đáp án */}
                                                            <div className="mb-2">
                                                                <RenderGameItem
                                                                    gameName={room.gameName}
                                                                    item={expItem}
                                                                    size="sm"
                                                                />
                                                            </div>

                                                            {/* Huy hiệu đúng/sai */}
                                                            <span
                                                                className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                                                                    isCorrect ? 'text-[#1F6B2A]' : 'text-[#b42318]'
                                                                }`}
                                                            >
                                                                {isCorrect ? (
                                                                    <>
                                                                        <CheckCircle2 size={13} /> Đúng
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle size={13} /> Sai
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BẢNG ĐIỂM TỔNG KẾT SAU CÁC VÒNG (LEADERBOARD) */}
                        {score && room.roundIndex >= 0 && (room.state === 'round_result' || room.state === 'completed') && (
                            <section className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-xs">
                                <h3 className="text-base font-bold text-ink flex items-center gap-2 mb-4">
                                    <Trophy size={18} className="text-[#2e7d32]" />
                                    Bảng điểm trận đấu
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-[#d3dfd6] bg-[#fbfbf9] p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-ink text-sm">Ba mẹ</span>
                                            <span className="text-xs font-semibold text-brand-deep">
                                                Hạng {score.parent.rank}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-muted">
                                            {score.parent.wins} Thắng · {score.parent.losses} Thua · {score.parent.draws} Hòa
                                        </p>
                                        <p className="mt-1 text-xl font-extrabold text-ink">
                                            {score.parent.points} <span className="text-xs font-normal text-muted">điểm</span>
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[#d3dfd6] bg-[#fbfbf9] p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-ink text-sm">Con</span>
                                            <span className="text-xs font-semibold text-brand-deep">
                                                Hạng {score.child.rank}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-muted">
                                            {score.child.wins} Thắng · {score.child.losses} Thua · {score.child.draws} Hòa
                                        </p>
                                        <p className="mt-1 text-xl font-extrabold text-ink">
                                            {score.child.points} <span className="text-xs font-normal text-muted">điểm</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Nút chuyển vòng (Dành cho chủ phòng) */}
                                {room.state === 'round_result' && room.role === 'parent' && (
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {room.roundIndex + 1 < room.roundCount ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn--brand h-11 px-6 font-bold"
                                                    disabled={busy}
                                                    onClick={() => void act(() => roomsApi.next(code))}
                                                >
                                                    Chuyển sang vòng {room.roundIndex + 2}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn--quiet h-11 px-5"
                                                    disabled={busy}
                                                    onClick={() => void act(() => roomsApi.finish(code))}
                                                >
                                                    Kết thúc sớm
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn--brand h-12 px-8 font-bold text-base"
                                                disabled={busy}
                                                onClick={() => void act(() => roomsApi.finish(code))}
                                            >
                                                Hoàn thành phiên thi đấu
                                            </button>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* TRẠNG THÁI HOÀN THÀNH (COMPLETED) */}
                        {room.state === 'completed' && (
                            <div className="relative overflow-hidden rounded-2xl border border-brand-deep/30 bg-[#EAF8EF] p-8 text-center space-y-4">
                                <Confetti />
                                <img src={mascotSvg} alt="" className="h-16 w-16 mx-auto drop-shadow-sm" />
                                <h3 className="text-2xl font-extrabold text-[#1F6B2A]">
                                    Phiên thi đấu đã hoàn thành xuất sắc!
                                </h3>
                                <p className="text-sm text-ink max-w-md mx-auto">
                                    {room.role === 'parent'
                                        ? 'Ba mẹ đã được cộng +10 điểm đồng hành. Thật tuyệt vời khi gia đình cùng nhau rèn luyện trí nhớ mỗi ngày!'
                                        : 'Chúc mừng con đã hoàn thành xuất sắc phiên thi đấu cùng ba mẹ!'}
                                </p>
                                <div className="pt-2 flex justify-center gap-3">
                                    <Link
                                        to={room.role === 'parent' ? '/parent' : '/'}
                                        className="btn btn--brand h-11 px-6 text-sm font-bold"
                                    >
                                        Về trang tổng quan
                                    </Link>
                                    {room.role === 'parent' && (
                                        <Link
                                            to="/parent/room"
                                            className="btn btn--quiet h-11 px-5 text-sm font-bold bg-white"
                                        >
                                            Tạo phòng mới
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TRẠNG THÁI HUỶ (CANCELLED) */}
                        {room.state === 'cancelled' && (
                            <div className="rounded-2xl border border-[#d3dfd6] bg-[#fbfbf9] p-8 text-center space-y-3">
                                <h3 className="text-lg font-bold text-ink">
                                    Phiên thi đấu đã kết thúc hoặc hết thời gian chờ
                                </h3>
                                <p className="text-xs text-muted">
                                    Phiên này không được tính điểm đồng hành. Bạn có thể tạo phòng mới bất kỳ lúc nào!
                                </p>
                                <div className="pt-2">
                                    <Link
                                        to={room.role === 'parent' ? '/parent' : '/'}
                                        className="btn btn--quiet text-xs"
                                    >
                                        Quay về
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FamilyRoomPage;
