import { useState, useEffect } from "react";

export type TimerMode = "count-up" | "count-down";

export const useTimer = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<TimerMode>("count-up");

    useEffect(() => {
        if (!isRunning) return;

        if (mode === "count-down" && time <= 0) {
            setIsRunning(false);
            return;
        }

        const timer = setTimeout(() => {
            setTime((previousTime) =>
                mode === "count-up"
                    ? previousTime + 1000
                    : Math.max(previousTime - 1000, 0),
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, [isRunning, mode, time]);

    const start = () => {
        if (mode === "count-up" || time > 0) {
            setIsRunning(true);
        }
    };
    const pause = () => setIsRunning(false);
    const reset = () => {
        setIsRunning(false);
        setTime(0);
    };

    const changeMode = (nextMode: TimerMode) => {
        if (nextMode === mode) return;

        setIsRunning(false);
        setTime(0);
        setMode(nextMode);
    };

    const addTime = (milliseconds: number) => {
        if (mode === "count-down" && milliseconds > 0) {
            setTime((previousTime) => previousTime + milliseconds);
        }
    };

    return {
        seconds: time,
        isRunning,
        mode,
        start,
        pause,
        reset,
        changeMode,
        addTime,
    };
};
