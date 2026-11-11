import { create } from 'zustand';
import { setQuery } from '@/lib/queryCache';
import { dashboardApi, type ApiCoachPlan } from '../api/dashboard.api';
import { COACH_PLAN_KEY } from '../hooks/useOverview';

// Hộp chat nổi dùng chung mọi trang: trạng thái mở/đóng, và planVersion tăng mỗi lần áp dụng lộ trình
// để khối Huấn luyện viên trên trang Tiến độ (nếu đang mở) tải lại tiến độ tuần.
interface CoachStore {
    isOpen: boolean;
    planVersion: number;
    setOpen: (isOpen: boolean) => void;
}

export const useCoachStore = create<CoachStore>((set) => ({
    isOpen: false,
    planVersion: 0,
    setOpen: (isOpen) => set({ isOpen }),
}));

export const applyCoachPlan = async (plan: ApiCoachPlan) => {
    const { data } = await dashboardApi.saveCoachPlan(plan);
    setQuery(COACH_PLAN_KEY, data.savedPlan);
    useCoachStore.setState((state) => ({ planVersion: state.planVersion + 1 }));
    return data.savedPlan;
};
