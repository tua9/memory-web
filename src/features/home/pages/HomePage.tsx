import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '../components/HeroSection';
import { MethodsSection } from '../components/MethodsSection';
import { GameIntroSection } from '../components/GameIntroSection';
import { cn } from '@/lib/utils';

const parentPoints = [
    ['Học cách tạo liên kết', 'Tìm mỗi liên hệ giữa những điều cần nhớ.'],
    ['Tập tự nhớ lại', 'Thử nhắc lại hoặc sắp xếp thông tin khi gợi ý đã được giấu đi.'],
    ['Tìm cách phù hợp với mình', 'Thử lại, thay đổi liên kết và nhận ra cách nào giúp mình nhớ rõ hơn.'],
];

const faqs = [
    ['Chưa biết phương pháp nào thì bắt đầu ở đâu?', 'Bạn có thể bắt đầu bằng ‘Nối thành câu chuyện’, làm quen với ví dụ rồi thử một dãy hình ngắn.'],
    ['Có cần học hết ba phương pháp trước khi chơi không?', 'Không cần. Bạn có thể chọn ngay một cách mình thấy thích, thử một lượt rồi khám phá thêm sau.'],
    ['Nếu trẻ chưa nhớ đúng thì sao?', 'Chưa nhớ hết cũng hoàn toàn bình thường. Trò chơi giúp trẻ nhận ra chỗ mình quên để điều chỉnh câu chuyện hoặc hình ảnh.'],
    ['Luyện tập có giúp trẻ học giỏi hơn không?', 'Việc luyện tập giúp trẻ hình thành thói quen liên tưởng và sắp xếp thông tin có trật tự, từ đó tiếp thu bài học nhẹ nhàng hơn.'],
];

