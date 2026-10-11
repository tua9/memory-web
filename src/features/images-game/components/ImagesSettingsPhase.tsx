import { useImagesGameStore } from "../store/imagesGameStore";
import { getImageCountForLevel } from "../utils/imageUtils";
import { GameSettingsLayout } from "@/components/layout/GameSettingsLayout";

export const ImagesSettingsPhase = () => {
    const { level, memorizeTime, setMemorizeTime, startGame } = useImagesGameStore();
    const imageCount = getImageCountForLevel(level);

    return (
        <GameSettingsLayout
            title="Hình ảnh"
            level={level}
            itemCount={imageCount}
            itemUnit="hình ảnh"
            memorizeTime={memorizeTime}
            setMemorizeTime={setMemorizeTime}
            onStart={startGame}
        />
    );
};
