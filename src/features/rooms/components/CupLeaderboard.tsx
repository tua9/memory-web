import { useState } from 'react';
import { Trophy } from 'lucide-react';
import type { Leaderboard } from '../api/rooms.api';

const SHORT_LIST = 5;

type Entry = Leaderboard['entries'][number];

const Row = ({ entry }: { entry: Entry }) => (
    <li className="cups__row" data-me={entry.isMe} data-place={entry.rank <= 3 ? entry.rank : undefined}>
        <span className="cups__rank num">{entry.rank}</span>
        <span className="cups__avatar" aria-hidden="true">
            {entry.avatarUrl ? <img src={entry.avatarUrl} alt="" /> : entry.username.charAt(0).toUpperCase()}
        </span>
        <span className="cups__name">{entry.isMe ? `${entry.username} (bạn)` : entry.username}</span>
        <span className="cups__count num" aria-label={`${entry.cups} cúp`}>
            {entry.cups} <Trophy size={14} aria-hidden="true" />
        </span>
    </li>
);

// Bảng xếp hạng cúp: mỗi trận thắng một cúp. Mặc định hiện 5 hạng đầu và luôn có dòng của bạn.
export const CupLeaderboard = ({ board, failed, onRetry }: { board: Leaderboard | null; failed: boolean; onRetry: () => void }) => {
    const [expanded, setExpanded] = useState(false);
    const entries = board?.entries ?? [];
    const shown = expanded ? entries : entries.slice(0, SHORT_LIST);
    const mine = entries.find((entry) => entry.isMe);
    const pinMine = !expanded && mine && !shown.includes(mine);

    return (
        <section className="panel cups" aria-labelledby="cups-title">
            <h2 id="cups-title">Bảng xếp hạng cúp</h2>

            {!board && !failed && (
                <ol className="cups__list" aria-hidden="true">
                    {[0, 1, 2].map((index) => <li key={index} className="cups__row cups__row--loading"><span /><span /></li>)}
                </ol>
            )}
            {failed && (
                <p className="cups__note">Chưa tải được bảng xếp hạng. <button type="button" className="cups__retry" onClick={onRetry}>Thử lại</button></p>
            )}
            {board && entries.length === 0 && <p className="cups__note">Chưa ai có cúp. Thắng trận đầu tiên để đứng đầu bảng.</p>}

            {entries.length > 0 && (
                <ol className="cups__list">
                    {shown.map((entry) => <Row key={entry._id} entry={entry} />)}
                    {pinMine && <li className="cups__gap" aria-hidden="true">…</li>}
                    {pinMine && <Row entry={mine} />}
                </ol>
            )}
            {entries.length > SHORT_LIST && (
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
