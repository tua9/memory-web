import { useGameStore } from "../store/gameStore";
import { SettingsPhase } from "./SettingsPhase";
import { MemorizePhase } from "./MemorizePhase";
import { RecallPhase } from "./RecallPhase";
import { ResultPhase } from "./ResultPhase";

export const CardsGame = () => {
    const { phase } = useGameStore();

    if (phase === "idle") return <SettingsPhase />;
    if (phase === "memorize") return <MemorizePhase />;
    if (phase === "recall") return <RecallPhase />;
    if (phase === "result") return <ResultPhase />;

    return null;
};
