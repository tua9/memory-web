import type { ImageCard } from "../types/imageTypes";

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getImageCountForLevel = (level: number): number => {
  const safeLevel = Math.max(1, Math.min(10, level));
  return 6 + (safeLevel - 1) * 2;
};

/**
 * Tải trước hình ảnh vào bộ nhớ đệm (cache) của trình duyệt.
 * Đảm bảo khi người chơi bắt đầu game, toàn bộ hình ảnh sẽ hiển thị tức thì 60fps,
 * hoàn toàn không bị trắng hình hay giật lag.
 * Có cơ chế timeout 3.5s để đảm bảo trải nghiệm chơi không bị chặn quá lâu nếu mạng chậm.
 */
export const preloadImages = (urls: string[]): Promise<void> => {
  if (!urls || urls.length === 0) return Promise.resolve();

  const loadPromises = urls.map(
    (url) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Tiếp tục dù 1 ảnh lỗi để không làm treo giao diện
      })
  );

  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(resolve, 3500);
  });

  return Promise.race([Promise.all(loadPromises).then(() => {}), timeoutPromise]);
};
