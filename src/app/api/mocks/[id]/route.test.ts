import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/lib/auth';

vi.mock('@/lib/require-auth', () => ({
  requireSession: vi.fn(),
}));

vi.mock('@/lib/mocks/mock-service', () => ({
  mockService: {
    getSession: vi.fn(),
  },
}));

import { GET } from './route';
import { requireSession } from '@/lib/require-auth';
import { mockService } from '@/lib/mocks/mock-service';

const session = { user: { id: 'user-123' } } as unknown as Session;
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

describe('GET /api/mocks/[id]', () => {
  it('returns the owned session', async () => {
    vi.mocked(mockService.getSession).mockResolvedValue(row() as never);
    const res = await GET(new Request('http://localhost/api/mocks/mock-1'), { params });
    expect(res.status).toBe(200);
    expect(mockService.getSession).toHaveBeenCalledWith('user-123', 'mock-1');
  });

  it('returns 404 when the session is not owned (or missing)', async () => {
    vi.mocked(mockService.getSession).mockResolvedValue(null as never);
    const res = await GET(new Request('http://localhost/api/mocks/mock-1'), { params });
    expect(res.status).toBe(404);
  });
});
