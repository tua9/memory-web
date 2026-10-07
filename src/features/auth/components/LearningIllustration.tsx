import type { ReactElement } from 'react';

type CardVariant = "book" | "numbers" | "space" | "game";

type IllustrationCard = {
    top: string;
    left: string;
    variant: CardVariant;
    image?: string;
    imageAlt?: string;
    label: string;
};

const cards: IllustrationCard[] = [
    {
        top: "top-[120px]",
        left: "left-[72px]",
        variant: "book",
        image: "https://c.animaapp.com/ici9nV0T/img/illustration---book.svg",
        imageAlt: "",
        label: "Câu chuyện",
    },
    {
        top: "top-[92px]",
        left: "left-[490px]",
        variant: "numbers",
        image: "https://c.animaapp.com/ici9nV0T/img/frame.svg",
        imageAlt: "",
        label: "Con số",
    },
    {
        top: "top-[430px]",
        left: "left-[470px]",
        variant: "space",
        image: "https://c.animaapp.com/ici9nV0T/img/frame-1.svg",
        imageAlt: "",
        label: "Không gian",
    },
    {
        top: "top-[470px]",
        left: "left-[72px]",
        variant: "game",
        image: "https://c.animaapp.com/ici9nV0T/img/illustration---cake.svg",
        imageAlt: "",
        label: "Trò chơi",
    },
];

const dots = [
    {
        className:
            "absolute top-40 left-[260px] w-[18px] h-[18px] bg-[#2e7d32] rounded-[9px]",
    },
    {
        className:
            "absolute top-[360px] left-[500px] w-3.5 h-3.5 bg-[#009e83] rounded-[7px]",
    },
    {
        className:
            "absolute top-[425px] left-[235px] w-3 h-3 bg-[#f4c95d] rounded-md",
    },
];

const getCardClassName = (variant: CardVariant): string => {
    if (variant === "numbers" || variant === "space") {
        return "absolute w-[150px] h-[124px] flex flex-col gap-[3px] bg-white rounded-2xl overflow-hidden border border-solid border-[#e3ebe6]";
    }
    return "absolute w-[150px] h-[124px] bg-white rounded-2xl overflow-hidden border border-solid border-[#e3ebe6]";
};

