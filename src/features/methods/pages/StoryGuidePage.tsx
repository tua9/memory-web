import { useState } from "react";
import { MethodGuideLayout } from "../components/MethodGuideLayout";

export const StoryGuidePage = () => {
    // Interactive state for section 03
    const [isQuizRevealed, setIsQuizRevealed] = useState(false);

    const items = [
        { id: 1, name: "Mèo", src: "/src/assets/memio/game/card-cat.svg" },
        { id: 2, name: "Ô", src: "/src/assets/memio/game/card-umbrella.svg" },
        { id: 3, name: "Bánh", src: "/src/assets/memio/game/card-cake.svg" },
        { id: 4, name: "Xe đạp", src: "/src/assets/memio/game/card-bicycle.svg" },
    ];

    return (
        <MethodGuideLayout
            breadcrumbCurrent="Kể một câu chuyện để nối các hình"
            title="Kể một câu chuyện để nối các hình"
            description="Bạn có thể nhớ một dãy hình bằng cách cho chúng cùng xuất hiện trong một câu chuyện. Hình nào xuất hiện trước, hình nào xuất hiện sau là điều quan trọng. Câu chuyện không cần hợp lý ngoài đời; chỉ cần bạn hình dung được và kể lại theo đúng thứ tự."
            practiceLabel="Thử với 4 hình"
            practiceLink="/practice/story"
            backMethodParam="story"
            nextMethodLink="/methods/number-shape"
            nextMethodLabel="Xem kỹ thuật khác"
        >
            {/* 01 · Nhìn và gọi tên từng hình */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    01 · Nhìn và gọi tên từng hình
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Trước tiên, nhìn từng hình và gọi tên thành tiếng theo một chiều: Mèo → Ô → Bánh → Xe đạp. Đừng vội kể chuyện khi bạn còn chưa nhận ra đủ bốn hình. Số 1–4 bên dưới giúp bạn kiểm tra vị trí của từng hình.
                </p>

                {/* 4 Cards Box */}
                <div className="mt-6 rounded-[20px] bg-[#EAF8EF] p-6 md:p-8">
                    <div className="grid grid-cols-4 gap-2 sm:gap-6">
                        {items.map((it) => (
                            <div
                                key={it.id}
                                className="flex flex-col items-center justify-center p-2 text-center"
                            >
                                <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center">
                                    <img
                                        src={it.src}
                                        alt={it.name}
                                        width="56"
                                        height="56"
                                        className="h-12 w-12 md:h-14 md:w-14 object-contain"
                                    />
                                </div>
                                <span className="mt-2 md:mt-3 text-[12px] sm:text-[14px] font-semibold text-[#1F2937] whitespace-nowrap">
                                    {it.id} · {it.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 02 · Cho các hình tương tác */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    02 · Cho các hình tương tác
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Một danh sách bốn tên rất dễ lẫn thứ tự. Hãy cho hình trước tạo ra hành động dẫn đến hình sau: mèo cầm ô; ô hứng bánh từ trên rơi xuống; bánh lăn lên xe đạp. Càng nhìn rõ chuyển động trong đầu, bạn càng dễ tìm được hình kế tiếp.
                </p>

                {/* 3 Action Panels */}
                <div className="mt-6 space-y-4">
                    {/* Panel 1: Mèo cầm ô */}
                    <div className="relative rounded-[20px] bg-[#EAF8EF] p-5 md:p-6 min-h-[130px] md:min-h-[140px] flex items-center justify-center">
                        <img
                            src="/src/assets/memio/guides/story-cat-umbrella.svg"
                            alt="Mèo cầm ô"
                            className="h-16 md:h-20 w-auto max-w-[85%] object-contain"
                        />
                        <span className="absolute bottom-3 left-4 md:bottom-4 md:left-6 text-[13px] md:text-[15px] font-semibold text-[#1F2937]">
                            Mèo cầm ô
                        </span>
                    </div>

                    {/* Panel 2: Ô hứng bánh */}
                    <div className="relative rounded-[20px] bg-[#FFF7DF] p-5 md:p-6 min-h-[130px] md:min-h-[140px] flex items-center justify-center">
                        <img
                            src="/src/assets/memio/guides/story-umbrella-cake.svg"
                            alt="Ô hứng bánh"
                            className="h-16 md:h-20 w-auto max-w-[85%] object-contain"
                        />
                        <span className="absolute bottom-3 left-4 md:bottom-4 md:left-6 text-[13px] md:text-[15px] font-semibold text-[#1F2937]">
                            Ô hứng bánh
                        </span>
                    </div>

                    {/* Panel 3: Bánh lăn lên xe đạp */}
                    <div className="relative rounded-[20px] bg-[#EAF6FC] p-5 md:p-6 min-h-[130px] md:min-h-[140px] flex items-center justify-center">
                        <img
                            src="/src/assets/memio/guides/story-cake-bike.svg"
                            alt="Bánh lăn lên xe đạp"
                            className="h-16 md:h-20 w-auto max-w-[85%] object-contain"
                        />
                        <span className="absolute bottom-3 left-4 md:bottom-4 md:left-6 text-[13px] md:text-[15px] font-semibold text-[#1F2937]">
                            Bánh lăn lên xe đạp
                        </span>
                    </div>
                </div>
            </section>

            {/* 03 · Giấu hình và kể lại */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    03 · Giấu hình và kể lại
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Bây giờ che dãy hình lại. Bắt đầu từ mèo, lần theo từng hành động để gọi tên hình tiếp theo, rồi nói đủ bốn hình theo thứ tự. Hãy tự trả lời trước khi bấm “Hiện đáp án”; nếu nhìn đáp án quá sớm, bạn chưa biết đoạn nối nào mình thực sự nhớ được.
                </p>

                {/* Quiz Box */}
                <div className="mt-6 rounded-[20px] bg-[#EAF6FC] p-6 md:p-8">
                    <div className="grid grid-cols-4 gap-2 sm:gap-6">
                        {items.map((it) => (
                            <div key={it.id} className="flex flex-col items-center">
                                <div className="flex w-full items-center justify-center rounded-[16px] md:rounded-[20px] bg-white p-3 md:p-5 shadow-xs border border-[#E3EBE6] min-h-[80px] md:min-h-[110px]">
                                    {isQuizRevealed ? (
                                        <img
                                            src={it.src}
                                            alt={it.name}
                                            className="h-10 w-10 md:h-14 md:w-14 object-contain animate-in fade-in duration-200"
                                        />
                                    ) : (
                                        <span className="text-[26px] md:text-[32px] font-bold text-[#2E7D32]">
                                            ?
                                        </span>
                                    )}
                                </div>
                                <span className="mt-2 text-[12px] sm:text-[14px] font-bold text-[#1F2937] text-center">
                                    {isQuizRevealed ? `${it.id} · ${it.name}` : it.id}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[14px] text-[#5F6B7A]">
                            Tự kể lại trước khi chọn “Hiện đáp án”.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsQuizRevealed(!isQuizRevealed)}
                            className="h-[42px] px-6 rounded-[12px] bg-white border border-[#CDE8D5] text-[14px] font-semibold text-[#2E7D32] transition-colors duration-200 hover:bg-[#F0FAF3]"
                        >
                            {isQuizRevealed ? "Che lại để thử lại" : "Hiện đáp án"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Nếu bạn bị quên */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    Nếu bạn bị quên
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Nếu dừng ở “mèo cầm ô”, hãy quay lại đúng chỗ đứt: tưởng tượng chiếc ô bật mở và hứng chiếc bánh rơi xuống thật rõ. Sau đó kể lại từ mèo. Chỉ cần sửa đoạn nối khó nhớ, không cần nghĩ lại toàn bộ câu chuyện.
                </p>
            </section>

            {/* Liên hệ bộ bài Memio */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    Liên hệ bộ bài Memio
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Bộ Memio có 13 con vật và 4 mùa, tạo thành 52 lá khác nhau. Khi gặp lá “Mèo · Đông”, hãy kể chuyện với chú mèo đội mũ lông hoặc đi dưới tuyết. Hình mèo giúp nhớ con vật; dấu hiệu lạnh giúp nhớ mùa. Nếu chỉ nhớ “Mèo”, bạn vẫn có thể nhầm với ba lá Mèo ở các mùa khác.
                </p>

                {/* 2 Memio Cards */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                    <div className="w-[180px] shrink-0 transition-transform duration-200 hover:scale-[1.02]">
                        <img
                            src="/src/assets/memio/guides/card-cat-xuan.svg"
                            alt="Mèo Xuân · 04/13"
                            width="180"
                            height="190"
                            className="w-full h-auto object-contain drop-shadow-sm"
                        />
                    </div>
                    <div className="w-[180px] shrink-0 transition-transform duration-200 hover:scale-[1.02]">
                        <img
                            src="/src/assets/memio/guides/card-cat-dong.svg"
                            alt="Mèo Đông · 04/13"
                            width="180"
                            height="190"
                            className="w-full h-auto object-contain drop-shadow-sm"
                        />
                    </div>
                </div>
            </section>
        </MethodGuideLayout>
    );
};

export default StoryGuidePage;
