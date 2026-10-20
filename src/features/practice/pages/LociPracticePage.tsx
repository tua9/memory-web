import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export const LociPracticePage = () => {
    // 0: Xem đề, 1: Che hình nhớ 1, 2: Mở 1 nhớ 2, 3: Mở 2 nhớ 3, 4: Xem cả ba
    const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
    const navigate = useNavigate();

    const stepImages = [
        "/src/assets/memio/practice/room-step0.svg",
        "/src/assets/memio/practice/room-step1.svg",
        "/src/assets/memio/practice/room-step2.svg",
        "/src/assets/memio/practice/room-step3.svg",
        "/src/assets/memio/practice/room-step4.svg",
    ];

    return (
        <div className="min-h-screen bg-[#F8FBF8] text-[#1F2937]">
            <Header />

            <main className="mx-auto max-w-[1040px] px-5 py-10 md:py-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[14px] text-[#2E7D32]">
                    <Link to="/" className="hover:underline">Memio</Link>
                    <span>/</span>
                    <Link to="/methods/memory-palace" className="hover:underline">Đặt điều cần nhớ vào một nơi quen thuộc</Link>
                    <span>/</span>
                    <span className="font-medium text-[#1F2937]">Bài thực hành</span>
                </div>

                {/* Page title with stable height */}
                <div className="mt-4 min-h-[48px] flex items-center">
                    <h1 className="text-[32px] font-bold text-[#1F2937] md:text-[40px] transition-opacity duration-200">
                        {step === 0 && "Xem đề"}
                        {step === 1 && "Che hình · nhớ vị trí 1"}
                        {step === 2 && "Mở vị trí 1 · nhớ vị trí 2"}
                        {step === 3 && "Mở vị trí 2 · nhớ vị trí 3"}
                        {step === 4 && "Xem cả ba"}
                    </h1>
                </div>

                {/* Exercise Container */}
                <div className="mt-8 rounded-[28px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                    {/* Prompt text with stable min-height */}
                    <div className="min-h-[48px] flex items-center">
                        <p className="text-[15px] font-medium text-[#5F6B7A] md:text-[16px] transition-opacity duration-200">
                            {step === 0 && "Quan sát: Táo ở cửa → Mèo ở bàn → Bóng ở giường."}
                            {step === 1 && "Giấu hình. Nhấn cửa sau khi đã tự nhớ."}
                            {step === 2 && "Đúng rồi! Cửa có quả táo. Giờ nhớ xem bàn học có gì?"}
                            {step === 3 && "Bàn học có chú mèo! Cuối cùng, giường ngủ có gì nào?"}
                            {step === 4 && "Tuyệt vời! Bạn đã hoàn thành toàn bộ lộ trình căn phòng trí nhớ."}
                        </p>
                    </div>

                    {/* 
                      Room graphic display:
                      Stack all 5 steps in the same grid cell so that:
                      1. All SVGs are preloaded with zero flashing
                      2. Sizing and aspect ratio are permanently locked
                      3. Switching steps is a silky smooth crossfade
                    */}
                    <div className="mt-6 overflow-hidden rounded-[24px] border border-[#DCEBF2] bg-[#EAF6FC] p-2 md:p-4">
                        <div className="grid grid-cols-1 grid-rows-1 w-full aspect-[944/300] max-h-[340px] items-center justify-center">
                            {stepImages.map((src, idx) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt={`Căn phòng trí nhớ bước ${idx}`}
                                    width="944"
                                    height="300"
                                    className={cn(
                                        "col-start-1 row-start-1 h-full w-full object-contain transition-opacity duration-300 ease-out",
                                        step === idx
                                            ? "opacity-100 z-10"
                                            : "opacity-0 pointer-events-none -z-10"
                                    )}
                                    aria-hidden={step !== idx}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Action buttons with stable container */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        {step === 0 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                            >
                                Che hình và tự nhớ
                            </button>
                        )}

                        {step === 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                            >
                                Mở cửa
                            </button>
                        )}

                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                            >
                                Mở bàn học
                            </button>
                        )}

                        {step === 3 && (
                            <button
                                type="button"
                                onClick={() => setStep(4)}
                                className="flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                            >
                                Mở giường ngủ
                            </button>
                        )}

                        {step === 4 && (
                            <button
                                type="button"
                                onClick={() => setStep(0)}
                                className="flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                            >
                                Thử lại lượt khác
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => navigate("/methods/memory-palace")}
                            className="flex h-[52px] items-center justify-center rounded-[14px] border border-[#E3EBE6] bg-white px-8 text-[15px] font-semibold text-[#1F2937] transition-colors duration-200 hover:bg-[#F0FAF3]"
                        >
                            ← Về hướng dẫn
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default LociPracticePage;
