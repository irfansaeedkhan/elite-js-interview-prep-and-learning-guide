import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/lib/auth';

vi.mock('@/lib/require-auth', () => ({
  requireSession: vi.fn(),
}));

vi.mock('@/lib/mocks/mock-service', () => ({
  mockService: {
    startSession: vi.fn(),
    listSessions: vi.fn(),
  },
}));

import { GET, POST } from './route';
import { ApiError } from '@/lib/api-error';
import { requireSession } from '@/lib/require-auth';
import { mockService } from '@/lib/mocks/mock-service';

const session = { user: { id: 'user-123' } } as unknown as Session;
const base = 'http://localhost/api/mocks';

function row(overrides: Record<string, unknown> = {}) {
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
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireSession).mockResolvedValue(session);
});

describe('POST /api/mocks', () => {
  it('starts a session for the signed-in user', async () => {
    vi.mocked(mockService.startSession).mockResolvedValue(row() as never);
    const res = await POST(
      new Request(base, {
        method: 'POST',
        body: JSON.stringify({ packId: 'javascript-foundations', durationMinutes: 30 }),
      }),
    );
    expect(res.status).toBe(201);
    expect(mockService.startSession).toHaveBeenCalledWith(
      'user-123',
      'javascript-foundations',
      30,
    );
    const body = await res.json();
    expect(body.session.id).toBe('mock-1');
    expect(body.session.startedAt).toBe('2026-10-29T10:00:00.000Z');
  });

  it('returns 400 for an invalid body', async () => {
    const res = await POST(
      new Request(base, {
        method: 'POST',
        body: JSON.stringify({ packId: 'javascript-foundations', durationMinutes: 20.5 }),
      }),
    );
    expect(res.status).toBe(400);
    expect(mockService.startSession).not.toHaveBeenCalled();
  });

  it('returns 401 without a session', async () => {
    vi.mocked(requireSession).mockRejectedValue(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
    const res = await POST(
      new Request(base, {
        method: 'POST',
        body: JSON.stringify({ packId: 'javascript-foundations', durationMinutes: 30 }),
      }),
    );
    expect(res.status).toBe(401);
  });
});

describe('GET /api/mocks', () => {
  it('lists sessions scoped to the signed-in user', async () => {
    vi.mocked(mockService.listSessions).mockResolvedValue([row()] as never);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockService.listSessions).toHaveBeenCalledWith('user-123');
    const body = await res.json();
    expect(body.sessions).toHaveLength(1);
  });
});
