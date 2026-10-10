import { useImagesGameStore } from "../store/imagesGameStore";
import { usePhaseTimer } from "@/features/cards-game/hooks/usePhaseTimer";
import { GameHeader } from "@/features/shared-game/components/GameHeader";

export const ImagesRecallPhase = () => {
    const {
        imagesToMemorize,
        userRecall,
        shuffledDeck,
        selectedSlotIndex,
        phaseDeadline,
        placeImage,
        removeImage,
        selectSlot,
        finishGame,
        resetGame,
        level,
    } = useImagesGameStore();

    const { formattedTime } = usePhaseTimer(phaseDeadline, finishGame);
    const filledCount = userRecall.filter(Boolean).length;
    const isComplete = filledCount === imagesToMemorize.length;

    return (
        <div className="flex min-h-screen flex-col bg-[#f5faf7] font-sans text-[#202b39]">
            <GameHeader
                gameName="Hình ảnh"
                level={level}
                subtitle={`Đã điền ${filledCount}/${imagesToMemorize.length} hình ảnh`}
                formattedTime={formattedTime}
                actionButtonText="Nộp bài ➔"
                onAction={finishGame}
                onReset={resetGame}
                actionButtonColor={isComplete ? "#2e7d32" : "#1a7a4a"}
            />

            <main className="flex flex-1 flex-col items-center justify-between gap-8 p-6">
                <section className="flex w-full max-w-4xl flex-col items-center gap-4 rounded-3xl border border-[#e0eee6] bg-white p-6 shadow-sm">
                    <div className="flex w-full items-center justify-between text-sm font-bold text-[#77839a]">
                        <span>Xếp lại theo thứ tự ban đầu ({filledCount}/{imagesToMemorize.length})</span>
                        <span className="text-xs font-normal text-[#98a2b3]">Bấm vào ô để chọn vị trí xếp</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 p-2">
                        {userRecall.map((item, index) => {
                            const isSelected = selectedSlotIndex === index;
                            return (
                                <button
                                    key={`slot-${index}`}
                                    type="button"
                                    onClick={() => item ? removeImage(index) : selectSlot(index)}
                                    className={`relative flex h-16 w-14 items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${item ? "border-[#1a7a4a] bg-[#e6f7ed] shadow-sm" : isSelected ? "border-[#1a7a4a] bg-[#e6f7ed] ring-2 ring-[#1a7a4a]" : "border-dashed border-[#c8d8d0] bg-[#f8faf9] hover:border-[#1a7a4a]"
                                        }`}
                                >
                                    <span className="absolute left-1.5 top-1 text-[10px] font-bold text-[#77839a]">{index + 1}</span>
                                    {item ? (
                                        <span className="text-3xl leading-none">{item.emoji}</span>
                                    ) : (
                                        <span className="text-xs font-bold text-[#c8d8d0]">{isSelected ? "✎" : "+"}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="flex w-full max-w-4xl flex-col items-center gap-3 rounded-3xl border border-[#e0eee6] bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-[#40493d]">Danh sách hình ảnh</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {shuffledDeck.map((img) => {
                            const isUsed = userRecall.some((item) => item?.id === img.id);
                            return (
                                <button
                                    key={`deck-${img.id}`}
                                    type="button"
                                    disabled={isUsed}
                                    onClick={() => placeImage(img)}
                                    className={`flex h-16 w-14 items-center justify-center rounded-xl border text-3xl transition cursor-pointer ${isUsed ? "border-[#e2e8f0] bg-[#f1f5f9] opacity-25 cursor-not-allowed" : "border-[#e0eee6] hover:scale-105 hover:border-[#1a7a4a] shadow-xs " + img.bgColor
                                        }`}
                                >
                                    <span>{img.emoji}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
};
