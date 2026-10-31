import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/lib/auth';

vi.mock('@/lib/require-auth', () => ({
  requireSession: vi.fn(),
}));

vi.mock('@/lib/mocks/mock-service', () => ({
  mockService: {
    saveAnswer: vi.fn(),
  },
}));

import { POST } from './route';
import { ApiError } from '@/lib/api-error';
import { requireSession } from '@/lib/require-auth';
import { mockService } from '@/lib/mocks/mock-service';

const session = { user: { id: 'user-123' } } as unknown as Session;
const base = 'http://localhost/api/mocks/mock-1/answer';
const params = Promise.resolve({ id: 'mock-1' });

function row() {
  return {
    id: 'mock-1',
    userId: 'user-123',
    packId: 'javascript-foundations',
    durationMinutes: 30,
    status: 'in_progress',
    startedAt: new Date('2026-10-29T10:00:00.000Z'),
    deadlineAt: new Date('2026-10-29T10:30:00.000Z'),
    submittedAt: null,
    answers: {},
    createdAt: new Date('2026-10-29T10:00:00.000Z'),
    updatedAt: new Date('2026-10-29T10:00:00.000Z'),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireSession).mockResolvedValue(session);
});

describe('POST /api/mocks/[id]/answer', () => {
  it('saves the answer for the signed-in user', async () => {
    vi.mocked(mockService.saveAnswer).mockResolvedValue(row() as never);
    const res = await POST(
      new Request(base, {
        method: 'POST',
        body: JSON.stringify({ questionId: 'flatten-depth', answer: { code: 'export function f() {}' } }),
      }),
      { params },
    );
    expect(res.status).toBe(200);
    expect(mockService.saveAnswer).toHaveBeenCalledWith(
      'user-123',
      'mock-1',
      'flatten-depth',
      { code: 'export function f() {}' },
    );
  });

  it('passes service timeout conflicts through as 409', async () => {
    vi.mocked(mockService.saveAnswer).mockRejectedValue(
      new ApiError('Time expired: the mock session timed out', 409, 'SESSION_TIMED_OUT'),
    );
    const res = await POST(
      new Request(base, {
        method: 'POST',
        body: JSON.stringify({ questionId: 'flatten-depth', answer: { code: 'x' } }),
      }),
      { params },
    );
    expect(res.status).toBe(409);
  });

  it('returns 400 when the question id is missing', async () => {
    const res = await POST(
      new Request(base, { method: 'POST', body: JSON.stringify({ answer: {} }) }),
      { params },
    );
    expect(res.status).toBe(400);
    expect(mockService.saveAnswer).not.toHaveBeenCalled();
  });
});
