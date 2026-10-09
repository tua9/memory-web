import { useImagesGameStore } from "../store/imagesGameStore";
import { GameHeader } from "@/features/shared-game/components/GameHeader";
import { GameResultCard } from "@/features/shared-game/components/GameResultCard";
import type { ImageCard } from "../types/imageTypes";

const MAX_LEVEL = 10;

const ImageChip = ({ image, isCorrect, showMark = false }: { image: ImageCard | null; isCorrect?: boolean; showMark?: boolean }) => {
    if (!image) {
        return <div className="flex h-16 w-14 items-center justify-center rounded-xl border-2 border-dashed border-[#c8d8d0] text-sm font-bold text-[#c8d8d0]">—</div>;
    }
    const borderColor = showMark ? (isCorrect ? "#1a7a4a" : "#e45454") : "#e0eee6";
    const bgColor = showMark ? (isCorrect ? "#e6f7ed" : "#fef2f2") : "#ffffff";

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex h-16 w-14 flex-col items-center justify-center gap-0.5 rounded-xl border-2 text-[11px] font-bold shadow-xs transition" style={{ borderColor, backgroundColor: bgColor }}>
                <span className="text-2xl leading-none">{image.emoji}</span>
                <span className="max-w-full truncate px-1 text-[9px] font-bold text-[#202b39]">{image.name}</span>
            </div>
            {showMark && (
                <span className="text-xs font-bold" style={{ color: isCorrect ? "#1a7a4a" : "#e45454" }}>
                    {isCorrect ? "✓ Đúng" : "✗ Sai"}
                </span>
            )}
        </div>
    );
};

export const ImagesResultPhase = () => {
    const { imagesToMemorize, userRecall, resetGame, level, setLevel } = useImagesGameStore();

    const correctCount = imagesToMemorize.reduce((acc, target, idx) => acc + (userRecall[idx]?.id === target.id ? 1 : 0), 0);
    const isPerfect = correctCount === imagesToMemorize.length;

    const handlePlayAgain = () => {
        if (isPerfect && level < MAX_LEVEL) setLevel(level + 1);
        resetGame();
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f5faf7] font-sans text-[#202b39]">
            {/* Header dùng chung */}
            <GameHeader
                gameName="Hình ảnh"
                level={level}
                subtitle="Kết quả thi đấu"
                onReset={resetGame}
            />

            <main className="flex flex-1 flex-col items-center gap-8 overflow-auto px-4 py-8">
                {/* Thẻ Điểm số dùng chung */}
                <GameResultCard
                    correctCount={correctCount}
                    totalCount={imagesToMemorize.length}
                    level={level}
                    maxLevel={MAX_LEVEL}
                    onPlayAgain={handlePlayAgain}
                    onReset={resetGame}
                />

                <section className="w-full max-w-4xl rounded-2xl border border-[#e0eee6] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#77839a]">Bài làm của bạn</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {userRecall.map((img, index) => (
                            <div key={`user-${index}`} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-[#77839a]">{index + 1}</span>
                                <ImageChip image={img} isCorrect={img?.id === imagesToMemorize[index]?.id} showMark />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="w-full max-w-4xl rounded-2xl border border-[#e0eee6] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[#77839a]">Thứ tự đúng</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {imagesToMemorize.map((img, index) => (
                            <div key={`correct-${index}`} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-[#77839a]">{index + 1}</span>
                                <div className="flex h-16 w-14 flex-col items-center justify-center gap-0.5 rounded-xl border border-[#1a7a4a] bg-[#e6f7ed] text-[11px] font-bold">
                                    <span className="text-2xl leading-none">{img.emoji}</span>
                                    <span className="max-w-full truncate px-1 text-[9px] font-bold text-[#1f2937]">{img.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};