const IllustrationCard = ({
    top,
    left,
    variant,
    image,
    imageAlt = "",
    label,
}: IllustrationCard): ReactElement => {
    if (variant === "book") {
        return (
            <div className={`${top} ${left} ${getCardClassName(variant)}`}>
                <div className="absolute top-2.5 left-2.5 w-[130px] h-[90px] flex bg-[#ddf2e4] rounded-[11px] overflow-hidden">
                    <div className="mt-2.5 w-[130px] h-[34px] font-normal text-[#009e83] text-[32px] text-center leading-[34px] [font-family:'Be_Vietnam_Pro',Helvetica] tracking-[0]">
                        ▱
                    </div>
                </div>
                <div className="absolute top-[103px] left-0 w-[150px] [font-family:'Be_Vietnam_Pro',Helvetica] font-semibold text-[#1f2937] text-[11px] text-center tracking-[0] leading-[14px]">
                    {label}
                </div>
                {image ? (
                    <img
                        className="absolute top-0.5 left-[23px] w-[104px] h-[104px]"
                        alt={imageAlt}
                        src={image}
                    />
                ) : null}
            </div>
        );
    }

    if (variant === "numbers") {
        return (
            <div className={`${top} ${left} ${getCardClassName(variant)}`}>
                {image ? (
                    <img
                        className="ml-2.5 w-[130px] h-[90px] mt-2.5"
                        alt={imageAlt}
                        src={image}
                    />
                ) : null}
                <div className="h-3.5 [font-family:'Be_Vietnam_Pro',Helvetica] font-semibold text-[#1f2937] text-[11px] text-center tracking-[0] leading-[14px]">
                    {label}
                </div>
            </div>
        );
    }

    if (variant === "space") {
        return (
            <div className={`${top} ${left} ${getCardClassName(variant)}`}>
                {image ? (
                    <img
                        className="ml-2.5 w-[130px] h-[90px] mt-2.5"
                        alt={imageAlt}
                        src={image}
                    />
                ) : (
                    <div className="ml-2.5 w-[130px] h-[90px] mt-2.5 flex bg-[#eaf6fb] rounded-[11px] overflow-hidden">
                        <div className="mt-2 w-[130px] h-9 font-normal text-[#3fa7d6] text-[34px] text-center leading-9 [font-family:'Be_Vietnam_Pro',Helvetica] tracking-[0]">
                            ▯
                        </div>
                    </div>
                )}
                <div className="h-3.5 [font-family:'Be_Vietnam_Pro',Helvetica] font-semibold text-[#1f2937] text-[11px] text-center tracking-[0] leading-[14px]">
                    {label}
                </div>
            </div>
        );
    }

    return (
        <div className={`${top} ${left} ${getCardClassName(variant)}`}>
            {image ? (
                <>
                    <div className="absolute top-2.5 left-2.5 w-[130px] h-[90px] bg-[#f6d7c7] rounded-[11px]" />
                    <div className="absolute top-[103px] left-0 w-[150px] [font-family:'Be_Vietnam_Pro',Helvetica] font-semibold text-[#1f2937] text-[11px] text-center tracking-[0] leading-[14px]">
                        {label}
                    </div>
                    <img
                        className="absolute top-0 left-0 w-[150px] h-[124px]"
                        alt={imageAlt}
                        src={image}
                    />
                </>
            ) : (
                <>
                    <div className="ml-2.5 w-[130px] h-[90px] mt-2.5 flex bg-[#f5f8f6] rounded-[11px] overflow-hidden">
                        <div className="mt-2 w-[130px] h-8 font-bold text-[#2e7d32] text-3xl text-center leading-8 [font-family:'Be_Vietnam_Pro',Helvetica] tracking-[0]">
                            ✦
                        </div>
                    </div>
                    <div className="absolute top-[103px] left-0 w-[150px] [font-family:'Be_Vietnam_Pro',Helvetica] font-semibold text-[#1f2937] text-[11px] text-center tracking-[0] leading-[14px]">
                        {label}
                    </div>
                </>
            )}
        </div>
    );
};

export const LearningIllustrationSection = (): ReactElement => {
    return (
        <div className="relative w-[720px] h-[728px] shrink-0 hidden lg:block scale-90 xl:scale-100 origin-top-left">
            <div className="absolute top-[55px] left-[50px] w-[600px] h-[600px] bg-[#eaf8eff5] rounded-[300px] shadow-[inset_0px_4px_4px_#00000040]" />
            <div className="absolute top-5 left-[480px] w-[100px] h-[100px] bg-[#f4c95d7a] rounded-[50px]" />
            <div className="absolute top-[525px] left-[30px] w-[90px] h-[90px] bg-[#3fa7d629] rounded-[45px]" />
            <div className="absolute top-[500px] left-[535px] w-[95px] h-[95px] bg-[#f6d7c77a] rounded-[47.5px]" />
            {cards.map((card, index) => (
                <IllustrationCard
                    key={`${card.label}-${card.variant}-${index}`}
                    {...card}
                />
            ))}

            {dots.map((dot, index) => (
                <div
                    key={`dot-${index}`}
                    className={dot.className}
                    aria-hidden="true"
                />
            ))}

            <p className="absolute top-[610px] left-[190px] w-[340px] [font-family:'Be_Vietnam_Pro',Helvetica] font-semibold text-[#2e7d32] text-xs text-center tracking-[0] leading-[18px]">
                NHỚ THEO CÁCH CỦA BẠN
            </p>
            <p className="absolute top-[640px] left-[100px] w-[540px] [font-family:'Be_Vietnam_Pro',Helvetica] font-extrabold text-[#1f2937] text-3xl text-center tracking-[0] leading-[38px]">
                Chơi một chút.
                <br />
                Nhớ thêm một chút.
            </p>
            <img
                className="absolute top-[279px] left-[287px] w-[135px] h-[136px]"
                alt="Memio mascot"
                src="https://c.animaapp.com/ici9nV0T/img/memio-mascot.svg"
            />
        </div>
    );
};

export const LearningIllustration = LearningIllustrationSection;
