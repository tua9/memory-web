import { apiClient } from "@/lib/api-client";
import type { ImageCard } from "../types/imageTypes";

interface ImageApiResponse {
  status: string;
  message: string;
  data: {
    images: Array<{
      id: string;
      code: string;
      imageUrl: string;
      title?: string;
    }>;
    count: number;
  };
}

// Danh sách URL trực tiếp dự phòng (Unsplash CDN direct 200 OK, không 302 redirect)
// phòng trường hợp backend mất kết nối hoặc offline
const FALLBACK_DIRECT_IMAGES: ImageCard[] = [
  { id: "img_001", imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&h=400&q=80", name: "Chú chó vui vẻ" },
  { id: "img_002", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&h=400&q=80", name: "Mèo mướp vàng" },
  { id: "img_003", imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&h=400&q=80", name: "Chó Golden" },
  { id: "img_004", imageUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&h=400&q=80", name: "Cún con dễ thương" },
  { id: "img_005", imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&h=400&q=80", name: "Hồ nước và núi non" },
  { id: "img_006", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&h=400&q=80", name: "Sương mù trên đồi" },
  { id: "img_007", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&h=400&q=80", name: "Ánh nắng trong rừng" },
  { id: "img_008", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&h=400&q=80", name: "Bãi biển nhiệt đới" },
  { id: "img_009", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&h=400&q=80", name: "Dãy núi phủ tuyết" },
  { id: "img_010", imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&h=400&q=80", name: "Thuyền trên hồ xanh" },
  { id: "img_011", imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&h=400&q=80", name: "Mèo con mắt xanh" },
  { id: "img_012", imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&h=400&q=80", name: "Cây đơn độc trên đồng" },
  { id: "img_013", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=400&q=80", name: "Bát salad lành mạnh" },
  { id: "img_014", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&h=400&q=80", name: "Bánh pizza hấp dẫn" },
  { id: "img_015", imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&h=400&q=80", name: "Bánh pancake chuối" },
  { id: "img_016", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&h=400&q=80", name: "Salad rau xanh tươi mát" },
  { id: "img_017", imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&h=400&q=80", name: "Bữa tối ấm cúng" },
  { id: "img_018", imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&h=400&q=80", name: "Bánh ngọt tráng miệng" },
  { id: "img_019", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&h=400&q=80", name: "Tô bún rau củ" },
  { id: "img_020", imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&h=400&q=80", name: "Trái cây mùa hè" },
  { id: "img_021", imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&h=400&q=80", name: "Phòng khách ấm áp" },
  { id: "img_022", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=400&q=80", name: "Bàn làm việc hiện đại" },
  { id: "img_023", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&h=400&q=80", name: "Tòa cao ốc kính" },
  { id: "img_024", imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&h=400&q=80", name: "Nhiếp ảnh gia tác nghiệp" },
];

/**
 * Lấy danh sách ngẫu nhiên N ảnh từ API backend (lưu trong MongoDB).
 * Các URL ảnh là link trực tiếp đến CDN (không qua 302 redirect), giải quyết triệt để vấn đề giật/lag.
 */
export const fetchRandomImages = async (count: number, level: number = 1): Promise<ImageCard[]> => {
  try {
    const response = (await apiClient.get("/images/random", {
      params: { count, level },
    })) as unknown as ImageApiResponse;

    if (response?.data?.images && response.data.images.length > 0) {
      return response.data.images.map((item) => ({
        id: item.id || item.code,
        imageUrl: item.imageUrl,
      }));
    }
  } catch (error) {
    console.warn("⚠️ [ImageGameApi] Không thể kết nối API /images/random, chuyển sang dùng kho ảnh dự phòng trực tiếp:", error);
  }

  // Fallback nếu gọi API thất bại
  const shuffled = [...FALLBACK_DIRECT_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
