import type { ItemView } from "@/features/shared-game/api/games.api";
import type { ImageCard } from "../types/imageTypes";

// Backend gửi mã ảnh kèm đường dẫn; mã được dùng làm id và gửi lại khi nộp bài
export const imageFromView = (item: ItemView): ImageCard => ({
    id: item.code,
    imageUrl: item.imageUrl ?? "",
});
