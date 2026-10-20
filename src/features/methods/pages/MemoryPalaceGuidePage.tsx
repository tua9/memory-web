import { useState } from "react";
import { MethodGuideLayout } from "../components/MethodGuideLayout";
import { cn } from "@/lib/utils";

export const MemoryPalaceGuidePage = () => {
    // Interactive state for section 02 (inspecting locations)
    const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
    // Interactive state for section 03 (quiz step)
    const [revealedQuiz, setRevealedQuiz] = useState<boolean>(false);

    const spotsInfo = [
        {
            id: 1,
            name: "Cửa phòng",
            item: "Quả táo",
            detail: "Quả táo khổng lồ đỏ mọng chắn ngay trước lối vào cửa.",
        },
        {
            id: 2,
            name: "Bàn học",
            item: "Mèo",
            detail: "Chú mèo lông vàng ngồi nghịch giữa quyển vở trên bàn.",
        },
        {
            id: 3,
            name: "Giường ngủ",
            item: "Quả bóng",
            detail: "Quả bóng xanh liên tục nảy tung tăng trên chiếc gối êm.",
        },
    ];

    return (
        <MethodGuideLayout
            breadcrumbCurrent="Đặt điều cần nhớ vào một nơi quen thuộc"
            title="Đặt điều cần nhớ vào một nơi quen thuộc"
            description="Hãy chọn một con đường mà bạn có thể đi qua trong trí tưởng tượng. Mỗi điểm trên đường sẽ giữ một hình cần nhớ. Khi muốn nhớ lại, bạn đi đúng con đường ấy lần nữa."
            practiceLabel="Khám phá căn phòng"
            practiceLink="/practice/loci"
            backMethodParam="loci"
            nextMethodLink="/methods/story-linking"
            nextMethodLabel="Xem kỹ thuật khác"
        >
            {/* 01 · Chọn tuyến đường */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    01 · Chọn tuyến đường
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Chọn ba nơi bạn gặp hằng ngày và hình dung một tuyến đi cố định: 1. Cửa phòng → 2. Bàn học → 3. Giường. Hãy thử đi qua ba điểm ấy trong đầu trước khi đặt hình vào. Nếu mỗi lần bạn đi một hướng khác, thứ tự đồ vật sẽ dễ bị đảo.
                </p>

                {/* Empty Room Diagram */}
                <div className="mt-6 overflow-hidden rounded-[20px] border border-[#DCEBF2] bg-[#EAF6FC] p-2 md:p-4">
                    <img
                        src="/src/assets/memio/guides/loci-room-empty.svg"
                        alt="Tuyến đường căn phòng: Cửa phòng → Bàn học → Giường"
                        width="944"
                        height="300"
                        className="w-full h-auto object-contain max-h-[320px]"
                    />
                </div>
            </section>

            {/* 02 · Đặt hình vào vị trí */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    02 · Đặt hình vào vị trí
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Danh sách cần nhớ là Táo → Mèo → Bóng. Đặt mỗi hình vào một điểm của tuyến đường: quả táo khổng lồ chắn cửa; chú mèo ngồi giữa vở trên bàn; quả bóng nảy trên gối ở giường. Kích thước hoặc chuyển động khác thường giúp bạn nhận ra hình ở đúng vị trí.
                </p>

                {/* Room with Items Diagram */}
                <div className="mt-6 overflow-hidden rounded-[20px] border border-[#CDE8D5] bg-[#EAF8EF] p-2 md:p-4">
                    <img
                        src="/src/assets/memio/guides/loci-room-items.svg"
                        alt="Đặt Táo, Mèo và Bóng vào các vị trí trong phòng"
                        width="944"
                        height="300"
                        className="w-full h-auto object-contain max-h-[320px]"
                    />
                </div>

                {/* Interactive Location Buttons */}
                <div className="mt-6">
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-medium text-[#2E7D32]">
                            Nhấn vào cửa, bàn học hoặc giường để xem từng vị trí.
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {spotsInfo.map((spot) => (
                            <button
                                key={spot.id}
                                type="button"
                                onClick={() => setSelectedSpot(selectedSpot === spot.id ? null : spot.id)}
                                className={cn(
                                    "flex flex-col text-left p-4 rounded-[16px] border transition-all duration-200",
                                    selectedSpot === spot.id
                                        ? "bg-[#EAF8EF] border-[#2E7D32] shadow-xs"
                                        : "bg-white border-[#E3EBE6] hover:bg-[#F8FBF8]"
                                )}
                            >
                                <span className="text-[13px] font-bold text-[#2E7D32]">
                                    {spot.id} · {spot.name}
                                </span>
                                <span className="mt-1 text-[15px] font-bold text-[#1F2937]">
                                    {spot.item}
                                </span>
                                <p className="mt-2 text-[13px] leading-relaxed text-[#5F6B7A]">
                                    {spot.detail}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 03 · Đi lại để nhớ */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    03 · Đi lại để nhớ
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Che danh sách ban đầu và đi lại tuyến đường trong đầu. Tại cửa, tự hỏi mình thấy gì; trả lời xong mới bước đến bàn, rồi đến giường. Hãy gọi tên hình theo từng vị trí trước khi chạm để kiểm tra, thay vì mở cả ba đáp án cùng lúc.
                </p>

                {/* Quiz Diagram with interactive reveal */}
                <div className="mt-6 overflow-hidden rounded-[20px] border border-[#F2E5C2] bg-[#FFF7DF] p-2 md:p-4">
                    <img
                        src={revealedQuiz ? "/src/assets/memio/guides/loci-room-items.svg" : "/src/assets/memio/guides/loci-room-quiz.svg"}
                        alt="Đi lại tuyến đường để nhớ"
                        width="944"
                        height="300"
                        className="w-full h-auto object-contain max-h-[320px] transition-all duration-300"
                    />
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[14px] text-[#5F6B7A]">
                        {revealedQuiz ? "Đã hiện cả ba đồ vật theo lộ trình." : "Tự gọi tên hình ở từng vị trí trước khi mở đáp án."}
                    </p>
                    <button
                        type="button"
                        onClick={() => setRevealedQuiz(!revealedQuiz)}
                        className="h-[42px] px-6 rounded-[12px] bg-white border border-[#DCEBF2] text-[14px] font-semibold text-[#2E7D32] transition-colors duration-200 hover:bg-[#F0FAF3]"
                    >
                        {revealedQuiz ? "Che lại để thử lại" : "Hiện đáp án cả 3 vị trí"}
                    </button>
                </div>
            </section>

            {/* Nếu bạn bị quên */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    Nếu bạn bị quên
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Nếu quên một hình, trước tiên nhớ điểm đặt nó: cửa, bàn hay giường. Sau đó làm hình ở đó lớn hơn hoặc chuyển động rõ hơn, chẳng hạn quả bóng liên tục nảy trên gối. Nếu nhớ đủ hình nhưng sai thứ tự, hãy đi lại đúng tuyến cửa → bàn → giường vài lần.
                </p>
            </section>

            {/* Liên hệ bộ bài Memio */}
            <section className="rounded-[24px] border border-[#E3EBE6] bg-white p-6 md:p-10 shadow-sm">
                <h2 className="text-[20px] font-bold text-[#1F2937] md:text-[24px]">
                    Liên hệ bộ bài Memio
                </h2>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#5F6B7A]">
                    Với lá Memio, mỗi điểm phải giữ đủ con vật và mùa. Hãy đặt “Mèo · Đông” đội mũ lông ở cửa, “Rùa · Hạ” phơi nắng trên bàn. Khi nhớ lại tuyến đường, nói cả hai phần của từng lá. Nếu chỉ thấy con mèo hoặc con rùa, bạn chưa đủ thông tin để chọn đúng lá trong 52 lá.
                </p>

                {/* 2 Memio Cards */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                    <div className="w-[180px] shrink-0 transition-transform duration-200 hover:scale-[1.02]">
                        <img
                            src="/src/assets/memio/guides/card-cat-dong.svg"
                            alt="Mèo Đông · 04/13"
                            width="180"
                            height="190"
                            className="w-full h-auto object-contain drop-shadow-sm"
                        />
                    </div>
                    <div className="w-[180px] shrink-0 transition-transform duration-200 hover:scale-[1.02]">
                        <img
                            src="/src/assets/memio/guides/card-turtle-ha.svg"
                            alt="Rùa Hạ · 13/13"
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

export default MemoryPalaceGuidePage;
