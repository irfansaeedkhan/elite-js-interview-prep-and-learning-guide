import { beforeEach, describe, expect, it, vi } from 'vitest';

// Same hoisted-mock pattern as progress-service.test.ts: the mock factory
// runs before imports, so plain top-level consts would hit the ESM TDZ.
const mocks = vi.hoisted(() => {
  const returningMock = vi.fn();
  const valuesMock = vi.fn(() => ({ returning: returningMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));

  const updateWhereMock = vi.fn(() => ({ returning: returningMock }));
  const setMock = vi.fn(() => ({ where: updateWhereMock }));
  const updateMock = vi.fn(() => ({ set: setMock }));

  const orderByMock = vi.fn();
  const limitMock = vi.fn();
  const whereMock = vi.fn(() => ({ orderBy: orderByMock, limit: limitMock }));
  const fromMock = vi.fn(() => ({ where: whereMock }));
  const selectMock = vi.fn(() => ({ from: fromMock }));

  return {
    returningMock,
    valuesMock,
    insertMock,
    updateWhereMock,
    setMock,
    updateMock,
    orderByMock,
    limitMock,
    whereMock,
    fromMock,
    selectMock,
  };
});

vi.mock('@/db/db', () => ({
  db: { insert: mocks.insertMock, select: mocks.selectMock, update: mocks.updateMock },
}));

import { reviewService } from '@/lib/progress/review-service';

const {
  returningMock,
  valuesMock,
  insertMock,
  setMock,
  updateMock,
  orderByMock,
  limitMock,
} = mocks;

const NOW = new Date('2026-01-10T10:00:00.000Z');
const USER = 'user-1';

beforeEach(() => {
  vi.clearAllMocks();
  limitMock.mockReturnValue([]);
  orderByMock.mockReturnValue([]);
  returningMock.mockReturnValue([{ id: 'row-1' }]);
});

function existingRow(partial: Record<string, unknown>) {
  return {
    id: 'row-1',
    userId: USER,
    topicPath: 'javascript/foundation/closures',
    promptId: 'q1',
    kind: 'qa',
    intervalDays: 2,
    repetitions: 2,
    lapses: 0,
    dueAt: new Date('2026-01-09T10:00:00.000Z'),
    lastReviewedAt: new Date('2026-01-07T10:00:00.000Z'),
    lastResult: 'know',
    updatedAt: new Date('2026-01-07T10:00:00.000Z'),
    ...partial,
  };
}

describe('recordReview', () => {
  it('inserts a first-known grade due the next day', async () => {
    await reviewService.recordReview(
      USER,
      { topicPath: 'javascript/foundation/closures', promptId: 'q1', grade: 'know' },
      NOW,
    );

    expect(insertMock).toHaveBeenCalledOnce();
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER,
        topicPath: 'javascript/foundation/closures',
        promptId: 'q1',
        kind: 'qa',
        intervalDays: 1,
        repetitions: 1,
        lapses: 0,
        dueAt: new Date('2026-01-11T10:00:00.000Z'),
        lastResult: 'know',
      }),
    );
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('doubles the interval on a later known grade', async () => {
    limitMock.mockReturnValue([existingRow({})]);

    await reviewService.recordReview(
      USER,
      { topicPath: 'javascript/foundation/closures', promptId: 'q1', grade: 'know' },
      NOW,
    );

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        intervalDays: 4,
        repetitions: 3,
        lapses: 0,
        dueAt: new Date('2026-01-14T10:00:00.000Z'),
        lastResult: 'know',
      }),
    );
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('resets to one day on a weak grade', async () => {
    limitMock.mockReturnValue([existingRow({ intervalDays: 8, repetitions: 4 })]);

    await reviewService.recordReview(
      USER,
      { topicPath: 'javascript/foundation/closures', promptId: 'q1', grade: 'review' },
      NOW,
    );

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        intervalDays: 1,
        repetitions: 0,
        lapses: 1,
        dueAt: new Date('2026-01-11T10:00:00.000Z'),
        lastResult: 'review',
      }),
    );
  });
});

describe('getDueQueue', () => {
  it('returns only due items, weak first, with counts', async () => {
    orderByMock.mockReturnValue([
      existingRow({ promptId: 'known-overdue', lastResult: 'know', dueAt: new Date('2026-01-05T10:00:00.000Z') }),
      existingRow({ promptId: 'not-yet', lastResult: 'know', dueAt: new Date('2026-01-20T10:00:00.000Z') }),
      existingRow({ promptId: 'weak-due', lastResult: 'review', dueAt: new Date('2026-01-09T10:00:00.000Z') }),
    ]);

    const { items, counts } = await reviewService.getDueQueue(USER, NOW);

    expect(items.map((entry) => entry.promptId)).toEqual(['weak-due', 'known-overdue']);
    expect(items[1]?.overdueDays).toBe(5);
    expect(counts).toEqual({ due: 2, overdue: 2, weakDue: 1 });
  });

  it('returns an empty queue with zero counts when nothing is due', async () => {
    const { items, counts } = await reviewService.getDueQueue(USER, NOW);
    expect(items).toEqual([]);
    expect(counts).toEqual({ due: 0, overdue: 0, weakDue: 0 });
  });
});
