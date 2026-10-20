export interface MethodCardProps {
    tag: string;
    title: string;
    subtitle: string;
    description: string;
    illustrationSrc: string;
    illustrationAlt: string;
    buttonLabel: string;
    isActive?: boolean;
    onSelect?: () => void;
}

export const MethodCard = ({
    tag,
    title,
    subtitle,
    description,
    illustrationSrc,
    illustrationAlt,
    buttonLabel,
    isActive = false,
    onSelect,
}: MethodCardProps) => {
    return (
        <article
            className={`flex flex-col justify-between h-full rounded-[24px] bg-white p-7 border-2 transition-[border-color,box-shadow] duration-200 ease-out ${
                isActive
                    ? "border-[#2E7D32] shadow-sm"
                    : "border-[#E3EBE6] hover:border-[#2E7D32]"
            }`}
        >
            <div>
                {/* Illustration box */}
                <div className="flex h-[130px] w-full items-center justify-center">
                    <img 
                        src={illustrationSrc} 
                        alt={illustrationAlt} 
                        className="max-h-[124px] w-auto object-contain"
                    />
                </div>

                {/* Tag */}
                <div className="mt-6 text-[13px] font-semibold text-[#2E7D32]">
                    {isActive ? `✓ Đang xem · ${tag}` : tag}
                </div>

                {/* Title */}
                <h3 className="mt-2 text-[22px] font-bold leading-tight text-[#1F2937]">
                    {title}
                </h3>

                {/* Subtitle */}
                <div className="mt-2 text-[14px] font-medium text-[#5F6B7A]">
                    {subtitle}
                </div>

                {/* Description */}
                <p className="mt-4 text-[14px] leading-[1.6] text-[#5F6B7A]">
                    {description}
                </p>
            </div>

            {/* CTA button */}
            <div className="mt-7">
                <button
                    type="button"
                    onClick={onSelect}
                    className={`flex h-[44px] w-full items-center justify-center rounded-[12px] border text-[14px] font-semibold transition-colors duration-200 ease-out ${
                        isActive
                            ? "border-[#2E7D32] bg-[#EAF8EF] text-[#2E7D32]"
                            : "border-[#E3EBE6] bg-white text-[#2E7D32] hover:bg-[#F0FAF3]"
                    }`}
                >
                    {buttonLabel}
                </button>
            </div>
        </article>
    );
};
