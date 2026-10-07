import { useState, useEffect } from "react";

export const usePhaseTimer = (
    phaseDeadline: number | null,
    onExpire: () => void
) => {
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!phaseDeadline) return 0;
        return Math.max(0, Math.floor((phaseDeadline - Date.now()) / 1000));
    });

    useEffect(() => {
        if (!phaseDeadline) return;

        const checkTime = () => {
            const remaining = Math.max(0, Math.floor((phaseDeadline - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) {
                onExpire();
                return true; // Expired
            }
            return false;
        };

        // Check initially in case deadline passed while offline
        if (checkTime()) return;

        const timer = setInterval(() => {
            if (checkTime()) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [phaseDeadline, onExpire]);

    const formattedTime = (() => {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    })();

    return { timeLeft, formattedTime };
};
