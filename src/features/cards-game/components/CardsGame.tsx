import {
    createDeck,
    shuffle,
    getCardCountForLevel,
} from "@/features/cards-game/utils/cardUtils";
import { useState } from "react";
import { Timer } from "./Timer";
import { PlayingCard } from "./PlayingCard";

export const CardsGame = () => {
    const [selectedCards] = useState(() => {
        const deck = shuffle(createDeck());
        const cardCount = getCardCountForLevel(3);

        return deck.slice(0, cardCount);
    });
    return (
        <>
            <div>Deck: {selectedCards.length} cards</div>
            <Timer />
            <div className="flex flex-wrap gap-3 p-4">
                {selectedCards.map((card) => (
                    <PlayingCard
                        key={`${card.suit}-${card.rank}`}
                        card={card}
                        size="medium"
                    />
                ))}
            </div>
        </>
    );
};
