import { useEffect, useRef, useState } from "react";
import { useImagesGameStore } from "../store/imagesGameStore";
import { usePhaseTimer } from "@/features/cards-game/hooks/usePhaseTimer";
import { GameHeader } from "@/features/shared-game/components/GameHeader";
import { GameFooterNav } from "@/features/shared-game/components/GameFooterNav";
import type { ImageCard } from "../types/imageTypes";

const THUMB_W = 40;
const THUMB_GAP = 8;
const THUMB_STEP = THUMB_W + THUMB_GAP;
const VISIBLE_THUMBS = 5;
const STRIP_WIDTH = VISIBLE_THUMBS * THUMB_STEP - THUMB_GAP;

const BigImageCard = ({ image, index, total }: { image: ImageCard; index: number; total: number }) => (
    <div className="relative w-[220px] rounded-3xl border border-[#e0eee6] bg-white shadow-lg">
        <div className="flex flex-col items-center px-6 pb-6 pt-14">
            <div className={`flex h-36 w-36 items-center justify-center rounded-2xl text-[96px] leading-none select-none shadow-xs ${image.bgColor}`}>
                {image.emoji}
            </div>
        </div>
        <p className="px-4 pb-3 text-right text-xs font-semibold text-[#77839a]">{index + 1}/{total}</p>
    </div>
);

const ThumbStrip = ({ images, activeIndex, onSelect }: { images: ImageCard[]; activeIndex: number; onSelect: (idx: number) => void }) => {
    const centerOffset = STRIP_WIDTH / 2 - THUMB_W / 2;
    const baseTranslate = -activeIndex * THUMB_STEP + centerOffset;
    const dragRef = useRef<{ startX: number; startIndex: number } | null>(null);
    const [dragDelta, setDragDelta] = useState(0);
    const isDragging = useRef(false);

    const onPointerDown = (e: React.PointerEvent) => {
        isDragging.current = false;
        dragRef.current = { startX: e.clientX, startIndex: activeIndex };
        setDragDelta(0);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current) return;
        const delta = e.clientX - dragRef.current.startX;
        if (Math.abs(delta) > 4) isDragging.current = true;
        setDragDelta(delta);
    };
    const onPointerUp = (e: React.PointerEvent) => {
        if (!dragRef.current) return;
        const delta = e.clientX - dragRef.current.startX;
        const steps = -Math.round(delta / THUMB_STEP);
        if (steps !== 0) {
            const next = Math.max(0, Math.min(images.length - 1, dragRef.current.startIndex + steps));
            onSelect(next);
        }
        dragRef.current = null;
        setDragDelta(0);
    };

    return (
        <div style={{ width: STRIP_WIDTH }} className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10 bg-gradient-to-r from-[#f5faf7] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10 bg-gradient-to-l from-[#f5faf7] to-transparent" />
            <div
                className="flex items-center py-1"
                style={{
                    gap: THUMB_GAP,
                    transform: `translateX(${baseTranslate + (dragRef.current ? dragDelta : 0)}px)`,
                    transition: dragRef.current ? "none" : "transform 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    willChange: "transform",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                {images.map((img, idx) => (
                    <button
                        key={`thumb-${img.id}-${idx}`}
                        type="button"
                        onClick={() => { if (!isDragging.current) onSelect(idx); }}
                        style={{ width: THUMB_W, flexShrink: 0 }}
                        className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${idx === activeIndex ? "border-[#1a7a4a] bg-[#e6f7ed] shadow-sm" : "border-[#e0eee6] bg-white hover:border-[#1a7a4a]"
                            }`}
                    >
                        <span className="text-sm leading-none">{img.emoji}</span>
                        <span className="text-[10px] font-bold" style={{ color: idx === activeIndex ? "#1a7a4a" : "#202b39" }}>{idx + 1}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export const ImagesMemorizePhase = () => {
    const { imagesToMemorize, currentMemorizeIndex, nextMemorizeCard, prevMemorizeCard, finishMemorize, phaseDeadline, level, resetGame } = useImagesGameStore();
    const { formattedTime } = usePhaseTimer(phaseDeadline, finishMemorize);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prevMemorizeCard();
            else if (e.key === "ArrowRight") nextMemorizeCard();
            else if (e.key === " ") { e.preventDefault(); useImagesGameStore.setState({ currentMemorizeIndex: 0 }); }
            else if (e.key === "Enter") finishMemorize();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [prevMemorizeCard, nextMemorizeCard, finishMemorize]);

    const currentImg = imagesToMemorize[currentMemorizeIndex];
    const isFirst = currentMemorizeIndex === 0;
    const isLast = currentMemorizeIndex === imagesToMemorize.length - 1;

    return (
        <div className="flex min-h-screen flex-col bg-[#f5faf7] font-sans text-[#202b39]">
            <GameHeader
                gameName="Hình ảnh"
                level={level}
                subtitle={`Mục tiêu: Ghi nhớ chuẩn xác thứ tự ${imagesToMemorize.length} hình ảnh`}
                formattedTime={formattedTime}
                actionButtonText="✓ Tôi đã nhớ xong"
                onAction={finishMemorize}
                onReset={resetGame}
            />

            <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
                {currentImg && <BigImageCard image={currentImg} index={currentMemorizeIndex} total={imagesToMemorize.length} />}
                <ThumbStrip images={imagesToMemorize} activeIndex={currentMemorizeIndex} onSelect={(idx) => useImagesGameStore.setState({ currentMemorizeIndex: idx })} />
                <div className="flex gap-1.5">
                    {imagesToMemorize.map((_, idx) => (
                        <span key={`dot-${idx}`} className={`h-1.5 rounded-full transition-all ${idx === currentMemorizeIndex ? "w-4 bg-[#1a7a4a]" : "w-1.5 bg-[#c8d8d0]"}`} />
                    ))}
                </div>
            </main>

            <GameFooterNav
                onFirst={() => useImagesGameStore.setState({ currentMemorizeIndex: 0 })}
                onPrev={prevMemorizeCard}
                onNext={nextMemorizeCard}
                isFirst={isFirst}
                isLast={isLast}
            />
        </div>
    );
};
