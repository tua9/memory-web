import { useState } from "react";
import { MethodGuideLayout } from "../components/MethodGuideLayout";

export const NumberShapeGuidePage = () => {
    // Interactive state for section 04 self-test
    const [isNumberHidden, setIsNumberHidden] = useState(false);

    const digitShapes = [
        { digit: "0", name: "Trứng", src: "/src/assets/memio/guides/num-0-egg.svg" },
        { digit: "1", name: "Nến", src: "/src/assets/memio/guides/num-1-candle.svg" },
        { digit: "2", name: "Thiên nga", src: "/src/assets/memio/guides/num-2-swan.svg" },
        { digit: "3", name: "Bướm", src: "/src/assets/memio/guides/num-3-butterfly.svg" },
        { digit: "4", name: "Cánh buồm", src: "/src/assets/memio/guides/num-4-boat.svg" },
        { digit: "5", name: "Móc câu", src: "/src/assets/memio/guides/num-5-hook.svg" },
        { digit: "6", name: "Anh đào", src: "/src/assets/memio/guides/num-6-cherry.svg" },
        { digit: "7", name: "Boomerang", src: "/src/assets/memio/guides/num-7-boomerang.svg" },
        { digit: "8", name: "Người tuyết", src: "/src/assets/memio/guides/num-8-snowman.svg" },
        { digit: "9", name: "Bóng bay", src: "/src/assets/memio/guides/num-9-balloon.svg" },
    ];

    return (
        <MethodGuideLayout
            breadcrumbCurrent="Cho mỗi con số một hình ảnh"
            title="Chuyển đổi số thành hình ảnh"
            description="Một con số có thể gợi ra một hình quen thuộc nhờ dáng của nó. Khi cần nhớ một dãy số, bạn đổi từng chữ số thành hình, nối các hình theo thứ tự rồi đổi chúng trở lại thành số."
            practiceLabel="Thử nhớ một dãy số"
            practiceLink="/practice/numbers"
            backMethodParam="numbers"
            nextMethodLink="/methods/memory-palace"
            nextMethodLabel="Xem kỹ thuật khác"
        >
            {/* 01 · Nhìn dáng số */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    01 · Nhìn dáng số
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Hãy nhìn nét giống nhau, không cần hai hình phải y hệt: đường cong của số 2 gợi cổ thiên nga; số 0 là một vòng kín như quả trứng; hai vòng chồng của số 8 gợi đầu và thân người tuyết. Mỗi lần thấy chữ số, thử gọi ngay hình tương ứng.
                </p>

                {/* 3 Pairs Box */}
                <div className="mt-6 rounded-[20px] bg-[#EAF6FC] p-6 md:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                        {/* 2 -> Thiên nga */}
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-[32px] font-bold text-[#2E7D32]">2</span>
                            <span className="text-[20px] font-bold text-[#2E7D32]">→</span>
                            <div className="flex items-center gap-3">
                                <img
                                    src="/src/assets/memio/guides/num-2-swan.svg"
                                    alt="Thiên nga"
                                    className="h-12 w-12 object-contain"
                                />
                                <span className="text-[15px] font-semibold text-[#1F2937]">Thiên nga</span>
                            </div>
                        </div>

                        {/* 0 -> Trứng */}
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-[32px] font-bold text-[#2E7D32]">0</span>
                            <span className="text-[20px] font-bold text-[#2E7D32]">→</span>
                            <div className="flex items-center gap-3">
                                <img
                                    src="/src/assets/memio/guides/num-0-egg.svg"
                                    alt="Trứng"
                                    className="h-12 w-12 object-contain"
                                />
                                <span className="text-[15px] font-semibold text-[#1F2937]">Trứng</span>
                            </div>
                        </div>

                        {/* 8 -> Người tuyết */}
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-[32px] font-bold text-[#2E7D32]">8</span>
                            <span className="text-[20px] font-bold text-[#2E7D32]">→</span>
                            <div className="flex items-center gap-3">
                                <img
                                    src="/src/assets/memio/guides/num-8-snowman.svg"
                                    alt="Người tuyết"
                                    className="h-12 w-12 object-contain"
                                />
                                <span className="text-[15px] font-semibold text-[#1F2937]">Người tuyết</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 02 · Tạo hình cho 0–9 */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    02 · Tạo hình cho 0–9
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Đây là mười hình gợi ý, từ 0 đến 9. Bạn có thể thay bằng hình quen thuộc hơn, nhưng khi đã chọn thì giữ cố định một hình cho mỗi chữ số. Nhờ vậy, lúc nhớ lại bạn đổi hình về số mà không phải đoán giữa nhiều đáp án.
                </p>

                {/* Grid 10 Items Box */}
                <div className="mt-6 rounded-[20px] bg-[#EAF8EF] p-6 md:p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-6 gap-x-4 md:gap-8">
                        {digitShapes.map((item) => (
                            <div
                                key={item.digit}
                                className="flex flex-col items-center justify-between p-2"
                            >
                                <span className="text-[16px] md:text-[18px] font-bold text-[#2E7D32] self-start pl-2">
                                    {item.digit}
                                </span>
                                <div className="my-2 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center">
                                    <img
                                        src={item.src}
                                        alt={item.name}
                                        width="48"
                                        height="48"
                                        className="h-12 w-12 md:h-14 md:w-14 object-contain"
                                    />
                                </div>
                                <span className="text-[13px] md:text-[14px] font-medium text-[#1F2937] text-center">
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 03 · Nhớ 208 */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    03 · Nhớ 208
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Để nhớ 208, đổi từng số theo thứ tự: 2 thành thiên nga, 0 thành trứng, 8 thành người tuyết. Hãy thấy thiên nga mang quả trứng đến tặng người tuyết. Khi nhớ lại, lần theo cảnh đó từ trái sang phải rồi đổi từng hình về chữ số.
                </p>

                {/* 208 Display Box */}
                <div className="mt-6 rounded-[20px] bg-[#FFF7DF] p-6 md:p-8">
                    <div className="grid grid-cols-3 gap-2 sm:gap-6">
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center">
                                <img
                                    src="/src/assets/memio/guides/num-2-swan.svg"
                                    alt="Thiên nga"
                                    className="h-12 w-12 md:h-14 md:w-14 object-contain"
                                />
                            </div>
                            <span className="mt-2 text-[13px] md:text-[14px] font-semibold text-[#1F2937]">
                                1 · Thiên nga
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center">
                                <img
                                    src="/src/assets/memio/guides/num-0-egg.svg"
                                    alt="Trứng"
                                    className="h-12 w-12 md:h-14 md:w-14 object-contain"
                                />
                            </div>
                            <span className="mt-2 text-[13px] md:text-[14px] font-semibold text-[#1F2937]">
                                2 · Trứng
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center">
                                <img
                                    src="/src/assets/memio/guides/num-8-snowman.svg"
                                    alt="Người tuyết"
                                    className="h-12 w-12 md:h-14 md:w-14 object-contain"
                                />
                            </div>
                            <span className="mt-2 text-[13px] md:text-[14px] font-semibold text-[#1F2937]">
                                3 · Người tuyết
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-[15px] font-bold text-[#2E7D32]">
                        Thiên nga → Trứng → Người tuyết → 2 → 0 → 8
                    </p>
                    <p className="mt-1 text-[14px] text-[#5F6B7A]">
                        Nếu đổi chỗ trứng và người tuyết, bạn sẽ nhớ thành 280.
                    </p>
                </div>
            </section>

            {/* 04 · Tự thử */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    04 · Tự thử
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Để là 2018. Nhìn dãy số, đổi từng chữ số thành hình theo đúng thứ tự, rồi chọn “Che dãy số”. Hãy tự viết hoặc nói đáp án trước khi mở. Số 2 vẫn là thiên nga như ở ví dụ 208; một số luôn dùng một hình.
                </p>

                {/* Big Number Test Container */}
                <div className="mt-6 max-w-[548px] mx-auto rounded-[20px] bg-[#EAF6FC] p-8 md:p-10 text-center">
                    <div className="text-[48px] md:text-[64px] font-extrabold tracking-widest text-[#1F2937] select-none transition-all duration-300">
                        {isNumberHidden ? (
                            <span className="text-[#2E7D32]">? ? ? ?</span>
                        ) : (
                            <span>2 0 1 8</span>
                        )}
                    </div>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => setIsNumberHidden(!isNumberHidden)}
                            className="h-[42px] px-6 rounded-[12px] bg-white border border-[#BCDCE8] text-[14px] font-semibold text-[#2E7D32] transition-colors duration-200 hover:bg-[#F0FAF3]"
                        >
                            {isNumberHidden ? "Xem dãy số" : "Che dãy số"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Lưu ý */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    Lưu ý
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Bắt đầu với dãy ngắn. Với dãy dài, chia thành nhóm nhỏ và nhớ thứ tự giữa các nhóm. Cách này giúp nhớ chữ số, nhưng không tự biểu diễn con vật và mùa trên lá Memio. Với bộ bài, bạn cần một hình rõ cho cả hai thông tin trên từng lá.
                </p>
            </section>

            {/* Liên hệ bộ bài Memio */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    Liên hệ bộ bài Memio
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Hai lá Mèo · Xuân và Mèo · Đông cùng con vật nhưng khác mùa. Con số 04 / 13 chỉ là vị trí Mèo trong nhóm con vật; nó chưa cho biết mùa. Khi nhớ bài Memio, hãy hình dung riêng con vật và dấu hiệu của mùa trên từng lá.
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

export default NumberShapeGuidePage;
