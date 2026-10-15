import { Link } from "react-router-dom";

export const GameIntroSection = () => {
    return (
        <section className="w-full bg-[#F8FBF8] py-16 md:py-24">
            <div className="mx-auto max-w-[1200px] px-5 md:px-0">
                <div className="rounded-[32px] bg-[#EAF8EF] p-8 md:p-14">
                    <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left column: Text, Steps, CTA */}
                        <div className="flex flex-1 flex-col items-start max-w-[540px]">
                            <h2 className="text-[34px] font-bold leading-[1.18] text-[#1F2937] md:text-[44px]">
                                Học một cách nhớ.<br />
                                Thử ngay với những lá bài.
                            </h2>
                            <p className="mt-4 text-[15px] leading-[1.65] text-[#5F6B7A] md:text-[16px]">
                                Những lá bài vừa xuất hiện theo thứ tự nào? Hãy quan sát, chọn cách ghi nhớ rồi thử xếp lại khi chúng được giấu đi.
                            </p>

                            {/* Steps list */}
                            <div className="mt-8 flex flex-col gap-6">
                                <div className="flex items-start gap-4">
                                    <span className="text-[14px] font-bold tracking-wider text-[#2E7D32]">01</span>
                                    <div>
                                        <h4 className="text-[16px] font-bold text-[#1F2937]">Quan sát</h4>
                                        <p className="mt-1 text-[14px] leading-relaxed text-[#5F6B7A]">Làm quen với một dãy bài ngắn.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-[14px] font-bold tracking-wider text-[#2E7D32]">02</span>
                                    <div>
                                        <h4 className="text-[16px] font-bold text-[#1F2937]">Tạo liên kết</h4>
                                        <p className="mt-1 text-[14px] leading-relaxed text-[#5F6B7A]">Nối các hình thành câu chuyện hoặc đặt chúng vào những vị trí đã học.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-[14px] font-bold tracking-wider text-[#2E7D32]">03</span>
                                    <div>
                                        <h4 className="text-[16px] font-bold text-[#1F2937]">Nhớ lại</h4>
                                        <p className="mt-1 text-[14px] leading-relaxed text-[#5F6B7A]">Xếp lại dãy bài và đối chiếu kết quả.</p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-8 text-[14px] leading-relaxed text-[#5F6B7A]">
                                Chưa nhớ hết cũng được. Xem lại chỗ còn nhầm và thử một liên kết khác nhé.
                            </p>

                            <Link
                                to="/games"
                                className="mt-8 inline-flex h-[52px] w-full sm:w-auto items-center justify-center rounded-[14px] bg-[#2E7D32] px-10 text-[15px] font-semibold text-white transition hover:bg-[#236527]"
                            >
                                Thử một lượt
                            </Link>
                        </div>

                        {/* Right column: Interactive preview board matching reference */}
                        <div className="flex flex-1 justify-center lg:justify-end">
                            <div className="w-full max-w-[480px] rounded-[28px] bg-white p-6 shadow-sm md:p-8">
                                <h3 className="text-[20px] font-bold text-[#1F2937]">
                                    Nhớ lại thứ tự nào!
                                </h3>

                                {/* 4 top cards with illustrations */}
                                <div className="mt-6 grid grid-cols-4 gap-2.5 sm:gap-3">
                                    <div className="flex flex-col items-center justify-between rounded-[16px] border border-[#E3EBE6] bg-white py-3 px-1.5 h-[124px]">
                                        <img src="/src/assets/memio/game/card-cat.svg" alt="Mèo" className="h-11 w-auto object-contain" />
                                        <span className="text-[12px] font-medium text-[#1F2937]">Mèo</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-between rounded-[16px] border border-[#E3EBE6] bg-white py-3 px-1.5 h-[124px]">
                                        <img src="/src/assets/memio/game/card-umbrella.svg" alt="Ô" className="h-11 w-auto object-contain" />
                                        <span className="text-[12px] font-medium text-[#1F2937]">Ô</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-between rounded-[16px] border border-[#E3EBE6] bg-white py-3 px-1.5 h-[124px]">
                                        <img src="/src/assets/memio/game/card-cake.svg" alt="Bánh" className="h-11 w-auto object-contain" />
                                        <span className="text-[12px] font-medium text-[#1F2937]">Bánh</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-between rounded-[16px] border border-[#E3EBE6] bg-white py-3 px-1.5 h-[124px]">
                                        <img src="/src/assets/memio/game/card-bicycle.svg" alt="Xe đạp" className="h-11 w-auto object-contain" />
                                        <span className="text-[12px] font-medium text-[#1F2937]">Xe đạp</span>
                                    </div>
                                </div>

                                {/* 4 bottom placeholder slots */}
                                <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3">
                                    {["1", "2", "3", "4"].map((slotNum) => (
                                        <div
                                            key={slotNum}
                                            className="flex h-[82px] items-start justify-center rounded-[14px] border border-[#E3EBE6] bg-[#F8FBF8] pt-3 text-[14px] font-semibold text-[#5F6B7A]"
                                        >
                                            {slotNum}
                                        </div>
                                    ))}
                                </div>

                                {/* Mascot at the bottom left */}
                                <div className="mt-6 flex justify-start">
                                    <img 
                                        src="/src/assets/memio/mascot.svg" 
                                        alt="Mascot Memio" 
                                        className="h-16 w-auto object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
