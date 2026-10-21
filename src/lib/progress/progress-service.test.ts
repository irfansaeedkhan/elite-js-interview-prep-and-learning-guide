import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.hoisted runs before imports, so the mock factory below can reference these.
// (Plain top-level consts would hit the ESM TDZ: imports evaluate first.)
const mocks = vi.hoisted(() => {
  const returningMock = vi.fn();
  const valuesMock = vi.fn(() => ({ returning: returningMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));

  const limitMock = vi.fn();
  const orderByMock = vi.fn(() => ({ limit: limitMock }));
  const whereMock = vi.fn(() => ({ orderBy: orderByMock }));
  const fromMock = vi.fn(() => ({ where: whereMock }));
  const selectMock = vi.fn(() => ({ from: fromMock }));

  return {
    returningMock,
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
