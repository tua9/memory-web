import { Link } from "react-router-dom";

export const HeroSection = () => {
    return (
        <section className="relative w-full overflow-hidden bg-[#F8FBF8] pt-12 pb-20 md:pt-20 md:pb-32">
            <div className="mx-auto flex max-w-[1440px] flex-col items-center px-5 md:flex-row md:items-start md:px-[120px] gap-10 md:gap-8">
                {/* Text Content */}
                <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left z-10 pt-10">
                    <h1 className="text-[34px] leading-[46px] md:text-[52px] md:leading-[66px] font-bold text-[#1F2937] max-w-[500px]">
                        Học cách ghi nhớ,<br className="hidden md:block" /> bắt đầu từ một trò chơi.
                    </h1>
                    
                    {/* Placeholder for description */}
                    <p className="mt-6 text-[16px] md:text-[18px] text-[#5F6B7A] max-w-[480px]">
                        [Nội dung giới thiệu đang chờ cập nhật từ thiết kế chi tiết...]
                    </p>

                    <div className="mt-10 flex flex-col w-full sm:w-auto sm:flex-row gap-4">
                        <Link
                            to="/games"
                            className="flex items-center justify-center rounded-full bg-[#2E7D32] px-8 py-4 text-[16px] font-bold text-white transition hover:bg-[#236527]"
                        >
                            Bắt đầu khám phá
                        </Link>
                        <a
                            href="#methods"
                            className="flex items-center justify-center rounded-full bg-[#EAF8EF] px-8 py-4 text-[16px] font-bold text-[#2E7D32] transition hover:bg-[#D4EEDC]"
                        >
                            Xem 3 cách ghi nhớ
                        </a>
                    </div>
                </div>

                {/* Illustration / Carousel placeholder */}
                <div className="flex-1 w-full max-w-[600px] flex justify-center relative">
                    {/* Single slide for now, based on provided asset */}
                    <img 
                        src="/src/assets/memio/B · Hero/Ba đảo ghi nhớ.svg" 
                        alt="Ba đảo ghi nhớ" 
                        className="w-full h-auto object-contain drop-shadow-sm"
                    />
                    
                    {/* Placeholder indicator for future carousel */}
                    <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
                        <div className="h-2 w-8 rounded-full bg-[#2E7D32]"></div>
                        <div className="h-2 w-2 rounded-full bg-[#E3EBE6]"></div>
                        <div className="h-2 w-2 rounded-full bg-[#E3EBE6]"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};
