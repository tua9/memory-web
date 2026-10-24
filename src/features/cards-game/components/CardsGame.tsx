import { useAuthStore } from "@/features/auth/store/authStore";
import { LoginRequired } from "@/features/shared-game/components/LoginRequired";
import { useGameStore } from "../store/gameStore";
import { SettingsPhase } from "./SettingsPhase";
import { MemorizePhase } from "./MemorizePhase";
import { RecallPhase } from "./RecallPhase";
import { ResultPhase } from "./ResultPhase";

export const CardsGame = () => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const phase = useGameStore((state) => state.phase);

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#f5faf7]">Đang tải...</div>;
    }
    // Ván chơi được chấm và lưu ở backend nên tạm thời cần đăng nhập
    if (!isAuthenticated) return <LoginRequired gameTitle="Thẻ bài" />;

    let content = null;
    if (phase === "idle") content = <SettingsPhase />;
    else if (phase === "memorize") content = <MemorizePhase />;
    else if (phase === "recall") content = <RecallPhase />;
    else if (phase === "result") content = <ResultPhase />;

    return (
        <div className="min-h-screen bg-[#f5faf7]">
            {content}
        </div>
    );
};
