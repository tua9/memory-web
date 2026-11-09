import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowRight,
    KeyRound,
    Lock,
    Sparkles,
    Trophy,
    Users,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/features/auth/store/authStore';
import { roomsApi, type FamilyGame } from '../api/rooms.api';
import mascotSvg from '@/assets/memio/mascot.svg';
import '@/styles/app-screen.css';
import '@/features/shared-game/game.css';

const FAMILY_GAMES_INFO: Record<string, { label: string; desc: string; icon: string; color: string; bg: string; unit: string }> = {
    card: { label: 'Thẻ bài', desc: 'Nhớ thứ tự bộ bài tây 52 lá', icon: '🃏', color: '#2e7d32', bg: '#eaf8ef', unit: 'lá' },
    image: { label: 'Hình ảnh', desc: 'Nhớ thứ tự tranh vẽ sinh động', icon: '🖼️', color: '#2a78d6', bg: '#eaf2fd', unit: 'hình' },
    number: { label: 'Ghi nhớ số', desc: 'Nhớ chuỗi chữ số ngẫu nhiên', icon: '🔢', color: '#987000', bg: '#fef7e6', unit: 'chữ số' },
    facename: { label: 'Gương mặt & Tên', desc: 'Nhớ tên người gắn với gương mặt', icon: '👤', color: '#a04465', bg: '#fdf2f4', unit: 'người' },
    word: { label: 'Ghi nhớ từ', desc: 'Nhớ danh sách từ vựng theo thứ tự', icon: '📝', color: '#7c3aed', bg: '#f3e8ff', unit: 'từ' },
};

