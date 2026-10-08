export interface MethodCardProps {
    title: string;
    subtitle: string;
    description?: string;
    imagePlaceholderHeight?: string;
}

export const MethodCard = ({ title, subtitle, description, imagePlaceholderHeight = "200px" }: MethodCardProps) => {
    return (
        <div className="flex flex-col overflow-hidden rounded-[24px] bg-white border border-[#E3EBE6] shadow-sm transition hover:shadow-md">
            {/* Image placeholder - chừa chỗ cho ảnh thực tế */}
            <div 
                className="w-full bg-[#F8FBF8] flex items-center justify-center border-b border-[#E3EBE6]"
                style={{ height: imagePlaceholderHeight }}
            >
                <span className="text-[#5F6B7A] text-sm italic">[Vùng ảnh thiết kế - Đang chờ Asset]</span>
            </div>
            
            <div className="flex flex-col p-6 md:p-8 flex-1">
                <div className="text-[14px] font-bold tracking-wider text-[#2E7D32] uppercase mb-2">
                    {subtitle}
                </div>
                <h3 className="text-[24px] font-bold text-[#1F2937] leading-tight mb-4">
                    {title}
                </h3>
                <p className="text-[16px] text-[#5F6B7A] flex-1">
                    {description || "[Nội dung mô tả đang chờ cập nhật...]"}
                </p>
                <div className="mt-6">
                    <button className="text-[16px] font-semibold text-[#2E7D32] hover:text-[#236527] transition flex items-center gap-2">
                        Tìm hiểu thêm
                        <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
