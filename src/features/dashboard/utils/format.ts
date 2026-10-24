import type { ApiTimelineBucket } from '../api/dashboard.api';
import type { Period, PeriodBucket } from '../types';

// Số kỳ do backend quyết định, nhãn được ghép theo số kỳ nhận về
export const describePeriod = (period: Period, count: number) => {
    const unit = period === 'week' ? 'tuần' : 'tháng';
    return {
        label: `${count} ${unit} gần nhất`,
        compareLabel: `so với ${count} ${unit} trước`,
    };
};

const pad = (value: number) => String(value).padStart(2, '0');

// Đọc ngày/tháng/năm theo múi giờ backend dùng để chia kỳ, để nhãn đúng dù trình duyệt ở múi giờ khác
const datePartsIn = (date: Date, timeZone: string) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(date);
    const valueOf = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    return { day: valueOf('day'), month: valueOf('month'), year: valueOf('year') };
};

const formatDayMonth = (date: Date, timeZone: string) => {
    const { day, month } = datePartsIn(date, timeZone);
    return `${pad(day)}/${pad(month)}`;
};

// Đổi một kỳ backend trả về thành cột trên biểu đồ
export const toPeriodBucket = (bucket: ApiTimelineBucket, period: Period, timeZone: string): PeriodBucket => {
    const start = new Date(bucket.start);

    if (period === 'week') {
        // Ngày cuối tuần = mốc kết thúc lùi 1 ms
        const lastDay = new Date(new Date(bucket.end).getTime() - 1);
        return {
            key: bucket.start,
            label: formatDayMonth(start, timeZone),
            fullLabel: `Tuần ${formatDayMonth(start, timeZone)} – ${formatDayMonth(lastDay, timeZone)}`,
            byGame: bucket.byGame,
        };
    }

    const { month, year } = datePartsIn(start, timeZone);
    return {
        key: bucket.start,
        label: `Th${month}`,
        fullLabel: `Tháng ${month}/${year}`,
        byGame: bucket.byGame,
    };
};

export const formatPercent = (value: number | null) =>
    value === null ? '—' : `${Math.round(value * 100)}%`;

export const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
};

export const formatClock = (seconds: number) => `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export const formatDateTime = (date: Date) => dateTimeFormatter.format(date);
