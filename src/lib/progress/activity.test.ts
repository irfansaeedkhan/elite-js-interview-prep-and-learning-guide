import { describe, expect, it } from 'vitest';
import {
  aggregateAttemptsByDay,
  buildHeatmapWeeks,
  countActiveDaysInWeekContaining,
  countGoalWeeks,
  heatmapWindowStart,
  toDateKey,
  type DayCount,
} from './activity';

// Fixed Wednesday, so week boundaries are deterministic.
const TODAY = new Date('2026-10-28T12:00:00.000Z');

function day(date: string, count: number): DayCount {
  return { date, count };
}

describe('heatmapWindowStart', () => {
  it('starts 181 days before today for the 182-day window', () => {
    expect(toDateKey(heatmapWindowStart(182, TODAY))).toBe('2026-04-30');
  });

  it('starts on today for a 1-day window', () => {
    expect(toDateKey(heatmapWindowStart(1, TODAY))).toBe('2026-10-28');
  });
});

describe('aggregateAttemptsByDay', () => {
  it('returns one entry per day in the window, oldest first, zeros included', () => {
    const days = aggregateAttemptsByDay([], 7, TODAY);
    expect(days.map((d) => d.date)).toEqual([
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
    ]);
    expect(days.every((d) => d.count === 0)).toBe(true);
  });

  it('sums attempts per UTC date and accepts string timestamps', () => {
    const days = aggregateAttemptsByDay(
      [
        { createdAt: new Date('2026-10-25T08:00:00.000Z') },
        { createdAt: '2026-10-25T23:30:00.000Z' },
        { createdAt: new Date('2026-10-28T00:00:00.000Z') },
      ],
      7,
      TODAY,
    );
    const byDate = new Map(days.map((d) => [d.date, d.count]));
    expect(byDate.get('2026-10-25')).toBe(2);
    expect(byDate.get('2026-10-28')).toBe(1);
    expect(byDate.get('2026-10-26')).toBe(0);
  });

  it('ignores attempts outside the window and unparseable timestamps', () => {
    const days = aggregateAttemptsByDay(
      [
        { createdAt: new Date('2026-10-21T10:00:00.000Z') },
        { createdAt: new Date('2026-10-29T10:00:00.000Z') },
        { createdAt: 'not-a-date' },
      ],
      7,
      TODAY,
    );
    expect(days.every((d) => d.count === 0)).toBe(true);
    expect(days).toHaveLength(7);
  });

  it('counts attempts on the first and last window days', () => {
    const days = aggregateAttemptsByDay(
      [
        { createdAt: new Date('2026-10-22T00:00:00.000Z') },
        { createdAt: new Date('2026-10-28T23:59:59.000Z') },
      ],
      7,
      TODAY,
    );
    expect(days[0]).toEqual({ date: '2026-10-22', count: 1 });
    expect(days[6]).toEqual({ date: '2026-10-28', count: 1 });
  });
});

describe('buildHeatmapWeeks', () => {
  it('returns an empty list for no days', () => {
    expect(buildHeatmapWeeks([])).toEqual([]);
  });

  it('keeps an exact Monday-to-Sunday span unpadded', () => {
    const weeks = buildHeatmapWeeks([
      day('2026-10-26', 1),
      day('2026-10-27', 0),
      day('2026-10-28', 2),
      day('2026-10-29', 0),
      day('2026-10-30', 0),
      day('2026-10-31', 0),
      day('2026-11-01', 0),
    ]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].map((cell) => cell.date)).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ]);
  });

  it('pads the first week to Monday and the last week to Sunday', () => {
    // 2026-10-28 is a Wednesday, 2026-11-02 is the following Monday.
    const weeks = buildHeatmapWeeks([
      day('2026-10-28', 1),
      day('2026-10-29', 0),
      day('2026-10-30', 0),
      day('2026-10-31', 0),
      day('2026-11-01', 0),
      day('2026-11-02', 3),
    ]);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].map((cell) => cell.date)).toEqual([
      null,
      null,
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ]);
    expect(weeks[1].map((cell) => cell.date)).toEqual([
      '2026-11-02',
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });
});

describe('countGoalWeeks', () => {
  function weekWith(activeDates: string[]): DayCount[] {
    // One full Monday-Sunday week, 2026-10-26 to 2026-11-01.
    return [
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ].map((date) => day(date, activeDates.includes(date) ? 1 : 0));
  }

  it('counts a week with exactly 3 active days and not one with 2', () => {
    const weeks = buildHeatmapWeeks(weekWith(['2026-10-26', '2026-10-27', '2026-10-28']));
    expect(countGoalWeeks(weeks)).toBe(1);
    const short = buildHeatmapWeeks(weekWith(['2026-10-26', '2026-10-27']));
    expect(countGoalWeeks(short)).toBe(0);
  });

  it('counts non-consecutive goal weeks independently', () => {
    const twoWeeks = [
      ...weekWith(['2026-10-26', '2026-10-27', '2026-10-28']),
      ...[
        '2026-11-02',
        '2026-11-03',
        '2026-11-04',
        '2026-11-05',
        '2026-11-06',
        '2026-11-07',
        '2026-11-08',
      ].map((date) => day(date, 0)),
      ...[
        '2026-11-09',
        '2026-11-10',
        '2026-11-11',
        '2026-11-12',
        '2026-11-13',
        '2026-11-14',
        '2026-11-15',
      ].map((date) => day(date, ['2026-11-09', '2026-11-11', '2026-11-13'].includes(date) ? 2 : 0)),
    ];
    expect(countGoalWeeks(buildHeatmapWeeks(twoWeeks))).toBe(2);
  });

  it('never counts padding cells as active', () => {
    const weeks = buildHeatmapWeeks([day('2026-10-28', 1)]);
    expect(countGoalWeeks(weeks)).toBe(0);
  });
});

describe('countActiveDaysInWeekContaining', () => {
  it('counts active days in the containing week only', () => {
    const weeks = buildHeatmapWeeks([
      day('2026-10-26', 1),
      day('2026-10-27', 0),
      day('2026-10-28', 2),
      day('2026-10-29', 0),
      day('2026-10-30', 0),
      day('2026-10-31', 0),
      day('2026-11-01', 0),
    ]);
    expect(countActiveDaysInWeekContaining(weeks, '2026-10-28')).toBe(2);
    expect(countActiveDaysInWeekContaining(weeks, '2026-10-27')).toBe(2);
  });

  it('returns 0 for a date outside the window', () => {
    const weeks = buildHeatmapWeeks([day('2026-10-28', 1)]);
    expect(countActiveDaysInWeekContaining(weeks, '2026-01-01')).toBe(0);
  });
});
