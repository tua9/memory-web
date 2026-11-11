import { useEffect, useState } from 'react';
import { RollingFigure } from '@/features/home/components/RollingFigure';

const Rolling = ({ value }: { value: string }) => {
    const [shown, setShown] = useState(false);
    useEffect(() => {
        // Hai khung hình: trình duyệt vẽ vị trí 0 trước rồi mới lăn tới giá trị
        let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setShown(true)); });
        return () => cancelAnimationFrame(frame);
    }, []);
    return (
        <span data-reveal className={shown ? 'rolling is-in' : 'rolling'}>
            <RollingFigure value={value} />
        </span>
    );
};

// Số lăn tới giá trị ngay khi hiện ra (kể cả khi dữ liệu tải xong sau trang), dùng chung cách lăn của trang chủ.
// Giá trị đổi (chuyển tuần, có trận mới) thì gắn lại và lăn lại.
export const RollingNumber = ({ value }: { value: number | string }) => <Rolling key={String(value)} value={String(value)} />;
