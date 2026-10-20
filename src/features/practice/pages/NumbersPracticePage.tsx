import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export const NumbersPracticePage = () => {
    // 0: Xem đề, 1: Che đề · tự nhớ, 2: Hiện đáp án
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const navigate = useNavigate();

    const items = [
        { digit: "2", name: "Thiên nga", src: "/src/assets/memio/practice/swan.svg" },
        { digit: "0", name: "Trứng", src: "/src/assets/memio/practice/egg.svg" },
        { digit: "1", name: "Nến", src: "/src/assets/memio/practice/candle.svg" },
        { digit: "8", name: "Người tuyết", src: "/src/assets/memio/practice/snowman.svg" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FBF8] text-[#1F2937]">
            <Header />

            <main className="mx-auto max-w-[1040px] px-5 py-10 md:py-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[14px] text-[#2E7D32]">
                    <Link to="/" className="hover:underline">Memio</Link>
                    <span>/</span>
                    <Link to="/methods/number-shape" className="hover:underline">Cho mỗi con số một hình ảnh</Link>
                    <span>/</span>
                    <span className="font-medium text-[#1F2937]">Bài thực hành</span>
                </div>

                {/* Page title with stable height */}
                <div className="mt-4 min-h-[48px] flex items-center">
                    <h1 className="text-[32px] font-bold text-[#1F2937] md:text-[40px] transition-opacity duration-200">
                        {step === 0 && "Xem đề"}
                        {step === 1 && "Che đề · tự nhớ"}
                        {step === 2 && "Hiện đáp án"}
                    </h1>
                </div>

                {/* Exercise Container */}
                <div className="mt-8 rounded-[28px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                    {/* Prompt text with stable min-height */}
                    <div className="min-h-[48px] flex items-center">
                        <p className="text-[15px] font-medium text-[#5F6B7A] md:text-[16px] transition-opacity duration-200">
                            {step === 0 && "Nhìn 2018. Hãy đổi mỗi chữ số thành một hình."}
                            {step === 1 && "Đề đã được che. Hãy nhớ lại bốn hình tương ứng với dãy số 2, 0, 1, 8."}
                            {step === 2 && "Đối chiếu sau khi bạn tự trả lời: 2, 0, 1, 8."}
                        </p>
                    </div>

                    {/* 
                      Stabilized Display Box:
                      All 3 states share the exact same grid cell so the wrapper maintains
                      identical height and buttons below never jump.
                    */}
                    <div className="mt-6 rounded-[24px] bg-[#EAF8EF] overflow-hidden">
                        <div className="grid grid-cols-1 grid-rows-1 w-full">
                            {/* Step 0: Big Numbers */}
                            <div
                                className={cn(
                                    "col-start-1 row-start-1 flex items-center justify-center p-10 md:p-16 transition-opacity duration-250 ease-out",
                                    step === 0
                                        ? "opacity-100 z-10"
                                        : "opacity-0 pointer-events-none -z-10"
                                )}
                                aria-hidden={step !== 0}
                            >
                                <div className="flex items-center gap-8 md:gap-14 text-[64px] md:text-[96px] font-extrabold text-[#1F2937] tracking-wider select-none">
                                    <span>2</span>
                                    <span>0</span>
                                    <span>1</span>
                                    <span>8</span>
                                </div>
                            </div>

                            {/* Step 1: Question marks */}
                            <div
                                className={cn(
                                    "col-start-1 row-start-1 flex items-center justify-center p-10 md:p-16 transition-opacity duration-250 ease-out",
                                    step === 1
                                        ? "opacity-100 z-10"
                                        : "opacity-0 pointer-events-none -z-10"
                                )}
                                aria-hidden={step !== 1}
                            >
                                <div className="flex items-center gap-8 md:gap-14 text-[64px] md:text-[96px] font-extrabold text-[#2E7D32] tracking-wider select-none">
                                    <span>?</span>
                                    <span>?</span>
                                    <span>?</span>
                                    <span>?</span>
                                </div>
                            </div>

                            {/* Step 2: Revealed images & sequence */}
                            <div
                                className={cn(
                                    "col-start-1 row-start-1 p-6 md:p-10 transition-opacity duration-250 ease-out",
                                    step === 2
                                        ? "opacity-100 z-10"
                                        : "opacity-0 pointer-events-none -z-10"
                                )}
                                aria-hidden={step !== 2}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                                    {items.map((it, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-center justify-center rounded-[20px] bg-white p-5 shadow-sm border border-[#E3EBE6] aspect-square"
                                        >
                                            <div className="flex h-16 w-16 items-center justify-center">
                                                <img
                                                    src={it.src}
                                                    alt={it.name}
                                                    width="56"
                                                    height="56"
                                                    className="h-14 w-14 object-contain"
                                                />
                                            </div>
                                            <span className="mt-3 text-[14px] font-bold text-[#1F2937]">
                                                {idx + 1} · {it.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 rounded-[16px] bg-white/80 p-4 text-center text-[16px] font-bold text-[#2E7D32] shadow-sm">
                                    Thiên nga → Trứng → Nến → Người tuyết → 2018
                                </div>
                            </div>
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
                                Che dãy số và tự nhớ
                            </button>
                        )}

                        {step === 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                            >
                                Xem đáp án
                            </button>
                        )}

                        {step === 2 && (
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
                            onClick={() => navigate("/methods/number-shape")}
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
export default NumbersPracticePage;
