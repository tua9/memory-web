import { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { MethodCard } from "./MethodCard";
import { cn } from "@/lib/utils";

export const MethodsSection = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const methodParam = searchParams.get("method") as "story" | "numbers" | "loci" | null;
    const [selectedMethod, setSelectedMethod] = useState<"story" | "numbers" | "loci" | null>(
        methodParam && ["story", "numbers", "loci"].includes(methodParam) ? methodParam : "story"
    );

    useEffect(() => {
        const p = searchParams.get("method") as "story" | "numbers" | "loci" | null;
        if (p && ["story", "numbers", "loci"].includes(p)) {
            setSelectedMethod((prev) => (prev !== p ? p : prev));
        }
        if (location.hash === "#methods") {
            const el = document.getElementById("methods");
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: "smooth" });
                }, 50);
            }
        }
    }, [searchParams, location.hash]);

    return (
        <section id="methods" className="w-full bg-[#F8FBF8] py-16 md:py-24 scroll-mt-24">
            <div className="mx-auto max-w-[1200px] px-5 md:px-0">
                <div className="mb-10 max-w-[620px]">
                    <h2 className="text-[34px] font-bold leading-[1.2] text-[#1F2937] md:text-[44px]">
                        Có nhiều cách để nhớ.<br />Bạn muốn thử cách nào?
                    </h2>
                    <p className="mt-4 text-[15px] leading-[1.65] text-[#5F6B7A] md:text-[16px]">
                        Bắt đầu từ một câu chuyện, làm quen với những con số hoặc khám phá căn phòng trí nhớ. Mỗi cách đều có ví dụ để bạn thử từng bước.
                    </p>
                </div>
                
                {/* 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
                    <MethodCard
                        tag="Làm quen"
                        title="Nối thành câu chuyện"
                        subtitle="Story Linking"
                        description="Nối các hình ảnh bằng một câu chuyện của riêng bạn. Khi kể lại, hãy tìm xem từng hình đã xuất hiện ở đâu."
                        illustrationSrc="/src/assets/memio/methods/method-story.svg"
                        illustrationAlt="Nối thành câu chuyện"
                        buttonLabel="Xem cách nối chuyện"
                        isActive={selectedMethod === "story"}
                        onSelect={() => setSelectedMethod(selectedMethod === "story" ? null : "story")}
                    />
                    <MethodCard
                        tag="Luyện thêm"
                        title="Biến số thành hình"
                        subtitle="Number–Shape"
                        description="Số 2 trông như thiên nga, số 8 giống người tuyết. Học cách đổi số thành hình, rồi dùng những hình ấy để nhớ một dãy số."
                        illustrationSrc="/src/assets/memio/methods/method-numbers.svg"
                        illustrationAlt="Biến số thành hình"
                        buttonLabel="Xem cách mã hóa số"
                        isActive={selectedMethod === "numbers"}
                        onSelect={() => setSelectedMethod(selectedMethod === "numbers" ? null : "numbers")}
                    />
                    <MethodCard
                        tag="Thử thách"
                        title="Khám phá căn phòng trí nhớ"
                        subtitle="Method of Loci"
                        description="Đặt mỗi điều cần nhớ vào một vị trí quen thuộc. Đi qua từng vị trí trong trí tưởng tượng để tìm lại chúng."
                        illustrationSrc="/src/assets/memio/methods/method-loci.svg"
                        illustrationAlt="Khám phá căn phòng trí nhớ"
                        buttonLabel="Xem cách ghi nhớ bằng vị trí"
                        isActive={selectedMethod === "loci"}
                        onSelect={() => setSelectedMethod(selectedMethod === "loci" ? null : "loci")}
                    />
                </div>

                {/* 
                  EXPANDABLE DETAIL PANELS:
                  We stack all three panels in the same grid cell (col-start-1 row-start-1).
                  This guarantees the container matches the maximum height among the 3 panels at
                  any viewport, preventing any abrupt jumping of the sections below.
                */}
                <div
                    className={cn(
                        "grid transition-[grid-template-rows,margin-top] duration-300 ease-out",
                        selectedMethod !== null ? "grid-rows-[1fr] mt-10" : "grid-rows-[0fr] mt-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="grid grid-cols-1 grid-rows-1 w-full">
                            {/* Panel 1: Story Linking */}
                            <div
                                className={cn(
                                    "col-start-1 row-start-1 w-full rounded-[32px] bg-[#EAF8EF] border border-[#CDE8D5] p-8 md:p-12 transition-opacity duration-300 ease-out",
                                    selectedMethod === "story"
                                        ? "opacity-100 z-10 transition-opacity duration-300 ease-out"
                                        : "opacity-0 pointer-events-none -z-10 transition-opacity duration-150 ease-in select-none"
                                )}
                                aria-hidden={selectedMethod !== "story"}
                                inert={selectedMethod !== "story" ? true : undefined}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-[26px] font-bold text-[#1F2937] md:text-[32px]">
                                            Kể một câu chuyện để nối các hình
                                        </h3>
                                        <p className="mt-2 text-[15px] text-[#5F6B7A]">
                                            Thử nhớ bốn hình này nhé: mèo · ô · bánh · xe đạp.
                                        </p>
                                    </div>
                                    <Link
                                        to="/methods/story-linking"
                                        className="text-[14px] font-semibold text-[#2E7D32] hover:underline transition-colors"
                                    >
                                        Hướng dẫn chi tiết &gt;&gt;
                                    </Link>
                                </div>

                                {/* 4 Cards */}
                                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[620px]">
                                    {[
                                        { name: "Mèo", src: "/src/assets/memio/game/card-cat.svg" },
                                        { name: "Ô", src: "/src/assets/memio/game/card-umbrella.svg" },
                                        { name: "Bánh", src: "/src/assets/memio/game/card-cake.svg" },
                                        { name: "Xe đạp", src: "/src/assets/memio/game/card-bicycle.svg" },
                                    ].map((card, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col items-center justify-center rounded-[20px] border border-[#E3EBE6] bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex h-14 w-14 items-center justify-center">
                                                <img src={card.src} alt={card.name} width="48" height="48" className="h-12 w-12 object-contain" />
                                            </div>
                                            <span className="mt-2 text-[14px] font-semibold text-[#1F2937]">{card.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Callout box */}
                                <div className="mt-6 rounded-[20px] bg-white p-5 text-[15px] leading-[1.6] text-[#1F2937] shadow-sm">
                                    Một chú mèo cầm chiếc ô. Chiếc ô hứng được một chiếc bánh khổng lồ. Chiếc bánh lăn lên xe đạp rồi chạy đi!
                                </div>

                                {/* 3 Steps */}
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">01</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Nhìn và gọi tên từng hình.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">02</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Tưởng tượng hành động nối hình trước với hình tiếp theo.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">03</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Giấu các hình rồi kể lại câu chuyện để nhớ thứ tự.
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-6 text-[13px] text-[#5F6B7A]">
                                    Không cần kể thật hay. Chỉ cần bạn hiểu câu chuyện của mình.
                                </p>

                                {/* Actions */}
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                                    <Link
                                        to="/practice/story"
                                        className="flex h-[48px] w-full sm:w-auto items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                                    >
                                        Thử với 4 hình
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMethod(null)}
                                        className="flex h-[48px] w-full sm:w-auto items-center justify-center rounded-[14px] border border-[#E3EBE6] bg-white px-8 text-[15px] font-semibold text-[#2E7D32] transition-colors duration-200 hover:bg-[#F0FAF3]"
                                    >
                                        Thu gọn hướng dẫn
                                    </button>
                                </div>
                            </div>

                            {/* Panel 2: Number-Shape */}
                            <div
                                className={cn(
                                    "col-start-1 row-start-1 w-full rounded-[32px] bg-[#FFF9E6] border border-[#F0E5C9] p-8 md:p-12 transition-opacity duration-300 ease-out",
                                    selectedMethod === "numbers"
                                        ? "opacity-100 z-10 transition-opacity duration-300 ease-out"
                                        : "opacity-0 pointer-events-none -z-10 transition-opacity duration-150 ease-in select-none"
                                )}
                                aria-hidden={selectedMethod !== "numbers"}
                                inert={selectedMethod !== "numbers" ? true : undefined}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-[26px] font-bold text-[#1F2937] md:text-[32px]">
                                            Cho mỗi con số một hình ảnh
                                        </h3>
                                        <p className="mt-2 text-[15px] text-[#5F6B7A]">
                                            Cùng làm quen với ba hình: 2 là thiên nga · 0 là quả trứng · 8 là người tuyết.
                                        </p>
                                    </div>
                                    <Link
                                        to="/methods/number-shape"
                                        className="text-[14px] font-semibold text-[#2E7D32] hover:underline transition-colors"
                                    >
                                        Hướng dẫn chi tiết &gt;&gt;
                                    </Link>
                                </div>

                                {/* 3 Number Cards */}
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[780px]">
                                    <div className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-sm border border-[#F0E5C9]">
                                        <span className="text-[32px] font-bold text-[#2E7D32] w-8">2</span>
                                        <img src="/src/assets/memio/practice/swan.svg" alt="Thiên nga" width="48" height="48" className="h-12 w-12 object-contain" />
                                        <span className="text-[15px] font-semibold text-[#1F2937]">Thiên nga</span>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-sm border border-[#F0E5C9]">
                                        <span className="text-[32px] font-bold text-[#2E7D32] w-8">0</span>
                                        <img src="/src/assets/memio/practice/egg.svg" alt="Quả trứng" width="48" height="48" className="h-12 w-12 object-contain" />
                                        <span className="text-[15px] font-semibold text-[#1F2937]">Quả trứng</span>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-sm border border-[#F0E5C9]">
                                        <span className="text-[32px] font-bold text-[#2E7D32] w-8">8</span>
                                        <img src="/src/assets/memio/practice/snowman.svg" alt="Người tuyết" width="48" height="48" className="h-12 w-12 object-contain" />
                                        <span className="text-[15px] font-semibold text-[#1F2937]">Người tuyết</span>
                                    </div>
                                </div>

                                {/* Callout box */}
                                <div className="mt-6 rounded-[20px] bg-white p-5 text-[15px] leading-[1.6] text-[#1F2937] shadow-sm">
                                    Muốn nhớ 208? Hãy tưởng tượng một chú thiên nga mang quả trứng đến tặng người tuyết.
                                </div>

                                {/* 3 Steps */}
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">01</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Làm quen với hình đại diện của từng số.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">02</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Nối các hình theo thứ tự của dãy số.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">03</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Nhớ lại các hình và đổi chúng về số.
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-6 text-[13px] text-[#5F6B7A]">
                                    Lần sau gặp cùng một số, hãy dùng lại hình đã học nhé.
                                </p>

                                {/* Actions */}
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                                    <Link
                                        to="/practice/numbers"
                                        className="flex h-[48px] w-full sm:w-auto items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                                    >
                                        Thử nhớ một dãy số
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMethod(null)}
                                        className="flex h-[48px] w-full sm:w-auto items-center justify-center rounded-[14px] border border-[#E3EBE6] bg-white px-8 text-[15px] font-semibold text-[#2E7D32] transition-colors duration-200 hover:bg-[#F0FAF3]"
                                    >
                                        Thu gọn hướng dẫn
                                    </button>
                                </div>
                            </div>

                            {/* Panel 3: Method of Loci */}
                            <div
                                className={cn(
                                    "col-start-1 row-start-1 w-full rounded-[32px] bg-[#EBF5FA] border border-[#D0E4EE] p-8 md:p-12 transition-opacity duration-300 ease-out",
                                    selectedMethod === "loci"
                                        ? "opacity-100 z-10 transition-opacity duration-300 ease-out"
                                        : "opacity-0 pointer-events-none -z-10 transition-opacity duration-150 ease-in select-none"
                                )}
                                aria-hidden={selectedMethod !== "loci"}
                                inert={selectedMethod !== "loci" ? true : undefined}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-[26px] font-bold text-[#1F2937] md:text-[32px]">
                                            Đặt điều cần nhớ vào một nơi quen thuộc
                                        </h3>
                                        <p className="mt-2 text-[15px] text-[#5F6B7A]">
                                            Cùng đi qua ba vị trí: cửa phòng → bàn học → giường.
                                        </p>
                                    </div>
                                    <Link
                                        to="/methods/memory-palace"
                                        className="text-[14px] font-semibold text-[#2E7D32] hover:underline transition-colors"
                                    >
                                        Hướng dẫn chi tiết &gt;&gt;
                                    </Link>
                                </div>

                                {/* 3 Location Cards */}
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[840px]">
                                    <div className="flex flex-col rounded-[20px] bg-white p-4 shadow-sm border border-[#D0E4EE]">
                                        <span className="text-[13px] font-bold text-[#2E7D32]">1 · Cửa phòng</span>
                                        <div className="mt-3 flex items-center justify-center gap-3 h-16">
                                            <img src="/src/assets/memio/practice/apple.svg" alt="Táo" width="48" height="48" className="h-12 w-12 object-contain" />
                                            <img src="/src/assets/memio/practice/door.svg" alt="Cửa" width="48" height="48" className="h-12 w-12 object-contain" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col rounded-[20px] bg-white p-4 shadow-sm border border-[#D0E4EE]">
                                        <span className="text-[13px] font-bold text-[#2E7D32]">2 · Bàn học</span>
                                        <div className="mt-3 flex items-center justify-center gap-3 h-16">
                                            <img src="/src/assets/memio/game/card-cat.svg" alt="Mèo" width="48" height="48" className="h-12 w-12 object-contain" />
                                            <img src="/src/assets/memio/practice/desk.svg" alt="Bàn" width="48" height="48" className="h-12 w-12 object-contain" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col rounded-[20px] bg-white p-4 shadow-sm border border-[#D0E4EE]">
                                        <span className="text-[13px] font-bold text-[#2E7D32]">3 · Giường</span>
                                        <div className="mt-3 flex items-center justify-center gap-3 h-16">
                                            <img src="/src/assets/memio/practice/ball.svg" alt="Bóng" width="48" height="48" className="h-12 w-12 object-contain" />
                                            <img src="/src/assets/memio/practice/bed.svg" alt="Giường" width="48" height="48" className="h-12 w-12 object-contain" />
                                        </div>
                                    </div>
                                </div>

                                {/* Callout box */}
                                <div className="mt-6 rounded-[20px] bg-white p-5 text-[15px] leading-[1.6] text-[#1F2937] shadow-sm">
                                    Hãy tưởng tượng một quả táo khổng lồ chắn ở cửa, chú mèo ngồi trên bàn học và quả bóng nhảy trên giường.
                                </div>

                                {/* 3 Steps */}
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">01</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Làm quen với các vị trí và thứ tự di chuyển.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">02</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Đặt một hình ảnh cần nhớ vào mỗi vị trí.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="text-[16px] font-bold text-[#2E7D32]">03</div>
                                        <p className="mt-1 text-[14px] leading-[1.5] text-[#5F6B7A]">
                                            Đi lại đúng lộ trình trong tưởng tượng để tìm các hình.
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                                    <Link
                                        to="/practice/loci"
                                        className="flex h-[48px] w-full sm:w-auto items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                                    >
                                        Khám phá căn phòng
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMethod(null)}
                                        className="flex h-[48px] w-full sm:w-auto items-center justify-center rounded-[14px] border border-[#E3EBE6] bg-white px-8 text-[15px] font-semibold text-[#2E7D32] transition-colors duration-200 hover:bg-[#F0FAF3]"
                                    >
                                        Thu gọn hướng dẫn
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

