import { useImagesGameStore } from "../store/imagesGameStore";
import { ImagesSettingsPhase } from "./ImagesSettingsPhase";
import { ImagesMemorizePhase } from "./ImagesMemorizePhase";
import { ImagesRecallPhase } from "./ImagesRecallPhase";
import { ImagesResultPhase } from "./ImagesResultPhase";

export const ImagesGame = () => {
    const { phase } = useImagesGameStore();
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
