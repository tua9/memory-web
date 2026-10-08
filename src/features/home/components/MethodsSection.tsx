import { MethodCard } from "./MethodCard";

export const MethodsSection = () => {
    return (
        <section id="methods" className="w-full bg-white py-20 md:py-32">
            <div className="mx-auto max-w-[1440px] px-5 md:px-[120px]">
                <div className="mb-12 text-center md:mb-16">
                    <h2 className="text-[30px] md:text-[36px] leading-[40px] md:leading-[48px] font-bold text-[#1F2937]">
                        3 phương pháp ghi nhớ
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <MethodCard
                        title="Nối thành câu chuyện"
                        subtitle="Story Linking"
                    />
                    <MethodCard
                        title="Biến số thành hình"
                        subtitle="Number–Shape"
                    />
                    <MethodCard
                        title="Khám phá căn phòng trí nhớ"
                        subtitle="Method of Loci"
                    />
                </div>
            </div>
        </section>
    );
};
