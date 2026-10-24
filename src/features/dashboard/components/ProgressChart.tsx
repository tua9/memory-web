import { useCallback, useState } from 'react';
import { CHART_COLORS, GAME_META } from '../constants';
import { formatPercent } from '../utils/format';
import type { ChartMetric, GameId, PeriodBucket } from '../types';
import { SegmentedControl } from './SegmentedControl';

const HEIGHT = 240;
const MARGIN = { top: 20, right: 44, bottom: 28, left: 40 };
const MAX_BAR_WIDTH = 24;
const SEGMENT_GAP = 2;

// Vẽ SVG theo đúng số pixel của khung để chữ không bị co giãn trên màn hình nhỏ.
// Callback ref để vẫn đo đúng khi khung được tạo lại (chuyển Bảng ↔ Biểu đồ).
const useElementWidth = <T extends HTMLElement>() => {
    const [width, setWidth] = useState(0);

    const ref = useCallback((element: T | null) => {
        if (!element) return;
        setWidth(element.getBoundingClientRect().width);
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return [ref, width] as const;
};

// Bước chia trục tròn số: 1, 2, 5, 10, 20, 50...
const niceStep = (raw: number) => {
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const normalized = raw / magnitude;
    return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
};

const valueOf = (bucket: PeriodBucket, game: GameId, metric: ChartMetric) =>
    metric === 'accuracy' ? bucket.byGame[game].accuracy : bucket.byGame[game].played;

const formatValue = (value: number | null, metric: ChartMetric) => {
    if (value === null) return 'Chưa chơi';
    return metric === 'accuracy' ? formatPercent(value) : `${value} ván`;
};

// Cột chỉ bo tròn 4px ở đầu dữ liệu, vuông ở đường gốc
const columnPath = (x: number, top: number, bottom: number, width: number, rounded: boolean) => {
    const radius = rounded ? Math.min(4, width / 2, bottom - top) : 0;
    return `M${x},${bottom}V${top + radius}A${radius},${radius} 0 0 1 ${x + radius},${top}` +
        `H${x + width - radius}A${radius},${radius} 0 0 1 ${x + width},${top + radius}V${bottom}Z`;
};

interface ProgressChartProps {
    title: string;
    description: string;
    metric: ChartMetric;
    buckets: PeriodBucket[];
    games: readonly GameId[];
}

export const ProgressChart = ({ title, description, metric, buckets, games }: ProgressChartProps) => {
    const [containerRef, width] = useElementWidth<HTMLDivElement>();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [view, setView] = useState<'chart' | 'table'>('chart');

    const isLine = metric === 'accuracy';
    const hasData = buckets.some((bucket) => games.some((game) => bucket.byGame[game].played > 0));

    // Trục Y: độ chính xác luôn 0–100%; số ván làm tròn lên bước chia đẹp
    const totals = buckets.map((bucket) => games.reduce((sum, game) => sum + bucket.byGame[game].played, 0));
    const countStep = Math.max(1, niceStep(Math.max(1, ...totals) / 4));
    const yMax = isLine ? 1 : Math.ceil(Math.max(1, ...totals) / countStep) * countStep;
    const yStep = isLine ? 0.25 : countStep;
    const ticks = Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, index) => index * yStep);

    const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
    const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
    const band = buckets.length ? plotWidth / buckets.length : 0;
    const xCenter = (index: number) => MARGIN.left + band * (index + 0.5);
    const y = (value: number) => MARGIN.top + plotHeight - (value / yMax) * plotHeight;
    const barWidth = Math.min(MAX_BAR_WIDTH, band * 0.6);
    const labelEvery = band >= 40 ? 1 : 2;

    // Đường bị ngắt ở tuần/tháng không chơi, thay vì nối qua khoảng trống
    const linePath = (game: GameId) => {
        let path = '';
        let penDown = false;
        buckets.forEach((bucket, index) => {
            const value = valueOf(bucket, game, metric);
            if (value === null) {
                penDown = false;
                return;
            }
            path += `${penDown ? 'L' : 'M'}${xCenter(index)},${y(value)}`;
            penDown = true;
        });
        return path;
    };

    // Nhãn giá trị ở cuối đường, đặt trong lề phải nên chỉ dùng cho điểm ở kỳ gần nhất.
    // Bỏ nhãn nếu hai đường quá gần nhau (khi đó dùng chú thích + tooltip).
    const lastIndex = buckets.length - 1;
    const endLabels = isLine && lastIndex >= 0
        ? games.flatMap((game) => {
            const value = valueOf(buckets[lastIndex], game, metric);
            return value === null ? [] : [{ game, x: xCenter(lastIndex), y: y(value), value }];
        })
        : [];
    const showEndLabels = endLabels.every((label, index) =>
        endLabels.slice(index + 1).every((other) => Math.abs(other.y - label.y) >= 14),
    );

    const activeBucket = activeIndex === null ? null : buckets[activeIndex];
    // Tooltip nằm cạnh dải đang hover (bên phải ở nửa trái, bên trái ở nửa phải) để không che dữ liệu
    const tooltipOnRight = activeIndex !== null && xCenter(activeIndex) < width / 2;
    const tooltipStyle = activeIndex === null
        ? {}
        : tooltipOnRight
            ? { left: xCenter(activeIndex) + band / 2 + 4 }
            : { left: xCenter(activeIndex) - band / 2 - 4, transform: 'translateX(-100%)' };
    const subtitle = games.length === 1 ? `${description} · ${GAME_META[games[0]].label}` : description;

    return (
        <section className="rounded-[24px] border border-[#e3ebe6] bg-white p-5 shadow-[0px_8px_24px_rgba(31,77,51,0.06)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-[17px] font-bold text-[#1f2937]">{title}</h2>
                    <p className="mt-0.5 text-[13px] text-[#667085]">{subtitle}</p>
                </div>
                <SegmentedControl
                    label={`Cách hiển thị ${title.toLowerCase()}`}
                    size="sm"
                    value={view}
                    onChange={setView}
                    options={[
                        { value: 'chart', label: 'Biểu đồ' },
                        { value: 'table', label: 'Bảng' },
                    ]}
                />
            </div>

            {games.length > 1 && (
                <ul className="mt-4 flex flex-wrap gap-4 text-[12px] text-[#667085]">
                    {games.map((game) => (
                        <li key={game} className="flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className={isLine ? 'h-[2px] w-4 rounded-full' : 'h-2.5 w-2.5 rounded-[3px]'}
                                style={{ backgroundColor: GAME_META[game].color }}
                            />
                            {GAME_META[game].label}
                        </li>
                    ))}
                </ul>
            )}

            {view === 'table' ? (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[320px] text-left text-[13px]">
                        <thead className="text-[12px] text-[#667085]">
                            <tr className="border-b border-[#e3ebe6]">
                                <th className="py-2 pr-3 font-medium">Thời gian</th>
                                {games.map((game) => (
                                    <th key={game} className="py-2 pr-3 text-right font-medium">{GAME_META[game].label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="tabular-nums text-[#1f2937]">
                            {buckets.map((bucket) => (
                                <tr key={bucket.key} className="border-b border-[#f0f4f1] last:border-0">
                                    <td className="py-2 pr-3">{bucket.fullLabel}</td>
                                    {games.map((game) => (
                                        <td key={game} className="py-2 pr-3 text-right">
                                            {formatValue(valueOf(bucket, game, metric), metric)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div ref={containerRef} className="relative mt-4" style={{ height: HEIGHT }}>
                    {!hasData && (
                        <p className="absolute inset-0 flex items-center justify-center text-[13px] text-[#667085]">
                            Chưa có ván chơi nào trong khoảng thời gian này.
                        </p>
                    )}

                    {width > 0 && hasData && (
                        <svg width={width} height={HEIGHT} role="img" aria-label={`${title}: ${subtitle}`}>
                            {/* Lưới ngang và nhãn trục Y */}
                            {ticks.map((tick) => (
                                <g key={tick}>
                                    <line
                                        x1={MARGIN.left}
                                        x2={MARGIN.left + plotWidth}
                                        y1={y(tick)}
                                        y2={y(tick)}
                                        stroke={tick === 0 ? CHART_COLORS.baseline : CHART_COLORS.grid}
                                        strokeWidth={1}
                                    />
                                    <text
                                        x={MARGIN.left - 8}
                                        y={y(tick)}
                                        textAnchor="end"
                                        dominantBaseline="middle"
                                        fontSize={11}
                                        fill={CHART_COLORS.axisText}
                                        className="tabular-nums"
                                    >
                                        {isLine ? formatPercent(tick) : tick}
                                    </text>
                                </g>
                            ))}

                            {/* Nhãn trục X */}
                            {buckets.map((bucket, index) =>
                                index % labelEvery === (buckets.length - 1) % labelEvery ? (
                                    <text
                                        key={bucket.key}
                                        x={xCenter(index)}
                                        y={HEIGHT - 8}
                                        textAnchor="middle"
                                        fontSize={11}
                                        fill={CHART_COLORS.axisText}
                                    >
                                        {bucket.label}
                                    </text>
                                ) : null,
                            )}

                            {/* Vùng đang hover */}
                            {activeIndex !== null && (isLine ? (
                                <line
                                    x1={xCenter(activeIndex)}
                                    x2={xCenter(activeIndex)}
                                    y1={MARGIN.top}
                                    y2={MARGIN.top + plotHeight}
                                    stroke={CHART_COLORS.baseline}
                                    strokeWidth={1}
                                />
                            ) : (
                                <rect
                                    x={MARGIN.left + band * activeIndex}
                                    y={MARGIN.top}
                                    width={band}
                                    height={plotHeight}
                                    fill={CHART_COLORS.hoverWash}
                                />
                            ))}

                            {isLine ? (
                                games.map((game) => (
                                    <g key={game}>
                                        <path
                                            d={linePath(game)}
                                            fill="none"
                                            stroke={GAME_META[game].color}
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                        />
                                        {buckets.map((bucket, index) => {
                                            const value = valueOf(bucket, game, metric);
                                            return value === null ? null : (
                                                <circle
                                                    key={bucket.key}
                                                    cx={xCenter(index)}
                                                    cy={y(value)}
                                                    r={activeIndex === index ? 5 : 4}
                                                    fill={GAME_META[game].color}
                                                    stroke={CHART_COLORS.surface}
                                                    strokeWidth={2}
                                                />
                                            );
                                        })}
                                    </g>
                                ))
                            ) : (
                                // Cột chồng theo game, cách nhau 2px; tổng số ván ở đỉnh cột
                                buckets.map((bucket, index) => {
                                    const x = xCenter(index) - barWidth / 2;
                                    const visible = games.filter((game) => bucket.byGame[game].played > 0);
                                    let base = 0;
                                    return (
                                        <g key={bucket.key}>
                                            {visible.map((game, order) => {
                                                const value = bucket.byGame[game].played;
                                                const bottom = y(base) - (order > 0 ? SEGMENT_GAP : 0);
                                                const top = y(base + value);
                                                base += value;
                                                return bottom - top > 0 ? (
                                                    <path
                                                        key={game}
                                                        d={columnPath(x, top, bottom, barWidth, order === visible.length - 1)}
                                                        fill={GAME_META[game].color}
                                                    />
                                                ) : null;
                                            })}
                                            {base > 0 && band >= 28 && (
                                                <text
                                                    x={xCenter(index)}
                                                    y={y(base) - 6}
                                                    textAnchor="middle"
                                                    fontSize={11}
                                                    fontWeight={600}
                                                    fill={CHART_COLORS.ink}
                                                    className="tabular-nums"
                                                >
                                                    {base}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })
                            )}

                            {showEndLabels && endLabels.map((label) => (
                                <text
                                    key={label.game}
                                    x={label.x + 9}
                                    y={label.y}
                                    dominantBaseline="middle"
                                    fontSize={11}
                                    fontWeight={600}
                                    fill={CHART_COLORS.ink}
                                    className="tabular-nums"
                                >
                                    {formatPercent(label.value)}
                                </text>
                            ))}

                            {/* Vùng bắt hover/focus: cả dải tuần/tháng, lớn hơn điểm hoặc cột */}
                            {buckets.map((bucket, index) => (
                                <rect
                                    key={bucket.key}
                                    x={MARGIN.left + band * index}
                                    y={MARGIN.top}
                                    width={band}
                                    height={plotHeight}
                                    fill="transparent"
                                    tabIndex={0}
                                    aria-label={`${bucket.fullLabel}: ${games
                                        .map((game) => `${GAME_META[game].label} ${formatValue(valueOf(bucket, game, metric), metric)}`)
                                        .join(', ')}`}
                                    className="outline-none"
                                    onPointerEnter={() => setActiveIndex(index)}
                                    onPointerLeave={() => setActiveIndex(null)}
                                    onFocus={() => setActiveIndex(index)}
                                    onBlur={() => setActiveIndex(null)}
                                />
                            ))}
                        </svg>
                    )}

                    {activeBucket && (
                        <div
                            role="tooltip"
                            className="pointer-events-none absolute top-0 z-10 min-w-[150px] whitespace-nowrap rounded-[12px] border border-[#e3ebe6] bg-white px-3 py-2 text-[12px] shadow-[0px_8px_24px_rgba(31,77,51,0.12)]"
                            style={tooltipStyle}
                        >
                            <p className="mb-1.5 text-[#667085]">{activeBucket.fullLabel}</p>
                            {games.map((game) => (
                                <p key={game} className="flex items-center gap-2">
                                    <span
                                        aria-hidden="true"
                                        className="h-[2px] w-3 rounded-full"
                                        style={{ backgroundColor: GAME_META[game].color }}
                                    />
                                    <strong className="tabular-nums text-[#1f2937]">
                                        {formatValue(valueOf(activeBucket, game, metric), metric)}
                                    </strong>
                                    <span className="text-[#667085]">{GAME_META[game].label}</span>
                                </p>
                            ))}
                            {!isLine && games.length > 1 && (
                                <p className="mt-1 border-t border-[#f0f4f1] pt-1 text-[#667085]">
                                    Tổng:{' '}
                                    <strong className="tabular-nums text-[#1f2937]">
                                        {games.reduce((sum, game) => sum + activeBucket.byGame[game].played, 0)} ván
                                    </strong>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
