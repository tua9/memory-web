import { type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { GameCatalogItem } from "@/features/shared-game/api/games.api";
import { PlayingCard } from "@/features/cards-game/components/PlayingCard";
import type { Card } from "@/features/cards-game/types/types";
import cat from "@/assets/memio/game/card-cat.svg";
import umbrella from "@/assets/memio/game/card-umbrella.svg";
import cake from "@/assets/memio/game/card-cake.svg";
import bicycle from "@/assets/memio/game/card-bicycle.svg";
import "@/features/shared-game/game.css";

const FAN_CARDS: Card[] = [
    { rank: "A", suit: "spades" },
    { rank: "7", suit: "hearts" },
    { rank: "Q", suit: "clubs" },
    { rank: "3", suit: "diamonds" },
    { rank: "K", suit: "hearts" },
];

const FAN_PICTURES = [cat, umbrella, cake, bicycle];

const FAN_DIGITS = ["2", "0", "8", "5", "1"];

const FAN_FACES = ["John", "Mary", "David", "Linh", "Mai"];

const FAN_WORDS = ["Bồ câu", "Hải đăng", "Kim tự tháp", "Gió mùa", "Hoa sen"];

const spread = (i: number, count: number) => ({ "--o": i - (count - 1) / 2 }) as CSSProperties;

interface GameProgressStat {
    gameName: string;
    unlockedLevel: number;
    stats: {
        played: number;
        totalCorrect: number;
        totalItems: number;
    };
}

interface ParentGameProgressProps {
    catalog: GameCatalogItem[] | null;
    progress?: GameProgressStat[];
}

interface PickProgress {
    unlocked: number;
    maxLevel: number;
    nextCount?: number;
    played?: number;
}

interface GamePickProps {
    to: string;
    variant: "cards" | "images" | "numbers" | "facename" | "words";
    title: string;
    description: string;
    unit: string;
    progress: PickProgress | null;
    fan: ReactNode;
}

const GamePick = ({ to, variant, title, description, unit, progress, fan }: GamePickProps) => {
    const unlocked = progress?.unlocked ?? 1;
    const maxLevel = progress?.maxLevel ?? 10;
    const nextCount = progress?.nextCount;

    return (
        <Link to={to} viewTransition className={`pick pick--${variant}`} aria-label={`${title}: cấp ${unlocked}/${maxLevel}`}>
            <div className="pick__table" aria-hidden="true">
                <div className="pick__fan">{fan}</div>
            </div>
            <div className="pick__body">
                <h2>{title}</h2>
                <p>{description}</p>
                <dl className="pick__facts">
                    <div>
                        <dt>Cấp đang mở</dt>
                        <dd>
                            {unlocked} / {maxLevel}
                        </dd>
                    </div>
                    {nextCount !== undefined && (
                        <div>
                            <dt>Ván tới</dt>
                            <dd>
                                {nextCount} {unit}
                            </dd>
                        </div>
                    )}
                    {progress?.played !== undefined && (
                        <div>
                            <dt>Đã chơi</dt>
                            <dd>{progress.played} ván</dd>
                        </div>
                    )}
                </dl>
                <ol className="pick__ladder" aria-hidden="true">
                    {Array.from({ length: maxLevel }, (_, i) => (
                        <li key={i} data-on={i < unlocked} />
                    ))}
                </ol>
                <span className="btn btn--brand pick__cta">
                    {unlocked > 1 ? `Chơi cùng con cấp ${unlocked}` : "Chơi cùng con"}
                    <ArrowRight size={18} aria-hidden="true" />
                </span>
            </div>
        </Link>
    );
};

export const ParentGameProgress = ({ catalog, progress }: ParentGameProgressProps) => {
    const getStats = (gameKey: string, defaultNextCount: number): PickProgress => {
        const cat = catalog?.find((c) => c.gameName === gameKey);
        const prog = progress?.find((p) => p.gameName === gameKey);
        const unlocked = cat?.player?.unlockedLevel ?? prog?.unlockedLevel ?? 1;
        const maxLevel = cat?.maxLevel ?? 10;
        const nextCount = cat?.levels?.[unlocked - 1]?.itemCount ?? defaultNextCount;
        const played = cat?.player?.played ?? prog?.stats?.played ?? 0;

        return {
            unlocked,
            maxLevel,
            nextCount,
            played,
        };
    };

    const wordProgress = getStats("word", 6);
    const faceProgress = getStats("facename", 6);
    const cardProgress = getStats("card", 5);
    const imageProgress = getStats("image", 6);
    const numberProgress = getStats("number", 8);

    return (
        <div className="arcade__games">
            <GamePick
                to="/parent/room"
                variant="words"
                title="Ghi nhớ từ"
                description="Ghi nhớ danh sách từ vựng theo thứ tự, rồi tự gõ lại từng từ chính xác."
                unit="từ"
                progress={wordProgress}
                fan={FAN_WORDS.map((word, i) => (
                    <span key={word} className="pwordtile" style={spread(i, FAN_WORDS.length)}>
                        {word}
                    </span>
                ))}
            />

            <GamePick
                to="/parent/room"
                variant="facename"
                title="Gương mặt & Tên"
                description="Gắn một tên gọi với một gương mặt, rồi nhớ lại khi vị trí được xáo trộn."
                unit="người"
                progress={faceProgress}
                fan={FAN_FACES.map((name, i) => (
                    <span key={name} className="pfacetile" style={spread(i, FAN_FACES.length)}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="" />
                    </span>
                ))}
            />

            <GamePick
                to="/parent/room"
                variant="cards"
                title="Thẻ bài"
                description="Nhớ thứ tự các lá bài, rồi tìm lại chúng trong bộ 52 lá."
                unit="lá"
                progress={cardProgress}
                fan={FAN_CARDS.map((card, i) => (
                    <span key={`${card.rank}${card.suit}`} style={spread(i, FAN_CARDS.length)}>
                        <PlayingCard card={card} size="sm" />
                    </span>
                ))}
            />

            <GamePick
                to="/parent/room"
                variant="images"
                title="Hình ảnh"
                description="Nhớ thứ tự các bức ảnh, rồi xếp chúng lại từ một bộ đã xáo trộn."
                unit="hình"
                progress={imageProgress}
                fan={FAN_PICTURES.map((src, i) => (
                    <span key={src} className="ptile" data-size="sm" style={spread(i, FAN_PICTURES.length)}>
                        <img src={src} alt="" />
                    </span>
                ))}
            />

            <GamePick
                to="/parent/room"
                variant="numbers"
                title="Ghi nhớ số"
                description="Nhớ một dãy chữ số dài theo đúng thứ tự, rồi gõ lại từng số."
                unit="chữ số"
                progress={numberProgress}
                fan={FAN_DIGITS.map((digit, i) => (
                    <span key={i} className="pick__digit" style={spread(i, FAN_DIGITS.length)}>
                        {digit}
                    </span>
                ))}
            />
        </div>
    );
};
