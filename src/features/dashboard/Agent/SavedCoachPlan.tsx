import type { ApiSavedCoachPlan } from '../api/dashboard.api';

interface SavedCoachPlanProps {
    plan: ApiSavedCoachPlan;
}

const groupPlanByDay = (content: string) => content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<{ day: string; sessions: { duration: string; description: string }[] }[]>((days, line) => {
        const match = line.match(/^(.+?)\s*\(([^)]+)\):\s*(.+)$/);
        const day = match?.[1] ?? 'Lộ trình';
        const currentDay = days.at(-1);
        const session = {
            duration: match?.[2] ?? '',
            description: match?.[3] ?? line,
        };

        if (currentDay?.day === day) currentDay.sessions.push(session);
        else days.push({ day, sessions: [session] });

        return days;
    }, []);

export const SavedCoachPlan = ({ plan }: SavedCoachPlanProps) => (
    <div className="coach-schedule">
        <time className="coach-schedule__saved-at" dateTime={plan.savedAt}>
            Cập nhật {new Date(plan.savedAt).toLocaleString('vi-VN')}
        </time>
        {groupPlanByDay(plan.content).map(({ day, sessions }, dayIndex) => (
            <section className="coach-schedule__day" key={`${day}-${dayIndex}`}>
                <div className="coach-schedule__day-head">
                    <h4>{day}</h4>
                    <span>{sessions.length} buổi</span>
                </div>
                <ul>
                    {sessions.map((session, index) => (
                        <li key={`${session.description}-${index}`}>
                            {session.duration && <span>{session.duration}</span>}
                            <p>{session.description}</p>
                        </li>
                    ))}
                </ul>
            </section>
        ))}
    </div>
);
