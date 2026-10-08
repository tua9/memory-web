import { Link } from "react-router-dom";

export const GameIntroSection = () => {
    return (
        <section className="w-full bg-[#F8FBF8] py-20 md:py-32">
            <div className="mx-auto max-w-[1440px] px-5 md:px-[120px] text-center flex flex-col items-center">
                <h2 className="text-[30px] md:text-[36px] leading-[40px] md:leading-[48px] font-bold text-[#1F2937] max-w-[600px] mb-12 md:mb-16">
                    Học một cách nhớ.<br className="hidden md:block" /> Thử ngay với những lá bài.
                </h2>

                {/* Steps */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full mb-16">
                    <div className="flex flex-col items-center max-w-[280px]">
                        <div className="h-[200px] w-full bg-white rounded-[24px] border border-[#E3EBE6] shadow-sm flex items-center justify-center mb-6">
                            <span className="text-[#5F6B7A] text-sm italic">[Hình minh họa bước 1]</span>
                        </div>
                        <h4 className="text-[20px] font-bold text-[#1F2937] mb-2">Quan sát</h4>
                        <p className="text-[16px] text-[#5F6B7A]">[Nội dung mô tả...]</p>
                    </div>

                    {/* Arrow (hidden on mobile, visible on desktop) */}
                    <div className="hidden md:block text-[#2E7D32] font-bold text-2xl -mt-20">→</div>

                    <div className="flex flex-col items-center max-w-[280px]">
                        <div className="h-[200px] w-full bg-white rounded-[24px] border border-[#E3EBE6] shadow-sm flex items-center justify-center mb-6">
                            <span className="text-[#5F6B7A] text-sm italic">[Hình minh họa bước 2]</span>
                        </div>
                        <h4 className="text-[20px] font-bold text-[#1F2937] mb-2">Tạo liên kết</h4>
                        <p className="text-[16px] text-[#5F6B7A]">[Nội dung mô tả...]</p>
                    </div>

                    {/* Arrow (hidden on mobile, visible on desktop) */}
                    <div className="hidden md:block text-[#2E7D32] font-bold text-2xl -mt-20">→</div>

                    <div className="flex flex-col items-center max-w-[280px]">
                        <div className="h-[200px] w-full bg-white rounded-[24px] border border-[#E3EBE6] shadow-sm flex items-center justify-center mb-6">
                            <span className="text-[#5F6B7A] text-sm italic">[Hình minh họa bước 3]</span>
                        </div>
                        <h4 className="text-[20px] font-bold text-[#1F2937] mb-2">Nhớ lại</h4>
                        <p className="text-[16px] text-[#5F6B7A]">[Nội dung mô tả...]</p>
                    </div>
                </div>

                <Link
                    to="/games"
                    className="inline-flex items-center justify-center rounded-full bg-[#2E7D32] px-10 py-4 text-[16px] font-bold text-white transition hover:bg-[#236527]"
                >
                    Chơi game ngay
                </Link>
            </div>
        </section>
    );
};
