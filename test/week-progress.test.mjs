import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildGameRows, buildWeek, pickSuggestion, summarySentence, weekLabel } from '../src/features/family/utils/weekProgress.ts';

// Thứ Hai 9/11/2026 0:00 giờ Việt Nam
const WEEK_START = '2026-11-08T17:00:00.000Z';
const at = (iso) => ({ completedAt: iso });
const play = (iso, gameName, correctItems, totalItems) => ({ ...at(iso), gameName, correctItems, totalItems, durationSec: 60 });
const summary = (byGame) => {
    const total = byGame.reduce((s, g) => s + g.total, 0);
    return { games: byGame.reduce((s, g) => s + g.games, 0), practiceDays: 0, accuracy: total ? byGame.reduce((s, g) => s + g.correct, 0) / total : null, recordedPracticeSeconds: 0, byGame };
};
const label = (name) => ({ card: 'Thẻ bài', number: 'Ghi nhớ số', word: 'Ghi nhớ từ' })[name] ?? name;

test('week strip buckets games by Vietnam calendar day, Monday first', () => {
    const days = buildWeek(WEEK_START, [
        play('2026-11-08T17:30:00Z', 'card', 4, 5),  // 0:30 thứ Hai giờ Việt Nam
        play('2026-11-09T16:59:00Z', 'card', 1, 5),  // 23:59 thứ Hai
        play('2026-11-15T10:00:00Z', 'word', 3, 3),  // Chủ nhật
    ], new Date('2026-11-11T05:00:00Z'));
    assert.deepEqual(days.map((d) => d.label), ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
    assert.equal(days[0].games, 2);
    assert.equal(days[0].accuracy, 5 / 10);
    assert.equal(days[6].games, 1);
    assert.equal(days[2].isToday, true);
    assert.equal(days[3].isFuture, true);
    assert.equal(weekLabel(days), '9/11 – 15/11');
});

test('only the weakest game is flagged, and changes come from the rounded percentages', () => {
    const rows = buildGameRows(['card', 'number', 'word'],
        summary([{ gameName: 'card', games: 2, correct: 9, total: 10 }, { gameName: 'number', games: 3, correct: 13, total: 20 }]),
        summary([{ gameName: 'card', games: 1, correct: 4, total: 5 }, { gameName: 'number', games: 1, correct: 7, total: 10 }]),
        { card: { level: 4, maxLevel: 10 } });
    assert.deepEqual(rows.map((r) => [r.gameName, r.accuracy, r.change, r.focus]), [
        ['card', 90, 10, false], ['number', 65, -5, true], ['word', null, null, false],
    ]);
    assert.equal(rows[0].level, 4);
    const tip = pickSuggestion('Na', rows, label, null);
    assert.equal(tip.gameName, 'number');
    assert.match(tip.text, /giảm 5 điểm/);
    assert.equal(tip.method.route, '/methods/number-shape');
});

test('summary sentence names its baseline and handles an empty week', () => {
    const now = { ...summary([{ gameName: 'card', games: 4, correct: 41, total: 50 }]), practiceDays: 3 };
    const before = summary([{ gameName: 'card', games: 2, correct: 19, total: 25 }]);
    assert.equal(summarySentence('Na', now, before, true), 'Na luyện 3/7 ngày tuần này, 4 ván, đúng 82%, tăng 6 điểm so với cùng thời điểm tuần trước.');
    assert.equal(summarySentence('Na', summary([]), before, true), 'Na chưa luyện ván nào tuần này.');
    const idle = buildGameRows(['card', 'word'], summary([]), summary([]), {});
    assert.equal(pickSuggestion('Na', idle, label, 'word').gameName, 'word');
});
