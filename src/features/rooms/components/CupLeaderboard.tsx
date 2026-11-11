import { useState } from 'react';
import { Trophy } from 'lucide-react';
import type { Leaderboard } from '../api/rooms.api';

const SHORT_LIST = 8;

type Entry = Leaderboard['entries'][number];

const Avatar = ({ entry }: { entry: Entry }) => (
    <span className="cups__avatar" aria-hidden="true">
        {entry.avatarUrl ? <img src={entry.avatarUrl} alt="" /> : entry.username.charAt(0).toUpperCase()}
    </span>
);

const Row = ({ entry }: { entry: Entry }) => (
    <li className="cups__row" data-me={entry.isMe}>
        <span className="cups__rank num">{entry.rank}</span>
        <Avatar entry={entry} />
        <span className="cups__name">{entry.isMe ? `${entry.username} (bạn)` : entry.username}</span>
        <span className="cups__count num" aria-label={`${entry.cups} cúp`}>
            {entry.cups} <Trophy size={14} aria-hidden="true" />
        </span>
    </li>
);

// Bảng xếp hạng cúp: ba người đầu đứng trên bục (hạng 1 ở giữa, cao nhất), từ hạng 4 là danh sách.
// Mặc định hiện 8 người đầu và luôn có dòng của bạn.
export const CupLeaderboard = ({ board, failed, onRetry }: { board: Leaderboard | null; failed: boolean; onRetry: () => void }) => {
    const [expanded, setExpanded] = useState(false);
    const entries = board?.entries ?? [];
    const podium = entries.slice(0, 3);
    const rest = entries.slice(3);
    const shown = expanded ? rest : rest.slice(0, SHORT_LIST - 3);
    const mine = entries.find((entry) => entry.isMe);
    const pinMine = !expanded && mine && !podium.includes(mine) && !shown.includes(mine);

    return (
        <section className="panel cups" aria-labelledby="cups-title">
            <h2 id="cups-title">Bảng xếp hạng cúp</h2>

            {!board && !failed && <div className="cups__loading" aria-hidden="true" />}
            {failed && (
                <p className="cups__note">Chưa tải được bảng xếp hạng. <button type="button" className="cups__retry" onClick={onRetry}>Thử lại</button></p>
            )}
            {board && entries.length === 0 && <p className="cups__note">Chưa ai có cúp. Thắng trận đầu tiên để đứng đầu bảng.</p>}

            {podium.length > 0 && (
                <ol className="podium" aria-label="Ba hạng đầu">
                    {podium.map((entry, index) => (
                        <li key={entry._id} className="podium__step" data-place={index + 1} data-me={entry.isMe}
                            style={{ '--i': index } as React.CSSProperties}>
                            <Avatar entry={entry} />
                            <span className="podium__name">{entry.isMe ? 'Bạn' : entry.username}</span>
                            <span className="podium__block">
                                <span className="podium__rank num">{entry.rank}</span>
                                <span className="podium__cups num" aria-label={`${entry.cups} cúp`}>
                                    {entry.cups} <Trophy size={12} aria-hidden="true" />
                                </span>
                            </span>
                        </li>
                    ))}
                </ol>
            )}

            {(shown.length > 0 || pinMine) && (
                <ol className="cups__list" start={4}>
                    {shown.map((entry) => <Row key={entry._id} entry={entry} />)}
                    {pinMine && <li className="cups__gap" aria-hidden="true">…</li>}
                    {pinMine && <Row entry={mine} />}
                </ol>
            )}
            {rest.length > SHORT_LIST - 3 && (
                <button type="button" className="cups__retry cups__more" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
                    {expanded ? 'Thu gọn' : `Xem top ${entries.length}`}
                </button>
            )}
            {board && !mine && board.me.rank && (
                <p className="cups__note">Bạn đang ở hạng {board.me.rank} với {board.me.cups} cúp.</p>
            )}
        </section>
    );
};
