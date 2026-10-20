import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export const StoryPracticePage = () => {
    // 0: Xem đề, 1: Che đề · tự nhớ, 2: Hiện đáp án
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const navigate = useNavigate();

    const cards = [
        { num: 1, name: "Mèo", src: "/src/assets/memio/game/card-cat.svg" },
        { num: 2, name: "Ô", src: "/src/assets/memio/game/card-umbrella.svg" },
        { num: 3, name: "Bánh", src: "/src/assets/memio/game/card-cake.svg" },
        { num: 4, name: "Xe đạp", src: "/src/assets/memio/game/card-bicycle.svg" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FBF8] text-[#1F2937]">
            <Header />

            <main className="mx-auto max-w-[1040px] px-5 py-10 md:py-16">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[14px] text-[#2E7D32]">
                    <Link to="/" className="hover:underline">Memio</Link>
                    <span>/</span>
                    <Link to="/methods/story-linking" className="hover:underline">Kể một câu chuyện để nối các hình</Link>
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
                            {step === 0 && "Nhìn dãy hình theo thứ tự và tạo câu chuyện."}
                            {step === 1 && "Đề đã được che. Hãy kể lại câu chuyện và điền bốn vị trí."}
                            {step === 2 && "Bây giờ đối chiếu thứ tự bạn vừa nhớ."}
                        </p>
                    </div>

                    {/* Cards Display Box */}
                    <div className="mt-6 rounded-[24px] bg-[#EAF8EF] p-6 md:p-10">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                            {cards.map((c) => (
                                <div
                                    key={c.num}
                                    className="flex flex-col items-center justify-center rounded-[20px] bg-white p-5 shadow-sm border border-[#E3EBE6] aspect-square"
                                >
                                    <div className="relative flex h-16 w-16 items-center justify-center">
                                        {/* Hidden question mark */}
                                        <div
                                            className={cn(
                                                "absolute inset-0 flex items-center justify-center transition-opacity duration-250 ease-out",
                                                step === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                                            )}
                                        >
                                            <span className="text-[36px] font-bold text-[#2E7D32]">?</span>
                                        </div>
                                        {/* Revealed card image */}
                                        <div
                                            className={cn(
                                                "absolute inset-0 flex items-center justify-center transition-opacity duration-250 ease-out",
                                                step !== 1 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                                            )}
                                        >
                                            <img
                                                src={c.src}
                                                alt={c.name}
                                                width="56"
                                                height="56"
                                                className="h-14 w-14 object-contain"
                                            />
                                        </div>
                                    </div>
                                    <span className="mt-3 text-[14px] font-bold text-[#1F2937] transition-opacity duration-200">
                                        {step === 1 ? `${c.num} · ?` : `${c.num} · ${c.name}`}
                                    </span>
                                </div>
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
                                Che dãy hình và tự nhớ
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
                            onClick={() => navigate("/methods/story-linking")}
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
export default StoryPracticePage;
