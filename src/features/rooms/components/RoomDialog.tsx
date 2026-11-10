import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

// Hộp thoại giữa màn hình bằng <dialog> của trình duyệt: tự giữ focus bên trong, Esc để đóng, nền phía sau bị che
export const RoomDialog = ({ open, onClose, labelledBy, wide = false, children }: {
    open: boolean;
    onClose: () => void;
    labelledBy: string;
    wide?: boolean;
    children: ReactNode;
}) => {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
            // Đưa focus vào nút chính của hộp thoại thay vì nút đóng
            dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
        }
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog ref={ref} className="room-dialog" data-wide={wide} aria-labelledby={labelledBy}
            onClose={() => { if (open) onClose(); }}
            // Bấm ra vùng tối bên ngoài cũng đóng
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <button type="button" className="room-dialog__close" aria-label="Đóng" onClick={onClose}>
                <X size={18} aria-hidden="true" />
            </button>
            {open && children}
        </dialog>
    );
};
