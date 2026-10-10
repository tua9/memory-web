import { Header } from '@/components/layout/Header';
import { useGameStore } from "../store/gameStore";
import { SettingsPhase } from "./SettingsPhase";
import { MemorizePhase } from "./MemorizePhase";
import { RecallPhase } from "./RecallPhase";
import { ResultPhase } from "./ResultPhase";

export const CardsGame = () => {
    const { phase } = useGameStore();

    let content = null;
    if (phase === "idle") content = <SettingsPhase />;
    else if (phase === "memorize") content = <MemorizePhase />;
    else if (phase === "recall") content = <RecallPhase />;
    else if (phase === "result") content = <ResultPhase />;

    return (
        <div className="min-h-screen bg-[#f5faf7]">
            <Header />
            {content}
        </div>
    );
};
