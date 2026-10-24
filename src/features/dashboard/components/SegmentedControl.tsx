interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedControlProps<T extends string> {
    label: string;
    options: readonly SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    size?: 'md' | 'sm';
}

export const SegmentedControl = <T extends string>({
    label,
    options,
    value,
    onChange,
    size = 'md',
}: SegmentedControlProps<T>) => (
    <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-[14px] border border-[#e3ebe6] bg-white p-1"
    >
        {options.map((option) => {
            const isActive = option.value === value;
            return (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onChange(option.value)}
                    className={`rounded-[10px] font-semibold transition-colors cursor-pointer ${
                        size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3.5 py-1.5 text-[13px]'
                    } ${
                        isActive
                            ? 'bg-[#2e7d32] text-white'
                            : 'text-[#667085] hover:bg-[#f3f8f4] hover:text-[#1f2937]'
                    }`}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);
