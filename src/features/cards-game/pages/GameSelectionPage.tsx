import { Header } from '@/components/layout/Header';
import { useNavigate } from 'react-router-dom';

const GAME_OPTIONS = [
    {
        id: 'cards',
        name: 'Thẻ bài',
        description: 'Ghi nhớ các lá bài và kiểm tra khả năng hồi đáp nhanh.',
        accent: 'from-[#dff5e3] to-[#c7ebd0]',
        badge: 'Học ngắn',
    },
    {
        id: 'vocabulary',
        name: 'Từ vựng',
        description: 'Sắp tới: luyện từ mới theo từng chủ đề và mức độ.',
        accent: 'from-[#fdf0d4] to-[#fbe4a1]',
        badge: 'Sắp ra mắt',
    },
];

export const GameSelectionPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fbf8] text-[#1f2937]">
            <Header />
            <main className="px-6 py-12">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 text-center">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#2e7d32]">
                            Memio
                        </p>
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#1f2937]">
                            Chọn trò chơi
                        </h1>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {GAME_OPTIONS.map((game) => (
                            <div
                                key={game.id}
                                className="rounded-[28px] border border-[#e3ebe6] bg-white p-6 shadow-[0px_10px_30px_rgba(30,78,52,0.06)]"
                            >
                                <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${game.accent}`}>
                                    <span className="text-2xl font-black text-[#1a7a4a]">
                                        {game.name.charAt(0)}
                                    </span>
                                </div>

                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h2 className="text-2xl font-bold text-[#1f2937]">{game.name}</h2>
                                    <span className="rounded-full bg-[#eaf8ef] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#2e7d32]">
                                        {game.badge}
                                    </span>
                                </div>

                                <p className="mb-6 text-sm leading-6 text-[#667085]">
                                    {game.description}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (game.id === 'cards') {
                                            navigate('/games/cards');
                                            return;
                                        }
                                    }}
                                    disabled={game.id !== 'cards'}
                                    className={`flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-bold transition ${
                                        game.id === 'cards'
                                            ? 'bg-[#1a7a4a] text-white hover:bg-[#15633c]'
                                            : 'cursor-not-allowed bg-[#eef2f0] text-[#98a2b3]'
                                    }`}
                                >
                                    {game.id === 'cards' ? 'Chơi ngay' : 'Sắp ra mắt'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GameSelectionPage;
