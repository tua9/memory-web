import { Header } from '@/components/layout/Header';
import { HeroSection } from '../components/HeroSection';
import { MethodsSection } from '../components/MethodsSection';
import { GameIntroSection } from '../components/GameIntroSection';

export const HomePage = () => {
    return (
        <div className="min-h-screen bg-[#F8FBF8] font-sans">
            <Header />
            
            <main>
                <HeroSection />
                <MethodsSection />
                <GameIntroSection />
                
                {/* Parents Section Placeholder */}
                <section className="w-full bg-white py-20 md:py-32">
                    <div className="mx-auto max-w-[1440px] px-5 md:px-[120px] text-center">
                        <h2 className="text-[30px] md:text-[36px] font-bold text-[#1F2937] mb-8">
                            Con sẽ thực hành điều gì cùng Memio?
                        </h2>
                        <div className="h-[300px] bg-[#F8FBF8] rounded-[24px] border border-[#E3EBE6] flex flex-col items-center justify-center">
                            <span className="text-[#5F6B7A] italic mb-2">[Nội dung 3 giá trị thực hành - Đang chờ Asset]</span>
                            <span className="text-[#5F6B7A] italic">[Khối gợi ý trò chuyện cùng con & Mascot - Đang chờ Asset]</span>
                        </div>
                    </div>
                </section>

                {/* FAQ Section Placeholder */}
                <section className="w-full bg-[#F8FBF8] py-20 md:py-32">
                    <div className="mx-auto max-w-[800px] px-5 md:px-0 text-center">
                        <h2 className="text-[30px] md:text-[36px] font-bold text-[#1F2937] mb-8">
                            Câu hỏi thường gặp
                        </h2>
                        <div className="h-[300px] bg-white rounded-[24px] border border-[#E3EBE6] flex items-center justify-center shadow-sm">
                            <span className="text-[#5F6B7A] italic">[Nội dung FAQ & Accordion - Đang chờ Asset]</span>
                        </div>
                    </div>
                </section>

                {/* Final CTA Placeholder */}
                <section className="w-full bg-white py-20 md:py-32">
                    <div className="mx-auto max-w-[800px] px-5 md:px-0 text-center">
                        <div className="h-[200px] bg-[#EAF8EF] rounded-[24px] flex flex-col items-center justify-center">
                            <span className="text-[#2E7D32] italic mb-4">[Mascot, tiêu đề, mô tả CTA - Đang chờ Asset]</span>
                            <button className="rounded-full bg-[#2E7D32] px-8 py-4 text-[16px] font-bold text-white">
                                Bắt đầu với Memio
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Placeholder */}
            <footer className="w-full bg-[#1F2937] py-12 text-white">
                <div className="mx-auto max-w-[1440px] px-5 md:px-[120px] text-center">
                    <span className="text-gray-400 italic">[Nội dung Footer - Đang chờ Asset]</span>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
