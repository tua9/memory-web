import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideData {
    id: number;
    title: React.ReactNode;
    description: string;
    primaryBtnText: string;
    primaryBtnLink?: string;
    primaryBtnHref?: string;
    secondaryBtnText?: string;
    secondaryBtnHref?: string;
}

const SLIDES: SlideData[] = [
    {
        id: 0,
        title: (
            <>
                <span className="text-[#2E7D32]">Học cách ghi nhớ,</span>
                <br />
                bắt đầu từ một trò chơi.
            </>
        ),
        description:
            "Cùng Memio biến những điều cần nhớ thành câu chuyện, hình ảnh và những chuyến khám phá. Tìm hiểu từng cách, rồi tự mình thử sức.",
        primaryBtnText: "Bắt đầu khám phá",
        primaryBtnLink: "/games",
        secondaryBtnText: "Xem 3 cách ghi nhớ",
        secondaryBtnHref: "#methods",
    },
    {
        id: 1,
        title: (
            <>
                <span className="text-[#2E7D32]">Một chú mèo, một</span>
                <br />
                <span className="text-[#2E7D32]">chiếc ô...</span>
                <br />
                thành cả câu chuyện!
            </>
        ),
        description:
            "Những hình ảnh rời rạc có thể nối thành một chuyến phiêu lưu do bạn nghĩ ra. Cùng thử kể chuyện để nhớ lại từng hình nhé.",
        primaryBtnText: "Thử nối câu chuyện",
        primaryBtnHref: "#methods",
    },
    {
        id: 2,
        title: (
            <>
                <span className="text-[#2E7D32]">Bạn có thể nhớ</span>
                <br />
                những lá bài
                <br />
                theo cách nào?
            </>
        ),
        description:
            "Quan sát, tạo liên kết rồi thử xếp lại. Bắt đầu với một dãy ngắn và khám phá cách ghi nhớ phù hợp với mình.",
        primaryBtnText: "Khám phá trò chơi",
        primaryBtnLink: "/games",
    },
];

