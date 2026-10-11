import { useGameStore } from "../store/gameStore";
import { getCardCountForLevel } from "../utils/cardUtils";
import { GameSettingsLayout } from "@/components/layout/GameSettingsLayout";

export const SettingsPhase = () => {
    const { level, memorizeTime, setMemorizeTime, startGame } = useGameStore();
    const cardCount = getCardCountForLevel(level);

    return (
        <GameSettingsLayout
            title="Thẻ bài"
            level={level}
            itemCount={cardCount}
            itemUnit="thẻ bài"
            memorizeTime={memorizeTime}
            setMemorizeTime={setMemorizeTime}
            onStart={startGame}
        />
    );
};
