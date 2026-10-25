import { useAuthStore } from "@/features/auth/store/authStore";
import { LoginRequired } from "@/features/shared-game/components/LoginRequired";
import { useImagesGameStore } from "../store/imagesGameStore";
import { ImagesSettingsPhase } from "./ImagesSettingsPhase";
import { ImagesMemorizePhase } from "./ImagesMemorizePhase";
import { ImagesRecallPhase } from "./ImagesRecallPhase";
import { ImagesResultPhase } from "./ImagesResultPhase";

export const ImagesGame = () => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const phase = useImagesGameStore((state) => state.phase);

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#f5faf7]">Đang tải...</div>;
    }
    // Ván chơi được chấm và lưu ở backend nên tạm thời cần đăng nhập
    if (!isAuthenticated) return <LoginRequired gameTitle="Hình ảnh" />;

    let content = null;
    if (phase === "idle") content = <ImagesSettingsPhase />;
    if (phase === "memorize") content = <ImagesMemorizePhase />;
    if (phase === "recall") content = <ImagesRecallPhase />;
    if (phase === "result") content = <ImagesResultPhase />;

    return (
        <div className="min-h-screen bg-[#f5faf7]">
            {content}
        </div>
    );
};
