import { useImagesGameStore } from "../store/imagesGameStore";
import { ImagesSettingsPhase } from "./ImagesSettingsPhase";
import { ImagesMemorizePhase } from "./ImagesMemorizePhase";
import { ImagesRecallPhase } from "./ImagesRecallPhase";
import { ImagesResultPhase } from "./ImagesResultPhase";

export const ImagesGame = () => {
    const { phase } = useImagesGameStore();

    if (phase === "idle") return <ImagesSettingsPhase />;
    if (phase === "memorize") return <ImagesMemorizePhase />;
    if (phase === "recall") return <ImagesRecallPhase />;
    if (phase === "result") return <ImagesResultPhase />;

    return null;
};
