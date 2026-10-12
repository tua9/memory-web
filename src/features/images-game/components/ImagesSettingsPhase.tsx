import { useState } from "react";
import { useImagesGameStore } from "../store/imagesGameStore";
import { getImageCountForLevel } from "../utils/imageUtils";
import { GameSettingsLayout } from "@/components/layout/GameSettingsLayout";
import { ImagesPreferencesModal } from "./ImagesPreferencesModal";

export const ImagesSettingsPhase = () => {
    const { level, memorizeTime, setMemorizeTime, startGame } = useImagesGameStore();
    const [showPreferences, setShowPreferences] = useState(false);
    const imageCount = getImageCountForLevel(level);

    return (
        <>
            <GameSettingsLayout
                title="Hình ảnh"
                level={level}
                itemCount={imageCount}
                itemUnit="hình ảnh"
                memorizeTime={memorizeTime}
                setMemorizeTime={setMemorizeTime}
                onStart={startGame}
                onOpenPreferences={() => setShowPreferences(true)}
            />

            <ImagesPreferencesModal
                isOpen={showPreferences}
                onClose={() => setShowPreferences(false)}
            />
        </>
    );
};
