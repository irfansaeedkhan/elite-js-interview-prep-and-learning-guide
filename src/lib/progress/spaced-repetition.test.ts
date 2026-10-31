import { describe, expect, it } from 'vitest';
import {
  getDueQueue,
  isDue,
  nextIntervalDays,
  scheduleReview,
  type ReviewItemState,
  type SchedulableItem,
} from '@/lib/progress/spaced-repetition';

const JAN_1 = new Date('2026-01-01T10:00:00.000Z');
const JAN_2 = new Date('2026-01-02T10:00:00.000Z');
const JAN_4 = new Date('2026-01-04T10:00:00.000Z');
const JAN_8 = new Date('2026-01-08T10:00:00.000Z');

function state(partial: Partial<ReviewItemState>): ReviewItemState {
  return {
    intervalDays: 1,
    repetitions: 1,
    lapses: 0,
    dueAt: JAN_2,
    lastReviewedAt: JAN_1,
    lastResult: 'know',
    ...partial,
  };
}

function item(partial: Partial<SchedulableItem>): SchedulableItem {
  return {
    topicPath: 'javascript/foundation/closures',
    promptId: 'q1',
    kind: 'qa',
    ...state({}),
    ...partial,
  };
}

describe('scheduleReview for new items', () => {
  it('grades a first known answer due in 1 day with 1 repetition', () => {
    const next = scheduleReview(null, 'know', JAN_1);
    expect(next.intervalDays).toBe(1);
    expect(next.repetitions).toBe(1);
    expect(next.lapses).toBe(0);
    expect(next.dueAt).toEqual(JAN_2);
    expect(next.lastResult).toBe('know');
  });

  it('grades a first weak answer due in 1 day with 0 repetitions and 1 lapse', () => {
    const next = scheduleReview(null, 'review', JAN_1);
    expect(next.intervalDays).toBe(1);
    expect(next.repetitions).toBe(0);
    expect(next.lapses).toBe(1);
    expect(next.dueAt).toEqual(JAN_2);
    expect(next.lastResult).toBe('review');
  });
});

describe('doubling ladder for known answers', () => {
  it('walks 1, 2, 4, 8, 16, 32, 64 and caps at 64', () => {
    let current = scheduleReview(null, 'know', JAN_1);
    expect(current.intervalDays).toBe(1);

    const expected = [2, 4, 8, 16, 32, 64, 64];
    for (const days of expected) {
      current = scheduleReview(current, 'know', current.dueAt);
      expect(current.intervalDays).toBe(days);
    }
    expect(current.repetitions).toBe(8);
  });

  it('matches the worked example: known Jan 1 -> due Jan 2 -> due Jan 4 -> due Jan 8', () => {
    const first = scheduleReview(null, 'know', JAN_1);
    expect(first.dueAt).toEqual(JAN_2);
    const second = scheduleReview(first, 'know', JAN_2);
    expect(second.intervalDays).toBe(2);
    expect(second.dueAt).toEqual(JAN_4);
    const third = scheduleReview(second, 'know', JAN_4);
    expect(third.intervalDays).toBe(4);
    expect(third.dueAt).toEqual(JAN_8);
  });

  it('doubles a non-ladder interval and still caps at 64', () => {
    expect(nextIntervalDays(3, 'know')).toBe(6);
    expect(nextIntervalDays(40, 'know')).toBe(64);
    expect(nextIntervalDays(64, 'know')).toBe(64);
  });
});

describe('weak answers reset the schedule', () => {
  it('returns a failed item the next day with repetitions reset and a lapse added', () => {
    const previous = state({ intervalDays: 8, repetitions: 4, lapses: 0 });
    const next = scheduleReview(previous, 'review', JAN_8);
    expect(next.intervalDays).toBe(1);
    expect(next.repetitions).toBe(0);
    expect(next.lapses).toBe(1);
    expect(next.dueAt).toEqual(new Date('2026-01-09T10:00:00.000Z'));
  });

  it('keeps lapses from earlier weak answers on later known answers', () => {
    const weak = scheduleReview(null, 'review', JAN_1);
    const known = scheduleReview(weak, 'know', JAN_2);
    expect(known.lapses).toBe(1);
    expect(known.repetitions).toBe(1);
    expect(known.intervalDays).toBe(2);
  });
});

describe('due boundaries', () => {
  it('is due exactly at the due instant and overdue after it', () => {
    expect(isDue({ dueAt: JAN_2 }, JAN_2)).toBe(true);
    expect(isDue({ dueAt: JAN_2 }, new Date('2026-01-03T10:00:00.000Z'))).toBe(true);
  });

  it('is not due one millisecond before the due instant', () => {
    expect(isDue({ dueAt: JAN_2 }, new Date('2026-01-02T09:59:59.999Z'))).toBe(false);
  });
});

describe('due queue ordering and clearing', () => {
  it('orders weak items first, then most overdue, then topic and prompt', () => {
    const queue = getDueQueue(
      [
        item({ promptId: 'known-recent', lastResult: 'know', dueAt: new Date('2026-01-05T10:00:00.000Z') }),
        item({ promptId: 'weak-old', lastResult: 'review', dueAt: new Date('2026-01-06T10:00:00.000Z') }),
        item({ promptId: 'known-overdue', lastResult: 'know', dueAt: new Date('2026-01-02T10:00:00.000Z') }),
        item({ promptId: 'not-yet', lastResult: 'know', dueAt: new Date('2026-01-20T10:00:00.000Z') }),
        item({ promptId: 'weak-newer', lastResult: 'review', dueAt: new Date('2026-01-07T10:00:00.000Z') }),
      ],
      new Date('2026-01-10T10:00:00.000Z'),
    );
    expect(queue.map((entry) => entry.promptId)).toEqual([
      'weak-old',
      'weak-newer',
      'known-overdue',
      'known-recent',
    ]);
  });

  it('counts whole overdue days, floored', () => {
    const queue = getDueQueue(
      [item({ dueAt: new Date('2026-01-08T10:00:00.000Z') })],
      new Date('2026-01-09T22:00:00.000Z'),
    );
    expect(queue[0]?.overdueDays).toBe(1);
  });

  it('clears to zero after every due item is graded', () => {
    const now = new Date('2026-01-10T10:00:00.000Z');
    const due = getDueQueue(
      [
        item({ promptId: 'a', lastResult: 'know', dueAt: new Date('2026-01-05T10:00:00.000Z') }),
        item({ promptId: 'b', lastResult: 'review', dueAt: new Date('2026-01-09T10:00:00.000Z') }),
      ],
      now,
    );
    expect(due).toHaveLength(2);

    const rescheduled: SchedulableItem[] = due.map((entry) => ({
      ...entry,
      ...scheduleReview(entry, entry.promptId === 'a' ? 'know' : 'review', now),
    }));
    expect(getDueQueue(rescheduled, now)).toHaveLength(0);
  });
});
