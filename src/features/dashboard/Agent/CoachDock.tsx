import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { X } from 'lucide-react';
import { Mascot } from '@/components/ui/Mascot';
import { useCoachPlan } from '../hooks/useOverview';
import { CoachChat } from './CoachChat';
import { applyCoachPlan, useCoachStore } from './coachStore';
import './coach.css';

// Hộp chat Huấn luyện viên nổi ở góc phải dưới trên mọi trang (chỉ khi đã đăng nhập, gắn ở RootLayout).
// Chỉ dựng phần chat sau lần mở đầu tiên (không gọi API khi chưa ai mở), rồi giữ lại để đóng/mở không mất hội thoại.
export const CoachDock = () => {
    const isOpen = useCoachStore((state) => state.isOpen);
    const setOpen = useCoachStore((state) => state.setOpen);
    const [hasOpened, setHasOpened] = useState(false);
    const [unread, setUnread] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const launcherRef = useRef<HTMLButtonElement>(null);

    // Cập nhật ngay trong lúc render khi vừa mở (thay vì trong effect)
    if (isOpen && !hasOpened) setHasOpened(true);
    if (isOpen && unread) setUnread(false);

    useEffect(() => {
        if (!isOpen) return;
        // Đợi một khung hình để ô nhập đã hiện (vừa bỏ inert) rồi mới đặt focus
        const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(frame);
    }, [isOpen]);

    const close = useCallback(() => {
        setOpen(false);
        launcherRef.current?.focus();
    }, [setOpen]);

    // Esc đóng hộp kể cả khi focus đã rơi ra ngoài (vd. nút gợi ý vừa biến mất sau khi bấm)
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, close]);

    return (
        <div className="coach-dock">
            <section
                className="coach-dock__panel"
                role="dialog"
                aria-labelledby="coach-dock-title"
                data-open={isOpen || undefined}
                inert={!isOpen}
            >
                <header className="coach-dock__head">
                    <Mascot className="coach-dock__avatar" />
                    <div>
                        <h2 id="coach-dock-title">Huấn luyện viên AI</h2>
                        <p>Lập và chỉnh lộ trình tập theo tiến độ của bạn</p>
                    </div>
                    <button type="button" className="coach-dock__close" onClick={close} aria-label="Đóng hộp chat">
                        <X size={20} aria-hidden="true" />
                    </button>
                </header>
                {hasOpened && <DockChat inputRef={inputRef} onReply={() => !useCoachStore.getState().isOpen && setUnread(true)} />}
                <p className="coach-dock__privacy">Tin nhắn và tóm tắt tiến độ được gửi tới Gemini (Google) để trả lời.</p>
            </section>

            <button
                ref={launcherRef}
                type="button"
                className="coach-dock__launcher"
                data-open={isOpen || undefined}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Đóng huấn luyện viên AI' : `Mở huấn luyện viên AI${unread ? ' (có trả lời mới)' : ''}`}
                onClick={() => (isOpen ? close() : setOpen(true))}
            >
                <Mascot className="coach-dock__launcher-face" />
                <X className="coach-dock__launcher-close" size={24} aria-hidden="true" />
                {unread && <span className="coach-dock__unread" aria-hidden="true" />}
            </button>
        </div>
    );
};

// Tách riêng để lộ trình đã lưu chỉ được tải khi hộp chat đã mở ít nhất một lần
const DockChat = ({ inputRef, onReply }: { inputRef: RefObject<HTMLInputElement | null>; onReply: () => void }) => {
    const plan = useCoachPlan();
    const planVersion = useCoachStore((state) => state.planVersion);
    const { reload } = plan;

    useEffect(() => {
        if (planVersion > 0) reload();
    }, [planVersion, reload]);

    return (
        <CoachChat
            savedPlan={plan.state.status === 'ready' ? plan.state.data : null}
            onApply={async (next) => { await applyCoachPlan(next); }}
            inputRef={inputRef}
            onReply={onReply}
        />
    );
};