export const HeroSection = () => {
    const [activeSlide, setActiveSlide] = useState(0);

    const prevSlide = () => {
        setActiveSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setActiveSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    };

    return (
        <section className="relative overflow-hidden bg-[#F8FBF8] pt-6 pb-14 md:pt-10 md:pb-20">
            <div className="mx-auto max-w-[1200px] px-5 md:px-0">
                {/* 
                  Unified Hero Grid:
                  - On desktop: Column 1 has text on top and nav below; Column 2 has media spanning rows.
                  - On mobile: Stacked in 3 rows: text, media, nav.
                  - All 3 slides stack inside text and media cells (col-start-1 row-start-1) so their
                    reserved bounding boxes are fixed to the tallest slide, completely locking nav coordinates.
                */}
                <div className="hero-grid w-full items-center">
                    {/* Vùng nội dung slide: Text (Title, Description, CTA) */}
                    <div className="hero-area-text z-10 w-full max-w-[560px] grid grid-cols-1">
                        {SLIDES.map((slide, idx) => {
                            const isActive = activeSlide === idx;

                            return (
                                <div
                                    key={slide.id}
                                    className={cn(
                                        "col-start-1 row-start-1 flex flex-col items-start text-left w-full",
                                        isActive
                                            ? "opacity-100 z-10 pointer-events-auto transition-opacity duration-300 ease-out"
                                            : "opacity-0 z-0 pointer-events-none transition-opacity duration-150 ease-in"
                                    )}
                                    aria-hidden={!isActive}
                                    inert={!isActive ? true : undefined}
                                >
                                    <h1 className="text-[32px] sm:text-[38px] md:text-[54px] font-bold leading-[1.15] tracking-tight text-[#1F2937]">
                                        {slide.title}
                                    </h1>

                                    <p className="mt-4 md:mt-5 text-[15px] leading-[1.65] text-[#5F6B7A] md:text-[16px]">
                                        {slide.description}
                                    </p>

                                    <div className="mt-7 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:items-center">
                                        {slide.primaryBtnLink ? (
                                            <Link
                                                to={slide.primaryBtnLink}
                                                tabIndex={isActive ? 0 : -1}
                                                className="flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                                            >
                                                {slide.primaryBtnText}
                                            </Link>
                                        ) : (
                                            <a
                                                href={slide.primaryBtnHref ?? "#methods"}
                                                tabIndex={isActive ? 0 : -1}
                                                className="flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#236527]"
                                            >
                                                {slide.primaryBtnText}
                                            </a>
                                        )}

                                        {slide.secondaryBtnText && (
                                            <a
                                                href={slide.secondaryBtnHref ?? "#methods"}
                                                tabIndex={isActive ? 0 : -1}
                                                className="flex h-[52px] items-center justify-center rounded-[14px] border border-[#E3EBE6] bg-white px-8 text-[15px] font-semibold text-[#1F2937] transition-colors duration-200 hover:bg-[#F0FAF3]"
                                            >
                                                {slide.secondaryBtnText}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Vùng nội dung slide: Media (Illustrations) */}
                    <div className="hero-area-media relative flex w-full flex-1 flex-col items-center md:items-end justify-center self-center min-h-[300px] md:min-h-[440px] mt-8 md:mt-0 grid grid-cols-1">
                        {SLIDES.map((slide, idx) => {
                            const isActive = activeSlide === idx;

                            return (
                                <div
                                    key={slide.id}
                                    className={cn(
                                        "col-start-1 row-start-1 flex w-full items-center justify-center md:justify-end",
                                        isActive
                                            ? "opacity-100 z-10 pointer-events-auto transition-opacity duration-300 ease-out"
                                            : "opacity-0 z-0 pointer-events-none transition-opacity duration-150 ease-in"
                                    )}
                                    aria-hidden={!isActive}
                                    inert={!isActive ? true : undefined}
                                >
                                    {/* Slide 0: Ba đảo ghi nhớ */}
                                    {slide.id === 0 && (
                                        <div className="flex w-full max-w-[580px] items-center justify-center md:justify-end">
                                            <img
                                                src="/src/assets/memio/B · Hero/Ba đảo ghi nhớ.svg"
                                                alt="Ba đảo ghi nhớ"
                                                width="580"
                                                height="377"
                                                className="h-auto w-full max-w-[580px] object-contain"
                                            />
                                        </div>
                                    )}

                                    {/* Slide 1: 4 thẻ + mascot */}
                                    {slide.id === 1 && (
                                        <div className="w-full max-w-[580px] rounded-[32px] bg-[#EAF8EF] p-6 sm:p-8 md:p-10">
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { name: "Mèo", src: "/src/assets/memio/game/card-cat.svg" },
                                                    { name: "Ô", src: "/src/assets/memio/game/card-umbrella.svg" },
                                                    { name: "Bánh", src: "/src/assets/memio/game/card-cake.svg" },
                                                    { name: "Xe đạp", src: "/src/assets/memio/game/card-bicycle.svg" },
                                                ].map((card, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex flex-col items-center justify-center rounded-[20px] border border-[#E3EBE6] bg-white p-3 aspect-square shadow-sm"
                                                    >
                                                        <div className="flex h-12 w-12 items-center justify-center">
                                                            <img
                                                                src={card.src}
                                                                alt={card.name}
                                                                width="40"
                                                                height="40"
                                                                className="h-10 w-10 object-contain"
                                                            />
                                                        </div>
                                                        <span className="mt-1 text-[13px] font-semibold text-[#1F2937]">
                                                            {card.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 md:mt-8 flex justify-start pl-2">
                                                <img
                                                    src="/src/assets/memio/mascot.svg"
                                                    alt="Memio mascot"
                                                    width="64"
                                                    height="64"
                                                    className="h-16 w-auto object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Slide 2: 4 thẻ + 4 slot + mascot */}
                                    {slide.id === 2 && (
                                        <div className="w-full max-w-[580px] rounded-[32px] bg-[#EAF8EF] p-6 sm:p-8 md:p-10">
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { name: "Mèo", src: "/src/assets/memio/game/card-cat.svg" },
                                                    { name: "Ô", src: "/src/assets/memio/game/card-umbrella.svg" },
                                                    { name: "Bánh", src: "/src/assets/memio/game/card-cake.svg" },
                                                    { name: "Xe đạp", src: "/src/assets/memio/game/card-bicycle.svg" },
                                                ].map((card, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex flex-col items-center justify-center rounded-[20px] border border-[#E3EBE6] bg-white p-3 aspect-square shadow-sm"
                                                    >
                                                        <div className="flex h-12 w-12 items-center justify-center">
                                                            <img
                                                                src={card.src}
                                                                alt={card.name}
                                                                width="40"
                                                                height="40"
                                                                className="h-10 w-10 object-contain"
                                                            />
                                                        </div>
                                                        <span className="mt-1 text-[13px] font-semibold text-[#1F2937]">
                                                            {card.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 grid grid-cols-4 gap-3">
                                                {[1, 2, 3, 4].map((num) => (
                                                    <div
                                                        key={num}
                                                        className="flex h-16 items-center justify-center rounded-[16px] border border-dashed border-[#8EBEA3] bg-white/70 text-[16px] font-bold text-[#5F6B7A]"
                                                    >
                                                        {num}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 md:mt-8 flex justify-start pl-2">
                                                <img
                                                    src="/src/assets/memio/mascot.svg"
                                                    alt="Memio mascot"
                                                    width="64"
                                                    height="64"
                                                    className="h-16 w-auto object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* 
                      Vùng điều hướng riêng: DUY NHẤT 1 hàng dùng chung toàn bộ carousel.
                      Hoàn toàn nằm ngoài các slide và ngoài wrapper đang animate.
                      Được đặt ở [grid-area:nav], căn đều mép trái container nội dung.
                    */}
                    <div
                        id="hero-nav-controls"
                        data-testid="hero-nav-controls"
                        className="hero-area-nav mt-8 md:mt-10 flex items-center justify-start gap-3 w-full"
                    >
                        <button
                            id="hero-nav-prev"
                            type="button"
                            onClick={prevSlide}
                            aria-label="Slide trước"
                            className="flex h-[40px] w-[40px] md:h-[42px] md:w-[42px] items-center justify-center rounded-[12px] border border-[#E3EBE6] bg-white text-[#5F6B7A] transition-colors duration-200 hover:border-[#2E7D32] hover:text-[#2E7D32] active:bg-gray-50 cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        {SLIDES.map((s, dotIdx) => (
                            <button
                                id={`hero-nav-dot-${dotIdx}`}
                                key={s.id}
                                type="button"
                                onClick={() => setActiveSlide(dotIdx)}
                                aria-label={`Slide ${dotIdx + 1}`}
                                className={cn(
                                    "flex h-[40px] w-[40px] md:h-[42px] md:w-[42px] items-center justify-center rounded-[12px] border transition-colors duration-200 bg-white cursor-pointer",
                                    activeSlide === dotIdx
                                        ? "border-[#2E7D32]"
                                        : "border-[#E3EBE6] hover:border-[#2E7D32]"
                                )}
                            >
                                <span
                                    className={cn(
                                        "size-2 rounded-full transition-colors duration-200",
                                        activeSlide === dotIdx
                                            ? "bg-[#2E7D32]"
                                            : "border border-[#2E7D32] bg-white"
                                    )}
                                />
                            </button>
                        ))}
                        <button
                            id="hero-nav-next"
                            type="button"
                            onClick={nextSlide}
                            aria-label="Slide tiếp theo"
                            className="flex h-[40px] w-[40px] md:h-[42px] md:w-[42px] items-center justify-center rounded-[12px] border border-[#E3EBE6] bg-white text-[#5F6B7A] transition-colors duration-200 hover:border-[#2E7D32] hover:text-[#2E7D32] active:bg-gray-50 cursor-pointer"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

