import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.hoisted runs before imports, so the mock factory below can reference these.
// (Plain top-level consts would hit the ESM TDZ: imports evaluate first.)
const mocks = vi.hoisted(() => {
  const returningMock = vi.fn();
  const onConflictMock = vi.fn().mockResolvedValue(undefined);
  const valuesMock = vi.fn(() => ({ returning: returningMock, onConflictDoNothing: onConflictMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));

  const limitMock = vi.fn();
  const orderByMock = vi.fn(() => ({ limit: limitMock }));
  const whereMock = vi.fn(() => ({ orderBy: orderByMock }));
  const fromMock = vi.fn(() => ({ where: whereMock }));
  const selectMock = vi.fn(() => ({ from: fromMock }));

  return {
    returningMock,
    onConflictMock,
    valuesMock,
    insertMock,
    limitMock,
    orderByMock,
    whereMock,
    fromMock,
    selectMock,
  };
});

vi.mock('@/db/db', () => ({
  db: { insert: mocks.insertMock, select: mocks.selectMock },
}));

import { practiceAttempts } from '@/db/schema/progress.schema';
import { progressService } from '@/lib/progress/progress-service';

const {
  returningMock,
  valuesMock,
  insertMock,
  limitMock,
  orderByMock,
  whereMock,
  fromMock,
  selectMock,
} = mocks;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('recordPracticeAttempt', () => {
  it('inserts the attempt scoped to the given user id', async () => {
    const row = {
      id: 'attempt-1',
      userId: 'user-1',
      topicPath: 'javascript/foundation/closures',
      kind: 'challenge',
      promptId: 'closures-1',
      passed: true,
      createdAt: new Date('2026-10-01T10:00:00.000Z'),
    };
    returningMock.mockResolvedValue([row]);

    const result = await progressService.recordPracticeAttempt('user-1', {
      topicPath: 'javascript/foundation/closures',
      kind: 'challenge',
      promptId: 'closures-1',
      passed: true,
    });

    expect(insertMock).toHaveBeenCalledWith(practiceAttempts);
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        topicPath: 'javascript/foundation/closures',
        kind: 'challenge',
        promptId: 'closures-1',
        passed: true,
      }),
    );
    expect(result).toEqual(row);
  });
});

describe('listPracticeAttempts', () => {
  it('queries newest-first, scoped to user and topic, capped at 20', async () => {
    const rows = [
      { id: 'a2', passed: true },
      { id: 'a1', passed: false },
    ];
    limitMock.mockResolvedValue(rows);

    const result = await progressService.listPracticeAttempts(
      'user-1',
      'javascript/foundation/closures',
    );

    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith(practiceAttempts);
    // userId + topicPath scoping happens in the where clause
    expect(whereMock).toHaveBeenCalledTimes(1);
    expect(whereMock).toHaveBeenCalledWith(expect.anything());
    expect(orderByMock).toHaveBeenCalledTimes(1);
    expect(limitMock).toHaveBeenCalledWith(20);
    expect(result).toEqual(rows);
  });
});

describe('getActivityByDay', () => {
  it('aggregates attempts per day in the window and reports the weekly goal', async () => {
    whereMock.mockResolvedValueOnce([
      { createdAt: new Date('2026-10-25T08:00:00.000Z') },
      { createdAt: new Date('2026-10-25T20:00:00.000Z') },
      { createdAt: new Date('2026-10-28T09:00:00.000Z') },
      // Outside the 7-day window; the mock ignores the gte filter, so the
      // aggregation itself must drop it.
      { createdAt: new Date('2026-10-21T09:00:00.000Z') },
    ] as never);

    const result = await progressService.getActivityByDay(
      'user-1',
      7,
      new Date('2026-10-28T12:00:00.000Z'),
    );

    expect(result.days).toHaveLength(7);
    expect(result.days[3]).toEqual({ date: '2026-10-25', count: 2 });
    expect(result.days[6]).toEqual({ date: '2026-10-28', count: 1 });
    expect(result.weeklyGoal).toEqual({
      targetDaysPerWeek: 3,
      currentWeekActiveDays: 1,
      goalWeeks: 0,
    });
    expect(whereMock).toHaveBeenCalledTimes(1);
  });
});

