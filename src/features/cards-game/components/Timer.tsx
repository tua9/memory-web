import {
    ChevronDown,
    Hourglass,
    Pause,
    Play,
    RotateCcw,
    Timer as TimerIcon,
} from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { Button } from "@/components/ui/button";
import { useTimer } from "../hooks/useTimer";

const formatTime = (elapsedMs: number): string => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    return `${pad(Math.floor(totalSeconds / 60))}:${pad(seconds)}`;
};

export const Timer = () => {
    const {
        seconds: elapsedMs,
        isRunning,
        mode,
        start,
        pause,
        reset,
        changeMode,
        addTime,
    } = useTimer();
    const hasStarted = isRunning || elapsedMs > 0;
    const canStart = mode === "count-up" || elapsedMs > 0;

    const toggleMode = () => {
        changeMode(mode === "count-up" ? "count-down" : "count-up");
    };

    const addMinutes = (minutes: number) => {
        addTime(minutes * 60 * 1000);
    };

    return (
        <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-sm">
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Switch to ${mode === "count-up" ? "count down" : "count up"} mode`}
                aria-pressed={mode === "count-down"}
                title={`Switch to ${mode === "count-up" ? "count down" : "count up"}`}
                onClick={toggleMode}
            >
                {mode === "count-up" ? (
                    <TimerIcon aria-hidden="true" />
                ) : (
                    <Hourglass aria-hidden="true" />
                )}
            </Button>
            {mode === "count-down" ? (
                <Popover.Root>
                    <Popover.Trigger
                        aria-label={`Remaining time ${formatTime(elapsedMs)}; add time`}
                        title="Add time"
                        className="inline-flex h-8 min-w-[88px] items-center justify-center gap-2 rounded-sm px-2 font-mono text-sm font-medium tabular-nums text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span role="timer">{formatTime(elapsedMs)}</span>
                        <ChevronDown
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-muted-foreground"
                        />
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Positioner
                            side="bottom"
                            align="start"
                            sideOffset={6}
                        >
                            <Popover.Popup className="z-50 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none">
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    Add time
                                </div>
                                {[5, 10, 30].map((minutes) => (
                                    <Popover.Close
                                        key={minutes}
                                        type="button"
                                        onClick={() => addMinutes(minutes)}
                                        className="flex h-8 w-full items-center justify-between rounded-sm px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent"
                                    >
                                        <span className="text-xs text-foreground/70">
                                            +{minutes} min
                                        </span>
                                    </Popover.Close>
                                ))}
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            ) : (
                <div
                    role="timer"
                    aria-label={`Elapsed time ${formatTime(elapsedMs)}`}
                    className="inline-flex h-8 min-w-[88px] items-center justify-center gap-2 px-2 font-mono text-sm font-medium tabular-nums text-foreground"
                >
                    {formatTime(elapsedMs)}
                </div>
            )}
            <div className="flex items-center border-l border-border pl-1">
                {!isRunning && canStart && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Start timer"
                        title="Start"
                        onClick={start}
                    >
                        <Play aria-hidden="true" />
                    </Button>
                )}
                {isRunning && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Pause timer"
                        title="Pause"
                        onClick={pause}
                    >
                        <Pause aria-hidden="true" />
                    </Button>
                )}
                {hasStarted && (
                    <>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Restart timer"
                            title="Restart"
                            onClick={reset}
                        >
                            <RotateCcw aria-hidden="true" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
