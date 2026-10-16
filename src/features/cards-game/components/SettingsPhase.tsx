import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { getCardCountForLevel } from "../utils/cardUtils";
import { GameSettingsLayout } from "@/components/layout/GameSettingsLayout";
import { CardPreferencesModal } from "./CardPreferencesModal";

export const SettingsPhase = () => {
  const { level, memorizeTime, setMemorizeTime, startGame, preferences } =
    useGameStore();
  const [showPreferences, setShowPreferences] = useState(false);
  const cardCount = preferences.cardCount ?? getCardCountForLevel(level);

  return (
    <>
      <GameSettingsLayout
        title="Thẻ bài"
        level={level}
        itemCount={cardCount}
        itemUnit="thẻ bài"
        memorizeTime={memorizeTime}
        setMemorizeTime={setMemorizeTime}
        onStart={startGame}
        onOpenPreferences={() => setShowPreferences(true)}
      />
      {showPreferences && (
        <CardPreferencesModal
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </>
  );
};