describe('getBadges', () => {
  it('persists only newly earned badges and never revokes earned ones', async () => {
    const progressRows = [
      {
        qaResults: { q1: 'know', q2: 'review' },
        challengePassed: 1,
        masteredAt: new Date('2026-10-20T00:00:00.000Z'),
      },
      { qaResults: {}, challengePassed: 0, masteredAt: null },
    ];
    const attemptRows = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];
    const statsRows = [
      {
        points: 120,
        longestStreak: 8,
        currentStreak: 3,
        lastActiveDate: '2026-10-28',
        lastTopicPath: null,
      },
    ];
    const earnedRows = [
      { badgeId: 'first-visit', earnedAt: new Date('2026-10-01T00:00:00.000Z') },
      // Earned earlier, but the current window has zero goal weeks. It must
      // stay earned: a missed day never erases a record.
      { badgeId: 'steady-weeks-4', earnedAt: new Date('2026-10-15T00:00:00.000Z') },
    ];
    const finalRows = [
      ...earnedRows,
      { badgeId: 'first-answer', earnedAt: new Date('2026-10-28T00:00:00.000Z') },
      { badgeId: 'first-challenge', earnedAt: new Date('2026-10-28T00:00:00.000Z') },
      { badgeId: 'first-attempt', earnedAt: new Date('2026-10-28T00:00:00.000Z') },
      { badgeId: 'streak-7', earnedAt: new Date('2026-10-28T00:00:00.000Z') },
      { badgeId: 'points-100', earnedAt: new Date('2026-10-28T00:00:00.000Z') },
    ];

    // Call order inside getBadges: progress, attempts, stats, earned,
    // activity attempts, final badge rows.
    whereMock
      .mockResolvedValueOnce(progressRows as never)
      .mockResolvedValueOnce(attemptRows as never)
      .mockResolvedValueOnce(statsRows as never)
      .mockResolvedValueOnce(earnedRows as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce(finalRows as never);

    const result = await progressService.getBadges('user-1');

    const valueCalls = valuesMock.mock.calls as unknown as Array<
      [{ userId: string; badgeId: string }]
    >;
    const insertedIds = valueCalls.map((call) => call[0].badgeId);
    expect(insertedIds).toEqual([
      'first-answer',
      'first-challenge',
      'first-attempt',
      'streak-7',
      'points-100',
    ]);
    expect(insertMock).toHaveBeenCalledTimes(5);
    expect(valueCalls.every((call) => call[0].userId === 'user-1')).toBe(true);

    const byId = new Map(result.badges.map((badge) => [badge.id, badge]));
    expect(byId.get('first-visit')).toMatchObject({ earned: true, earnedAt: '2026-10-01T00:00:00.000Z' });
    expect(byId.get('steady-weeks-4')).toMatchObject({
      earned: true,
      earnedAt: '2026-10-15T00:00:00.000Z',
    });
    expect(byId.get('first-answer')).toMatchObject({ earned: true });
    expect(byId.get('streak-7')).toMatchObject({ earned: true });
    expect(byId.get('points-100')).toMatchObject({ earned: true });
    expect(byId.get('streak-30')).toMatchObject({ earned: false, earnedAt: null });
    expect(byId.get('mastered-5')).toMatchObject({ earned: false, earnedAt: null });
    expect(byId.get('attempts-50')).toMatchObject({ earned: false, earnedAt: null });
    expect(byId.get('points-500')).toMatchObject({ earned: false, earnedAt: null });
  });

  it('handles a user with no stats row and earns nothing', async () => {
    whereMock
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never);

    const result = await progressService.getBadges('user-1');

    expect(insertMock).not.toHaveBeenCalled();
    expect(result.badges).toHaveLength(16);
    expect(result.badges.every((badge) => badge.earned === false)).toBe(true);
  });
});