export const FamilyRoomLobbyPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const isParent = user?.role === 'parent';

    // State tạo phòng (chỉ dành cho phụ huynh)
    const [games, setGames] = useState<FamilyGame[]>([]);
    const [gameName, setGameName] = useState('card');
    const [mode, setMode] = useState<'level' | 'custom'>('level');
    const [level, setLevel] = useState(1);
    const [itemCount, setItemCount] = useState(5);
    const [memorizeSec, setMemorizeSec] = useState(60);
    const [recallSec, setRecallSec] = useState(60);
    const [roundCount, setRoundCount] = useState(3);

    // State nhập mã phòng (chỉ dành cho con)
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isParent) {
            void roomsApi
                .games()
                .then(({ games }) => {
                    setGames(games);
                    const first = games[0];
                    if (first) {
                        setGameName(first.gameName);
                        setMemorizeSec(first.defaultMemorizeSec);
                        setRecallSec(first.recallSec);
                        setItemCount(first.customItems?.min ?? 5);
                    }
                })
                .catch((cause: { message?: string }) =>
                    setError(cause.message ?? 'Không tải được cấu hình trò chơi.')
                );
        }
    }, [isParent]);

    const currentGame = games.find((item) => item.gameName === gameName);

    const chooseGame = (name: string) => {
        const next = games.find((item) => item.gameName === name);
        if (!next) return;
        setGameName(name);
        setMode('level');
        setLevel(1);
        setItemCount(next.customItems?.min ?? 5);
        setMemorizeSec(next.defaultMemorizeSec);
        setRecallSec(next.recallSec);
    };

    const handleCreateRoom = async (event: React.FormEvent) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            const room = await roomsApi.create({
                gameName,
                mode,
                roundCount,
                memorizeSec,
                ...(mode === 'level' ? { gameLevel: level } : { itemCount, recallSec }),
            });
            navigate(`/family-room/${room.code}`);
        } catch (cause) {
            setError((cause as { message?: string }).message ?? 'Không tạo được phòng thi đấu.');
        } finally {
            setBusy(false);
        }
    };

    const handleEnterRoom = (event: React.FormEvent) => {
        event.preventDefault();
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode) {
            navigate(`/family-room/${cleanCode}`);
        }
    };

    const gameInfo = FAMILY_GAMES_INFO[gameName] ?? {
        label: gameName,
        desc: '',
        icon: '🎮',
        color: '#2e7d32',
        bg: '#eaf8ef',
        unit: 'mục',
    };

    const unlockedMaxLevel = currentGame?.player?.unlockedLevel ?? 1;
    const currentLevelConfig = currentGame?.levels.find((l) => l.level === level) ?? {
        level: 1,
        itemCount: 5,
    };

    return (
        <div className="min-h-svh bg-wall">
            <Header />

            <main className="page-col py-8">
                {/* Hero Title */}
                <div className="mb-8 text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8EF] px-3 py-1 text-xs font-bold text-[#1F6B2A]">
                            <Sparkles size={14} /> Phòng thi đấu gia đình
                        </span>
                        {isParent && (
                            <span className="rounded-full bg-step px-2.5 py-0.5 text-xs font-semibold text-muted">
                                Dành cho Phụ huynh & Con
                            </span>
                        )}
                    </div>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                        {isParent ? 'Chơi cùng con · Tạo phòng thi đấu' : 'Chơi cùng ba mẹ · Vào phòng'}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                        {isParent
                            ? 'Chọn trò chơi và mức độ thử thách để cùng con thi tài trí nhớ, tạo niềm vui và tích lũy +10 điểm đồng hành cho mỗi phiên.'
                            : 'Nhập mã phòng do ba mẹ tạo để cùng nhau đọ sức trong các thử thách trí nhớ hấp dẫn!'}
                    </p>
                </div>

                {error && (
                    <div role="alert" className="mb-6 rounded-xl border border-[#ffd2cc] bg-[#ffe4df] p-4 text-sm text-[#8f1d14]">
                        {error}
                    </div>
                )}

                {/* Bố cục 2 cột cân đối, sinh động */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* CỘT TRÁI: Dành cho Phụ huynh tạo phòng HOẶC Con nhập mã */}
                    <div className="lg:col-span-7">
                        {isParent ? (
                            /* FORM TẠO PHÒNG DÀNH CHO PHỤ HUYNH (KHÔNG CÓ PHẦN NHẬP MÃ PHÒNG) */
                            <form
                                onSubmit={handleCreateRoom}
                                className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-xs sm:p-7"
                            >
                                <div className="border-b border-[#edf3ef] pb-4 mb-5">
                                    <h2 className="text-lg font-bold text-ink">Thiết lập phòng thi đấu</h2>
                                    <p className="text-xs text-muted">
                                        Chọn trò chơi và cấu hình cấp độ phù hợp với con
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* 1. Chọn trò chơi dạng Cards/Chips */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                                            1. Chọn trò chơi thi đấu
                                        </label>
                                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                            {games.map((item) => {
                                                const info = FAMILY_GAMES_INFO[item.gameName] ?? {
                                                    label: item.gameName,
                                                    icon: '🎮',
                                                    color: '#2e7d32',
                                                    bg: '#eaf8ef',
                                                    unit: 'mục',
                                                };
                                                const isSelected = item.gameName === gameName;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={item.gameName}
                                                        onClick={() => chooseGame(item.gameName)}
                                                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                                                            isSelected
                                                                ? 'border-brand-deep bg-[#EAF8EF] ring-2 ring-brand-deep/20 shadow-xs'
                                                                : 'border-[#d3dfd6] bg-white hover:border-brand-deep/40'
                                                        }`}
                                                    >
                                                        <span className="text-2xl">{info.icon}</span>
                                                        <span className="mt-2 text-sm font-bold text-ink">
                                                            {info.label}
                                                        </span>
                                                        <span className="text-xs text-muted">
                                                            Con đã mở cấp {item.player?.unlockedLevel ?? 1}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 2. Chế độ chơi & Lựa chọn Cấp độ chuẩn như trang con (Image 3) */}
                                    <div className="rounded-xl border border-[#edf3ef] bg-[#f8faf8] p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                                                    2. Cấp độ thi đấu
                                                </label>
                                                <p className="text-[11px] text-muted">
                                                    Con đã mở {unlockedMaxLevel} trên {currentGame?.levels.length ?? 10} cấp
                                                </p>
                                            </div>

                                            {currentGame?.customItems && (
                                                <div className="flex rounded-lg border border-[#d3dfd6] bg-white p-0.5 text-xs font-semibold">
                                                    <button
                                                        type="button"
                                                        onClick={() => setMode('level')}
                                                        className={`rounded-md px-3 py-1 transition-colors ${
                                                            mode === 'level'
                                                                ? 'bg-[#EAF8EF] text-[#1F6B2A]'
                                                                : 'text-muted hover:text-ink'
                                                        }`}
                                                    >
                                                        Theo cấp độ
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setMode('custom')}
                                                        className={`rounded-md px-3 py-1 transition-colors ${
                                                            mode === 'custom'
                                                                ? 'bg-[#EAF8EF] text-[#1F6B2A]'
                                                                : 'text-muted hover:text-ink'
                                                        }`}
                                                    >
                                                        Tự chọn
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {mode === 'level' ? (
                                            /* Lưới 10 thẻ cấp độ y hệt màn Settings của con */
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                                {currentGame?.levels.map((item) => {
                                                    const isUnlocked = item.level <= unlockedMaxLevel;
                                                    const isSelected = level === item.level;

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={item.level}
                                                            disabled={!isUnlocked}
                                                            onClick={() => isUnlocked && setLevel(item.level)}
                                                            className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                                                                isSelected
                                                                    ? 'border-[#1F6B2A] bg-[#1F6B2A] text-white shadow-sm ring-2 ring-[#1F6B2A]/30'
                                                                    : isUnlocked
                                                                    ? 'border-[#d3dfd6] bg-white text-ink hover:border-brand-deep'
                                                                    : 'border-dashed border-[#d3dfd6] bg-[#fbfbf9] text-muted/60 opacity-60 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-1 font-bold text-base">
                                                                <span>{item.level}</span>
                                                                {!isUnlocked && <Lock size={12} className="opacity-70" />}
                                                            </div>
                                                            <span
                                                                className={`text-[11px] mt-0.5 ${
                                                                    isSelected ? 'text-white/90' : 'text-muted'
                                                                }`}
                                                            >
                                                                {item.itemCount} {gameInfo.unit}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center justify-between text-xs text-muted mb-2">
                                                    <span>Số vị trí cần ghi nhớ:</span>
                                                    <strong className="text-ink font-bold text-sm">
                                                        {itemCount} vị trí
                                                    </strong>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={currentGame?.customItems?.min ?? 3}
                                                    max={currentGame?.customItems?.max ?? 20}
                                                    value={itemCount}
                                                    onChange={(e) => setItemCount(Number(e.target.value))}
                                                    className="w-full accent-brand-deep cursor-pointer"
                                                />
                                                <div className="flex justify-between text-[11px] text-muted mt-1">
                                                    <span>{currentGame?.customItems?.min ?? 3} mục</span>
                                                    <span>{currentGame?.customItems?.max ?? 20} mục</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Thời gian ghi nhớ & Số vòng thi đấu */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                                                3. Thời gian ghi nhớ
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {currentGame?.memorizeSecOptions.map((sec) => (
                                                    <button
                                                        type="button"
                                                        key={sec}
                                                        onClick={() => setMemorizeSec(sec)}
                                                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                                                            memorizeSec === sec
                                                                ? 'border-brand-deep bg-[#EAF8EF] text-brand-deep'
                                                                : 'border-[#d3dfd6] bg-white text-muted hover:text-ink'
                                                        }`}
                                                    >
                                                        {sec >= 60 ? `${Math.round(sec / 60)} phút` : `${sec} giây`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                                                4. Số vòng thi đấu
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 3, 5].map((cnt) => (
                                                    <button
                                                        type="button"
                                                        key={cnt}
                                                        onClick={() => setRoundCount(cnt)}
                                                        className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
                                                            roundCount === cnt
                                                                ? 'border-brand-deep bg-[#EAF8EF] text-brand-deep'
                                                                : 'border-[#d3dfd6] bg-white text-muted hover:text-ink'
                                                        }`}
                                                    >
                                                        {cnt} {cnt === 1 ? 'vòng (nhanh)' : 'vòng'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tóm tắt & Nút tạo phòng */}
                                    <div className="rounded-xl border border-[#d3dfd6] bg-[#fbfbf9] p-4 text-xs text-ink space-y-1">
                                        <p className="font-semibold text-brand-deep">
                                            Tóm tắt trận đấu:
                                        </p>
                                        <p className="text-muted">
                                            {gameInfo.label} · {roundCount} vòng thi đấu ·{' '}
                                            {mode === 'level'
                                                ? `Cấp độ ${level} (${currentLevelConfig.itemCount} ${gameInfo.unit})`
                                                : `${itemCount} ${gameInfo.unit}`} ·{' '}
                                            {memorizeSec >= 60 ? `${Math.round(memorizeSec / 60)} phút` : `${memorizeSec} giây`} ghi nhớ mỗi vòng.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={busy || !currentGame}
                                        className="btn btn--brand h-12 w-full text-base font-bold shadow-xs hover:shadow-md"
                                    >
                                        {busy ? (
                                            'Đang khởi tạo phòng...'
                                        ) : (
                                            <>
                                                <Sparkles size={18} className="mr-2" />
                                                Tạo phòng & Lấy mã mời con
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* FORM NHẬP MÃ VÀO PHÒNG (CHỈ DÀNH CHO CON) */
                            <div className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-xs sm:p-8">
                                <div className="flex items-center gap-3 border-b border-[#edf3ef] pb-4 mb-6">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF8EF] text-[#1F6B2A]">
                                        <KeyRound size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-ink">Nhập mã phòng của ba mẹ</h2>
                                        <p className="text-xs text-muted">
                                            Mã gồm 6–8 ký tự chữ cái hoặc số do ba mẹ cung cấp
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleEnterRoom} className="space-y-6">
                                    <div>
                                        <label htmlFor="room-code-input" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                                            Mã phòng thi đấu
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="room-code-input"
                                                type="text"
                                                maxLength={8}
                                                autoFocus
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                                placeholder="VD: AB12CD"
                                                required
                                                className="w-full rounded-xl border-2 border-[#d3dfd6] bg-[#fbfbf9] px-4 py-3.5 text-center font-mono text-2xl font-extrabold tracking-widest text-ink transition-all placeholder:text-muted/40 focus:border-brand-deep focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-deep/15"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!code.trim()}
                                        className="btn btn--brand h-12 w-full text-base font-bold shadow-xs hover:shadow-md disabled:opacity-50"
                                    >
                                        Vào phòng thi đấu ngay
                                        <ArrowRight size={18} className="ml-1.5" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: Hướng dẫn, Quy tắc & Linh vật sinh động */}
                    <div className="space-y-6 lg:col-span-5">
                        {/* Thẻ 3 bước thi đấu */}
                        <section className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-xs">
                            <h3 className="text-base font-bold text-ink flex items-center gap-2 mb-4">
                                <Users size={18} className="text-[#2e7d32]" />
                                Cách thi đấu gia đình
                            </h3>

                            <ol className="space-y-4">
                                <li className="flex items-start gap-3.5">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF8EF] text-xs font-extrabold text-[#1F6B2A]">
                                        1
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold text-ink">Ba mẹ tạo phòng</h4>
                                        <p className="text-xs text-muted leading-relaxed">
                                            Ba mẹ chọn trò chơi, số vòng và mức độ thử thách phù hợp rồi bấm tạo phòng.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3.5">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF8EF] text-xs font-extrabold text-[#1F6B2A]">
                                        2
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold text-ink">Con nhập mã phòng</h4>
                                        <p className="text-xs text-muted leading-relaxed">
                                            Ba mẹ đọc mã phòng cho con nhập trên máy của con và bấm sẵn sàng.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3.5">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF8EF] text-xs font-extrabold text-[#1F6B2A]">
                                        3
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold text-ink">Cùng so tài trí nhớ!</h4>
                                        <p className="text-xs text-muted leading-relaxed">
                                            Cả hai cùng ghi nhớ và nộp đáp án. Bảng so tài sẽ chấm điểm công minh ngay sau mỗi vòng!
                                        </p>
                                    </div>
                                </li>
                            </ol>
                        </section>

                        {/* Thẻ Thưởng Điểm đồng hành & Gắn kết với linh vật */}
                        <section className="rounded-2xl border border-[#d3dfd6] bg-gradient-to-br from-[#EAF8EF] to-[#dcefe3] p-6 shadow-xs">
                            <div className="flex items-center gap-4">
                                <img
                                    src={mascotSvg}
                                    alt="Memio mascot"
                                    className="h-16 w-16 shrink-0 drop-shadow-sm"
                                />
                                <div>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1F6B2A]">
                                        <Trophy size={14} /> Điểm đồng hành +10
                                    </span>
                                    <h4 className="text-base font-extrabold text-ink">
                                        Luyện tập vui, gắn kết cả nhà
                                    </h4>
                                    <p className="mt-1 text-xs text-muted leading-relaxed">
                                        Mỗi phiên thi đấu hoàn thành sẽ giúp con tăng cường phản xạ ghi nhớ và tích luỹ 10 điểm đồng hành cho tài khoản phụ huynh.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Thẻ 5 Trò chơi sẵn sàng so tài */}
                        <section className="rounded-2xl border border-[#d3dfd6] bg-white p-6 shadow-xs">
                            <h3 className="text-sm font-bold text-ink mb-3 flex items-center justify-between">
                                <span>5 Trò chơi rèn luyện cùng con</span>
                                <Link to="/games" className="text-xs font-semibold text-brand-deep hover:underline">
                                    Xem chi tiết
                                </Link>
                            </h3>
                            <div className="divide-y divide-[#edf3ef] text-xs">
                                {Object.entries(FAMILY_GAMES_INFO).map(([key, info]) => (
                                    <div key={key} className="flex items-center justify-between py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-lg">{info.icon}</span>
                                            <div>
                                                <p className="font-bold text-ink">{info.label}</p>
                                                <p className="text-muted">{info.desc}</p>
                                            </div>
                                        </div>
                                        <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: info.color }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FamilyRoomLobbyPage;