export const HomePage = () => {
    const [openFaq, setOpenFaq] = useState(0);

    return (
        <div className="min-h-screen bg-[#F8FBF8] font-sans text-[#1F2937]">
            <Header />
            <main>
                <HeroSection />
                <MethodsSection />
                <GameIntroSection />

                {/* Parents Section */}
                <section className="bg-[#F8FBF8] py-16 md:py-24">
                    <div className="mx-auto max-w-[1200px] px-5 md:px-0">
                        <div className="mb-10 max-w-[640px]">
                            <h2 className="text-[34px] font-bold leading-[1.2] text-[#1F2937] md:text-[44px]">
                                Con sẽ thực hành điều gì cùng Memio?
                            </h2>
                            <p className="mt-4 text-[15px] leading-[1.65] text-[#5F6B7A] md:text-[16px]">
                                Memio hướng dẫn trẻ làm quen với các cách ghi nhớ thông qua hình ảnh, câu chuyện và vị trí. Sau mỗi ví dụ, trẻ được thử vận dụng vào một nhiệm vụ nhỏ.
                            </p>
                        </div>
                        <div className="grid gap-5 md:grid-cols-3">
                            {parentPoints.map(([title, description], index) => (
                                <article key={title} className="rounded-[24px] bg-white p-7 shadow-sm">
                                    <span className="text-[13px] font-bold tracking-wider text-[#2E7D32]">0{index + 1}</span>
                                    <h3 className="mt-5 text-[20px] font-bold text-[#1F2937]">{title}</h3>
                                    <p className="mt-3 text-[14px] leading-relaxed text-[#5F6B7A]">{description}</p>
                                </article>
                            ))}
                        </div>
                        <div className="mt-6 flex flex-col md:flex-row items-start md:items-center gap-6 rounded-[24px] bg-[#EAF8EF] p-7 md:p-8">
                            <img 
                                src="/src/assets/memio/mascot.svg" 
                                alt="Mascot" 
                                className="h-16 w-auto shrink-0 object-contain"
                            />
                            <div>
                                <span className="text-[13px] font-semibold text-[#2E7D32]">
                                    Cùng con bắt đầu bằng một câu hỏi nhỏ
                                </span>
                                <h3 className="mt-1 text-[20px] font-bold text-[#1F2937]">
                                    “Con đã nghĩ ra câu chuyện gì để nhớ những hình này?”
                                </h3>
                                <p className="mt-2 text-[14px] leading-relaxed text-[#5F6B7A]">
                                    Bố mẹ có thể nghe con giải thích, cùng tạo một liên kết vui và để con tự thử lại.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-[#F8FBF8] py-16 md:py-24">
                    <div className="mx-auto max-w-[1200px] px-5 md:px-0">
                        <h2 className="text-[34px] font-bold leading-[1.2] text-[#1F2937] md:text-[44px]">
                            Bạn có thể đang thắc mắc
                        </h2>
                        <div className="mt-10 flex flex-col gap-4">
                            {faqs.map(([question, answer], index) => {
                                const isOpen = openFaq === index;
                                return (
                                    <div
                                        key={question}
                                        className={cn(
                                            "overflow-hidden rounded-[20px] border border-[#E3EBE6] transition-colors duration-200",
                                            isOpen ? "bg-[#EAF8EF]" : "bg-white"
                                        )}
                                    >
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between gap-6 p-6 text-left text-[16px] font-bold text-[#1F2937] md:text-[17px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] focus-visible:ring-inset rounded-[20px]"
                                            aria-expanded={isOpen}
                                            onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                        >
                                            <span>{question}</span>
                                            <span
                                                className="relative flex size-6 shrink-0 items-center justify-center text-[#2E7D32]"
                                                aria-hidden="true"
                                            >
                                                {/* Horizontal bar */}
                                                <span
                                                    className={cn(
                                                        "absolute h-[2px] w-4 rounded-full bg-[#2E7D32] transition-transform duration-200 ease-out",
                                                        isOpen ? "rotate-180" : "rotate-0"
                                                    )}
                                                />
                                                {/* Vertical bar morphing */}
                                                <span
                                                    className={cn(
                                                        "absolute h-4 w-[2px] rounded-full bg-[#2E7D32] transition-all duration-200 ease-out",
                                                        isOpen ? "rotate-90 scale-y-0 opacity-0" : "rotate-0 scale-y-100 opacity-100"
                                                    )}
                                                />
                                            </span>
                                        </button>
                                        {/* CSS Grid smooth accordion expansion */}
                                        <div
                                            className={cn(
                                                "grid transition-[grid-template-rows] duration-250 ease-out",
                                                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                            )}
                                        >
                                            <div className="overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "px-6 pb-6 pt-0 transition-opacity duration-200 ease-out",
                                                        isOpen ? "opacity-100" : "opacity-0"
                                                    )}
                                                >
                                                    <p className="text-[15px] leading-[1.65] text-[#5F6B7A]">
                                                        {answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="bg-[#F8FBF8] py-12 md:py-16">
                    <div className="mx-auto max-w-[1200px] px-5 md:px-0">
                        <div className="flex flex-col items-center rounded-[32px] bg-[#EAF8EF] px-6 py-16 text-center md:py-20">
                            <img
                                src="/src/assets/memio/mascot.svg"
                                alt="Mascot Memio"
                                className="h-20 w-auto object-contain"
                            />
                            <h2 className="mt-8 text-[32px] font-bold leading-[1.2] text-[#1F2937] md:text-[44px]">
                                Bắt đầu bằng một câu chuyện nhỏ nhé?
                            </h2>
                            <p className="mt-4 max-w-[540px] text-[15px] leading-relaxed text-[#5F6B7A] md:text-[16px]">
                                Khám phá cách ghi nhớ đầu tiên và thử sức với những lá bài.
                            </p>
                            <Link
                                to="/games"
                                className="mt-8 inline-flex h-[52px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-10 text-[15px] font-semibold text-white transition hover:bg-[#236527]"
                            >
                                Bắt đầu với Memio
                            </Link>
                            <div className="mt-5 text-[14px] text-[#5F6B7A]">
                                Đã có tài khoản?{" "}
                                <Link to="/login" className="font-semibold text-[#2E7D32] hover:underline">
                                    Đăng nhập
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#E3EBE6] bg-white py-14">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 md:flex-row md:items-start md:justify-between md:px-0">
                    <div>
                        <Link to="/" className="inline-block">
                            <img src="/src/assets/memio/Logo/Memio.svg" alt="Memio" className="h-[40px] w-auto object-contain" />
                        </Link>
                        <p className="mt-4 text-[14px] text-[#5F6B7A]">
                            Học cách ghi nhớ qua những trò chơi nhỏ.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-8 text-[14px] font-medium text-[#5F6B7A]">
                        <a href="#methods" className="transition hover:text-[#2E7D32]">
                            Giới thiệu
                        </a>
                        <button
                            type="button"
                            onClick={() => alert("Trang liên hệ đang được phát triển")}
                            className="transition hover:text-[#2E7D32]"
                        >
                            Liên hệ
                        </button>
                        <button
                            type="button"
                            onClick={() => alert("Điều khoản sử dụng đang được cập nhật")}
                            className="transition hover:text-[#2E7D32]"
                        >
                            Điều khoản
                        </button>
                        <button
                            type="button"
                            onClick={() => alert("Chính sách quyền riêng tư đang được cập nhật")}
                            className="transition hover:text-[#2E7D32]"
                        >
                            Quyền riêng tư
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
